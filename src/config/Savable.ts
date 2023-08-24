import {debug} from "@/util/log";

/**
 * 配置文件基类
 */
export abstract class Savable {
  /**
   * 保存的时间间隔, 单位ms
   */
  saveInterval: number = 10 * 60 * 1000;

  private saveTask: NodeJS.Timeout | null;

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
      this.beforeSave();
      this.save();
      this.afterSave();
    }, this.saveInterval)
  }

  /**
   * save之前执行
   */
  beforeSave() {
  }

  /**
   * save之后执行
   */
  afterSave() {
  }

  /**
   * 保存当前数据至文件
   */
  abstract save();
}