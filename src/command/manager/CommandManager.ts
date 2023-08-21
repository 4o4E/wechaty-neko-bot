import type {CommandHandler} from "../handler/CommandHandler";
import {CommandHandlerType} from "../handler/CommandHandler";
import {Command} from "../Command";
import type {ContactInterface} from "wechaty/dist/esm/src/user-modules/contact";
import fs from "fs";
import type {Message} from "wechaty";
import {log} from "wechaty";

const PREFIX = "[CommandManager]"

/**
 * 指令解析的结果
 */
interface ParseResult {
  /**
   * 指令前缀
   */
  prefix: string,
  /**
   * 指令名字
   */
  name: string,
  /**
   * 指令body开始的下标, body的第一个非空格字符
   */
  bodyStart: number,
  /**
   * 指令参数
   */
  args: Array<string>,
  /**
   * 指令参数`-aaa=bbb`
   */
  props: Map<string, string>,
  /**
   * 指令正文(完整body)
   */
  content: string
}

/**
 * 指令管理器
 */
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
      case CommandHandlerType.GROUP:
        this.group.add(handler);
        break;
      case CommandHandlerType.PRIVATE:
        this.private.add(handler);
        break;
      case CommandHandlerType.ALL:
        this.group.add(handler);
        this.private.add(handler);
        break;
    }
  }

  /**
   * 自动从`command/handler/list`文件夹下扫描指令js并执行
   */
  static scanCommands() {
    fs.readdir(`${process.cwd()}/dist/command/handler/list`, (err, names) => {
      if (err !== null) {
        console.error(err);
        return;
      }
      names
        .filter((name) => name.endsWith(".js"))
        .map((name) => `${process.cwd()}/dist/command/handler/list/${name.substring(0, name.indexOf(".js"))}`)
        .map((path) => require(path));
      log.info(PREFIX, `注册私聊指令${this.private.size}条, 群聊指令${this.group.size}条`);
    });
  }

  /**
   * 处理私聊指令
   *
   * @param command 私聊指令
   */
  static handlePrivate(command: Command): boolean {
    log.info(PREFIX, "recv private: %s", command.toString())
    for (const handler of this.private) {
      if (!handler.regex.test(command.name)) continue;
      handler.onCommand(command);
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
      if (!handler.regex.test(command.name)) continue;
      handler.onCommand(command);
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
    if (!commandInfo) return false;
    let {name, args, props, content} = commandInfo;
    let sender = message.talker() as unknown as ContactInterface;
    let command = new Command(message, sender, name, args, props, content);
    // group
    return message.room() ? this.handleGroup(command) : this.handlePrivate(command);
  }

  /**
   * 尝试将消息解析为指令
   * @param message 消息
   * @return 若不是指令则返回null
   */
  static parseToCommand(message: Message): ParseResult | null {
    let text = message.text();
    let result: ParseResult = {
      prefix: "",
      name: "",
      bodyStart: NaN,
      args: new Array<string>(),
      props: new Map<string, string>(),
      content: ""
    }

    let index = {i: 0}

    if (!this.parseHeader(text, index, result)) return null;
    // 跳过开头全角空格
    while (text.charAt(index.i).isBlank()) index.i++;
    result.content = text.substring(index.i, text.length);
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
  private static parseHeader(text: string, index: { i: number }, _result: ParseResult): boolean {
    // 非指令
    if (text.charAt(index.i) !== '!' && text.charAt(index.i) != '！') return false;
    // 指令头
    let start = index.i;
    while (index.i < text.length && !text.charAt(index.i).isBlank()) index.i++;
    // 缺失name
    if (start == index.i) return false;
    _result.bodyStart = index.i;
    _result.prefix = text.charAt(start);
    _result.name = text.substring(start + 1, index.i - start);
    return true;
  }

  /**
   * 解析指令
   *
   * @param text 指令文本
   * @param index 记录解析下标的对象
   * @param _result 指令解析的结果
   */
  private static parseBody(text: string, index: { i: number }, _result: ParseResult) {
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
            cache.argument.push(c);
            return;
          case ParseStatus.KEY:
            cache.key.push(c);
            return;
          case ParseStatus.VALUE:
            cache.value.push(c);
            return;
        }
      };

      // 先处理转义
      if (status.escape) {
        status.escape = false;
        switch (c) {
          case 'n':
            current()?.push('\n');
            break;
          case '\\':
            current()?.push('\\\\');
            break;
          default:
            current()?.push(c)
            break;
        }
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
    space();
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