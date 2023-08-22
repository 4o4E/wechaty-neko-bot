import type {Command} from "@/message/command/Command";

/**
 * 指令处理器
 */
export abstract class CommandHandler {
  /**
   * 处理器名字
   */
  abstract name: string;
  /**
   * 接受的指令name正则
   */
  abstract regex: RegExp;
  /**
   * 用法
   */
  abstract usage: string;
  /**
   * 处理器类型
   */
  abstract type: CommandHandlerType;
  /**
   * 执行该处理器所需要的权限
   */
  abstract permission: Array<string>;

  /**
   * 处理指令
   * @param command 指令
   */
  abstract onCommand(command: Command): void;
}

/**
 * 指令处理器类型
 */
export enum CommandHandlerType {
  /**
   * 仅支持群聊
   */
    "GROUP",
  /**
   * 仅支持私聊
   */
    "PRIVATE",
  /**
   * 同时支持群聊和私聊
   */
    "ALL"
}