import ts from 'typescript';
import * as vscode from 'vscode';
import { BuildArgs } from '../types';
import { getNodeRange } from './parsingUtils';

interface ReplacementProps {
  position: vscode.Range;
  replacement: string;
}

export function replacePropsWithFullPath(args: BuildArgs) {
  const replacements = getReplacements(args);

  const selection = applyReplacementsToSelection({ replacements, ...args });
  return selection;
}

function getReplacements(args: BuildArgs) {
  const { sourceFile } = args;

  const replacements: ReplacementProps[] = [];
  ts.forEachChild(sourceFile, (node) => visit({ node, replacements, ...args }));

  return replacements;
}

type VisitorArguments = BuildArgs & {
  node: ts.Node;
  replacements: ReplacementProps[];
};

function visit(args: VisitorArguments) {
  const { node, sourceFile, range, replacements, props } = args;

  // visiting node outside selection
  const nodeRange = getNodeRange(node, sourceFile);
  if (!range.intersection(nodeRange)) return;

  // looks for nested nodes
  ts.forEachChild(node, (node) => visit({ ...args, node }));

  // escapes from non-identifiers
  if (!ts.isIdentifier(node)) return;

  // escapes from tag names and attributes
  const invalidIdentifierParents = [
    ts.SyntaxKind.JsxSelfClosingElement,
    ts.SyntaxKind.JsxOpeningElement,
    ts.SyntaxKind.JsxClosingElement,
    ts.SyntaxKind.JsxFragment,
    ts.SyntaxKind.JsxOpeningFragment,
    ts.SyntaxKind.JsxClosingFragment,
    ts.SyntaxKind.JsxAttribute,
    ts.SyntaxKind.JsxSpreadAttribute
  ];
  if (invalidIdentifierParents.includes(node.parent?.kind)) return;

  // escapes from identifiers that are not the props to be passed
  if (!props.some((prop) => prop.name === node.getText())) return;

  if (node.parent?.kind === ts.SyntaxKind.ShorthandPropertyAssignment) {
    replacements.push({ position: nodeRange, replacement: `${node.getText()}: props.${node.getText()}` });
  } else {
    replacements.push({ position: nodeRange, replacement: `props.${node.getText()}` });
  }
}

type ApplyReplacementsArguments = BuildArgs & {
  replacements: ReplacementProps[];
};

function applyReplacementsToSelection(args: ApplyReplacementsArguments) {
  const { document, replacements, range: originalRange } = args;
  let modifiedText = document.getText();
  let offset = 0;

  for (const { position, replacement } of replacements) {
    const start = document.offsetAt(position.start) + offset;
    const end = document.offsetAt(position.end) + offset;

    modifiedText = modifiedText.slice(0, start) + replacement + modifiedText.slice(end);

    offset += replacement.length - (end - start);
  }

  // Extract the modified text using the adjusted range
  const startOffset = document.offsetAt(originalRange.start);
  const endOffset = document.offsetAt(originalRange.end) + offset;
  const extractedText = modifiedText.substring(startOffset, endOffset);

  return extractedText;
}

