import ts from 'typescript';
import { chooseAdequateType, truncateType } from './utils';

interface GetNodeTypeArguments {
  valueDeclaration: ts.Declaration;
  isSpread: boolean;
  node: ts.Node;
  checker: ts.TypeChecker;
  typeFormatFlag?: ts.TypeFormatFlags;
}

export function getNodeType(args: GetNodeTypeArguments) {
  const resolvedType = getNodeTypeString(args);
  const heuristicType = truncateType(getTypeHeuristically(args));

  return chooseAdequateType(resolvedType, heuristicType);
}

function getNodeTypeString({ node, checker, typeFormatFlag }: GetNodeTypeArguments) {
  const type = checker.getTypeAtLocation(node);
  const typeAsString = checker.typeToString(type, node, typeFormatFlag);

  const isPropTypeTruncated = /... \d+ more .../.test(typeAsString);

  return isPropTypeTruncated ? 'any' : typeAsString;
}

function getTypeHeuristically(args: GetNodeTypeArguments) {
  const { valueDeclaration } = args;

  const shouldGetHeuristicType = [ts.SyntaxKind.BindingElement, ts.SyntaxKind.Parameter].includes(
    valueDeclaration.kind
  );
  if (!shouldGetHeuristicType) return 'any';

  if (valueDeclaration.kind === ts.SyntaxKind.Parameter) {
    return getParameterType({ valueDeclaration });
  }

  const isSpreadDeclaration = valueDeclaration.getFirstToken()?.kind === ts.SyntaxKind.DotDotDotToken ?? false;
  const parent = valueDeclaration.parent;
  const parentType = getValueDeclarationParentType({
    ...args,
    node: parent,
    typeFormatFlag: ts.TypeFormatFlags.NodeBuilderFlagsMask
  });

  if (parentType === 'any') return isSpreadDeclaration ? 'Record<any, any>' : 'any';

  if (parent.kind === ts.SyntaxKind.ArrayBindingPattern) {
    return getArrayBoundValueType({ isSpreadDeclaration, parentType });
  }

  if (parent.kind === ts.SyntaxKind.ObjectBindingPattern) {
    return getObjectBoundValueType({ isSpreadDeclaration, parentType, parent, valueDeclaration });
  }

  // Unforeseen case
  return 'any';
}

interface GetArrayBoundValueTypeArgs {
  isSpreadDeclaration: boolean;
  parentType: string;
}

function getArrayBoundValueType({ isSpreadDeclaration, parentType }: GetArrayBoundValueTypeArgs) {
  if (isSpreadDeclaration) {
    return parentType;
  } else {
    const arrayArgumentAngleBracketsSyntax = [...(parentType.match(/Array<([\s\S]+)>/) ?? [])][1];
    const arrayArgumentSquareBracketSyntax = [...(parentType.match(/([\s\S]+)\[]/) ?? [])][1];
    return arrayArgumentAngleBracketsSyntax || arrayArgumentSquareBracketSyntax || `${parentType}[number]`;
  }
}

interface GetObjectBoundValueTypeArgs {
  parent: ts.Node;
  valueDeclaration: ts.Node;
  isSpreadDeclaration: boolean;
  parentType: string;
}

function getObjectBoundValueType({
  parent,
  valueDeclaration,
  isSpreadDeclaration,
  parentType
}: GetObjectBoundValueTypeArgs) {
  if (isSpreadDeclaration) {
    const siblings = new Set<string>();

    parent.forEachChild((child) => {
      if (child !== valueDeclaration) {
        child.forEachChild((child) => {
          if (child.kind === ts.SyntaxKind.Identifier) {
            siblings.add(child.getText());
          }
        });
      }
    });

    if (siblings.size === 0) return parentType;

    return `Omit<${parentType}, ${[...siblings.values()].map((v) => `'${v}'`).join(' | ')}>`;
  } else {
    return `${parentType}['${valueDeclaration.getText()}']`;
  }
}

interface GetTypeByTypeReferenceArgs {
  valueDeclaration: ts.Node;
}

function getParameterType({ valueDeclaration }: GetTypeByTypeReferenceArgs) {
  let type = 'any';
  valueDeclaration.forEachChild((child) => {
    if (child.kind === ts.SyntaxKind.TypeReference) {
      type = child.getText();
    }
  });
  return type;
}

function getValueDeclarationParentType(args: GetNodeTypeArguments) {
  const { node: parent } = args;
  const parentResolvedType = getNodeTypeString(args);
  let parentHeuristicType = 'any';

  if (parent.kind === ts.SyntaxKind.ObjectBindingPattern && parent.parent.kind === ts.SyntaxKind.Parameter) {
    parentHeuristicType = getParameterType({ valueDeclaration: parent.parent });
  }

  const parentType = chooseAdequateType(parentResolvedType, parentHeuristicType);
  return parentType;
}
