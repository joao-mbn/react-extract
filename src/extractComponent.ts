import dedent from "dedent";
import * as vscode from "vscode";
import { isFileTypescript } from "./checks";

export function extractComponent(document: vscode.TextDocument, range: vscode.Range | vscode.Selection) {
  const selectedText = document.getText(range).trim();

  // Get file extension
  const isTypescript = isFileTypescript(document);

  let content = "";

  // Add interface Component1Props if file is a TypeScript file
  const componentName = "Component1";
  const interfaceName = `${componentName}Props`;
  if (isTypescript) {
    content += dedent`
      interface ${interfaceName} {

      }\n\n
    `;
  }

  content += dedent`
    function ${componentName} ({ ...props }${isTypescript ? `: ${interfaceName}` : ""}) {
      return (
        ${selectedText}
      );
    }`;

  // Add the content to the bottom of the same file
  const edit = new vscode.WorkspaceEdit();
  edit.insert(document.uri, new vscode.Position(document.lineCount, 0), content);
  vscode.workspace.applyEdit(edit);
}
