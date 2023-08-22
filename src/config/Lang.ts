import {BaseConfig} from "@/config/BaseConfig";

class _Lang extends BaseConfig<Map<string, string>> {
  filePath = "config/lang.json";
  content = new Map<string, string>();

  get(path: string, ...args: Placeholder[]): string {
    let value = this.content.get(path);
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

function a() {
  let v = Lang["aaa"];
}