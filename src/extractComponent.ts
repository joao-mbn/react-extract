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
    function ${componentName} (${isTypescript ? `{ ...props }: ${interfaceName}` : ""}) {
      return (
        ${selectedText}
      );
    }`;

  console.log(content);
}
