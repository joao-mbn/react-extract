import * as vscode from 'vscode';

export type ExtractedProp = {
  pair: string;
  name: string;
  propAlias: string;
  isSpread: boolean;
  type: string;
  range: vscode.Range;
  isLiteral: boolean;
  propId: string;
};
