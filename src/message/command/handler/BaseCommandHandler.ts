import {PermValue} from "@/permission/types";
import {ArgInfo} from "@/message/command/handler/builder/ArgInfo";
import {OptionInfo} from "@/message/command/handler/builder/OptionInfo";
import {Command} from "@/message/command/Command";
import {CommandHandler} from "@/message/command/handler/CommandHandler";
import {SubCommandHandler} from "@/message/command/handler/SubCommandHandler";

/**
 * 指令处理器和子指令处理器的基类
 */
export abstract class BaseCommandHandler {
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
  usage: string = null;
  /**
   * 执行该处理器对应指令是否需要权限, 设为null则无需权限
   *
   * 权限名字为`command.use.{name}`, 若有嵌套则`command.use.{name}.{sub}`
   */
  perm: PermValue = PermValue.NULL;
  /**
   * 指令参数信息
   *
   * 若`supportVararg`为`false`, 则数量应大于等于输入的参数个数, 超过个数则视为错误输入
   */
  argsInfo: ArgInfo[] = [];
  /**
   * 指令选项信息
   */
  optionsInfo: Map<string, OptionInfo> = new Map<string, OptionInfo>();
  /**
   * 是否支持可变长参数, 若支持, 则参数校验器中的最后一个校验器将用于后续可变参数的校验
   */
  supportVararg: boolean = false;
  /**
   * 子指令
   */
  sub: SubCommandHandler[] = [];
  /**
   * 处理指令
   */
  onCommand: (handler: BaseCommandHandler, command: Command, arg: string, args: string[]) => void = null;

  protected constructor(name: string, regex: RegExp) {
    this.name = name;
    this.regex = regex;
  }

  /**
   * 尝试从子指令中选择合适的处理器处理该指令
   *
   * @param handler 处理器,
   * @param command 指令
   * @param thisArg 执行到当前节点时匹配的arg
   * @param args 还未处理的参数
   * @return 若找到合适的处理器处理则返回true
   */
  async trySubCommand(handler: BaseCommandHandler, command: Command, thisArg: string, args: string[]): Promise<void> {
    let arg = args.shift();
    if (command.args.length !== 0) {
      for (let handler of this.sub) {
        if (handler.regex.test(arg)) {
          handler.onCommand(handler, command, arg, args);
          return;
        }
      }
    }
    if (this.onCommand) {
      this.onCommand(handler, command, arg, args);
      return;
    }
    await command.say(this.usage);
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
   * 对参数进行校验和转换, 需要在构建指令时注入参数校验
   *
   * @param args 参数
   * @return 若错误则返回遇到的第一个错误信息, 若成功则返回转换完成后的参数列表
   */
  processArgs(args: string[]): string | any[] {
    if (args.length > this.argsInfo.length) {
      if (!this.supportVararg) return `参数个数${args.length}超出预期${this.argsInfo.length}`;
      // 可变长参数
      let result: any[] = new Array(args.length);
      for (let i = 0; i < this.argsInfo.length - 1; i++) {
        let validation = this.argsInfo[i];
        let convertResult = validation.checkConvert(args[i]);
        if (convertResult.error) return convertResult.error;
        result[i] = convertResult;
      }
      let last = this.argsInfo[this.argsInfo.length - 1];
      for (let i = this.argsInfo.length; i < args.length; i++) {
        let convertResult = last.checkConvert(args[i]);
        if (convertResult.error) return convertResult.error;
        result.push(convertResult);
      }
      return result;
    }

    // 检查参数是否是可选的
    for (let i = args.length; i < this.argsInfo.length; i++) {
      let validation = this.argsInfo[i];
      if (validation.require) return `${validation.name}是必须的参数`;
    }

    // 检查参数
    let result: any[] = new Array(args.length);
    for (let i = 0; i < args.length; i++) {
      let validation = this.argsInfo[i];
      let convertResult = validation.checkConvert(args[i]);
      if (convertResult.error) return convertResult.error;
      result.push(convertResult);
    }
    return result;
  }

  /**
   * 对选项进行校验和转换
   *
   * @param options 选项Map
   * @return 若错误则返回遇到的第一个错误信息, 若成功则返回转换完成后的参数列表
   */
  processOptions(options: Map<string, string>): string | Map<string, any> {
    // 检查参数是否缺少
    for (let k in this.optionsInfo) {
      let v = this.optionsInfo.get(k);
      if (v.require && !options.get(k)) return `缺少必须的选项${k}`
    }
    let result = new Map<string, any>();
    // 检查参数
    options.forEach((v, k) => {
      let info = this.optionsInfo.get(k);
      if (!info) return `无效参数: ${k}`;
      let r = info.checkConvert(v);
      if (r.error) return r.error;
      result.set(k, r.result);
    });
    return result;
  }
}