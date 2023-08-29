import {CommandManager} from "@/message/command/CommandManager";
import {command} from "@/message/command/handler/builder/CommandBuilder";
import {ArgInfo} from "@/message/command/handler/builder/ArgInfo";
import {ConvertResult} from "@/message/command/handler/builder/ConvertResult";
import {CommandType} from "@/message/command/handler/CommandHandler";

// class Help implements CommandHandler {
//   name = "Help";
//   regex = /help|h|帮助/i;
//   usage = `!help - 查看所有指令(暂不支持)
// !help [指令] - 查看指令`;
//   type = CommandType.ROOM_AND_PRIVATE;
//   permission = new Array<string>();
//
//   onCommand(command: Command): void {
//     if (command.args.length === 0) {
//       await command.say(this.usage);
//       return;
//     }
//     let name = command.args[0];
//     let handlers = command.message.room() ? CommandManager.group : CommandManager.private;
//     for (let handler of handlers) {
//       if (handler.regex.test(name)) {
//         await command.say(handler.usage);
//         return;
//       }
//     }
//     await command.say("未找到对应指令");
//   }
// }

// const INSTANCE = new Help();
// CommandManager.register(INSTANCE, INSTANCE.type);

command("help", /help|h|帮助/i, CommandType.ROOM_AND_PRIVATE)
  .arg(new ArgInfo("name", "搜索的指令名字", true, (arg) => {
    if (arg.isBlank()) return ConvertResult.fail("指令名字不可为空");
    return ConvertResult.success(arg);
  }))
  .onCommand(async (h, c, arg, args) => {
    let name = args[0];
    let handlers = c.message.room() ? CommandManager.group : CommandManager.private;
    for (let handler of handlers) {
      if (handler.regex.test(name)) {
        await c.say(handler.usage);
        return;
      }
    }
    await c.say("未找到对应指令");
  })
  .register()