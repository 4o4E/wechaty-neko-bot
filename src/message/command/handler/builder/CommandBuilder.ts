import {PermValue} from "@/permission/types";
import {Command} from "@/message/command/Command";
import {CommandHandler, CommandType} from "@/message/command/handler/CommandHandler";
import {CommandArgValidation} from "@/message/command/handler/builder/CommandArgValidation";

export class CommandBuilder {
  private readonly handler: CommandHandler;

  constructor(name: string, regex: RegExp, type?: CommandType) {
    this.handler = new CommandHandler(name, regex);
    if (type) this.handler.type = type;
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
   * 添加一个子指令处理器
   *
   * @param sub 处理器
   */
  sub(sub: CommandHandler): CommandBuilder {
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
  valid(valid: CommandArgValidation<any>[]): CommandBuilder {
    this.handler.validations = valid;
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
   * arg参数在处理根指令时传入指令名字
   *
   * @param handler 指令处理器
   */
  onCommand(handler: (handler: CommandHandler, command: Command, arg: string, args: string[]) => void): CommandBuilder {
    this.handler.onCommand = (command, arg, args) => handler(this.handler, command, arg, args);
    return this;
  }

  build() {
    // 构建时注入了子指令
    if (this.handler.sub.length !== 0) {
      // 生成本级指令的usage
      this.handler.usage = this.handler.sub.map(sub => sub.usage).join("\n");
      // 注入onCommand
      return this.handler;
    }
    return this.handler;
  }

  register() {
    this.build().register();
  }
}
