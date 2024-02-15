import * as parser from '@babel/parser';
import traverse, { Node, NodePath } from '@babel/traverse';
import { JSXAttribute, JSXOpeningElement } from '@babel/types';
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
          const isStatic = isValueStatic(attribute, path);

          props.updateProps({ ...newProp, isSpread: false, isStatic });
        } else {
          props.updateProps({ ...newProp, isSpread: true, isStatic: false });
        }
      }
    },
  });

  return Object.values(props.props);
}

function isValueStatic(attribute: JSXAttribute, path: NodePath<JSXOpeningElement>) {
  let isValueStatic = false;
  if (attribute.value?.type === 'StringLiteral') {
    isValueStatic = true;
  } else if (attribute.value?.type === 'JSXExpressionContainer') {
    const expression = attribute.value.expression;
    if (expression.type.toString()?.includes('Literal')) {
      isValueStatic = true;
    } else if (expression.type === 'Identifier') {
      const binding = path.scope.getBinding(expression.name);

      const importSpecifiers: NodePath<Node>['type'][] = [
        'ImportSpecifier',
        'ImportDefaultSpecifier',
        'ImportNamespaceSpecifier',
      ];
      const isDeclaredInScope = binding && !importSpecifiers.includes(binding.path.type);

      isValueStatic = !isDeclaredInScope;
    }
  }

  // TODO: handle other types of JSXExpressionContainer and expression types

  return isValueStatic;
}
