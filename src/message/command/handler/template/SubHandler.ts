import {Command} from "@/message/command/Command";

/**
 * 常规的子指令
 */
export abstract class SubHandler {
  abstract name: string;
  abstract regex: RegExp;
  abstract permission: Array<string>;
  abstract sub: Array<SubHandler>;
  abstract currentUsage: string;
  get usage(): string {
    let strings = this.sub.map(s => s.usage);
    strings.unshift(this.currentUsage);
    return strings.join("\n");
  }

  /**
   * 从父指令解析器传递到此时执行此方法
   *
   * @param command 原始指令
   * @param arg 当前参数
   * @param args 剩余未解析的参数
   */
  abstract onSubCommand(command: Command, arg: string, args: string[]);
}

/**
 * 有子节点的子指令
 */
export abstract class SubNode extends SubHandler {

  /**
   * 从父指令解析器传递到此时执行此方法
   *
   * @param command 原始指令
   * @param arg 当前参数
   * @param args 剩余未解析的参数
   */
  override onSubCommand(command: Command, arg: string, args: string[]) {
    if (args.length == 0) {
      this.onCurrentCommand();
      return;
    }

  }

  abstract onCurrentCommand(): void;
}