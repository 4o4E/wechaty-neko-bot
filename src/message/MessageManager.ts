import {CommandManager} from "@/message/command/manager/CommandManager";
import {log, Message} from "wechaty";
import * as PUPPET from "wechaty-puppet";

export let debug = {value: false};

/**
 * 消息处理器
 */
export class MessageManager {
  static groupCallbacks = new Map<string, Callback>();
  static privateCallbacks = new Map<string, Callback>();

  /**
   * 处理消息接收
   *
   * @param message 消息
   */
  static onMessageRecv(message: Message): void {
    debug.value && log.info("bot", "recv message: [%s] %s", PUPPET.types.Message[message.type()], message.text());
    if (this.handleCallback(message)) return;
    if (message.type() === PUPPET.types.Message.Text && CommandManager.handleMessageAsCommand(message)) return;
    this.handleNotCommandMessage(message);
  }

  static addCallback(callback: Callback, isGroup: boolean) {
    let callbacks = isGroup ? this.groupCallbacks : this.privateCallbacks;
    callbacks.set(callback.sign, callback);
  }

  /**
   * 处理回调
   *
   * @return 若已处理则返回true
   */
  private static handleCallback(message: Message): boolean {
    let roomId = message.room()?.id;
    let senderId = message.talker().id;
    let now = new Date().getTime();

    if (roomId) {
      // group
      let sign = `${roomId}.${senderId}`;
      let callback = this.groupCallbacks.get(sign);
      if (!callback) return false;
      this.groupCallbacks.delete(sign);
      if (now - callback.time > CALLBACK_VALID) return false;
      return callback.callback(message);
    }

    // private
    let callback = this.privateCallbacks.get(senderId);
    if (!callback) return false;
    this.privateCallbacks.delete(senderId);
    if (now - callback.time > CALLBACK_VALID) return false;
    return callback.callback(message);
  }

  /**
   * 处理非指令消息
   */
  private static handleNotCommandMessage(message: Message) {
    if (message.type() === PUPPET.types.Message.Unknown) return
    debug.value && log.info("bot", "unhandled message: [%s] %s", PUPPET.types.Message[message.type()], message.text())
  }
}

const CALLBACK_VALID = 3 * 60 * 1000

export abstract class Callback {
  abstract sign: string
  abstract time: number

  abstract callback(message: Message): boolean
}