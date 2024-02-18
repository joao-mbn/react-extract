import * as vscode from 'vscode';
import { isFileTypescript } from './checks';
import { extractJsxProps } from './extractJsxProps';
import { extractTsxProps } from './extractTsxProps';

export async function extractComponent(document: vscode.TextDocument, range: vscode.Range | vscode.Selection) {
  const componentName = await vscode.window.showInputBox({
    value: 'Component',
    title: 'Give the extracted component a name',
  });

  // If the user clears the input or cancels the input, it's implied that the user doesn't want to proceed.
  if (!componentName) return;

  await buildExtractedComponent(document, range, componentName);
}

export async function buildExtractedComponent(
  document: vscode.TextDocument,
  range: vscode.Range,
  componentName: string
) {
  const isTypescript = isFileTypescript(document);

  const props = (isTypescript ? extractTsxProps(document, range) : extractJsxProps(document, range)).sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  const editor = await vscode.window.showTextDocument(document);

  await editor.edit((editBuilder) => {
    const shouldDisplayInterface = isTypescript && props.length > 0;

    const interfaceName = `${componentName}Props`;
    const extractedComponentInterface = `\n
      interface ${interfaceName} {
        ${props
          .map(({ name, type }) => `${name}: ${type}`)
          .join(';\n')
          .concat(';')}
      }\n
    `;

    const extractedComponent = `
      ${shouldDisplayInterface ? extractedComponentInterface : ''}\n

      function ${componentName}(
        ${props.length > 0 ? `{ ${props.map(({ name }) => name).join(',\n')} }` : ''}
        ${shouldDisplayInterface ? `: ${interfaceName}` : ''}
      ) {
        return (
          ${document.getText(range)}
        );
      }
    `;

    const lastLine = document.lineAt(document.lineCount - 1);
    const endOfDocument = new vscode.Position(lastLine.lineNumber, lastLine.text.length);
    editBuilder.insert(endOfDocument, '\n' + extractedComponent);

    const extractedComponentReference = `
      <${componentName}
        ${props.map(({ name }) => `${name}={${name}}`).join('\n')}
      />
    `;
    editBuilder.replace(range, extractedComponentReference);
  });
}
