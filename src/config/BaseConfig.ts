import fs from "fs";
import {debug} from "@/util/log";
import {safeWrite} from "@/util/path";
import {Savable} from "@/config/Savable";

/**
 * 配置文件基类
 */
export abstract class BaseConfig<T extends any> extends Savable {
  /**
   * 文件路径
   */
  abstract filePath: string;
  /**
   * 内容
   */
  abstract content: T;

  /**
   * load之前执行
   */
  beforeLoad() {
  }

  /**
   * load之后执行
   */
  afterLoad() {
  }

  /**
   * 加载配置文件
   */
  load() {
    this.beforeLoad();
    if (this.saveDefault()) return;
    let buffer = fs.readFileSync(this.filePath);
    let json = buffer.toString("utf8");
    this.content = JSON.parse(json) as T;
    this.afterLoad();
  }

  /**
   * 保存默认配置文件
   */
  saveDefault() {
    if (fs.existsSync(this.filePath)) return false;
    this.save();
    return true;
  }

  /**
   * save之前执行
   */
  override beforeSave() {
    debug("触发%s保存", this.filePath)
  }

  /**
   * save之后执行
   */
  override afterSave() {
    debug("完成%s保存", this.filePath)
  }

  /**
   * 保存当前数据至文件
   */
  override save() {
    this.beforeSave();
    let json = JSON.stringify(this.content);
    safeWrite(this.filePath, json);
    this.afterSave();
  }
}