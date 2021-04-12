import { DocumentFormattingParams, DocumentRangeFormattingParams } from "vscode-languageserver";
import { TextEdit } from "vscode-languageserver-textdocument";
import { GetDocument } from "../Code/include";
import { Languages } from "../Constants";
import { formatLangauge, formatLangaugeRange } from "./Language";
import { formatMcfunction, formatMcfunctionRange } from "./Mcfunction";

export function OnDocumentFormatRequestAsync(params: DocumentFormattingParams): Promise<TextEdit[] | undefined> {
  return new Promise<TextEdit[] | undefined>((resolve, reject) => {
    resolve(OnDocumentFormatRequest(params));
  });
}

export function OnDocumentRangeFormatRequestAsync(params: DocumentRangeFormattingParams): Promise<TextEdit[] | undefined> {
  return new Promise<TextEdit[] | undefined>((resolve, reject) => {
    resolve(OnDocumentRangeFormatRequest(params));
  });
}

function OnDocumentFormatRequest(params: DocumentFormattingParams): TextEdit[] | undefined {
  let doc = GetDocument(params.textDocument.uri);

  switch (doc.languageId) {
    case Languages.McFunctionIdentifier:
      return formatMcfunction(doc, params);

    case Languages.McLanguageIdentifier:
      return formatLangauge(doc, params);

    case Languages.JsonCIdentifier:
    case Languages.JsonIdentifier:
      break;
  }

  return undefined;
}

function OnDocumentRangeFormatRequest(params: DocumentRangeFormattingParams): TextEdit[] {
  let doc = GetDocument(params.textDocument.uri);

  switch (doc.languageId) {
    case Languages.McFunctionIdentifier:
      return formatMcfunctionRange(doc, params);

    case Languages.McLanguageIdentifier:
      return formatLangaugeRange(doc, params);

    case Languages.JsonCIdentifier:
    case Languages.JsonIdentifier:
    default:
  }

  return [];
}
