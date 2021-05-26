import { commands, ExtensionContext, InputBoxOptions, window } from "vscode";
import { ExecuteCommandParams, ExecuteCommandRequest } from "vscode-languageclient";
import { Console } from "../../Console/Console";
import { Commands } from "../../Constants";
import { Manager } from "../../Manager/Manager";

interface IDExample {
  ID: RegExp;
  example: string;
}

const AnimationControllerID: IDExample = { ID: /^[0-9a-zA-Z_\\.\\-]+$/, example: "example.foo | example" };
const AnimationID: IDExample = { ID: /^[0-9a-zA-Z_\\.\\-]+$/, example: "example.foo | example" };
const AttachableID: IDExample = { ID: /^[0-9a-zA-Z:_\\.\\-]+$/, example: "namespace:attachable" };
const EntityID: IDExample = { ID: /^[0-9a-zA-Z:_\\.\\-]+$/, example: "namespace:entity" };
const BlockID: IDExample = { ID: /^[0-9a-zA-Z:_\\.\\-]+$/, example: "namespace:block" };
const ItemID: IDExample = { ID: /^[0-9a-zA-Z:_\\.\\-]+$/, example: "namespace:item" };
const FogID: IDExample = { ID: /^[0-9a-zA-Z:_\\.\\-]+$/, example: "namespace:item" };
const LootTableID: IDExample = { ID: /^[0-9a-zA-Z_\\.\\-]+$/, example: "example.foo | example" };
const ModelID: IDExample = { ID: /^geometry.[0-9a-zA-Z_\\.\\-]+$/, example: "geometry.model_name" };
const ParticleID: IDExample = { ID: /^[0-9a-zA-Z:_\\.\\-]+$/, example: "namespace:particle" };
const RecipeID: IDExample = { ID: /^[0-9a-zA-Z:_\\.\\-]+$/, example: "namespace:recipe" };
const RenderControllerID: IDExample = { ID: /^[0-9a-zA-Z_\\.\\-]+$/, example: "" };
const SpawnRuleID: IDExample = { ID: /^[0-9a-zA-Z:_\\.\\-]+$/, example: "example.foo | example" };
const TradingID: IDExample = { ID: /^[0-9a-zA-Z:_\\.\\-]+$/, example: "example.foo | example" };

const ProjectID: IDExample = { ID: /^[A-Z]+$/, example: "EP" };

export function Activate(context: ExtensionContext): void {
  Console.Log("registering create commands");

  //General
  CreateID(context, Commands.Create.General.Entity, "Create Entity", EntityID);
  Create(context, Commands.Create.General.Languages, "Create Languages");
  Create(context, Commands.Create.General.Manifests, "Create Manifests");

  //Project
  CreateID(context, Commands.Create.Project.WorldProject, "Create World, BP, RP project", ProjectID);
  CreateID(context, Commands.Create.Project.Resourcepack, "Create BP", ProjectID);
  CreateID(context, Commands.Create.Project.Behaviorpack, "Create RP", ProjectID);

  //Behavior pack
  CreateID(context, Commands.Create.Behaviorpack.Animation_Controller, "Create animation controller", AnimationControllerID);
  CreateID(context, Commands.Create.Behaviorpack.Animation, "Create animation", AnimationID);
  CreateID(context, Commands.Create.Behaviorpack.Block, "Create block", BlockID);
  CreateID(context, Commands.Create.Behaviorpack.Entity, "Create entity", EntityID);
  CreateID(context, Commands.Create.Behaviorpack.Item, "Create item", ItemID);
  Create(context, Commands.Create.Behaviorpack.Languages, "Create language files");
  CreateID(context, Commands.Create.Behaviorpack.Loot_Table, "Create loot table", LootTableID);
  Create(context, Commands.Create.Behaviorpack.Manifests, "Create manifest");
  CreateID(context, Commands.Create.Behaviorpack.Recipe, "Create recipe", RecipeID);
  CreateID(context, Commands.Create.Behaviorpack.Spawn_Rule, "Create spawn rule", SpawnRuleID);
  CreateID(context, Commands.Create.Behaviorpack.Trading, "Create trading", TradingID);

  //Resource pack
  CreateID(context, Commands.Create.Resourcepack.Animation_Controller, "Create animation controllers files", AnimationControllerID);
  CreateID(context, Commands.Create.Resourcepack.Animation, "Create animations files", AnimationID);
  CreateID(context, Commands.Create.Resourcepack.Attachable, "Create attachable files", AttachableID);
  Create(context, Commands.Create.Resourcepack.Biomes_Client, "Create biomesclient file");
  Create(context, Commands.Create.Resourcepack.Blocks, "Create the blocks file");
  CreateID(context, Commands.Create.Resourcepack.Entity, "Create entities files", EntityID);
  Create(context, Commands.Create.Resourcepack.Flipbook_Textures, "Create flipbook_textures file");
  CreateID(context, Commands.Create.Resourcepack.Fog, "Create fog file", FogID);
  Create(context, Commands.Create.Resourcepack.Languages, "Create lanreate language file");
  Create(context, Commands.Create.Resourcepack.Item_Texture, "Create item tereate item texture file");
  Create(context, Commands.Create.Resourcepack.Manifests, "Creatreate all manifest");
  CreateID(context, Commands.Create.Resourcepack.Model, "Create reate model file", ModelID);
  Create(context, Commands.Create.Resourcepack.Music_Definitions, "Create the music definireate the music definitions file");
  CreateID(context, Commands.Create.Resourcepack.Particle, "Create particle file", ParticleID);
  CreateID(context, Commands.Create.Resourcepack.Render_Controller, "Create render_controller file", RenderControllerID);
  Create(context, Commands.Create.Resourcepack.Sounds, "Create the sreate the sounds file");
  Create(context, Commands.Create.Resourcepack.Sound_Definitions, "Create the sound definireate the sound definitions file");
  Create(context, Commands.Create.Resourcepack.Terrain_Texture, "Create the terrain texture file");
  Create(context, Commands.Create.Resourcepack.Texture_List, "Create texturelist");

  //World
  Create(context, Commands.Create.World.Manifests, "Create manifest");
  Create(context, Commands.Create.World.Languages, "Create language files");
}

function Create(context: ExtensionContext, command: string, title: string) {
  context.subscriptions.push(
    commands.registerCommand(command, (arg: any[]) => {
      OnComplete(command);
    })
  );
}

function CreateID(context: ExtensionContext, command: string, title: string, IDRegex: IDExample) {
  context.subscriptions.push(
    commands.registerCommand(command, (arg: any[]) => {
      const Options: InputBoxOptions = {
        validateInput(value): string | undefined {
          return ValidIdentifier(value, IDRegex);
        },
        prompt: title,
        password: false,
        ignoreFocusOut: true,
        placeHolder: IDRegex.example,
      };

      window.showInputBox(Options).then((value) => OnCompleteID(value, command));
    })
  );
}

function OnCompleteID(value: string | undefined, command: string): Promise<any> {
  if (value === undefined) return Promise.resolve();

  const Options: ExecuteCommandParams = {
    command: command,
    arguments: [value],
  };

  return Manager.Client.sendRequest(ExecuteCommandRequest.type, Options);
}

function OnComplete(command: string): Promise<any> {
  const Options: ExecuteCommandParams = {
    command: command,
    arguments: [],
  };

  return Manager.Client.sendRequest(ExecuteCommandRequest.type, Options);
}

function ValidIdentifier(ID: string, IDRegex: IDExample): string | undefined {
  if (ID === undefined) return undefined;

  if (ID.match(IDRegex.ID)) {
    return undefined;
  } else {
    return `Does not match pattern: ${IDRegex.example}`;
  }
}
