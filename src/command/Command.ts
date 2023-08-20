import type {ContactInterface} from "wechaty/src/user-modules/contact";
import type {Message} from "wechaty";

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
  options: Map<string, string | number>

  constructor(
    message: Message,
    sender: ContactInterface,
    name: string,
    args: string[],
    options: Map<string, string | number>
  ) {
    this.message = message;
    this.sender = sender;
    this.name = name;
    this.args = args;
    this.options = options;
  }

  toString() {
    return `command { name: ${this.name}, args: ${this.args}, options: ${this.options[Symbol.toStringTag]} }`
  }
}