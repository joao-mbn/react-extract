import ts from 'typescript';
import * as vscode from 'vscode';
import { ExtractedProps } from './class';

export function extractTsxProps(document: vscode.TextDocument, range: vscode.Range) {
  const program = ts.createProgram([document.uri.fsPath], {});
  const checker = program.getTypeChecker();

  const sourceFile = program.getSourceFile(document.uri.fsPath);
  if (!sourceFile) return [];

  // TODO: Handle template literals actually using interpolations
  // TODO: handle other types of JsxExpression and expression types
  const props = new ExtractedProps();
  ts.forEachChild(sourceFile, (node) => visit({ node, sourceFile, range, checker, props }));

  // TODO: Handle SpreadAssignment
  // TODO: Handle props that constantes outside the function scope but inside the file
  // TODO: Handle props drilling
  // TODO: Turn object into Map to avoid duplicate keys
  const variables = new ExtractedProps();
  ts.forEachChild(sourceFile, (node) => getVariables({ node, sourceFile, range, checker, props: variables }));

  return Object.values(props.props);
}

interface VisitorArguments {
  node: ts.Node;
  sourceFile: ts.SourceFile;
  range: vscode.Range;
  checker: ts.TypeChecker;
  props: ExtractedProps;
}

function visit(args: VisitorArguments) {
  const { node, sourceFile, range, checker, props } = args;

  if (!node) return;

  const nodeRange = getNodeRange(node, sourceFile);
  if (!range.intersection(nodeRange)) return;

  if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
    // Iterate over the attributes
    for (const prop of node.attributes.properties) {
      if (!ts.isJsxAttribute(prop) && !ts.isJsxSpreadAttribute(prop)) continue;

      const newProp = {
        pair: prop.getText(),
        type: getPropType(checker, prop),
        range: getNodeRange(prop, sourceFile),
      };

      if (ts.isJsxAttribute(prop)) {
        const isStatic = isValueLiteral(prop, checker);

        props.updateProps({ ...newProp, name: prop.name.getText(), isSpread: false, isLiteral: isStatic });
      } else {
        props.updateProps({ ...newProp, name: prop.expression.getText(), isSpread: true, isLiteral: false });
      }
    }
  }

  ts.forEachChild(node, (node) => visit({ ...args, node }));
}

function getPropType(checker: ts.TypeChecker, prop: ts.Node) {
  return checker.typeToString(checker.getTypeAtLocation(prop));
}

function getNodeRange(node: ts.Node, sourceFile: ts.SourceFile) {
  const start = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
  const end = sourceFile.getLineAndCharacterOfPosition(node.end);
  return new vscode.Range(start.line, start.character, end.line, end.character);
}

function isValueLiteral(attribute: ts.JsxAttribute, checker: ts.TypeChecker) {
  // prop [implicitly true]
  if (!attribute.initializer?.kind) return true;

  // prop="value"
  if (attribute.initializer.kind === ts.SyntaxKind.StringLiteral) {
    return true;
  }

  // prop={value}
  if (attribute.initializer.kind === ts.SyntaxKind.JsxExpression) {
    const expression = attribute.initializer.expression;

    if (!expression) return true;

    // null | true | false | string | number | regex passed as literals
    if (ts.isLiteralTypeLiteral(expression)) return true;

    if (ts.isIdentifier(expression)) {
      const symbol = checker.getSymbolAtLocation(expression);

      // undefined literal
      if (symbol?.escapedName === 'undefined') return true;

      const declarations = symbol?.getDeclarations();
      if (!declarations || declarations.length === 0) return true;

      // imported variables passed as is are considered static
      return declarations.every((d) => d.kind === ts.SyntaxKind.ImportSpecifier);
    }
  }

  return false;
}

function getVariables(args: VisitorArguments) {
  const { node, sourceFile, range, checker, props } = args;

  // visiting node outside selection
  const nodeRange = getNodeRange(node, sourceFile);
  if (!range.intersection(nodeRange)) return;

  // look for variables in nested nodes
  ts.forEachChild(node, (node) => getVariables({ ...args, node }));

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

  // value is declared or is a parameter in the selection itself,
  // e.g. <button onClick={(e) => { const target = e.target; doStuff(target); }} />
  // "onClick" is a JSX Attribute, "e" is a parameter and "target" is a declaration in the selection, but not "doStuff".
  const declarationRange = getNodeRange(valueDeclaration, sourceFile);
  if (range.intersection(declarationRange)) return;

  // value has a value declaration that should be passed as a prop
  const newProp = {
    name: node.getText(),
    pair: node.getText(),
    type: getPropType(checker, node),
    range: getNodeRange(node, sourceFile),
    isSpread: false,
    isLiteral: false,
  };

  props.updateProps(newProp);
}
