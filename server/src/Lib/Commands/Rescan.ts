import { Database } from "../Database/include";
import { Console } from "../Manager/Console";
import { Traverse } from "../Process/Traverse";

/**
 *
 */
export function ReScanProject() {
  Console.Info("Rescanning of project initiated");
  Database.Clear();
  return Traverse();
}
