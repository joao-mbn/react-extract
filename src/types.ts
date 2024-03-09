import * as vscode from 'vscode';

export type ExtractedProp = {
  name: string;
  isSpread: boolean;
  type: string;
};

export type ExtractionArgs = {
  document: vscode.TextDocument;
  range: vscode.Range | vscode.Selection;
  componentName: string;
  isTypescript: boolean;
  typeDeclaration: 'interface' | 'type';
  functionDeclaration: 'function' | 'arrow';
};

export type PropsAndDerivedData = SingleSpread & {
  props: ExtractedProp[];
  shouldDisplayTypeDeclaration: boolean;
  typeDeclarationName: string;
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

export type BuildArgs = ExtractionArgs & PropsAndDerivedData;
