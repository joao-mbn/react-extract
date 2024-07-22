import ts from 'typescript';
import * as vscode from 'vscode';
import { getProgramAndSourceFile } from '../typescriptProgram';
import { getNodeRange } from './parsingUtils';

export function isJsx(document: vscode.TextDocument, range: vscode.Range) {
  const selectedText = document.getText(range).trim();
  if (!selectedText) return false;

  const { sourceFile } = getProgramAndSourceFile(document);
  if (!sourceFile) return false;

  const outermostJsx: boolean[] = [];
  ts.forEachChild(sourceFile, (node) => visit({ node, range, sourceFile, document, outermostJsx }));

  return !!outermostJsx.length;
}

interface VisitorArguments {
  node: ts.Node;
  parent?: ts.Node;
  range: vscode.Range;
  sourceFile: ts.SourceFile;
  document: vscode.TextDocument;
  outermostJsx: boolean[];
}

function visit(args: VisitorArguments) {
  const { node, parent, range, sourceFile, document, outermostJsx } = args;

  if (outermostJsx.length) return;

  // visiting node outside selection
  const nodeRange = getNodeRange(node, sourceFile);
  if (!range.intersection(nodeRange)) return;

  // looks for nested nodes. Parents must be passed down as they are undefined in the JSX Children for some reason.
  ts.forEachChild(node, (child) => visit({ ...args, node: child, parent: node }));

  // element is bigger than the selection
  if (!range.contains(nodeRange)) return;

  // empty JSX text nodes appear when breaking lines with nesting and should be ignored
  if (document.getText(nodeRange) === '') return;

  const isOutermostSelectedNode = !parent || !range.contains(getNodeRange(parent, sourceFile));
  if (!isOutermostSelectedNode) return;

  const isJsx = ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node) || ts.isJsxFragment(node);
  if (isJsx) outermostJsx.push(true);
}

