import {BaseCommandHandler} from "@/message/command/handler/BaseCommandHandler";
import {CommandHandler} from "@/message/command/handler/CommandHandler";

/**
 * 指令处理器模板
 */
export class SubCommandHandler extends BaseCommandHandler {
  /**
   * 上级处理器, 作为根处理器时为null
   */
  parent: BaseCommandHandler = null;

  constructor(name: string, regex: RegExp) {
    super(name, regex);
  }
}