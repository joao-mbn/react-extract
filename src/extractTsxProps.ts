import ts from 'typescript';
import * as vscode from 'vscode';
import { ExtractedProps } from './class';

export function extractTsxProps(document: vscode.TextDocument, range: vscode.Range) {
  const program = ts.createProgram([document.uri.fsPath], {});
  const checker = program.getTypeChecker();

  const sourceFile = program.getSourceFile(document.uri.fsPath);
  if (!sourceFile) return [];

  const props = new ExtractedProps();

  ts.forEachChild(sourceFile, (node) => visit({ node, sourceFile, range, checker, props }));

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

function getPropType(checker: ts.TypeChecker, prop: ts.JsxAttributeLike) {
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

  // TODO: Handle template literals actually using interpolations
  // TODO: handle other types of JsxExpression and expression types

  return false;
}
