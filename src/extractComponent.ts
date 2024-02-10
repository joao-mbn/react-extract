import dedent from "dedent";
import * as vscode from "vscode";
import { isFileTypescript } from "./checks";

export function extractComponent(document: vscode.TextDocument, range: vscode.Range | vscode.Selection) {
  const selectedText = document.getText(range).trim();

  const isTypescript = isFileTypescript(document);

  // assuming the selection is JSX, extract props and props values, like <Component prop1="value1" prop2={value2} />
  const propsRegex = /(\w+)\s*=\s*({[^}]+}|".*"|'.*')/g;
  const propsMatches = selectedText.match(propsRegex);

  const entries =
    propsMatches?.map((match) => {
      const [prop, value] = match.split("=");
      return { prop: prop.trim(), value: value.trim() };
    }) ?? [];

  let content = "";

  // Create a component with the name Component{5 random numbers/letters}
  const componentName = `Component_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

  // Add interface Component1Props if file is a TypeScript file
  const interfaceName = `${componentName}Props`;

  if (isTypescript) {
    content += dedent`\n
      interface ${interfaceName} {
        ${entries
          .map((e) => `${e.prop}: unknown`)
          .join(";\n")
          .concat(";")}
      }\n\n
    `;
  }

  content += dedent`
    function ${componentName} ({ ${entries.map((e) => e.prop).join(", ")} }${isTypescript ? `: ${interfaceName}` : ""}) {
      return (
        ${selectedText}
      );
    }`;

  // Add the content to the bottom of the same file
  const edit = new vscode.WorkspaceEdit();
  edit.insert(document.uri, new vscode.Position(document.lineCount, 0), content);
  vscode.workspace.applyEdit(edit);
}
