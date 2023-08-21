import {CommandHandler, CommandHandlerType} from "@/message/command/handler/CommandHandler";
import type {Command} from "@/message/command/Command";
import {CommandManager} from "@/message/command/manager/CommandManager";
import {start} from "@/main";

class Status implements CommandHandler {
  name = "Status";
  regex = /status/i;
  usage = "!status - 查看机器人统计信息";
  type = CommandHandlerType.ALL;

  onCommand(command: Command): void {
    let mem = process.memoryUsage();
    const format = (bytes: number) => (bytes / 1024 / 1024).toFixed(2) + 'MB';
    command.say(`wechaty-neko-bot
启动于 ${start.toLocaleString()}
总内存: ${format(mem.rss)}
堆内存: ${format(mem.heapUsed)}/${format(mem.heapTotal)}
群聊指令 ${CommandManager.group.size} 条
私聊指令 ${CommandManager.private.size} 条`);
  }
}

const INSTANCE = new Status();
CommandManager.register(INSTANCE, INSTANCE.type);