import { SignatureHelp, SignatureHelpParams } from "vscode-languageserver";
import { Languages } from "../Constants";
import { Language, Mcfunction } from "../Minecraft/include";
import { GetDocument } from "../Types/Document/include";
import { ProvideJsonSignature } from "./Json";

export async function OnSignatureRequestAsync(params: SignatureHelpParams): Promise<SignatureHelp | undefined> {
  return new Promise<SignatureHelp | undefined>((resolve, reject) => {
    resolve(OnSignatureRequest(params));
  });
}

function OnSignatureRequest(params: SignatureHelpParams): SignatureHelp | undefined {
  const pos = params.position;
  const doc = GetDocument(params.textDocument.uri);
  if (!doc) return undefined;

  //Switch per language type
  switch (doc.languageId) {
    case Languages.McFunctionIdentifier:
      return Mcfunction.ProvideSignature(doc, pos);

    case Languages.McLanguageIdentifier:
      return Language.ProvideSignature(doc, pos);

    case Languages.McMolangIdentifier:
      //TODO add molang support
      return undefined;

    case Languages.McOtherIdentifier:
      return undefined;

    case Languages.JsonCIdentifier:
    case Languages.JsonIdentifier:
      return ProvideJsonSignature(doc, pos);
    //return Other.ProvideSignature(doc, pos);
  }

  return undefined;
}
