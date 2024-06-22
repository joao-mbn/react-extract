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
  const typeDeclarationInfo = getTypeDeclarationBodyAndReference({ ...extractionArgs, ...propsAndDerivedData });

  const buildArgs = { ...extractionArgs, ...propsAndDerivedData, ...typeDeclarationInfo, shouldWrapInFragments };

  const editor = await vscode.window.showTextDocument(document);
  await editor.edit((editBuilder) => {
    const extractedComponent = buildFunctionDeclarationWithType(buildArgs);

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
  const typeDeclaration =
    typeof _typeDeclaration === 'string' && ['interface', 'type', 'inline'].includes(_typeDeclaration)
      ? (_typeDeclaration as 'type' | 'inline' | 'interface')
      : 'interface';

  const _declareWithReactFC = config.get('declareWithReactFC');
  const declareWithReactFC = _declareWithReactFC === 'true' && functionDeclaration === 'arrow';

  const _destructureProps = config.get('destructureProps');
  const destructureProps = _destructureProps !== 'false';

  const _explicitReturnStatement = config.get('explicitReturnStatement');
  const explicitReturnStatement = _explicitReturnStatement === 'true' && functionDeclaration === 'arrow';

  return { functionDeclaration, typeDeclaration, declareWithReactFC, explicitReturnStatement, destructureProps };
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

function getTypeDeclarationBodyAndReference(args: ExtractionArgs & PropsAndDerivedData) {
  const { typeDeclaration: typeDeclarationType, typeDeclarationName } = args;
  const typeDeclaration = buildTypeDeclaration(args);
  const typeDeclarationBody = typeDeclarationType === 'inline' ? '' : typeDeclaration;
  const typeDeclarationReference = typeDeclarationType === 'inline' ? typeDeclaration : typeDeclarationName;

  return { typeDeclarationBody, typeDeclarationReference };
}

function buildTypeDeclaration(args: ExtractionArgs & PropsAndDerivedData) {
  const {
    hasSingleSpread,
    props,
    singleSpreadType,
    typeDeclaration: typeDeclarationType,
    typeDeclarationName,
    shouldDisplayTypeDeclaration
  } = args;

  if (!shouldDisplayTypeDeclaration) return '';

  const propsToDeclare = props.filter(({ isSpread }) => !hasSingleSpread || (hasSingleSpread && !isSpread));
  const declaredProps =
    propsToDeclare.map(({ name, type }) => `${name}: ${type}`).join(';\n') + (propsToDeclare.length > 0 ? ';' : '');

  switch (typeDeclarationType) {
    case 'type':
      return `\n
        type ${typeDeclarationName} = ${singleSpreadType ? `${singleSpreadType} & ` : ''} {
          ${declaredProps}
        };\n
      `;
    case 'inline':
      return `${singleSpreadType ? `${singleSpreadType} & ` : ''} { ${declaredProps} }`;
    case 'interface':
      return `\n
        interface ${typeDeclarationName} ${singleSpreadType ? `extends ${singleSpreadType}` : ''} {
          ${declaredProps}
        }\n
      `;
  }
}

function buildFunctionDeclarationWithType(args: BuildArgs) {
  const { componentName, functionDeclaration: functionDeclarationType, typeDeclarationBody } = args;

  const functionArguments = buildFunctionArguments(args);
  const functionArgumentsType = buildFunctionArgumentsType(args);
  const body = buildFunctionBody(args);

  if (functionDeclarationType === 'arrow') {
    const explicitType = buildFunctionExplicitType(args);
    return `
      ${typeDeclarationBody}
      const ${componentName}${explicitType} = (${functionArguments}${functionArgumentsType}) => ${body}
    `;
  } else {
    return `
      ${typeDeclarationBody}
      function ${componentName}(${functionArguments}${functionArgumentsType}) ${body}
    `;
  }
}

function buildFunctionArgumentsType(args: BuildArgs) {
  const {
    functionDeclaration: functionDeclarationType,
    declareWithReactFC,
    shouldDisplayTypeDeclaration,
    typeDeclarationReference
  } = args;

  if (!shouldDisplayTypeDeclaration) return '';

  if (functionDeclarationType === 'arrow' && declareWithReactFC) return '';

  return `: ${typeDeclarationReference}`;
}

function buildFunctionArguments(args: BuildArgs) {
  const { props, hasSingleSpread } = args;

  const boundProps = props.map(({ name, isSpread }) => (isSpread && hasSingleSpread ? `...${name}` : name)).join(',\n');
  const functionArguments = `${props.length > 0 ? `{ ${boundProps} }` : ''}`;
  return functionArguments;
}

function buildFunctionExplicitType(args: BuildArgs) {
  const {
    functionDeclaration,
    declareWithReactFC,
    shouldDisplayTypeDeclaration,
    typeDeclarationReference,
    isTypescript
  } = args;

  if (isTypescript && functionDeclaration === 'arrow' && declareWithReactFC) {
    return `: React.FC${shouldDisplayTypeDeclaration ? `<${typeDeclarationReference}>` : ''}`;
  } else {
    return '';
  }
}

function buildFunctionBody(args: BuildArgs) {
  const {
    document,
    explicitReturnStatement,
    functionDeclaration: functionDeclarationType,
    range,
    shouldWrapInFragments
  } = args;

  const functionReturn = shouldWrapInFragments ? `<>\n${document.getText(range)}\n</>` : document.getText(range);

  if (functionDeclarationType === 'arrow' && !explicitReturnStatement) {
    return `(
      ${functionReturn}
    );`;
  } else {
    return `{
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

