import ts from 'typescript';
import { truncateType } from './utils';

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

  if (resolvedType !== 'any' && heuristicType === 'any') return resolvedType;
  if (resolvedType === 'any' && heuristicType !== 'any') return heuristicType;

  if (resolvedType !== 'any' && heuristicType !== 'any') {
    return resolvedType.length <= heuristicType.length ? resolvedType : heuristicType;
  }

  return 'any';
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
    let type = 'any';
    valueDeclaration.forEachChild((child) => {
      if (child.kind === ts.SyntaxKind.TypeReference) {
        type = child.getText();
      }
    });
    return type;
  }

  const isSpreadDeclaration = valueDeclaration.getFirstToken()?.kind === ts.SyntaxKind.DotDotDotToken ?? false;
  const parent = valueDeclaration.parent;
  const parentType = getNodeTypeString({
    ...args,
    node: parent,
    typeFormatFlag: ts.TypeFormatFlags.NodeBuilderFlagsMask
  });

  if (parent.kind === ts.SyntaxKind.ArrayBindingPattern) {
    if (isSpreadDeclaration) {
      return parentType;
    } else {
      const arrayArgumentAngleBracketsSyntax = [...(parentType.match(/Array<([\s\S]+)>/) ?? [])][1];
      const arrayArgumentSquareBracketSyntax = [...(parentType.match(/([\s\S]+)\[]/) ?? [])][1];
      return arrayArgumentAngleBracketsSyntax || arrayArgumentSquareBracketSyntax || `${parentType}[number]`;
    }
  }

  if (parent.kind === ts.SyntaxKind.ObjectBindingPattern) {
    if (isSpreadDeclaration) {
      const siblings = new Set<string>();
      parent.forEachChild((child) => {
        if (child !== valueDeclaration) {
          siblings.add(child.getText());
        }
      });
      if (siblings.size === 0) return parentType;

      return `Omit<${parentType}, ${[...siblings.values()].map((v) => `'${v}'`).join(' | ')}>`;
    } else {
      return `Pick<${parentType}, '${valueDeclaration.getText()}'>`;
    }
  }

  // Unforeseen case
  return 'any';
}
