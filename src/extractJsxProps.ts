import * as parser from '@babel/parser';
import traverse, { Node } from '@babel/traverse';
import * as vscode from 'vscode';
import { ExtractedProp } from './types';

export function extractJsxProps(document: vscode.TextDocument, range: vscode.Range) {
  const selectedText = document.getText();

  const ast = parser.parse(selectedText, {
    sourceType: 'module',
    plugins: ['jsx'],
  });

  const props: Map<string, ExtractedProp> = new Map();

  traverse(ast, {
    Identifier(path) {
      const node = path.node;

      // visiting node outside selection
      const nodeRange = getNodeRange(node);
      if (!nodeRange || !range.intersection(nodeRange)) return;

      // value is literal undefined
      if (node.name === 'undefined') return;

      // node does not reference a named entity
      const binding = path.scope.getBinding(node.name);
      if (!binding) return;

      // value is imported or is a global variable, and thus not bound to the function scope in which the selection is made
      if (binding.path.type === 'ImportSpecifier') return;

      // value is declared or is a parameter in the selection itself,
      // e.g. <button onClick={(e) => { const target = e.target; doStuff(target); }} />
      // "e" is a parameter and "target" is a declaration in the selection, but not "doStuff".
      const declarationRange = getNodeRange(binding.path.node);
      if (declarationRange && range.intersection(declarationRange)) return;

      // value has a value declaration that should be passed as a prop
      const newProp = {
        name: node.name,
        type: '',
        isSpread: false,
      };

      props.set(newProp.name, newProp);
    },
  });

  return [...props.values()];
}

function getNodeRange(node: Node) {
  if (!node.loc) return;

  const range = new vscode.Range(
    node.loc.start.line - 1,
    node.loc.start.column,
    node.loc.end.line - 1,
    node.loc.end.column
  );
  return range;
}
