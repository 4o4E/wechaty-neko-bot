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
   * 添加一个task
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
class ScheduleTask {
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
  count: number;
  /**
   * 任务的类型
   */
  type: ScheduleTaskType;
  /**
   * 任务的数据
   */
  data: ScheduleTaskData;

  getTask(): () => Promise<void> {
    switch (this.type) {
      case ScheduleTaskType.SEND_GROUP_MESSAGE: {
        let data = this.data as SendGroupMessageData;
        return async () => {
          this.count++;
          let room = await bot.Contact.find({id: data.groupId});
          if (!room) {
            bot.log.warn("[Schedule]", `无法找到id为${data.groupId}的群聊`);
            return;
          }
          room.say(data.content);
        }
      }
      case ScheduleTaskType.SEND_PRIVATE_MESSAGE: {
        let data = this.data as SendPrivateMessageData;
        return async () => {
          this.count++;
          let contact = await bot.Contact.find({id: data.userId});
          if (!contact) {
            bot.log.warn("[Schedule]", `无法找到id为${data.userId}的联系人`);
            return;
          }
          contact.say(data.content);
        }
      }
    }
  }
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

enum ScheduleTaskType {
  SEND_GROUP_MESSAGE,
  SEND_PRIVATE_MESSAGE,
}

class SendGroupMessageData {
  groupId: string
  content: string
}

class SendPrivateMessageData {
  userId: string
  content: string
}

type ScheduleTaskData =
  | SendGroupMessageData
  | SendPrivateMessageData