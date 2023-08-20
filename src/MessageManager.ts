import {CommandManager} from "./command/manager/CommandManager";
import {log, Message} from "wechaty";
import * as PUPPET from "wechaty-puppet";

/**
 * 消息处理器
 */
export class MessageManager {
  /**
   * 处理消息接收
   *
   * @param message 消息
   */
  static onMessageRecv(message: Message): void {
    log.info("bot", "recv message: [%s] %s", PUPPET.types.Message[message.type()], message.text())
    if (message.type() === PUPPET.types.Message.Text && CommandManager.handleMessageAsCommand(message)) return;
    this.handleNotCommandMessage(message);
  }

  /**
   * 处理非指令消息
   *
   * @param message 消息
   */
  static handleNotCommandMessage(message: Message) {
    if (message.type() === PUPPET.types.Message.Unknown) return
    log.info("bot", "unhandled message: [%s] %s", PUPPET.types.Message[message.type()], message.text())
  }
}