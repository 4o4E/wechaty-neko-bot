import {CommandHandler, CommandHandlerType} from "@/message/command/handler/CommandHandler";
import type {Command} from "@/message/command/Command";
import {SubHandler} from "@/message/command/handler/template/SubHandler";

/**
 * 有多级嵌套子指令的指令模板
 */
export abstract class BaseSubCommand implements CommandHandler {
  abstract name: string;
  abstract regex: RegExp;
  abstract type: CommandHandlerType;
  abstract permission: Array<string>;
  /**
   * 所有的子指令处理器
   */
  abstract sub: Array<SubHandler>;
  abstract currentUsage: string;
  get usage(): string {
    let strings = this.sub.map(s => s.usage);
    strings.unshift(this.currentUsage);
    return strings.join("\n");
  }

  onCommand(command: Command): void {
    if (command.args.length == 0) {
      this.currentOnCommand(command);
      return;
    }
    let args = Array.from(command.args);
    let arg = args.shift();
    for (let handler of this.sub) {
      if (handler.regex.test(arg)) {
        handler
        return;
      }
    }
  }

  /**
   * 处理args为空的情况
   *
   * @param command
   */
  currentOnCommand(command: Command): void {
    command.say(this.usage);
  }
}

