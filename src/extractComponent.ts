import * as vscode from 'vscode';
import { isFileTypescript } from './checks';
import { extractProps } from './extractProps';
import { ExtractionArgs } from './types';
import { capitalizeComponentName, removeNonWordCharacters } from './utils';

export async function extractComponent(document: vscode.TextDocument, range: vscode.Range | vscode.Selection) {
  const componentGivenName = await vscode.window.showInputBox({
    value: 'Component',
    title: 'Give the extracted component a name'
  });
  // If the user clears the input or cancels the input, it's implied that the user doesn't want to proceed.
  if (!componentGivenName) return;

  const componentNameWithoutNonWordChars = removeNonWordCharacters(componentGivenName);
  if (!componentNameWithoutNonWordChars) return;

  const componentName = capitalizeComponentName(componentNameWithoutNonWordChars);
  const isTypescript = isFileTypescript(document);

  const args: ExtractionArgs = { document, range, componentName, isTypescript };

  await buildExtractedComponent(args);
}

export async function buildExtractedComponent(args: ExtractionArgs) {
  const { document, range, componentName, isTypescript } = args;
  const props = extractProps(args).sort((a, b) => {
    if (a.isSpread) return 1;
    if (b.isSpread) return -1;

    return a.name.localeCompare(b.name);
  });
  const hasSingleSpread = props.filter((prop) => prop.isSpread).length === 1;

  const editor = await vscode.window.showTextDocument(document);

  await editor.edit((editBuilder) => {
    const shouldDisplayInterface = isTypescript && props.length > 0;

    const interfaceName = `${componentName}Props`;
    const extractedComponentInterface = `\n
      interface ${interfaceName} ${hasSingleSpread ? `extends ${props.find((prop) => prop.isSpread)?.type ?? 'any'}` : ''} {
        ${props
          .filter(({ isSpread }) => !hasSingleSpread || (hasSingleSpread && !isSpread))
          .map(({ name, type }) => `${name}: ${type}`)
          .join(';\n')
          .concat(';')}
      }\n
    `;

    const extractedComponent = `
      ${shouldDisplayInterface ? extractedComponentInterface : ''}\n

      function ${componentName}(
        ${props.length > 0 ? `{ ${props.map(({ name, isSpread }) => (isSpread && hasSingleSpread ? `...${name}` : name)).join(',\n')} }` : ''}
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
        ${props.map(({ name, isSpread }) => (isSpread && hasSingleSpread ? `{...${name}}` : `${name}={${name}}`)).join('\n')}
      />
    `;
    editBuilder.replace(range, extractedComponentReference);
  });
}
