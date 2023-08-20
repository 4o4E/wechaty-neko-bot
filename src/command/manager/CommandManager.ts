import type {CommandHandler} from "../handler/CommandHandler";
import {CommandHandlerType} from "../handler/CommandHandler";
import {Command} from "../Command";
import type {ContactInterface} from "wechaty/src/user-modules/contact";
import fs from "fs";
import type {Message} from "wechaty";
import {log} from "wechaty";

const PREFIX = "[COMMAND]"

export class CommandManager {
  /**
   * 所有已注册的群聊指令处理器
   */
  static group: Set<CommandHandler> = new Set;
  /**
   * 所有已注册的私聊指令处理器
   */
  static private: Set<CommandHandler> = new Set;

  static register(handler: CommandHandler, type: CommandHandlerType) {
    switch (type) {
      case CommandHandlerType.group:
        this.group.add(handler);
        break;
      case CommandHandlerType.private:
        this.private.add(handler);
        break;
      case CommandHandlerType.all:
        this.group.add(handler);
        this.private.add(handler);
        break;
    }
  }

  static scanCommands() {
    fs.readdir(`${process.cwd()}/src/command/handler/list`, (err, names) => {
      if (err !== null) {
        console.error(err);
        return;
      }
      console.log(names);
      names
        .filter((name) => name.endsWith(".ts"))
        .map((name) => `${process.cwd()}/command/handler/list/${name.substring(0, name.indexOf(".ts"))}`)
        .map((path) => require(path).default)
    });
    log.info(PREFIX, `注册私聊指令${this.private.size}条, 群聊指令${this.group.size}条`);
  }

  /**
   * 处理私聊指令
   *
   * @param command 私聊指令
   */
  static handlePrivate(command: Command): boolean {
    log.info(PREFIX, "recv private: %s", command.toString())
    for (const handler of this.private) {
      if (!handler.match(command)) continue;
      handler.onCommand(command)
      return true;
    }
    return false;
  }

  /**
   * 处理群聊指令
   *
   * @param command 群聊指令
   */
  static handleGroup(command: Command): boolean {
    log.info(PREFIX, "recv group: %s", command.toString())
    for (const handler of this.group) {
      if (!handler.match(command)) continue;
      handler.onCommand(command)
      return true;
    }
    return false;
  }

  /**
   * 尝试解析消息到指令, 若是指令则执行并返回true, 否则返回false
   *
   * @param message 消息
   */
  static handleMessageAsCommand(message: Message): boolean {
    let commandInfo = this.parseToCommand(message);
    if (!commandInfo) return false
    let {name, args, props} = commandInfo;
    let sender = message.talker() as unknown as ContactInterface;
    let command = new Command(message, sender, name, args, props);
    // group
    return message.payload!.roomId ? this.handleGroup(command) : this.handlePrivate(command);
  }

  static parseToCommand(message: Message): { name: string, args: string[], props: Map<string, string> } | null {
    let text = message.text();
    let result = {
      prefix: "",
      name: "",
      bodyStart: NaN,
      args: new Array<string>(),
      props: new Map<string, string>(),
    }

    let index = {i: 0}

    if (!this.parseHeader(text, index, result)) return null;
    this.parseBody(text, index, result);
    return result;
  }

  /**
   * 尝试解析指令头
   *
   * @param text 指令文本
   * @param index 记录解析下标的对象
   * @param _result 指令解析的结果
   * @return 若解析成功则返回true
   */
  private static parseHeader(
    text: string,
    index: { i: number },
    _result: { prefix: string, name: string, bodyStart: number, args: string[], props: Map<string, string> }
  ): boolean {
    // 跳过开头全角空格
    while (text.charAt(index.i).isBlank()) {
      index.i++;
    }
    // 非指令
    if (text.charAt(index.i) !== '!' && text.charAt(index.i) != '！') return false;
    // 指令头
    let start = index.i
    while (index.i < text.length && !text.charAt(index.i).isBlank()) index.i++;
    // 缺失name
    if (start == index.i) return false;
    _result.bodyStart = index.i;
    _result.prefix = text.charAt(start);
    _result.name = text.substring(start + 1, index.i - start);
    return true;
  }

  private static parseBody(
    text: string,
    index: { i: number },
    _result: { prefix: string, name: string, bodyStart: number, args: string[], props: Map<string, string> }
  ) {
    // 使用数组作为cache, 最终使用join("")
    let cache = {
      argument: new Array<string>(),
      key: new Array<string>(),
      value: new Array<string>(),
    }
    let status: { status: ParseStatus; origin: boolean; escape: boolean } = {
      status: ParseStatus.SPACING, // 解析状态
      origin: false, // ""包裹的原始字符串
      escape: false, // \开头的转义字符串
    };

    function current(): Array<string> | null {
      switch (status.status) {
        case ParseStatus.ARGUMENT:
          return cache.argument;
        case ParseStatus.KEY:
          return cache.key;
        case ParseStatus.VALUE:
          return cache.value;
        case ParseStatus.SPACING:
          return null;
      }
    }
    const space = () => {
      console.log(ParseStatus[status.status]);
      switch (status.status) {
        case ParseStatus.ARGUMENT:
          _result.args.push(cache.argument.join(''))
          cache.argument = [];
          status.status = ParseStatus.SPACING;
          return;
        case ParseStatus.KEY:
          _result.props.set(cache.key.join(''), '')
          cache.key = [];
          cache.value = [];
          status.status = ParseStatus.SPACING;
          return;
        case ParseStatus.VALUE:
          _result.props.set(cache.key.join(''), cache.value.join(''))
          cache.key = [];
          cache.value = [];
          status.status = ParseStatus.SPACING;
          return;
        case ParseStatus.SPACING:
          return;
      }
    };

    for (let i = index.i; i < text.length; i++) {
      let c = text.charAt(i);
      // console.log(`cache: ${JSON.stringify(cache)}`)
      // console.log(`status: ${JSON.stringify(status)}`)
      // console.log(`char: ${c}`)
      // console.log()
      const prev = () => text.charAt(i - 1);
      const next = () => text.charAt(i + 1);

      const push = () => {
        switch (status.status) {
          case ParseStatus.ARGUMENT:
            cache.argument.push(c)
            return;
          case ParseStatus.KEY:
            cache.key.push(c)
            return;
          case ParseStatus.VALUE:
            cache.value.push(c)
            return;
        }
      };

      // 先处理转义
      if (status.escape) {
        status.escape = false;
        if (c === 'n') current()?.push('\n')
        if (c === '\\') current()?.push('\\\\')
      }
      // 若进入转义
      if (c === '\\') {
        status.escape = true;
        continue;
      }

      // 原始模式
      if (status.origin) {
        // 退出
        if (c === '"' && next().isBlank()) {
          status.origin = false;
          continue;
        }
        // 记录原始内容
        push();
        continue;
      }

      // 进入原始模式
      if (c === '"' && (prev().isBlank() || prev() === '=')) {
        if (status.status === ParseStatus.SPACING) status.status = ParseStatus.ARGUMENT;
        status.origin = true;
        continue;
      }

      if (c === '-' && status.status === ParseStatus.SPACING) {
        status.status = ParseStatus.KEY;
        continue;
      }

      if (c === '=' && status.status === ParseStatus.KEY) {
        status.status = ParseStatus.VALUE;
        continue;
      }

      // 空格, 一段结束
      if (c.isBlank()) {
        space();
        continue;
      }
      if (status.status === ParseStatus.SPACING) status.status = ParseStatus.ARGUMENT;

      // 缓存当前字符
      push();
    }
    // 收尾
    space()
  }
}

enum ParseStatus {
  ARGUMENT,
  KEY,
  VALUE,
  SPACING
}

const blanks = [' ', '\t', '\n', '\u3000'];

declare global {
  interface String {
    isBlank(): boolean;
  }
}

String.prototype.isBlank = function () {
  for (let blank of blanks) {
    if (this === blank) return true;
  }
  return false;
};