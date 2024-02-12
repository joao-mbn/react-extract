import dedent from 'dedent';
import * as vscode from 'vscode';
import XRegExp from 'xregexp';
import { isFileTypescript } from './checks';
import { ExtractedProps } from './types';

export async function extractComponent(document: vscode.TextDocument, range: vscode.Range | vscode.Selection) {
  const componentName = await vscode.window.showInputBox({
    value: 'Component',
    title: 'Give the extracted component a name',
  });

  // If the user clears the input or cancels the input, it's implied that the user doesn't want to proceed.
  if (!componentName) {
    return;
  }

  const selectedText = document.getText(range).trim();

  const props = extractProps(selectedText);

  const isTypescript = isFileTypescript(document);
  const extractedComponent = buildExtractedComponent(componentName, isTypescript, props, selectedText);

  const extractedComponentReference = buildExtractedComponentReference(componentName, props);

  // Add the content to the bottom of the same file
  const edit = new vscode.WorkspaceEdit();
  edit.insert(document.uri, new vscode.Position(document.lineCount, 0), extractedComponent);

  // Adds the new component instance, in place of the selected text
  edit.replace(document.uri, range, extractedComponentReference);

  vscode.workspace.applyEdit(edit);
}

export function extractProps(selectedText: string): ExtractedProps[] {
  // (["prop{whitespace}='value'", "prop{whitespace}", "'value'"])[]
  const stringProps = [...selectedText.matchAll(/(\w+)\s*=\s*("[^"]+"|'[^']+')/g)];

  // "prop"[]
  const implicitlyTrueProps =
    selectedText.match(/(?<=[\s}])\w+(?=(\s*[/>]|\s+\w+))(?!\s*\w*["'}])/g)?.map((m) => [m, m, '']) ?? [];

  // (["prop{whitespace}={value}", "prop{whitespace}", "{value}"])[]
  const insideCurlyProps = XRegExp.matchRecursive(selectedText, '{', '}', 'g', {
    valueNames: ['between', null, 'match', null],
    unbalanced: 'skip-lazy',
  }).reduce(
    (acc, curr, index, self) => {
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
    },
    [] as [string, string, string][]
  );

  return [...stringProps, ...implicitlyTrueProps, ...insideCurlyProps]
    .map((match, index) => {
      const [pair, prop, value] = match;
      return { pair: pair.trim(), prop: prop.trim(), value: value.trim(), index, implicitlyTrue: !value };
    })
    .map((entry, _, self) => {
      const { index: __, ...rest } = entry;

      /* appends a prop alias to differentiate props that appears multiple times */
      const repeatedProps = self.filter((e) => e.prop === entry.prop);
      if (repeatedProps.length > 1) {
        const repetitionOccurenceIndex = repeatedProps.findIndex((rp) => rp.index === entry.index);
        return {
          ...rest,
          propAlias: `${entry.prop}${repetitionOccurenceIndex > 0 ? repetitionOccurenceIndex + 1 : ''}`,
        };
      }

      return { ...rest, propAlias: entry.prop };
    });
}

export function buildExtractedComponent(
  componentName: string,
  isTypescript: boolean,
  props: ExtractedProps[],
  selectedText: string
) {
  const interfaceName = `${componentName}Props`;

  const interfaceDeclaration = dedent`\n
    interface ${interfaceName} {
      ${props
        .map((e) => `${e.propAlias}: unknown`)
        .join(';\n')
        .concat(';')}
      }\n
  `;

  // replace selectedText substrings matching entries values with entries propAlias
  const parsedText = props.reduce(
    (accParsedText, { pair, propAlias, prop }) => accParsedText.replace(pair, `${prop}={${propAlias}}`),
    selectedText
  );

  const shouldDisplayInterface = isTypescript && props.length > 0;

  const functionDeclaration = dedent`
    function ${componentName}(
      ${props.length > 0 ? `{ ${props.map((e) => e.propAlias).join(',\n')} }` : ''}
      ${shouldDisplayInterface ? `: ${interfaceName}` : ''}
    ) {
      return (
        ${parsedText}
      );
    }
  `;

  return dedent`
    ${shouldDisplayInterface ? interfaceDeclaration : ''}\n

    ${functionDeclaration}
  `;
}

export function buildExtractedComponentReference(componentName: string, props: ExtractedProps[]) {
  return dedent`
    <${componentName}
      ${props.map((e) => `${e.pair}`).join('\n')}
    />`;
}
