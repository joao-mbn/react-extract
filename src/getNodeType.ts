import ts from 'typescript';

interface GetNodeTypeArguments extends GetOriginalNodeTypeStringArguments {
  valueDeclaration: ts.Declaration;
  isSpread: boolean;
}

export function getNodeType(args: GetNodeTypeArguments) {
  const { node, checker, isSpread } = args;
  const typeAsString = getNodeTypeString({ node, checker });

  if (!isSpread || typeAsString !== 'any') return typeAsString;

  return getSpreadSimplifiedType(args);
}

interface GetOriginalNodeTypeStringArguments {
  node: ts.Node;
  checker: ts.TypeChecker;
  typeFormatFlag?: ts.TypeFormatFlags;
}

function getNodeTypeString({ node, checker, typeFormatFlag }: GetOriginalNodeTypeStringArguments) {
  const type = checker.getTypeAtLocation(node);
  const typeAsString = checker.typeToString(type, node, typeFormatFlag);

  const isPropTypeTruncated = /... \d+ more .../.test(typeAsString);

  return isPropTypeTruncated ? 'any' : typeAsString;
}

function getSpreadSimplifiedType({ valueDeclaration, checker }: GetNodeTypeArguments) {
  const id = valueDeclaration.pos;
  if (valueDeclaration.kind !== ts.SyntaxKind.BindingElement) return 'any';

  const parent = valueDeclaration.parent;
  if (parent.kind === ts.SyntaxKind.ArrayBindingPattern) {
    // TODO: handle array destructuring
    return 'any';
  }

  if (parent.kind !== ts.SyntaxKind.ObjectBindingPattern) return 'any';

  const siblingNames = new Set<string>();

  parent.forEachChild(
    (child) =>
      child.pos !== id &&
      child.forEachChild((grandChild) => ts.isIdentifier(grandChild) && siblingNames.add(grandChild.getText()))
  );

  const grandParentType = getNodeTypeString({
    checker,
    node: parent,
    typeFormatFlag: ts.TypeFormatFlags.NodeBuilderFlagsMask
  });
  if (grandParentType === 'any' || siblingNames.size === 0) return grandParentType;

  const type = `Omit<${grandParentType}, ${[...siblingNames.values()].map((v) => `'${v}'`).join(' | ')}>`;

  return type;
}
