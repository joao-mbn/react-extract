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
        type: checker.typeToString(checker.getTypeAtLocation(prop)),
        range: getNodeRange(prop, sourceFile),
      };

      if (ts.isJsxAttribute(prop)) {
        props.updateProps({ ...newProp, name: prop.name.getText(), isSpread: false });
      } else {
        props.updateProps({ ...newProp, name: prop.expression.getText(), isSpread: true });
      }
    }
  }

  ts.forEachChild(node, (node) => visit({ ...args, node }));
}

function getNodeRange(node: ts.Node, sourceFile: ts.SourceFile) {
  const start = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
  const end = sourceFile.getLineAndCharacterOfPosition(node.end);
  return new vscode.Range(start.line, start.character, end.line, end.character);
}
