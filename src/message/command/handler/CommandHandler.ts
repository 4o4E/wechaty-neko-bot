import type {Command} from "@/message/command/Command";
import {PermValue} from "@/permission/types";
import {CommandArgValidation} from "@/message/command/handler/builder/CommandArgValidation";
import {CommandManager} from "@/message/command/CommandManager";
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
export class CommandHandler {
  /**
   * 上级处理器, 作为根处理器时为null
   */
  parent: CommandHandler = null;
  /**
   * 处理器名字
   */
  readonly name: string;
  /**
   * 接受的指令name正则
   */
  readonly regex: RegExp;
  /**
   * 用法
   */
  usage: string;
  /**
   * 处理器类型,
   */
  type: CommandType;
  /**
   * 执行该处理器对应指令是否需要权限, 设为null则无需权限
   *
   * 权限名字为`command.use.{name}`, 若有嵌套则`command.use.{name}.{sub}`
   */
  perm: PermValue = null;
  /**
   * 参数校验信息
   *
   * 若`supportVararg`为`false`, 则数量应大于等于输入的参数个数, 超过个数则视为错误输入
   */
  validations: CommandArgValidation<any>[] = [];
  /**
   * 是否支持可变长参数, 若支持, 则参数校验器中的最后一个校验器将用于后续可变参数的校验
   */
  supportVararg: boolean = false;
  /**
   * 子指令
   */
  sub: CommandHandler[] = [];
  /**
   * 指令处理
   */
  onCommand: (command: Command, arg: string, args: string[]) => void;

  constructor(name: string, regex: RegExp) {
    this.name = name;
    this.regex = regex;
  }

  /**
   * 尝试从子指令中选择合适的处理器处理该指令
   *
   * @param command 指令
   * @param args 还未处理的参数
   * @return 若找到合适的处理器处理则返回true
   */
  trySubCommand(command: Command, args: string[]): boolean {
    if (command.args.length === 0) return false;
    let arg = args.shift();
    for (let handler of this.sub) {
      if (handler.regex.test(arg)) {
        handler.onCommand(command, arg, args);
        return true;
      }
    }
    return false;
  }

  /**
   * 生成usage, 在子类中手动调用, **调用必须在定义sub之后**
   */
  generateUsage(): string {
    let strings = this.sub.map(s => s.usage);
    if (this.usage) strings.unshift(this.usage);
    return strings.join("\n");
  }

  /**
   * 对参数进行校验和转换
   *
   * @param args 参数
   * @return 若错误则返回遇到的第一个错误信息, 若成功则返回转换完成后的参数列表
   */
  validArgs(args: string[]): string | any[] {
    if (args.length > this.validations.length) {
      if (!this.supportVararg) return `参数个数${args.length}超出预期${this.validations.length}`;
      // 可变长参数
      let result: any[] = new Array(args.length);
      for (let i = 0; i < this.validations.length - 1; i++) {
        let validation = this.validations[i];
        let convertResult = validation.checkConvert(args[i]);
        if (convertResult.error) return convertResult.error;
        result[i] = convertResult;
      }
      let last = this.validations[this.validations.length - 1];
      for (let i = this.validations.length; i < args.length; i++) {
        let convertResult = last.checkConvert(args[i]);
        if (convertResult.error) return convertResult.error;
        result.push(convertResult);
      }
      return result;
    }

    // 检查参数是否是可选的
    for (let i = args.length; i < this.validations.length; i++) {
      let validation = this.validations[i];
      if (validation.require) return `${validation.name}是必须的参数`;
    }

    // 检查参数
    let result: any[] = new Array(args.length);
    for (let i = 0; i < args.length; i++) {
      let validation = this.validations[i];
      let convertResult = validation.checkConvert(args[i]);
      if (convertResult.error) return convertResult.error;
      result.push(convertResult);
    }
    return result;
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