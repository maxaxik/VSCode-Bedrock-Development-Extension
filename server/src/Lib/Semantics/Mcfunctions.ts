import { Position, Range, SemanticTokens } from "vscode-languageserver";
import { TextDocument } from "../Types/Document/TextDocument";
import { McfunctionSemanticTokensBuilder } from "./Builders/McfunctionSemanticTokensBuilder";
import { CreateSelectorTokens } from "./include";
import { SemanticModifiersEnum, SemanticTokensEnum } from "./Legend";
import { Command } from "bc-minecraft-bedrock-command";
import { IsEducationEnabled } from "../Project/Attributes";

export function ProvideMcfunctionSemanticTokens(doc: TextDocument, range?: Range | undefined): SemanticTokens {
  const Builder = new McfunctionSemanticTokensBuilder(doc);
  let startindex = 0;
  let endindex = doc.lineCount;

  if (range) {
    startindex = range.start.line;
    endindex = range.end.line;
  }

  for (let I = startindex; I < endindex; I++) {
    const line = doc.getLine(I);
    const CommentIndex = line.indexOf("#");

    if (CommentIndex >= 0) {
      Builder.AddAt(I, CommentIndex, line.length - CommentIndex, SemanticTokensEnum.comment);
    }

    const P = Position.create(I, 0);
    const command = Command.parse(line, doc.offsetAt(P));
    CreateTokens(command, Builder);
  }

  return Builder.Build();
}

export function McfunctionLineTokens(line: string, cursor: number, offset: number, Builder: McfunctionSemanticTokensBuilder): void {
  if (line.startsWith("/")) {
    line = line.substring(1, line.length);
    offset++;
  }

  const command = Command.parse(line, offset);
  CreateTokens(command, Builder);
}

function CreateTokens(command: Command, Builder: McfunctionSemanticTokensBuilder): void {
  if (command.parameters.length == 0) return;

  const Edu = IsEducationEnabled(Builder.doc.getConfiguration());

  const First = command.parameters[0];
  Builder.AddWord(First, SemanticTokensEnum.class);
  const Matches = command.GetCommandData(Edu);
  let Match;

  if (Matches.length == 0) return;

  Match = Matches[0];

  let Max = command.parameters.length;
  if (Match.Command.parameters.length < Max) Max = Match.Command.parameters.length;

  for (let I = 1; I < Max; I++) {
    const Data = Match.Command.parameters[I];
    const Word = command.parameters[I];

    switch (Data.Type) {
      case MCCommandParameterType.command:
        let Sub = GetSubCommand(Command, Edu);
        if (Sub) {
          CreateTokens(Sub, Builder);
        }
        return;

      case MCCommandParameterType.boolean:
        Builder.AddWord(Word, SemanticTokensEnum.keyword);
        break;

      //Values
      case MCCommandParameterType.block:
      case MCCommandParameterType.entity:
      case MCCommandParameterType.item:
      case MCCommandParameterType.particle:
      case MCCommandParameterType.sound:
      case MCCommandParameterType.tickingarea:
        const Index = Word.text.indexOf(":");

        if (Index >= 0) {
          const Line = Word.location.range.start.line;
          const char = Word.location.range.start.character;

          Builder.AddAt(Line, char, Index, SemanticTokensEnum.namespace, SemanticModifiersEnum.static);
          Builder.AddAt(Line, char + Index + 1, Word.text.length - (Index + 1), SemanticTokensEnum.method, SemanticModifiersEnum.readonly);
        } else {
          Builder.AddWord(Word, SemanticTokensEnum.method, SemanticModifiersEnum.readonly);
        }

        break;

      case MCCommandParameterType.coordinate:
      case MCCommandParameterType.float:
      case MCCommandParameterType.integer:
      case MCCommandParameterType.xp:
        CreateRangeTokensWord(Word, Builder);

        break;

      case MCCommandParameterType.keyword:
        Builder.AddWord(Word, SemanticTokensEnum.method, SemanticModifiersEnum.defaultLibrary);
        break;

      case MCCommandParameterType.function:
      case MCCommandParameterType.string:
        Builder.AddWord(Word, SemanticTokensEnum.string);
        break;

      case MCCommandParameterType.objective:
        Builder.AddWord(Word, SemanticTokensEnum.variable);
        break;

      case MCCommandParameterType.tag:
        Builder.AddWord(Word, SemanticTokensEnum.regexp, SemanticModifiersEnum.readonly);
        break;

      case MCCommandParameterType.operation:
        Builder.AddWord(Word, SemanticTokensEnum.operator);
        break;

      //Modes
      case MCCommandParameterType.cameraShakeType:
      case MCCommandParameterType.cloneMode:
      case MCCommandParameterType.difficulty:
      case MCCommandParameterType.effect:
      case MCCommandParameterType.event:
      case MCCommandParameterType.fillMode:
      case MCCommandParameterType.gamemode:
      case MCCommandParameterType.locateFeature:
      case MCCommandParameterType.maskMode:
      case MCCommandParameterType.mirror:
      case MCCommandParameterType.musicRepeatMode:
      case MCCommandParameterType.replaceMode:
      case MCCommandParameterType.rideRules:
      case MCCommandParameterType.rotation:
      case MCCommandParameterType.saveMode:
      case MCCommandParameterType.slotType:
      case MCCommandParameterType.slotID:
      case MCCommandParameterType.structureAnimationMode:
      case MCCommandParameterType.teleportRules:
      case MCCommandParameterType.oldBlockMode:
        Builder.AddWord(Word, SemanticTokensEnum.enumMember);
        break;

      //json
      case MCCommandParameterType.blockStates:
      case MCCommandParameterType.jsonItem:
      case MCCommandParameterType.jsonRawText:
        break;

      //
      case MCCommandParameterType.selector:
        CreateSelectorTokens(Word, Builder);
        break;

      default:
        break;
    }
  }
}
