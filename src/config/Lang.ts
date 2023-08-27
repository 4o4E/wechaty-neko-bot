import {BaseConfig} from "@/config/BaseConfig";
import * as path from "path";

class _Lang extends BaseConfig<{ [key: string]: string }> {
  override filePath = `config${path.sep}lang.json`;
  override content: { [key: string]: string } = {};

  get(path: string, ...args: Placeholder[]): string {
    let value = this.content[path];
    if (!value) return path;
    for (let pair of args) {
      let {first, second} = pair;
      let regex = new RegExp(`\{${first}\}`, "g");
      let value: string;
      switch (typeof second) {
        case "string":
          value = second;
          break;
        case "number":
          value = second.toString();
          break;
        default:
          value = "null";
          break;
      }
      value = value.replace(regex, value);
    }
  }
}

export interface Placeholder {
  readonly first: string;
  readonly second: string | number | null;
}



export const Lang = new _Lang();