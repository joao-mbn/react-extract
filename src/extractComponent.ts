import * as vscode from 'vscode';
import { isFileTypescript } from './checks';
import { extractProps } from './extractProps';
import { BuildArgs, ExtractionArgs, PropsAndDerivedData } from './types';
import { capitalizeComponentName, removeNonWordCharacters } from './utils';

export async function extractComponent(document: vscode.TextDocument, range: vscode.Range | vscode.Selection) {
  const componentName = await getComponentName();
  if (!componentName) return;

  const configs = getFileConfigs();

  const isTypescript = isFileTypescript(document);

  const args: ExtractionArgs = { document, range, componentName, isTypescript, ...configs };

  await buildExtractedComponent(args);
}

export async function buildExtractedComponent(args: ExtractionArgs) {
  const { document, range } = args;

  const propsAndDerivedData = getPropsAndDerivedData(args);
  const { shouldDisplayTypeDeclaration } = propsAndDerivedData;

  const editor = await vscode.window.showTextDocument(document);

  await editor.edit((editBuilder) => {
    const buildArgs = { ...args, ...propsAndDerivedData };

    const typeDeclaration = shouldDisplayTypeDeclaration ? buildTypeDeclaration(buildArgs) : '';
    const functionDeclaration = buildFunctionDeclaration(buildArgs);

    const extractedComponent = `
      ${typeDeclaration}\n
      ${functionDeclaration}
    `;

    const lastLine = document.lineAt(document.lineCount - 1);
    const endOfDocument = new vscode.Position(lastLine.lineNumber, lastLine.text.length);
    editBuilder.insert(endOfDocument, '\n' + extractedComponent);

    const componentInstance = buildComponentInstance(buildArgs);
    editBuilder.replace(range, componentInstance);
  });
}

async function getComponentName() {
  const componentGivenName = await vscode.window.showInputBox({
    value: 'Component',
    title: 'Give the extracted component a name'
  });
  // If the user clears the input or cancels the input, it's implied that the user doesn't want to proceed.
  if (!componentGivenName) return;

  const componentNameWithoutNonWordChars = removeNonWordCharacters(componentGivenName);
  if (!componentNameWithoutNonWordChars) return;

  const componentName = capitalizeComponentName(componentNameWithoutNonWordChars);
  return componentName;
}

function getFileConfigs() {
  const config = vscode.workspace.getConfiguration('reactExtract');

  const _functionDeclaration = config.get('functionDeclaration');
  const functionDeclaration: 'arrow' | 'function' = _functionDeclaration === 'arrow' ? 'arrow' : 'function';

  const _typeDeclaration = config.get('typeDeclaration');
  const typeDeclaration: 'interface' | 'type' = _typeDeclaration === 'type' ? 'type' : 'interface';

  return { functionDeclaration, typeDeclaration };
}

function getPropsAndDerivedData(args: ExtractionArgs): PropsAndDerivedData {
  const { isTypescript, componentName } = args;
  const typeDeclarationName = `${componentName}Props`;

  const props = extractProps(args).sort((a, b) => {
    if (a.isSpread) return 1;
    if (b.isSpread) return -1;

    return a.name.localeCompare(b.name);
  });

  const shouldDisplayTypeDeclaration = isTypescript && props.length > 0;

  const spreadProps = props.filter((prop) => prop.isSpread);
  const hasSingleSpread = spreadProps.length === 1;

  return {
    typeDeclarationName,
    props,
    shouldDisplayTypeDeclaration,
    ...(hasSingleSpread
      ? { hasSingleSpread, singleSpreadType: spreadProps[0].type }
      : { hasSingleSpread, singleSpreadType: undefined })
  };
}

function buildTypeDeclaration(args: BuildArgs) {
  const { hasSingleSpread, props, singleSpreadType, typeDeclaration: typeDeclarationType, typeDeclarationName } = args;

  const declaredProps = props
    .filter(({ isSpread }) => !hasSingleSpread || (hasSingleSpread && !isSpread))
    .map(({ name, type }) => `${name}: ${type}`)
    .join(';\n')
    .concat(';');

  if (typeDeclarationType === 'type') {
    return `\n
      type ${typeDeclarationName} = ${singleSpreadType ? `${singleSpreadType} & ` : ''} {
        ${declaredProps}
      };\n
    `;
  } else {
    return `\n
      interface ${typeDeclarationName} ${singleSpreadType ? `extends ${singleSpreadType}` : ''} {
        ${declaredProps}
      }\n
    `;
  }
}

function buildFunctionDeclaration(args: BuildArgs) {
  const {
    componentName,
    document,
    functionDeclaration: functionDeclarationType,
    hasSingleSpread,
    props,
    range,
    shouldDisplayTypeDeclaration,
    typeDeclarationName
  } = args;

  const boundProps = props.map(({ name, isSpread }) => (isSpread && hasSingleSpread ? `...${name}` : name)).join(',\n');

  if (functionDeclarationType === 'arrow') {
    return `
      const ${componentName} = (
        ${props.length > 0 ? `{ ${boundProps} }` : ''}
        ${shouldDisplayTypeDeclaration ? `: ${typeDeclarationName}` : ''}
      ) => (
        ${document.getText(range)}
      );
    `;
  } else {
    return `
      function ${componentName}(
        ${props.length > 0 ? `{ ${boundProps} }` : ''}
        ${shouldDisplayTypeDeclaration ? `: ${typeDeclarationName}` : ''}
      ) {
        return (
          ${document.getText(range)}
        );
      }`;
  }
}

function buildComponentInstance(args: BuildArgs) {
  const { componentName, props, hasSingleSpread } = args;

  const passedProps = props
    .map(({ name, isSpread }) => (isSpread && hasSingleSpread ? `{...${name}}` : `${name}={${name}}`))
    .join('\n');

  return `
    <${componentName}
      ${passedProps}
    />
  `;
}
