import {CommandHandlerType} from "@/message/command/handler/CommandHandler";
import type {Command} from "@/message/command/Command";
import {CommandManager} from "@/message/command/manager/CommandManager";
import {ScheduleManager} from "@/schedule/ScheduleManager";
import {BaseSubCommand} from "@/message/command/handler/template/BaseSubCommand";
import {SubHandler} from "@/message/command/handler/template/SubHandler";

class Cron implements BaseSubCommand {
  name = "Cron";
  regex = /cron/i;
  type = CommandHandlerType.ALL;
  permission = ["command.use.Cron"];
  sub = new Array<SubHandler>();
  currentUsage: string;

  get usage(): string {
    let strings = this.sub.map(s => s.usage);
    strings.unshift(this.currentUsage);
    return strings.join("\n");
  }

  onCommand(command: Command): void {
    if (command.args.length == 0) {
      command.say(this.usage);
      return;
    }
    switch (command.args[0].toLowerCase()) {
      case "add":
        if (command.args)
          ScheduleManager.checkCron("")
        return;
      case "del":
      case "list":
      default:
        command.say(this.usage);
        return;
    }
  }

  currentOnCommand(command: Command) {

  }
}

const INSTANCE = new Cron();
CommandManager.register(INSTANCE, INSTANCE.type);