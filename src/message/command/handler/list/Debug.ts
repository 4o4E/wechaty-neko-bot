import {CommandHandler, CommandHandlerType} from "@/message/command/handler/CommandHandler";
import type {Command} from "@/message/command/Command";
import {CommandManager} from "@/message/command/CommandManager";
import {enableDebug, switchDebug} from "@/util/log";

class Debug implements CommandHandler {
  name = "Debug";
  regex = /debug/i;
  usage = "!debug - 切换debug";
  type = CommandHandlerType.ALL;
  permission = new Array<string>();

  onCommand(command: Command): void {
    switchDebug();
    command.say(enableDebug ? "已开启debug" : "已关闭debug");
  }
}

const INSTANCE = new Debug();
CommandManager.register(INSTANCE, INSTANCE.type);