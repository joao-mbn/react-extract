import dedent from 'dedent';
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

  const props = isTypescript ? extractTsxProps(document, range) : extractJsxProps(document, range);

  const editor = await vscode.window.showTextDocument(document);

  let totalLineChange = 0;
  const isSuccess = await editor.edit((editBuilder) => {
    // Perform batch edit on the original selected text replacing the props with their reference (propAlias)
    for (const { range, name, propAlias } of props) {
      const originalLineCount = range.end.line - range.start.line + 1;
      const updatedText = `${name}={${propAlias}}`;
      const updatedLineCount = 1; // updatedText is always one line long
      totalLineChange += updatedLineCount - originalLineCount;
      editBuilder.replace(range, updatedText);
    }
  });

  if (!isSuccess) return;

  const newEndLine = range.end.line + totalLineChange;
  const rangeAfterReplaces = new vscode.Range(range.start, new vscode.Position(newEndLine, range.end.character));

  await editor.edit((editBuilder) => {
    const shouldDisplayInterface = isTypescript && props.length > 0;

    const interfaceName = `${componentName}Props`;
    const interfaceDeclaration = dedent`\n
      interface ${interfaceName} {
        ${props
          .map((prop) => `${prop.propAlias}: ${prop.type}`)
          .join(';\n')
          .concat(';')}
        }\n
    `;

    const updatedSelectedText = dedent`
      ${shouldDisplayInterface ? interfaceDeclaration : ''}\n

      function ${componentName}(
        ${props.length > 0 ? `{ ${props.map((e) => e.propAlias).join(',\n')} }` : ''}
        ${shouldDisplayInterface ? `: ${interfaceName}` : ''}
      ) {
        return (
          ${document.getText(rangeAfterReplaces)}
        );
      }
    `;

    /**
     * Insert the extracted component at the end of the document.
     * Example:
     * function Component({ propAlias }) {
     *    return (
     *      <div>
     *         <Child1 prop={propAlias} />
     *         <Child2 />
     *      </div>
     *    );
     * }
     */
    const lastLine = document.lineAt(document.lineCount - 1);
    const endOfDocument = new vscode.Position(lastLine.lineNumber, lastLine.text.length);
    editBuilder.insert(endOfDocument, '\n' + updatedSelectedText);

    /**
     * Replace the selected text with the component reference, where the original prop names are
     * replaced with their reference (propAlias) in the extracted component, while the values are kept.
     * Example: <Component propAlias={value} />
     */
    const componentReference = dedent`
      <${componentName}
        ${props.map((prop) => `${prop.pair.replace(/\w+(?==)/, prop.propAlias)}`).join('\n')}
      />
    `;
    editBuilder.replace(rangeAfterReplaces, componentReference);
  });
}
