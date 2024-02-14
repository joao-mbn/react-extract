import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import * as vscode from 'vscode';
import { ExtractedProps } from './class';

export function extractJsxProps(document: vscode.TextDocument, range: vscode.Range) {
  const selectedText = document.getText();

  const ast = parser.parse(selectedText, {
    sourceType: 'module',
    plugins: ['jsx'],
  });

  const props = new ExtractedProps();

  traverse(ast, {
    JSXOpeningElement(path) {
      for (const attribute of path.node.attributes) {
        if (attribute.type !== 'JSXAttribute' && attribute.type !== 'JSXSpreadAttribute') continue;
        if (!attribute.loc) continue;

        const range = new vscode.Range(
          attribute.loc.start.line - 1,
          attribute.loc.start.column,
          attribute.loc.end.line - 1,
          attribute.loc.end.column
        );
        const pair = document.getText(range);
        const name = pair.match(/\w+(?==)/)?.[0] || '';

        const newProp = { pair, name, range, type: 'irrelevant' };

        if (attribute.type === 'JSXAttribute') {
          props.updateProps({ ...newProp, isSpread: false });
        } else {
          props.updateProps({ ...newProp, isSpread: true });
        }
      }
    },
  });

  return Object.values(props.props);
}
