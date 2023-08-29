import {CommandManager} from "@/message/command/CommandManager";
import {BaseCommandHandler} from "@/message/command/handler/BaseCommandHandler";
//
// /**
//  * 指令处理器
//  */
// export abstract class CommandHandler {
//   /**
//    * 处理器名字
//    */
//   abstract name: string;
//   /**
//    * 接受的指令name正则
//    */
//   abstract regex: RegExp;
//   /**
//    * 用法
//    */
//   abstract usage: string;
//   /**
//    * 处理器类型
//    */
//   abstract type: CommandType;
//   /**
//    * 执行该处理器所需要的权限
//    */
//   abstract permission: { perm: string, value: PermValue }[];
//
//   /**
//    * 处理指令
//    * @param command 指令
//    */
//   abstract onCommand(command: Command): void;
// }

/**
 * 指令处理器模板
 */
export class CommandHandler extends BaseCommandHandler {
  /**
   * 处理器类型
   */
  type: CommandType;

  constructor(name: string, regex: RegExp, type: CommandType) {
    super(name, regex);
    this.type = type;
  }

  register() {
    CommandManager.register(this)
  }
}

/**
 * 指令处理器类型
 */
export enum CommandType {
  /**
   * 仅支持群聊
   */
    "ROOM",
  /**
   * 仅支持私聊
   */
    "PRIVATE",
  /**
   * 同时支持群聊和私聊
   */
    "ROOM_AND_PRIVATE"
}