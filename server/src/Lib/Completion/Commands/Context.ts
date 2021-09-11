import { LocationWord } from "bc-vscode-words";
import { Position } from "vscode-languageserver-textdocument";
import { CommandInfo } from "../../Types/Commands/Info/include";
import { Command } from "../../Types/Commands/Interpertation/Command";
import { MCCommandParameter } from "../../Minecraft/Commands/Parameter/Parameter";
import { TextDocument } from "../../Types/Document/TextDocument";
import { BaseCommandContext } from "../../Types/General/Context/Context";
import { CompletionBuilder } from "../include";

/**
 *
 */
export interface CommandCompletionContext extends BaseCommandContext {
  Parameter: MCCommandParameter;
  ParameterIndex: number;
  Command: Command;
  BestMatch: CommandInfo;
  Pos: Position;
  receiver: CompletionBuilder;
  Current: LocationWord | undefined;
  doc: TextDocument;
}

/**
 *
 */
export namespace CommandCompletionContext {
  /**
   *
   * @param value
   * @returns
   */
  export function is(value: any): value is CommandCompletionContext {
    if (value) {
      let temp = value as CommandCompletionContext;

      if (temp.Parameter && temp.Command && temp.Pos && temp.receiver) return true;
    }

    return false;
  }

  /**
   *
   * @param Parameter
   * @param Command
   * @param pos
   * @param receiver
   * @param Current
   * @returns
   */
  export function create(
    Parameter: MCCommandParameter,
    ParameterIndex: number,
    Command: Command,
    Pos: Position,
    receiver: CompletionBuilder,
    Current: LocationWord | undefined = undefined,
    doc: TextDocument
  ): CommandCompletionContext {
    const BestMatch = Command.GetCommandData(IsEducationEnabled(doc))[0];

    return {
      Parameter: Parameter,
      ParameterIndex: ParameterIndex,
      Command: Command,
      BestMatch: BestMatch,
      Pos: Pos,
      receiver: receiver,
      Current: Current,
      doc: doc,
    };
  }
}
