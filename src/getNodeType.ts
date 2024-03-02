import ts from 'typescript';

interface GetNodeTypeArguments {
  valueDeclaration: ts.Declaration;
  isSpread: boolean;
  node: ts.Node;
  checker: ts.TypeChecker;
  typeFormatFlag?: ts.TypeFormatFlags;
}

export function getNodeType(args: GetNodeTypeArguments) {
  const resolvedType = getNodeTypeString(args);
  const heuristicType = getTypeHeuristically(args);

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
  const { valueDeclaration, isSpread } = args;

  const shouldGetHeuristicType = isSpread || valueDeclaration.kind === ts.SyntaxKind.Parameter;
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

  const parent = valueDeclaration.parent;
  if (parent.kind !== ts.SyntaxKind.ObjectBindingPattern) return 'any';

  const parentType = getNodeTypeString({
    ...args,
    node: parent,
    typeFormatFlag: ts.TypeFormatFlags.NodeBuilderFlagsMask
  });
  if (parentType === 'any') return 'any';

  const nephews = new Set<string>();
  parent.forEachChild(
    (child) =>
      child !== valueDeclaration &&
      child.forEachChild((grandChild) => ts.isIdentifier(grandChild) && nephews.add(grandChild.getText()))
  );
  if (nephews.size === 0) return parentType;

  const type = `Omit<${parentType}, ${[...nephews.values()].map((v) => `'${v}'`).join(' | ')}>`;
  return type;
}
