import { PackType } from "bc-minecraft-bedrock-project";
import { ResourcePack, BehaviorPack } from "bc-minecraft-bedrock-project";
import { Vanilla } from "bc-minecraft-bedrock-vanilla-data";
import { SimpleContext } from "../../../Code/SimpleContext";
import { CompletionBuilder } from "../../../Completion/Builder";
import { Database } from "../../../Database/Database";
import { Kinds } from "../../General/Kinds";
import { Models } from "../../ResourcePack/include";

export function ProvideCompletion(context: SimpleContext<CompletionBuilder>): void {
  const packType = PackType.detect(context.doc.uri);

  switch (packType) {
    case PackType.behavior_pack:
      return ProvideBehaviorpackCompletion(context);

    case PackType.resource_pack:
      return ProvideResourcepackCompletion(context);
  }
}

export function ProvideResourcepackCompletion(context: SimpleContext<CompletionBuilder>): void {
  const fileType = ResourcePack.FileType.detect(context.doc.uri);
  const receiver = context.receiver;
  const kind = Kinds.Completion.Models;

  switch (fileType) {
    case ResourcePack.FileType.item:
    case ResourcePack.FileType.entity:
    case ResourcePack.FileType.attachable:
      //Using model geometries
      Models.ProvideCompletion(context);
      break;

    default:
    case ResourcePack.FileType.animation:
    case ResourcePack.FileType.animation_controller:
    case ResourcePack.FileType.render_controller:
      //Using defined geometries
      Database.ProjectData.ResourcePacks.entities.forEach((entity) => {
        const gen = (item: string) => `The defined geomtry: ${item}\nDeclared by: ${entity.id}`;
        receiver.GenerateStr(entity.molang.geometries.defined, gen, kind);
      });
      break;
  }
}

export function ProvideBehaviorpackCompletion(context: SimpleContext<CompletionBuilder>): void {
  const fileType = BehaviorPack.FileType.detect(context.doc.uri);
  const receiver = context.receiver;
  const kind = Kinds.Completion.Models;

  switch (fileType) {
    case BehaviorPack.FileType.block:
    case BehaviorPack.FileType.item:
    case BehaviorPack.FileType.entity:
      //Using model geometries
      const gen = (item: ResourcePack.Model.Model) => `The geomtry: ${item}\nDeclared in: ${item.location.uri}`;
      receiver.Generate(Database.ProjectData.ResourcePacks.models, gen, kind);

      receiver.GenerateStr(Vanilla.ResourcePack.Models, (item) => `The vanilla geometry: ${item}`, kind);
      break;
  }
}
