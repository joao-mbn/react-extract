import ts from 'typescript';
import { ExtractedProp, ExtractionArgs } from '../types';
import { getNodeType } from './getNodeType';
import { getNodeRange } from './parsingUtils';

export function extractProps(args: ExtractionArgs) {
  const { program, sourceFile } = args;

  const checker = program.getTypeChecker();

  const props: Map<string, ExtractedProp> = new Map();
  ts.forEachChild(sourceFile, (node) => visit({ node, checker, props, ...args }));

  return [...props.values()];
}

interface VisitorArguments extends ExtractionArgs {
  node: ts.Node;
  checker: ts.TypeChecker;
  props: Map<string, ExtractedProp>;
}

function visit(args: VisitorArguments) {
  const { node, sourceFile, range, checker, props, isTypescript } = args;

  // visiting node outside selection
  const nodeRange = getNodeRange(node, sourceFile);
  if (!range.intersection(nodeRange)) return;

  // looks for nested nodes
  ts.forEachChild(node, (node) => visit({ ...args, node }));

  if (!ts.isIdentifier(node)) return;

  // escapes from tag names
  const invalidIdentifierParents = [
    ts.SyntaxKind.JsxSelfClosingElement,
    ts.SyntaxKind.JsxOpeningElement,
    ts.SyntaxKind.JsxClosingElement,
    ts.SyntaxKind.JsxFragment,
    ts.SyntaxKind.JsxOpeningFragment,
    ts.SyntaxKind.JsxClosingFragment
  ];
  if (invalidIdentifierParents.includes(node.parent?.kind)) return;

  // value is literal undefined
  if (node.getText() === 'undefined') return;

  // node does not reference a named entity
  const symbol = checker.getSymbolAtLocation(node);
  if (!symbol) return;

  const valueDeclaration = symbol?.valueDeclaration;
  if (!valueDeclaration) return;

  if (!shouldSymbolValueDeclarationBePassedAsProps({ ...args, valueDeclaration })) return;

  const isSpread = node.parent?.kind === ts.SyntaxKind.JsxSpreadAttribute;
  const type = isTypescript ? getNodeType({ node, checker, valueDeclaration, isSpread }) : 'any';

  const newProp = { name: node.getText(), type, isSpread };
  props.set(newProp.name, newProp);
}

function shouldSymbolValueDeclarationBePassedAsProps(args: VisitorArguments & { valueDeclaration: ts.Node }) {
  const { sourceFile, range, valueDeclaration } = args;

  // value is imported or is a global variable, and thus not bound to the function scope in which the selection is made
  if (valueDeclaration.getSourceFile().fileName !== sourceFile.fileName) return false;

  // types of declarations that should be passed as props, by trial and error with TS AST.
  const allowedDeclarationKinds = [
    ts.SyntaxKind.BindingElement,
    ts.SyntaxKind.Parameter,
    ts.SyntaxKind.ShorthandPropertyAssignment,
    ts.SyntaxKind.FunctionDeclaration,
    ts.SyntaxKind.VariableDeclaration
  ];
  if (!allowedDeclarationKinds.includes(valueDeclaration.kind)) return false;

  // A value declaration that is at the current file scope if it does not have any block statement containing it
  // or it's not passed as function parameter.
  // They shouldn't be passed as props, as they are available to the extracted component as well.
  if (isValueDeclarationAtFileScope({ ...args, valueDeclaration })) return false;

  // value is declared or is a parameter in the selection itself,
  // e.g. <button onClick={(e) => { const target = e.target; doStuff(target); }} />
  // "onClick" is a JSX Attribute, "e" is a parameter and "target" is a declaration in the selection, but not "doStuff".
  // shorthand assignments are exceptions to be checked apart, as declaration and reference occupy the same range.
  const declarationRange = getNodeRange(valueDeclaration, sourceFile);
  if (range.intersection(declarationRange)) {
    if (valueDeclaration.kind !== ts.SyntaxKind.ShorthandPropertyAssignment) return false;

    if (shouldShorthandBeIgnored({ ...args })) return false;
  }

  return true;
}

/**
 * Checks if the value declaration is a constant declared in the current file scope.
 * A value declaration that is within the current file and is available at the component
 * if it does not have any block statement containing it or it's not passed as function parameter.
 * @param args - The visitor arguments.
 * @param args.valueDeclaration - The value declaration node.
 * @returns A boolean indicating whether the value declaration is a constant declared in the current file scope.
 */

function isValueDeclarationAtFileScope({ valueDeclaration }: VisitorArguments & { valueDeclaration: ts.Node }) {
  let valueDeclarationContainer: ts.Node = valueDeclaration;
  let isAtFileScope = true;

  while (valueDeclarationContainer && isAtFileScope) {
    if ([ts.SyntaxKind.Parameter, ts.SyntaxKind.Block].includes(valueDeclarationContainer.kind)) {
      isAtFileScope = false;
    }
    valueDeclarationContainer = valueDeclarationContainer.parent;
  }

  return isAtFileScope;
}

/**
 * Determines whether the shorthand should be ignored based on the provided visitor arguments.
 * It will be ignored if the shorthand is declared within the selection or is at global/import/file scope.
 * @param arguments - The visitor arguments containing the node, source file, and range.
 * @returns - True if the shorthand should be ignored, false otherwise.
 */
function shouldShorthandBeIgnored({ node, sourceFile, range }: VisitorArguments) {
  /**
   * There's room for optimizations in this checker:
   * The first found reference may be within the JSX Expression but out of scope, meaning that a wrong variable has been found.
   * Example: In the else statement, the variable shortHand referenced is not the one in the if statement, but that's the one first found.
   *
   * if (shortHand) {
   *  const shortHand = 'propShortHand';
   *  const shortHandObject = { shortHand };
   * } else {
   *  const shortHandObject = { shortHand };
   * }
   */

  let hasFoundReference = false;

  function shortHandContainerVisitor(currentNode: ts.Node) {
    if (hasFoundReference) return;

    if (ts.isIdentifier(currentNode) && currentNode.getText() === node.getText() && node !== currentNode) {
      hasFoundReference = true;
    } else {
      ts.forEachChild(currentNode, shortHandContainerVisitor);
    }
  }

  // Reference is within selection
  let shorthandContainer = node.parent;
  while (range.contains(getNodeRange(shorthandContainer, sourceFile)) && shorthandContainer.parent) {
    shorthandContainer = shorthandContainer.parent;
  }

  shorthandContainer.forEachChild(shortHandContainerVisitor);

  if (hasFoundReference) return true;

  // Reference is outside selection, but within some component scope containing the shorthand
  let outermostParentComponentScope: ts.Node | null = null;
  let scopePointer = shorthandContainer;
  while (scopePointer) {
    if (ts.isFunctionDeclaration(scopePointer) || ts.isArrowFunction(scopePointer)) {
      outermostParentComponentScope = scopePointer;
    }
    scopePointer = scopePointer.parent;
  }

  outermostParentComponentScope?.forEachChild(shortHandContainerVisitor);

  // if hasFoundReference is true, the reference is within the component scope, else it's at global/import/file scope.
  return !hasFoundReference;
}

