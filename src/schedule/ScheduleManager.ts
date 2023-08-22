import schedule from "node-schedule";
import {parseString} from "cron-parser";
import {bot} from "@/main";
import {BaseConfig} from "@/config/BaseConfig";

/**
 * 定时任务管理器
 */
class _ScheduleManager extends BaseConfig<Array<ScheduleTask>> {
  override filePath = "config/schedule.json"
  override content = new Array<ScheduleTask>();
  private tasks = new Map<string, ScheduleJob>();

  /**
   * 检查cron表达式是否有效
   *
   * @param cron 表达式
   */
  checkCron(cron: string): boolean {
    let result = parseString(cron);
    return result.errors.size === 0;
  }

  /**
   * 添加task
   *
   * @param task 任务, cron表达式需要在调用此方法之前就进行校验
   * @return 若成功添加则返回true
   */
  addTask(task: ScheduleTask): boolean {
    if (this.tasks.has(task.name)) return false;
    let job = schedule.scheduleJob(task.name, task.cron, task.getTask());
    let scheduleJob = new ScheduleJob(task, job);
    this.tasks.set(task.name, scheduleJob);
    this.scheduleSave();
    return true;
  }

  /**
   * 删除task
   *
   * @param name task名字
   * @return 若成功删除则返回true
   */
  delTask(name: string): boolean {
    let scheduleJob = this.tasks.get(name);
    if (!scheduleJob) return false;
    this.tasks.delete(name);
    scheduleJob.job.cancel();
    this.scheduleSave();
    return true;
  }

  /**
   * 列出task
   *
   * @param contentId 会话id
   * @return 若成功删除则返回true
   */
  listTask(contentId: string): ScheduleTask[] {
    return Array.from(this.tasks.values())
      .filter(task => task.task.name.startsWith(contentId))
      .map(task => task.task);
  }

  beforeLoad() {
    // 清空已有的
    this.tasks.forEach(job => job.job.cancel());
    this.tasks.clear();
  }

  override afterLoad() {
    this.content.forEach((task: ScheduleTask) => {
      let job = schedule.scheduleJob(task.name, task.cron, task.getTask());
      let scheduleJob = new ScheduleJob(task, job);
      this.tasks.set(task.name, scheduleJob);
    })
  }
}

export const ScheduleManager = new _ScheduleManager();

/**
 * 计划任务的信息, 需要序列化成json保存在本地
 */
export class ScheduleTask {
  /**
   * 任务名字, 使用 `会话id.任务名字` 的格式
   */
  name: string
  /**
   * 表达式字符串
   */
  cron: string;
  /**
   * 执行次数
   */
  count = 0;
  /**
   * 任务的类型
   */
  type: ScheduleTaskType;
  /**
   * 任务的数据
   */
  data: ScheduleTaskData;

  constructor(name: string, cron: string, type: ScheduleTaskType, data: ScheduleTaskData) {
    this.name = name;
    this.cron = cron;
    this.type = type;
    this.data = data;
  }

  getTask(): () => Promise<void> {
    /// 未来可能会有更多的type以及对应的处理方式
    switch (this.type) {
      case ScheduleTaskType.SEND_PRIVATE_MESSAGE:
      case ScheduleTaskType.SEND_GROUP_MESSAGE: {
        let data = this.data as SendMessageData;
        return async () => {
          this.count++;
          let room = await bot.Contact.find({id: data.contactId});
          if (!room) {
            bot.log.warn("[Schedule]", `无法找到id为${data.contactId}的群聊`);
            return;
          }
          room.say(data.content);
        }
      }
    }
  }
}

export type {
  ScheduleJob,
}

/**
 * 运行时的任务信息, 包含了计划任务和运行中的任务
 */
class ScheduleJob {
  task: ScheduleTask;
  job: schedule.Job;

  constructor(task: ScheduleTask, job: schedule.Job) {
    this.task = task;
    this.job = job;
  }
}

export enum ScheduleTaskType {
  SEND_GROUP_MESSAGE,
  SEND_PRIVATE_MESSAGE,
}

export class SendMessageData {
  contactId: string
  content: string

  constructor(contactId: string, content: string) {
    this.contactId = contactId;
    this.content = content;
  }
}


export type ScheduleTaskData =
  | SendMessageData