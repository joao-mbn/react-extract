import * as vscode from 'vscode';
import { isFileTypescript } from './checks';
import { extractProps } from './parsers/extractProps';
import { determineIfShouldWrapInFragments } from './parsers/fragment';
import { ArgsDerivedFromExternalArgs, BuildArgs, ExternalArgs, ExtractionArgs, PropsAndDerivedData } from './types';
import { getProgramAndSourceFile } from './typescriptProgram';
import { capitalizeComponentName, removeNonWordCharacters } from './utils';

export async function extractComponent(document: vscode.TextDocument, range: vscode.Range | vscode.Selection) {
  const componentName = await getComponentName();
  if (!componentName) return;

  const configs = getFileConfigs();

  const args: ExternalArgs = { document, range, componentName, ...configs };

  await buildExtractedComponent(args);
}

export async function buildExtractedComponent(externalArgs: ExternalArgs) {
  const { document, range } = externalArgs;

  const argsDerivedFromExternalArgs = getArgsDerivedFromExternalArgs(externalArgs);

  const extractionArgs = { ...externalArgs, ...argsDerivedFromExternalArgs };

  const shouldWrapInFragments = determineIfShouldWrapInFragments(extractionArgs);

  const propsAndDerivedData = getPropsAndPropsDerivedData(extractionArgs);
  const { shouldDisplayTypeDeclaration } = propsAndDerivedData;

  const buildArgs = { ...extractionArgs, ...propsAndDerivedData, shouldWrapInFragments };

  const editor = await vscode.window.showTextDocument(document);
  await editor.edit((editBuilder) => {
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

  const _declareWithReactFC = config.get('declareWithReactFC');
  const declareWithReactFC = _declareWithReactFC === 'true' && functionDeclaration === 'arrow';

  const _explicitReturnType = config.get('explicitReturnType');
  const explicitReturnType = _explicitReturnType === 'true' && functionDeclaration === 'arrow';

  return { functionDeclaration, typeDeclaration, declareWithReactFC, explicitReturnType };
}

function getArgsDerivedFromExternalArgs(args: ExternalArgs): ArgsDerivedFromExternalArgs {
  const { componentName, document } = args;

  const isTypescript = isFileTypescript(document);
  const typeDeclarationName = `${componentName}Props`;
  const { program, sourceFile } = getProgramAndSourceFile(document);

  if (!sourceFile) {
    vscode.window.showErrorMessage('Could not get source file');
    throw new Error('Could not get source file');
  }

  return { isTypescript, typeDeclarationName, program, sourceFile };
}

function getPropsAndPropsDerivedData(args: ExtractionArgs): PropsAndDerivedData {
  const { isTypescript } = args;

  const props = extractProps(args).sort((a, b) => {
    if (a.isSpread) return 1;
    if (b.isSpread) return -1;

    return a.name.localeCompare(b.name);
  });

  const shouldDisplayTypeDeclaration = isTypescript && props.length > 0;

  const spreadProps = props.filter((prop) => prop.isSpread);
  const hasSingleSpread = spreadProps.length === 1;

  return {
    props,
    shouldDisplayTypeDeclaration,
    ...(hasSingleSpread
      ? { hasSingleSpread, singleSpreadType: spreadProps[0].type }
      : { hasSingleSpread, singleSpreadType: undefined })
  };
}

function buildTypeDeclaration(args: BuildArgs) {
  const { hasSingleSpread, props, singleSpreadType, typeDeclaration: typeDeclarationType, typeDeclarationName } = args;

  const propsToDeclare = props.filter(({ isSpread }) => !hasSingleSpread || (hasSingleSpread && !isSpread));
  const declaredProps =
    propsToDeclare.map(({ name, type }) => `${name}: ${type}`).join(';\n') + (propsToDeclare.length > 0 ? ';' : '');

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
    declareWithReactFC,
    document,
    explicitReturnType,
    functionDeclaration: functionDeclarationType,
    hasSingleSpread,
    isTypescript,
    props,
    range,
    shouldDisplayTypeDeclaration,
    shouldWrapInFragments,
    typeDeclarationName
  } = args;

  const boundProps = props.map(({ name, isSpread }) => (isSpread && hasSingleSpread ? `...${name}` : name)).join(',\n');
  const functionPropsAsString = `${props.length > 0 ? `{ ${boundProps} }` : ''}`;

  const functionReturn = shouldWrapInFragments ? `<>\n${document.getText(range)}\n</>` : document.getText(range);

  if (functionDeclarationType === 'arrow') {
    let functionArguments: string;

    if (declareWithReactFC) {
      functionArguments = isTypescript
        ? `: React.FC${shouldDisplayTypeDeclaration ? `<${typeDeclarationName}>` : ''} = (
        ${functionPropsAsString}
      )`
        : ` = (
          ${functionPropsAsString}
        )`;
    } else {
      functionArguments = ` = (
        ${functionPropsAsString}
        ${shouldDisplayTypeDeclaration ? `: ${typeDeclarationName}` : ''}
      )`;
    }

    return `
      const ${componentName}${functionArguments} => (
        ${functionReturn}
      );
    `;
  } else {
    const functionArguments = `
      ${functionPropsAsString}
      ${shouldDisplayTypeDeclaration ? `: ${typeDeclarationName}` : ''}
    `;
    return `
      function ${componentName}(
        ${functionArguments}
      ) {
        return (
          ${functionReturn}
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

