import ts from 'typescript';
import { ExtractionArgs } from '../types';
import { getNodeRange } from './parsingUtils';

export function determineIfShouldWrapInFragments(args: ExtractionArgs) {
  const { sourceFile } = args;

  const outermostSelectedNodes: Set<ts.Node> = new Set();
  ts.forEachChild(sourceFile, (node) => visit({ node, outermostSelectedNodes, ...args }));

  return outermostSelectedNodes.size > 1;
}

interface VisitorArguments extends ExtractionArgs {
  parent?: ts.Node;
  node: ts.Node;
  outermostSelectedNodes: Set<ts.Node>;
}

function visit(args: VisitorArguments) {
  const { node, parent, range, outermostSelectedNodes, sourceFile, document } = args;

  // visiting node outside selection
  const nodeRange = getNodeRange(node, sourceFile);
  if (!range.intersection(nodeRange)) return;

  // looks for nested nodes. Parents must be passed down as they are undefined in the JSX Children for some reason.
  ts.forEachChild(node, (child) => visit({ ...args, node: child, parent: node }));

  if (!parent) return;

  // element is bigger than the selection
  if (!range.contains(nodeRange)) return;

  // there is no way in which a valid selection candidate for being wrapped in fragments is not a JSX child
  if (!ts.isJsxChild(node)) return;

  // empty JSX text nodes appear when breaking lines with nesting and should be ignored
  if (document.getText(nodeRange) === '') return;

  const isOuterMostSelectedNode = !range.contains(getNodeRange(parent, sourceFile));
  isOuterMostSelectedNode && outermostSelectedNodes.add(node);
}
