import { Command } from "bc-minecraft-bedrock-command";
import { CommandCompletionContext } from "../../Completion/Context";
import { CompletionBuilder } from "../../Completion/Builder";
import { CompletionItemKind } from 'vscode-languageserver-types';
import { IsEducationEnabled } from '../../Project/Attributes';
import { Position } from "vscode-languageserver-textdocument";
import { SimpleContext } from '../../Code/SimpleContext';

import * as Parameter from "../Commands/Parameter/Completion";
import * as CCommand from "../Commands/Command/Completion";

/**
 *
 * @param doc
 * @param pos
 * @param receiver
 * @returns
 */
export function ProvideCompletion(context: SimpleContext<CompletionBuilder>, pos: Position): void {
  const doc = context.doc;
  const LineIndex = pos.line;
  const Line = doc.getLine(LineIndex);

  const CommentIndex = Line.indexOf("#");

  if (CommentIndex >= 0) {
    if (pos.character > CommentIndex) return;
  }

  if (LineIndex === 0 && pos.character < 3) {
    context.receiver.Add("# <mcfunction_documentation_here>", "mcfunction documentation", CompletionItemKind.Snippet);
  }

  const offset = doc.offsetAt({ character: 0, line: pos.line });

  let command = Command.parse(Line, offset);
  const Subcommand = command.isInSubCommand(doc.offsetAt(pos));

  if (Subcommand) {
    command = Subcommand;
  }

  ProvideCompletionCommand(context, doc.offsetAt(pos), command);
}

/**
 *
 * @param text
 * @param cursor
 * @param offset
 * @param doc
 * @param receiver
 */
export function ProvideCompletionLine(context: SimpleContext<CompletionBuilder>, text: string, cursor: number, offset: number): void {
  const command: Command = Command.parse(text, offset);
  ProvideCompletionCommand(context, cursor, command);
}

/**
 *
 * @param pos
 * @param receiver
 * @param command
 * @returns
 */
export function ProvideCompletionCommand(context: SimpleContext<CompletionBuilder>, pos: number, command: Command): void {
  if (command == undefined || command.parameters.length == 0 || pos < command.parameters[0].offset + 3) {
    CCommand.ProvideCompletion(context);
    return;
  }

  const Matches = command.getBestMatch(IsEducationEnabled(context.doc));

  if (Matches.length === 0) {
    if (pos < 10) CCommand.ProvideCompletion(context);

    return;
  }

  let ParameterIndex: number = command.findCursorIndex(pos);

  const Current = command.parameters[ParameterIndex];

  for (let I = 0; I < Matches.length; I++) {
    const Match = Matches[I];

    if (Match.parameters.length > ParameterIndex) {
      const parameter = Match.parameters[ParameterIndex];
      const ncontext = CommandCompletionContext.create(parameter, ParameterIndex, command, pos, context.receiver, Current, context.doc);

      Parameter.ProvideCompletion(ncontext);
    }
  }
}
