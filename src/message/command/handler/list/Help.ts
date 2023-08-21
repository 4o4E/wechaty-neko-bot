import {CommandHandler, CommandHandlerType} from "@/message/command/handler/CommandHandler";
import type {Command} from "@/message/command/Command";
import {CommandManager} from "@/message/command/manager/CommandManager";

class Help implements CommandHandler {
  name = "Help";
  regex = /help|h|帮助/i;
  usage = `!help - 查看所有指令(暂不支持)
!help [指令] - 查看指令`;
  type = CommandHandlerType.ALL;

  onCommand(command: Command): void {
    if (command.args.length == 0) {
      command.say(this.usage);
      return;
    }
    let name = command.args[0];
    let handlers = command.message.room() ? CommandManager.group : CommandManager.private;
    for (let handler of handlers) {
      if (handler.regex.test(name)) {
        command.say(handler.usage);
        return;
      }
    }
    command.say("未找到对应指令");
  }
}

const INSTANCE = new Help();
CommandManager.register(INSTANCE, INSTANCE.type);