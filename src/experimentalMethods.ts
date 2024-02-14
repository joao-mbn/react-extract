import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import * as t from '@babel/types';

export function babelExtract(code: string) {
  const ast = parser.parse(code, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript'],
  });

  const propTypes: { [key: string]: string } = {};

  traverse(ast, {
    JSXOpeningElement(path) {
      path.node.attributes.forEach((attr) => {
        if (attr.type === 'JSXAttribute' && attr.name.type === 'JSXIdentifier') {
          propTypes[attr.name.name] = 'unknown'; // replace 'unknown' with actual type if available
        }
      });
    },
  });

  traverse(ast, {
    enter(path) {
      if (t.isIdentifier(path.node, { name: 'n' })) {
        path.node.name = 'x';
      }
    },
  });

  //console.log(propTypes);
}
