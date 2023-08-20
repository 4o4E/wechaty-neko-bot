import {CommandManager} from "./command/manager/CommandManager";
import {log, Message} from "wechaty";
import * as PUPPET from "wechaty-puppet";

export class MessageManager {
  static onMessageRecv(message: Message): void {

    if (message)

    log.info("bot", "recv message: [%s] %s", PUPPET.types.Message[message.type()], message.text())
    if (message.type() === PUPPET.types.Message.Text && CommandManager.handleMessageAsCommand(message)) return;
    this.handleNotCommandMessage(message);
  }

  static handleNotCommandMessage(message: Message) {
    if (message.type() === PUPPET.types.Message.Unknown) return
    log.info("bot", "unhandled message: [%s] %s", PUPPET.types.Message[message.type()], message.text())
  }
}