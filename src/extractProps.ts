import ts from 'typescript';
import * as vscode from 'vscode';
import { ExtractedProp, ExtractionArgs } from './types';

export function extractProps(args: ExtractionArgs) {
  const { document } = args;

  const program = ts.createProgram([document.uri.fsPath], { allowJs: true, strict: true });
  const checker = program.getTypeChecker();

  const sourceFile = program.getSourceFile(document.uri.fsPath);
  if (!sourceFile) return [];

  const props: Map<string, ExtractedProp> = new Map();
  ts.forEachChild(sourceFile, (node) => visit({ node, sourceFile, checker, props, ...args }));

  return [...props.values()];
}

interface VisitorArguments extends ExtractionArgs {
  node: ts.Node;
  sourceFile: ts.SourceFile;
  checker: ts.TypeChecker;
  props: Map<string, ExtractedProp>;
}

function visit(args: VisitorArguments) {
  const { node, sourceFile, range, checker, props } = args;

  // visiting node outside selection
  const nodeRange = getNodeRange(node, sourceFile);
  if (!range.intersection(nodeRange)) return;

  // look for variables in nested nodes
  ts.forEachChild(node, (node) => visit({ ...args, node }));

  if (!ts.isIdentifier(node)) return;

  // escapes from tag names
  const invalidIdentifierParents = [
    ts.SyntaxKind.JsxSelfClosingElement,
    ts.SyntaxKind.JsxOpeningElement,
    ts.SyntaxKind.JsxClosingElement,
    ts.SyntaxKind.JsxFragment,
    ts.SyntaxKind.JsxOpeningFragment,
    ts.SyntaxKind.JsxClosingFragment,
  ];
  if (invalidIdentifierParents.includes(node.parent?.kind)) return;

  // value is literal undefined
  if (node.getText() === 'undefined') return;

  // node does not reference a named entity
  const symbol = checker.getSymbolAtLocation(node);
  if (!symbol) return;

  // no value is being declared
  const valueDeclaration = symbol?.valueDeclaration;
  if (!valueDeclaration) return;

  // value is imported or is a global variable, and thus not bound to the function scope in which the selection is made
  if (valueDeclaration.getSourceFile().fileName !== sourceFile.fileName) return;

  // types of declarations that should be passed as props, by trial and error with TS AST.
  const allowedDeclarationKinds = [
    ts.SyntaxKind.BindingElement,
    ts.SyntaxKind.Parameter,
    ts.SyntaxKind.ShorthandPropertyAssignment,
    ts.SyntaxKind.FunctionDeclaration,
    ts.SyntaxKind.VariableDeclaration,
    ts.SyntaxKind.PropertyDeclaration,
    ts.SyntaxKind.MethodDeclaration,
  ];
  if (!allowedDeclarationKinds.includes(valueDeclaration.kind)) return;

  // value is declared or is a parameter in the selection itself,
  // e.g. <button onClick={(e) => { const target = e.target; doStuff(target); }} />
  // "onClick" is a JSX Attribute, "e" is a parameter and "target" is a declaration in the selection, but not "doStuff".
  const declarationRange = getNodeRange(valueDeclaration, sourceFile);
  if (range.intersection(declarationRange)) return;

  // value has a value declaration that should be passed as a prop
  const newProp = {
    name: node.getText(),
    type: getNodeTypeString(node, checker),
    isSpread: node.parent?.kind === ts.SyntaxKind.JsxSpreadAttribute,
  };

  props.set(newProp.name, newProp);
}

function getNodeTypeString(node: ts.Node, checker: ts.TypeChecker) {
  const type = checker.getTypeAtLocation(node);
  const typeAsString = checker.typeToString(type, node);
  const isPropTypeTruncated = /... \d+ more .../.test(typeAsString);
  return isPropTypeTruncated ? 'any' : typeAsString;
}

function getNodeRange(node: ts.Node, sourceFile: ts.SourceFile) {
  const start = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
  const end = sourceFile.getLineAndCharacterOfPosition(node.end);
  return new vscode.Range(start.line, start.character, end.line, end.character);
}
