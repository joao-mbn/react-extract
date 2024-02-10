import dedent from "dedent";
import * as vscode from "vscode";
import { isFileTypescript } from "./checks";

export function extractComponent(document: vscode.TextDocument, range: vscode.Range | vscode.Selection) {
  const selectedText = document.getText(range).trim();

  const isTypescript = isFileTypescript(document);

  // assuming the selection is JSX, extract props and props values, like <Component prop1="value1" prop2={value2} />
  const propsRegex = /(\w+)\s*=\s*({[^}]+}|"[^"]+"|'[^']+')/g;
  const propsMatches = [...selectedText.matchAll(propsRegex)];

  const entries =
    propsMatches
      ?.map((match, index) => {
        const [pair, prop, value] = match; // ["prop={value}", "prop", "value"];
        return { pair: pair.trim(), prop: prop.trim(), value: value.trim(), index };
      })
      .map((entry, _, self) => {
        const { index: __, ...rest } = entry;

        /* appends a prop alias to differentiate props that appears multiple times */
        const repeatedProps = self.filter((e) => e.prop === entry.prop);
        if (repeatedProps.length > 1) {
          const repetitionOccurenceIndex = repeatedProps.findIndex((rp) => rp.index === entry.index);
          return {
            ...rest,
            propAlias: `${entry.prop}${repetitionOccurenceIndex > 0 ? repetitionOccurenceIndex + 1 : ""}`,
          };
        }

        return { ...rest, propAlias: entry.prop };
      }) ?? [];

  // Create a component with the name Component{5 random numbers/letters}
  const componentName = `Component_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
  // Add interface Component1Props if file is a TypeScript file
  const interfaceName = `${componentName}Props`;

  let newComponent = "";

  if (isTypescript) {
    newComponent += dedent`\n
      interface ${interfaceName} {
        ${entries
          .map((e) => `${e.propAlias}: unknown`)
          .join(";\n")
          .concat(";")}
      }\n
    `;
  }

  // replace selectedText substrings matching entries values with entries propAlias
  const parsedText = entries.reduce((accParsedText, currEntry) => accParsedText.replace(currEntry.value, `{${currEntry.propAlias}}`), selectedText);

  newComponent += dedent`\n
    function ${componentName} ({
      ${entries.map((e) => e.propAlias).join(",\n")}
    }${isTypescript ? `: ${interfaceName}` : ""}) {
      return (
        ${parsedText}
      );
    }`;

  const newComponentReferenceOnParent = dedent`
    <${componentName}
      ${entries.map((e) => `${e.pair}`).join("\n")}
    />`;

  // Add the content to the bottom of the same file
  const edit = new vscode.WorkspaceEdit();
  edit.insert(document.uri, new vscode.Position(document.lineCount, 0), newComponent);

  // Adds the new component instance, in place of the selected text
  edit.replace(document.uri, range, newComponentReferenceOnParent);

  vscode.workspace.applyEdit(edit);
}
