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
};
