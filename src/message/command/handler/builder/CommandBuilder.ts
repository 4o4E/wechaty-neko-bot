import {PermValue} from "@/permission/types";
import {Command} from "@/message/command/Command";
import {CommandHandler, CommandType} from "@/message/command/handler/CommandHandler";
import {ArgInfo} from "@/message/command/handler/builder/ArgInfo";
import {OptionInfo} from "@/message/command/handler/builder/OptionInfo";
import {SubCommandHandler} from "@/message/command/handler/SubCommandHandler";
import {BaseCommandHandler} from "@/message/command/handler/BaseCommandHandler";

export class CommandBuilder {
  private readonly handler: CommandHandler;

  constructor(name: string, regex: RegExp, type: CommandType) {
    this.handler = new CommandHandler(name, regex, type);
  }

  /**
   * 声明用法
   *
   * @param usage 用法
   */
  usage(usage: string): CommandBuilder {
    this.handler.usage = usage;
    return this;
  }

  /**
   * 声明需要的权限
   *
   * @param perm 权限默认值
   */
  perm(perm: PermValue): CommandBuilder {
    this.handler.perm = perm;
    return this;
  }

  /**
   * 添加一个参数信息
   *
   * @param info 参数信息
   */
  arg(info: ArgInfo) {
    this.handler.argsInfo.push(info);
    return this;
  }

  /**
   * 添加一个选项信息
   *
   * @param info 选项信息
   */
  option(info: OptionInfo) {
    this.handler.optionsInfo.set(info.name, info);
    return this;
  }

  /**
   * 标记为支持可变长参数
   */
  supportVararg(): CommandBuilder {
    this.handler.supportVararg = true;
    return this;
  }

  /**
   * 添加一个子指令处理器
   *
   * @param sub 处理器
   */
  sub(sub: SubCommandHandler): CommandBuilder {
    // 注入parent
    sub.parent = this.handler;
    this.handler.sub.push(sub);
    return this;
  }

  /**
   * 注入参数校验器
   *
   * @param valid 参数校验器数组
   */
  valid(valid: ArgInfo[]): CommandBuilder {
    this.handler.argsInfo = valid;
    return this;
  }

  /**
   * arg参数在处理根指令时传入指令名字
   *
   * @param handler 指令处理器
   */
  onCommand(handler: (handler: BaseCommandHandler, command: Command, arg: string, args: string[]) => void): CommandBuilder {
    this.handler.onCommand = (base, command, arg, args) => handler(base, command, arg, args);
    return this;
  }

  build() {
    // 构建时注入了子指令
    if (this.handler.sub.length !== 0) {
      // 生成本级指令的usage
      this.handler.usage = this.handler.sub.map(sub => sub.usage).join("\n");
      // 注入onCommand
      this.onCommand(this.handler.trySubCommand);
      return this.handler;
    }
    return this.handler;
  }

  register() {
    this.build().register();
  }
}

export class SubCommandBuilder {
  private readonly handler: SubCommandHandler;

  constructor(name: string, regex: RegExp) {
    this.handler = new SubCommandHandler(name, regex);
  }

  /**
   * 声明用法, 只需包含该节点的usage信息, 指令以及子指令将自动生成
   *
   * @param usage 用法
   */
  usage(usage: string): SubCommandBuilder {
    this.handler.usage = usage;
    return this;
  }

  /**
   * 声明需要的权限
   *
   * @param perm 权限默认值
   */
  perm(perm: PermValue): SubCommandBuilder {
    this.handler.perm = perm;
    return this;
  }

  /**
   * 设置参数信息
   *
   * @param info 参数信息
   */
  arg(info: ArgInfo[]): SubCommandBuilder {
    this.handler.argsInfo = info;
    return this;
  }

  /**
   * 添加一个选项信息
   *
   * @param info 选项信息
   */
  option(info: OptionInfo): SubCommandBuilder {
    this.handler.optionsInfo.set(info.name, info);
    return this;
  }

  /**
   * 标记为支持可变长参数
   */
  supportVararg(): SubCommandBuilder {
    this.handler.supportVararg = true;
    return this;
  }

  /**
   * 添加一个子指令处理器
   *
   * @param sub 处理器
   */
  sub(sub: SubCommandHandler): SubCommandBuilder {
    // 注入parent
    sub.parent = this.handler;
    this.handler.sub.push(sub);
    return this;
  }

  /**
   * 注入参数校验器
   *
   * @param valid 参数校验器数组
   */
  valid(valid: ArgInfo[]): SubCommandBuilder {
    this.handler.argsInfo = valid;
    return this;
  }

  /**
   * arg参数在处理根指令时传入指令名字
   *
   * @param handler 指令处理器
   */
  onCommand(handler: (handler: BaseCommandHandler, command: Command, arg: string, args: string[]) => void): SubCommandBuilder {
    this.handler.onCommand = (base, command, arg, args) => handler(base, command, arg, args);
    return this;
  }

  private buildUsage() {
    let arr: string[] = [];

    let p = this.handler;
    // 逐级补全指令path
    while (true) {
      arr.unshift(p.name, " ");
      let parent = p.parent;
      if (parent instanceof CommandHandler) {
        arr.unshift("!", parent.name, " ");
        break;
      }
    }

    // args
    if (this.handler.argsInfo.length > 0) {
      for (let i = 0; i < this.handler.argsInfo.length - 1; i++) {
        let info = this.handler.argsInfo[i];
        arr.push(
          info.require ? "<" : "[",
          info.name,
          info.require ? ">" : "]",
        );
      }
      // 最后一个arg
      let last = this.handler.argsInfo[this.handler.argsInfo.length - 1];
      arr.push(
        last.require ? "<" : "[",
        last.name, this.handler.supportVararg ? "..." : "",
        last.require ? ">" : "]",
      );
    }

    // usage
    arr.push(" - ", this.handler.usage);

    // args info
    if (this.handler.argsInfo.length > 0) {
      arr.push("\n指令参数:\n")
      for (let i = 0; i < this.handler.argsInfo.length - 1; i++) {
        let info = this.handler.argsInfo[i];
        arr.push("[", info.name, "]: ", info.desc, "\n");
      }
      // 最后一个arg
      let last = this.handler.argsInfo[this.handler.argsInfo.length - 1];
      arr.push(
        last.require ? "<" : "[",
        last.name, this.handler.supportVararg ? "..." : "",
        last.require ? ">" : "]",
        ": ", last.desc
      );
    }

    // options info
    if (this.handler.optionsInfo.size > 0) {
      arr.push("\n指令选项:\n")
      this.handler.optionsInfo.forEach((v, k) => {
        // 跳过隐藏参数
        if (v.hide) return;
        // todo
        arr.push("-", k);
        if (v.optional) arr.push("=", )
      });
    }
  }

  build(): SubCommandHandler {
    // 构建时注入了子指令
    if (this.handler.sub.length !== 0) {
      // 生成本级指令的usage
      if (!this.handler.usage && this.handler.argsInfo.length !== 0) {
        let arr: string[] = [];
        let p = this.handler;
        // 逐级补全指令path
        while (true) {
          arr.unshift(p.name);
          let parent = p.parent;
          if (parent instanceof CommandHandler) {
            arr.unshift(`!${parent.name}`);
            break;
          }
        }
        arr.push("-");

      }
      let subUsage = this.handler.sub.map(sub => sub.usage);
      if (this.handler.usage) subUsage.unshift(this.handler.usage);
      this.handler.usage = subUsage.join("\n");
      // 注入onCommand
      this.onCommand(this.handler.trySubCommand);
      return this.handler;
    }
    return this.handler;
  }
}

export function command(name: string, regex: RegExp, type: CommandType): CommandBuilder {
  return new CommandBuilder(name, regex, type);
}

export function subCommand(name: string, regex: RegExp): SubCommandBuilder {
  return new SubCommandBuilder(name, regex);
}
