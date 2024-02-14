import ts from 'typescript';
import * as vscode from 'vscode';
import { ExtractedProp } from './types';

export function extractPropsWithTypescript(document: vscode.TextDocument, range: vscode.Range) {
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

// This class is used encapsulate the props object and its update, which is mounted without immutability.
class ExtractedProps {
  props: Record<string, ExtractedProp> = {};

  constructor() {}

  updateProps(newProp: Omit<ExtractedProp, 'propAlias'>) {
    const countOfPropsWithSameName = Object.values(this.props).filter(({ name: prop }) => prop === newProp.name).length;
    const propAlias = `${newProp.name}${countOfPropsWithSameName === 0 ? '' : countOfPropsWithSameName + 1}`;
    this.props[propAlias] = { ...newProp, propAlias };
  }
}
