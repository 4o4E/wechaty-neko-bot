import {Command} from "@/message/command/Command";
import {BaseSubCommand} from "@/message/command/handler/template/BaseSubCommand";

/**
 * 常规的子指令
 */
export abstract class SubHandler {
  abstract name: string;
  abstract regex: RegExp;
  abstract permission: Array<string>;
  abstract usage: string;
  sub: SubHandler[] = [];
  currentUsage: string | null = null;
  parent: SubHandler | BaseSubCommand = null;

  constructor() {
    for (let handler of this.sub) {
      handler.parent = this;
    }
  }

  /**
   * 生成usage, 在子类中手动调用, **调用必须在定义sub之后**
   */
  generateUsage(): string {
    let strings = this.sub.map(s => s.usage);
    if (this.currentUsage) strings.unshift(this.currentUsage);
    return strings.join("\n");
  }

  /**
   * 从父指令解析器传递到此时执行此方法
   *
   * @param command 原始指令
   * @param arg 当前参数(和this.regex对应的arg)
   * @param args 剩余未解析的参数
   */
  abstract onSubCommand(command: Command, arg: string, args: string[]);
}