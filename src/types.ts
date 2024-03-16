import ts from 'typescript';
import * as vscode from 'vscode';

export type ExtractedProp = {
  name: string;
  isSpread: boolean;
  type: string;
};

export type ExternalArgs = {
  document: vscode.TextDocument;
  range: vscode.Range | vscode.Selection;
  componentName: string;
  functionDeclaration: 'function' | 'arrow';
  typeDeclaration: 'interface' | 'type';
};

export type ArgsDerivedFromExternalArgs = {
  isTypescript: boolean;
  program: ts.Program;
  sourceFile: ts.SourceFile;
  typeDeclarationName: string;
};

export type ExtractionArgs = ExternalArgs & ArgsDerivedFromExternalArgs;

export type PropsAndDerivedData = SingleSpread & {
  props: ExtractedProp[];
  shouldDisplayTypeDeclaration: boolean;
};

type SingleSpread =
  | {
      hasSingleSpread: true;
      singleSpreadType: string;
    }
  | {
      hasSingleSpread: false;
      singleSpreadType: undefined;
    };

export type BuildArgs = ExtractionArgs & PropsAndDerivedData & { shouldWrapInFragments: boolean };
