import fs from "fs";
import {debug} from "@/util/log";

/**
 * 配置文件基类
 */
export abstract class BaseConfig<T extends any> {
  /**
   * 文件路径
   */
  abstract filePath: string;
  /**
   * 内容
   */
  abstract content: T;

  private saveTask: NodeJS.Timeout | null;

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
   * 计划保存, 当有保存task时忽略, task完成后触发的计划保存会触发task
   */
  scheduleSave() {
    if (this.saveTask != null && this.saveTask.hasRef()) {
      debug("已有保存任务存在, 忽略保存请求")
      return
    }
    debug("触发保存任务, 将在3分钟后保存")
    this.saveTask = setTimeout(() => {
      this.saveTask = null;
      debug("开始保存任务")
      this.saveAsync();
    }, 3 * 60 * 1000)
  }

  /**
   * 保存默认配置文件
   */
  saveDefault() {
    if (fs.existsSync(this.filePath)) return false;
    this.saveAsync();
    return true;
  }

  /**
   * save之前执行
   */
  beforeSave() {
    debug("触发%s保存", this.filePath)
  }

  /**
   * save之后执行
   */
  afterSave() {
    debug("完成%s保存", this.filePath)
  }

  /**
   * 保存当前数据至文件
   */
  save() {
    this.beforeSave();
    let json = JSON.stringify(this.content);
    fs.writeFileSync(this.filePath, json, {encoding: "utf8"});
    this.afterSave();
  }

  /**
   * 异步保存
   */
  saveAsync() {
    this.beforeSave();
    let json = JSON.stringify(this.content);
    fs.writeFile(this.filePath, json, {encoding: "utf8"}, this.afterSave);
  }
}