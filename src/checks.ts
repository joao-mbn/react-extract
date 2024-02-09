import * as vscode from "vscode";

export function isSelectionLikelyJsx(document: vscode.TextDocument, range: vscode.Range, context: vscode.CodeActionContext) {
  const selectedText = document.getText(range).trim();

  // Check if selection is empty
  if (!selectedText) {
    return false;
  }

  // Check if selection starts and ends with opening and closing JSX tags
  if (!selectedText.startsWith("<") || !selectedText.endsWith(">")) {
    return false;
  }

  // Checks if the number of open tags is equal to the number of closing tags
  const openTags = selectedText.match(/</g);
  const closeTags = selectedText.match(/>/g);
  if (!openTags || !closeTags || openTags.length !== closeTags.length) {
    return false;
  }

  // Check if there are any diagnostics in the selection. If there are diagnostics in the selection, it's likely not valid JSX
  const diagnosticsInSelection = context.diagnostics.filter((diagnostic) => range.intersection(diagnostic.range));
  if (diagnosticsInSelection.length > 0) {
    return false;
  }

  // Check if the user is only requesting code actions of a kind other than Refactor,
  if (context.only && !context.only.contains(vscode.CodeActionKind.Refactor)) {
    return false;
  }

  return true;
}

export function isFileTypescript(document: vscode.TextDocument) {
  const fileExtension = document.fileName.split(".").pop();
  return fileExtension === "ts" || fileExtension === "tsx";
}
