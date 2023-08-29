import {BaseConfig} from "@/config/BaseConfig";
import {Savable} from "@/config/Savable";
import {mkdirs} from "@/util/path";
import fs from "fs";
import * as path from "path";

class ContactBasedConfig<T> extends Savable {
  dirPath: string;
  data: { [key: string]: T } = {};

  override save() {
    mkdirs(this.dirPath);
    for (let key in this.data) {
      let value = this.data[key];
      fs.writeFileSync(`${this.dirPath}${path.sep}${key}.json`, JSON.stringify(value));
    }
  }

  load() {
    mkdirs(this.dirPath);
    fs.readdirSync(this.dirPath).forEach(name => {
      if (!name.endsWith(".json")) return;
      let json = fs.readFileSync(`${this.dirPath}${path.sep}${name}`).toString("utf-8");
      this.data[name.substring(0, name.indexOf(".json"))] = JSON.parse(json);
    })
  }

}