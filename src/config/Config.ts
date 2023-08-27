import {BaseConfig} from "@/config/BaseConfig";
import * as path from "path";

class _Lang extends BaseConfig<Map<string, string>> {
  override filePath = `config${path.sep}config.json`;
  override content = new Map<string, string>();
}

export interface Placeholder {
  readonly first: string;
  readonly second: string | number | null;
}

export const Lang = new _Lang();