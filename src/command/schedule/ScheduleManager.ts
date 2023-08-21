import fs from "fs";

class ScheduleManager {
  static tasks = new Set<ScheduleTask>();

  static load() {
    fs.existsSync("")
  }
}

/**
 * 计划任务的信息, 需要序列化成json保存在本地
 */
class ScheduleTask {
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
}

enum ScheduleTaskType {
  SEND_GROUP_MESSAGE
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