import * as parser from '@babel/parser';
import traverse, { NodePath } from '@babel/traverse';
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
          const isStatic = isValueLiteral(attribute, path);

          props.updateProps({ ...newProp, isSpread: false, isLiteral: isStatic });
        } else {
          props.updateProps({ ...newProp, isSpread: true, isLiteral: false });
        }
      }
    },
  });

  return Object.values(props.props);
}

function isValueLiteral(attribute: JSXAttribute, path: NodePath<JSXOpeningElement>) {
  // prop [implicitly true]
  if (!attribute.value) return true;

  // prop="value"
  if (attribute.value.type === 'StringLiteral') {
    return true;
  }

  // prop={value}
  if (attribute.value?.type === 'JSXExpressionContainer') {
    const expression = attribute.value.expression;

    // null | true | false | string | number | regex passed as literals
    if (expression.type.toString().includes('Literal')) {
      return expression.type === 'TemplateLiteral' ? expression.expressions.length === 0 : true;
    }

    if (expression.type === 'Identifier') {
      // undefined literal
      if (expression.name === 'undefined') return true;

      const binding = path.scope.getBinding(expression.name);
      if (!binding) return true;

      // imported variables passed as is are considered static
      return binding.path.type === 'ImportSpecifier';
    }
  }

  // TODO: Handle template literals actually using interpolations
  // TODO: handle other types of JSXExpressionContainer and expression types

  return false;
}
