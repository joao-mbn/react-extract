import * as vscode from 'vscode';
import { isFileTypescript } from './checks';
import { extractProps } from './extractProps';
import { ExtractionArgs } from './types';

export async function extractComponent(document: vscode.TextDocument, range: vscode.Range | vscode.Selection) {
  const componentName = await vscode.window.showInputBox({
    value: 'Component',
    title: 'Give the extracted component a name',
  });

  // If the user clears the input or cancels the input, it's implied that the user doesn't want to proceed.
  if (!componentName) return;

  const args: ExtractionArgs = {
    document,
    range,
    componentName,
    isTypescript: isFileTypescript(document),
  };

  await buildExtractedComponent(args);
}

export async function buildExtractedComponent(args: ExtractionArgs) {
  const { document, range, componentName, isTypescript } = args;
  const props = extractProps(args).sort((a, b) => a.name.localeCompare(b.name));

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
