import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

async function getDocuments(folder: string) {
  const filePath = path.join(__dirname, '../../src/test/components/', folder);
  const fileNames = fs.readdirSync(filePath);

  const tsResultFilePath = fileNames.find((fileName) => fileName.endsWith('Result.tsx'));
  const tsTestFilePath = fileNames.find((fileName) => !fileName.endsWith('Result.tsx') && fileName.endsWith('.tsx'));
  const jsResultFilePath = fileNames.find((fileName) => fileName.endsWith('Result.jsx'));
  const jsTestFilePath = fileNames.find((fileName) => !fileName.endsWith('Result.jsx') && fileName.endsWith('.jsx'));

  const [tsResult, tsTest, jsResult, jsTest] = await Promise.all([
    tsResultFilePath && vscode.workspace.openTextDocument(path.join(filePath, tsResultFilePath)),
    tsTestFilePath && vscode.workspace.openTextDocument(path.join(filePath, tsTestFilePath)),
    jsResultFilePath && vscode.workspace.openTextDocument(path.join(filePath, jsResultFilePath)),
    jsTestFilePath && vscode.workspace.openTextDocument(path.join(filePath, jsTestFilePath))
  ]);

  return { tsResult, tsTest, jsResult, jsTest } as Record<
    'tsResult' | 'tsTest' | 'jsResult' | 'jsTest',
    vscode.TextDocument
  >;
}

export const allRanges: Record<string, { javascript: vscode.Range; typescript: vscode.Range }> = {
  noProps: {
    typescript: new vscode.Range(new vscode.Position(4, 4), new vscode.Position(9, 10)),
    javascript: new vscode.Range(new vscode.Position(4, 4), new vscode.Position(9, 10))
  },
  fragment: {
    typescript: new vscode.Range(new vscode.Position(4, 4), new vscode.Position(11, 7)),
    javascript: new vscode.Range(new vscode.Position(4, 4), new vscode.Position(11, 7))
  },
  onlyStatic: {
    typescript: new vscode.Range(new vscode.Position(5, 4), new vscode.Position(10, 10)),
    javascript: new vscode.Range(new vscode.Position(5, 4), new vscode.Position(10, 10))
  },
  static: {
    typescript: new vscode.Range(new vscode.Position(8, 4), new vscode.Position(18, 10)),
    javascript: new vscode.Range(new vscode.Position(8, 4), new vscode.Position(18, 10))
  },
  implicit: {
    typescript: new vscode.Range(new vscode.Position(6, 4), new vscode.Position(12, 11)),
    javascript: new vscode.Range(new vscode.Position(6, 4), new vscode.Position(12, 11))
  },
  conditional: {
    typescript: new vscode.Range(new vscode.Position(5, 4), new vscode.Position(10, 10)),
    javascript: new vscode.Range(new vscode.Position(5, 4), new vscode.Position(10, 10))
  },
  componentAsFunction: {
    typescript: new vscode.Range(new vscode.Position(13, 4), new vscode.Position(16, 10)),
    javascript: new vscode.Range(new vscode.Position(13, 4), new vscode.Position(16, 10))
  },
  componentAsProps: {
    typescript: new vscode.Range(new vscode.Position(13, 4), new vscode.Position(16, 10)),
    javascript: new vscode.Range(new vscode.Position(13, 4), new vscode.Position(16, 10))
  },
  map: {
    typescript: new vscode.Range(new vscode.Position(18, 4), new vscode.Position(25, 7)),
    javascript: new vscode.Range(new vscode.Position(18, 4), new vscode.Position(25, 7))
  },
  subSelection: {
    typescript: new vscode.Range(new vscode.Position(12, 6), new vscode.Position(15, 34)),
    javascript: new vscode.Range(new vscode.Position(12, 6), new vscode.Position(15, 34))
  },
  textChild: {
    typescript: new vscode.Range(new vscode.Position(6, 4), new vscode.Position(9, 10)),
    javascript: new vscode.Range(new vscode.Position(6, 4), new vscode.Position(9, 10))
  },
  shortHand: {
    typescript: new vscode.Range(new vscode.Position(18, 4), new vscode.Position(26, 6)),
    javascript: new vscode.Range(new vscode.Position(18, 4), new vscode.Position(26, 6))
  },
  longType: {
    typescript: new vscode.Range(new vscode.Position(38, 9), new vscode.Position(38, 39)),
    javascript: new vscode.Range(new vscode.Position(38, 9), new vscode.Position(38, 39))
  },
  propertiesAndMethods: {
    typescript: new vscode.Range(new vscode.Position(21, 4), new vscode.Position(28, 6)),
    javascript: new vscode.Range(new vscode.Position(21, 4), new vscode.Position(28, 6))
  },
  destructureRename: {
    typescript: new vscode.Range(new vscode.Position(5, 9), new vscode.Position(5, 42)),
    javascript: new vscode.Range(new vscode.Position(5, 9), new vscode.Position(5, 42))
  },
  destructureNested: {
    typescript: new vscode.Range(new vscode.Position(8, 9), new vscode.Position(8, 44)),
    javascript: new vscode.Range(new vscode.Position(8, 9), new vscode.Position(8, 44))
  },
  parameter: {
    typescript: new vscode.Range(new vscode.Position(13, 4), new vscode.Position(16, 10)),
    javascript: new vscode.Range(new vscode.Position(4, 4), new vscode.Position(7, 10))
  },
  parameterTypeReference: {
    typescript: new vscode.Range(new vscode.Position(4, 4), new vscode.Position(7, 10)),
    javascript: new vscode.Range(new vscode.Position(4, 4), new vscode.Position(7, 10))
  },
  spread: {
    typescript: new vscode.Range(new vscode.Position(11, 9), new vscode.Position(11, 31)),
    javascript: new vscode.Range(new vscode.Position(3, 9), new vscode.Position(3, 31))
  },
  spreadArray: {
    typescript: new vscode.Range(new vscode.Position(12, 4), new vscode.Position(16, 10)),
    javascript: new vscode.Range(new vscode.Position(8, 4), new vscode.Position(12, 10))
  },
  spreadNested: {
    typescript: new vscode.Range(new vscode.Position(16, 4), new vscode.Position(21, 10)),
    javascript: new vscode.Range(new vscode.Position(8, 4), new vscode.Position(13, 10))
  },
  spreadNestedTypeReference: {
    typescript: new vscode.Range(new vscode.Position(4, 4), new vscode.Position(9, 10)),
    javascript: new vscode.Range(new vscode.Position(4, 4), new vscode.Position(9, 10))
  },
  spreadAny: {
    typescript: new vscode.Range(new vscode.Position(4, 4), new vscode.Position(6, 10)),
    javascript: new vscode.Range(new vscode.Position(4, 4), new vscode.Position(6, 10))
  },
  typeInlineDeclaration: {
    typescript: new vscode.Range(new vscode.Position(7, 4), new vscode.Position(9, 10)),
    javascript: new vscode.Range(new vscode.Position(7, 4), new vscode.Position(9, 10))
  },
  typeInlineDeclarationEmpty: {
    typescript: new vscode.Range(new vscode.Position(4, 4), new vscode.Position(6, 10)),
    javascript: new vscode.Range(new vscode.Position(4, 4), new vscode.Position(6, 10))
  },
  typeInlineDeclarationExtended: {
    typescript: new vscode.Range(new vscode.Position(4, 4), new vscode.Position(9, 10)),
    javascript: new vscode.Range(new vscode.Position(4, 4), new vscode.Position(9, 10))
  },
  typeInlineDeclarationReactFC: {
    typescript: new vscode.Range(new vscode.Position(7, 4), new vscode.Position(9, 10)),
    javascript: new vscode.Range(new vscode.Position(7, 4), new vscode.Position(9, 10))
  },
  typeTypeDeclaration: {
    typescript: new vscode.Range(new vscode.Position(7, 4), new vscode.Position(9, 10)),
    javascript: new vscode.Range(new vscode.Position(7, 4), new vscode.Position(9, 10))
  },
  typeTypeDeclarationEmpty: {
    typescript: new vscode.Range(new vscode.Position(4, 4), new vscode.Position(6, 10)),
    javascript: new vscode.Range(new vscode.Position(4, 4), new vscode.Position(6, 10))
  },
  typeTypeDeclarationExtended: {
    typescript: new vscode.Range(new vscode.Position(4, 4), new vscode.Position(9, 10)),
    javascript: new vscode.Range(new vscode.Position(4, 4), new vscode.Position(9, 10))
  },
  arrowFunctionDeclarationEmpty: {
    typescript: new vscode.Range(new vscode.Position(4, 4), new vscode.Position(6, 10)),
    javascript: new vscode.Range(new vscode.Position(4, 4), new vscode.Position(6, 10))
  },
  arrowFunctionDeclarationSpread: {
    typescript: new vscode.Range(new vscode.Position(4, 4), new vscode.Position(9, 10)),
    javascript: new vscode.Range(new vscode.Position(4, 4), new vscode.Position(9, 10))
  },
  arrowFunctionExplicitReturn: {
    javascript: new vscode.Range(new vscode.Position(4, 4), new vscode.Position(7, 10)),
    typescript: new vscode.Range(new vscode.Position(4, 4), new vscode.Position(7, 10))
  },
  reactFCType: {
    typescript: new vscode.Range(new vscode.Position(6, 4), new vscode.Position(9, 10)),
    javascript: new vscode.Range(new vscode.Position(6, 4), new vscode.Position(9, 10))
  },
  reactFCTypeEmpty: {
    typescript: new vscode.Range(new vscode.Position(4, 4), new vscode.Position(7, 10)),
    javascript: new vscode.Range(new vscode.Position(4, 4), new vscode.Position(7, 10))
  },
  wrapInFragment: {
    typescript: new vscode.Range(new vscode.Position(5, 6), new vscode.Position(7, 21)),
    javascript: new vscode.Range(new vscode.Position(5, 6), new vscode.Position(7, 21))
  },
  undestructuredProps: {
    typescript: new vscode.Range(new vscode.Position(7, 4), new vscode.Position(9, 10)),
    javascript: new vscode.Range(new vscode.Position(7, 4), new vscode.Position(9, 10))
  },
  undestructuredPropsEmpty: {
    typescript: new vscode.Range(new vscode.Position(4, 4), new vscode.Position(6, 10)),
    javascript: new vscode.Range(new vscode.Position(4, 4), new vscode.Position(6, 10))
  },
  undestructuredPropsSpreadAttribute: {
    typescript: new vscode.Range(new vscode.Position(4, 4), new vscode.Position(6, 10)),
    javascript: new vscode.Range(new vscode.Position(4, 4), new vscode.Position(6, 10))
  },
  undestructuredPropsExtended: {
    typescript: new vscode.Range(new vscode.Position(24, 4), new vscode.Position(58, 7)),
    javascript: new vscode.Range(new vscode.Position(24, 4), new vscode.Position(58, 7))
  }
};

export async function getDocumentsAndRange(key: string) {
  const ranges = allRanges[key];

  if (!ranges) {
    throw new Error(`Range not found for key: ${key}`);
  }

  return {
    ranges,
    ...(await getDocuments(key))
  };
}

