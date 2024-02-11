import dedent from "dedent";
import * as vscode from "vscode";
import XRegExp from "xregexp";
import { isFileTypescript } from "./checks";
import { ExtractedProps } from "./types";

export function extractComponent(document: vscode.TextDocument, range: vscode.Range | vscode.Selection) {
  const selectedText = document.getText(range).trim();

  const isTypescript = isFileTypescript(document);

  // assuming the selection is JSX, extract props and props values, like <Component prop1="value1" prop2={value2} />
  const props = extractProps(selectedText);

  // Create a component with the name Component{5 random numbers/letters}
  const componentName = `Component_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
  // Add interface Component1Props if file is a TypeScript file
  const interfaceName = `${componentName}Props`;

  let newComponent = "";

  if (isTypescript) {
    newComponent += dedent`\n
      interface ${interfaceName} {
        ${props
          .map((e) => `${e.propAlias}: unknown`)
          .join(";\n")
          .concat(";")}
      }\n
    `;
  }

  // replace selectedText substrings matching entries values with entries propAlias
  const parsedText = props.reduce((accParsedText, currEntry) => accParsedText.replace(currEntry.value, `{${currEntry.propAlias}}`), selectedText);

  newComponent += dedent`\n
    function ${componentName} ({
      ${props.map((e) => e.propAlias).join(",\n")}
    }${isTypescript ? `: ${interfaceName}` : ""}) {
      return (
        ${parsedText}
      );
    }`;

  const newComponentReferenceOnParent = dedent`
    <${componentName}
      ${props.map((e) => `${e.pair}`).join("\n")}
    />`;

  // Add the content to the bottom of the same file
  const edit = new vscode.WorkspaceEdit();
  edit.insert(document.uri, new vscode.Position(document.lineCount, 0), newComponent);

  // Adds the new component instance, in place of the selected text
  edit.replace(document.uri, range, newComponentReferenceOnParent);

  vscode.workspace.applyEdit(edit);
}

export function extractProps(selectedText: string): ExtractedProps[] {
  // (["prop{whitespace}='value'", "prop{whitespace}", "'value'"])[]
  const stringProps = [...selectedText.matchAll(/(\w+)\s*=\s*("[^"]+"|'[^']+')/g)];

  // (["prop{whitespace}={value}", "prop{whitespace}", "{value}"])[]
  const matchesGrouped = XRegExp.matchRecursive(selectedText, "{", "}", "g", {
    valueNames: ["between", null, "match", null],
    unbalanced: "skip-lazy",
  }).reduce((acc, curr, index, self) => {
    const next = self[index + 1];
    if (next == null) {
      return acc;
    }

    // "prop{whitespace}="
    const prop = curr.value.match(/(\w+)\s*=(?![\s\S]*(\w+)\s*=)/)?.[0];

    if (prop == null) {
      return acc;
    }

    const value = `{${next.value}}`;

    if (index % 2 === 0) {
      acc.push([
        `${prop}${value}`,
        prop.substring(0, prop.length - 1), // remove "="
        value,
      ]);
    }

    return acc;
  }, [] as [string, string, string][]);

  return (
    [...stringProps, ...matchesGrouped]
      .map((match, index) => {
        const [pair, prop, value] = match;
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
      }) ?? []
  );
}
