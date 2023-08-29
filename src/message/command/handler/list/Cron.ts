import {CommandType} from "@/message/command/handler/CommandHandler";
import {ScheduleManager, ScheduleTask, ScheduleTaskType, SendMessageData} from "@/schedule/ScheduleManager";
import {PermValue} from "@/permission/types";
import {ArgInfo} from "@/message/command/handler/builder/ArgInfo";
import {ConvertResult} from "@/message/command/handler/builder/ConvertResult";
import {command, subCommand} from "@/message/command/handler/builder/CommandBuilder";

// class Cron extends BaseSubCommand {
//   name = "Cron";
//   regex = /cron/i;
//   type = CommandType.ROOM_AND_PRIVATE;
//   permission = ["command.use.Cron"];
//   sub: SubHandler[] = [
//     new class extends SubHandler {
//       name = "add";
//       permission = ["command.use.Cron.add"];
//       regex = /add/i;
//       currentUsage = `!cron add <id> <corn> <消息> - 添加一条定时发送的消息, id不可重复
// cron表达式参考 https://github.com/node-schedule/node-schedule`
//       usage = this.generateUsage();
//
//       async onSubCommand(command: Command, _arg: string, args: string[]) {
//         if (args.length != 3) {
//           await command.say(this.currentUsage);
//           return
//         }
//         let [id, cron, message] = args
//         if (!ScheduleManager.checkCron(cron)) {
//           await command.say(`${cron}不是有效的corn表达式`)
//           return;
//         }
//         let room = command.message.room();
//         let talker = command.message.talker();
//         let contact = room ? room.id : talker.id;
//
//         let success = ScheduleManager.addTask(new ScheduleTask(
//           `${contact}.${id}`,
//           cron,
//           room ? ScheduleTaskType.SEND_GROUP_MESSAGE : ScheduleTaskType.SEND_PRIVATE_MESSAGE,
//           new SendMessageData(contact, message)
//         ));
//         await command.say(success ? "已添加" : "已有同id的定时消息")
//       }
//     },
//     new class extends SubHandler {
//       name = "del";
//       permission = ["command.use.Cron.del"];
//       regex = /del/i;
//       currentUsage = "!cron del <id> - 删除一条定时消息"
//       usage = this.generateUsage();
//
//       async onSubCommand(command: Command, _arg: string, args: string[]) {
//         if (args.length != 1) {
//           await command.say(this.currentUsage);
//           return
//         }
//         let [id] = args;
//         let room = command.message.room();
//         let talker = command.message.talker();
//         let contact = room ? room.id : talker.id;
//
//         let success = ScheduleManager.delTask(`${contact}.${id}`);
//         await command.say(success ? "已删除" : "未找到此id的定时消息")
//       }
//     },
//     new class extends SubHandler {
//       name = "list";
//       permission = ["command.use.Cron.list"];
//       regex = /list/i;
//       currentUsage = "!cron list - 列出所有定时消息"
//       usage = this.generateUsage();
//
//       async onSubCommand(command: Command, _arg: string, args: string[]) {
//         if (args.length != 0) {
//           await command.say(this.currentUsage);
//           return
//         }
//         let room = command.message.room();
//         let talker = command.message.talker();
//         let taskInfo = ScheduleManager
//           .listTask(room ? room.id : talker.id)
//           .map(task => `${task.name.substring(task.name.indexOf(".") + 1)}: ${task.data.content}`)
//           .join("\n");
//         await command.say(taskInfo.isBlank() ? "当前还未定义定时消息" : taskInfo)
//       }
//     },
//   ];
//   usage = this.generateUsage();
// }
//
// const INSTANCE = new Cron();
// CommandManager.register(INSTANCE, INSTANCE.type);

command("cron", /cron/i, CommandType.ROOM_AND_PRIVATE)
  .perm(PermValue.TRUE)
  // add {name} {cron} {message}
  .sub(subCommand("add", /add|a/i)
    .valid([
      new ArgInfo("name", "定时任务名字", true, (arg: string): ConvertResult => {
        if (arg.isBlank()) return ConvertResult.fail("定时任务名字不可为空");
        return ConvertResult.success(arg);
      }),
      new ArgInfo("cron", "cron表达式", true, (arg: string): ConvertResult => {
        if (!ScheduleManager.checkCron(arg)) return ConvertResult.fail("无效cron表达式");
        return ConvertResult.success(arg);
      }),
      new ArgInfo("msg", "定时发送的消息", true, (arg: string): ConvertResult => {
        if (arg.isBlank()) return ConvertResult.fail("定时发送的消息不可为空");
        return ConvertResult.success(arg);
      })
    ])
    .onCommand(async (handler, command, _arg, args) => {
      let processedArgs = handler.processArgs(args);
      if (typeof processedArgs === "string") {
        await command.say(processedArgs);
        return;
      }
      let [name, cron, message] = processedArgs;
      let room = command.message.room();
      let talker = command.message.talker();
      let contact = room ? room.id : talker.id;

      let success = ScheduleManager.addTask(new ScheduleTask(
        `${contact}.${name}`,
        cron,
        room ? ScheduleTaskType.SEND_GROUP_MESSAGE : ScheduleTaskType.SEND_PRIVATE_MESSAGE,
        new SendMessageData(contact, message)
      ));
      await command.say(success ? "已添加" : "已有同id的定时消息");
    })
    .build()
  )
  // del {name}
  .sub(subCommand("del", /del|d/i)
    .valid([
      new ArgInfo("name", "定时任务名字", true, (arg: string): ConvertResult => {
        if (arg.isBlank()) return ConvertResult.fail("定时任务名字不可为空");
        return ConvertResult.success(arg);
      })
    ])
    .onCommand(async (handler, command, _arg, args) => {
      let processedArgs = handler.processArgs(args);
      if (typeof processedArgs === "string") {
        await command.say(processedArgs);
        return;
      }
      let [name] = processedArgs;
      let room = command.message.room();
      let talker = command.message.talker();
      let contact = room ? room.id : talker.id;

      let success = ScheduleManager.delTask(`${contact}.${name}`);
      await command.say(success ? "已删除" : "没有指定id的定时消息");
    })
    .build()
  )
  // list
  .sub(subCommand("list", /list/i)
    .valid([])
    .onCommand(async (handler, command, _arg, args) => {
      let processedArgs = handler.processArgs(args);
      if (typeof processedArgs === "string") {
        await command.say(processedArgs);
        return;
      }
      let room = command.message.room();
      let talker = command.message.talker();
      let taskInfo = ScheduleManager
        .listTask(room ? room.id : talker.id)
        .map(task => `${task.name.substring(task.name.indexOf(".") + 1)}: ${task.data.content}`)
        .join("\n");
      await command.say(taskInfo.isBlank() ? "当前还未定义定时消息" : taskInfo)
    })
    .build()
  )
  .register()