import * as path from "path";
import fs from "fs";
import {workingDir} from "@/main";

export function mkdirs(filePath: string) {
  let parent = path.parse(filePath).dir;
  // 若不存在则递归创建父文件夹
  if (!fs.existsSync(parent)) mkdirs(parent);
  // 若是文件则删除
  let stats = fs.statSync(parent);
  if (!stats.isDirectory()) {
    fs.unlinkSync(parent);
    fs.mkdirSync(parent);
  }
  // 创建文件夹
  fs.mkdirSync(filePath);
}

export function safeWrite(filePath: string, data: string) {
  mkdirs(path.parse(`${workingDir}${path.sep}${filePath}`).dir);
  fs.writeFileSync(filePath, data, {encoding: "utf8"});
}