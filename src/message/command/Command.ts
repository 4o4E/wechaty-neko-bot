import type {ContactInterface} from "wechaty/dist/esm/src/user-modules/contact";
import type {Message} from "wechaty";
import {MessageInterface} from "wechaty/dist/esm/src/user-modules/mod";
import {Sayable} from "wechaty/dist/esm/src/sayable/types";

/**
 * 代表一个指令, 用户输入的指令
 */
export class Command {
  /**
   * 原始消息
   */
  message: Message
  /**
   * 指令的发送者
   */
  sender: ContactInterface
  /**
   * 指令的名字
   */
  name: string
  /**
   * 指令的参数
   */
  args: string[]
  /**
   * 指令的选项, -aaa=bbb
   */
  props: Map<string, string>
  /**
   * 指令body原文
   */
  content: string

  constructor(
    message: Message,
    sender: ContactInterface,
    name: string,
    args: string[],
    props: Map<string, string>,
    content: string
  ) {
    this.message = message;
    this.sender = sender;
    this.name = name;
    this.args = args;
    this.props = props;
    this.content = content;
  }

  /**
   * 返回可视化的指令解析结果
   */
  toString() {
    return `command { name: ${this.name}, args: ${this.args}, options: ${JSON.stringify(this.props)} }`
  }

  async say(
    sayable: Sayable
  ): Promise<void | MessageInterface> {
    return this.message.say(sayable)
  }
}