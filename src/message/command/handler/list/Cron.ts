import {CommandType} from "@/message/command/handler/CommandHandler";
import type {Command} from "@/message/command/Command";
import {CommandManager} from "@/message/command/CommandManager";
import {ScheduleManager, ScheduleTask, ScheduleTaskType, SendMessageData} from "@/schedule/ScheduleManager";
import {BaseSubCommand} from "@/message/command/handler/template/BaseSubCommand";
import {SubHandler} from "@/message/command/handler/template/SubHandler";
import {buildCommand} from "@/message/command/handler/builder/BuildCommand";
import {PermValue} from "@/permission/types";
import {CommandArgValidation} from "@/message/command/handler/builder/CommandArgValidation";
import {ConvertResult} from "@/message/command/handler/builder/ConvertResult";
import {any} from "@/util/collection";

class Cron extends BaseSubCommand {
  name = "Cron";
  regex = /cron/i;
  type = CommandType.ROOM_AND_PRIVATE;
  permission = ["command.use.Cron"];
  sub: SubHandler[] = [
    new class extends SubHandler {
      name = "add";
      permission = ["command.use.Cron.add"];
      regex = /add/i;
      currentUsage = `!cron add <id> <corn> <消息> - 添加一条定时发送的消息, id不可重复
cron表达式参考 https://github.com/node-schedule/node-schedule`
      usage = this.generateUsage();

      onSubCommand(command: Command, _arg: string, args: string[]) {
        if (args.length != 3) {
          command.say(this.currentUsage);
          return
        }
        let [id, cron, message] = args
        if (!ScheduleManager.checkCron(cron)) {
          command.say(`${cron}不是有效的corn表达式`)
          return;
        }
        let room = command.message.room();
        let talker = command.message.talker();
        let contact = room ? room.id : talker.id;

        let success = ScheduleManager.addTask(new ScheduleTask(
          `${contact}.${id}`,
          cron,
          room ? ScheduleTaskType.SEND_GROUP_MESSAGE : ScheduleTaskType.SEND_PRIVATE_MESSAGE,
          new SendMessageData(contact, message)
        ));
        command.say(success ? "已添加" : "已有同id的定时消息")
      }
    },
    new class extends SubHandler {
      name = "del";
      permission = ["command.use.Cron.del"];
      regex = /del/i;
      currentUsage = "!cron del <id> - 删除一条定时消息"
      usage = this.generateUsage();

      onSubCommand(command: Command, _arg: string, args: string[]) {
        if (args.length != 1) {
          command.say(this.currentUsage);
          return
        }
        let [id] = args;
        let room = command.message.room();
        let talker = command.message.talker();
        let contact = room ? room.id : talker.id;

        let success = ScheduleManager.delTask(`${contact}.${id}`);
        command.say(success ? "已删除" : "未找到此id的定时消息")
      }
    },
    new class extends SubHandler {
      name = "list";
      permission = ["command.use.Cron.list"];
      regex = /list/i;
      currentUsage = "!cron list - 列出所有定时消息"
      usage = this.generateUsage();

      onSubCommand(command: Command, _arg: string, args: string[]) {
        if (args.length != 0) {
          command.say(this.currentUsage);
          return
        }
        let room = command.message.room();
        let talker = command.message.talker();
        let taskInfo = ScheduleManager
          .listTask(room ? room.id : talker.id)
          .map(task => `${task.name.substring(task.name.indexOf(".") + 1)}: ${task.data.content}`)
          .join("\n");
        command.say(taskInfo.isBlank() ? "当前还未定义定时消息" : taskInfo)
      }
    },
  ];
  usage = this.generateUsage();
}

const INSTANCE = new Cron();
CommandManager.register(INSTANCE, INSTANCE.type);

buildCommand("cron", /cron/i, CommandType.ROOM_AND_PRIVATE)
  .perm(PermValue.TRUE)
  // add {group} {perm}
  .sub(buildCommand("add", /add/i)
    .valid([
      new class implements CommandArgValidation<any> {
        name: "权限组名字";
        require: true;
        checkConvert(arg: string): ConvertResult<string> {
          if (arg.isBlank()) return ConvertResult.fail("权限组名字不可为空");
          // 默认权限组
          if (arg === "*.*") return ConvertResult.success(arg);
          let split = arg.split(".");
          if (split.length > 2) return ConvertResult.fail("权限组名字不可包含超过两个'.'");
          if (split[0].isBlank() || split[1].isBlank()) return ConvertResult.fail("权限组名字中.字符不可位于首尾");
          if (!arg.match(/[a-z\\d.*_-]+/i)) return ConvertResult.fail("权限组名字仅可由大小写字母, 阿拉伯数字, .*_-字符组成");
          return ConvertResult.success(arg);
        }
      },
      new class implements CommandArgValidation<any> {
        name: "权限节点名字";
        require: true;
        checkConvert(arg: string): ConvertResult<string> {
          if (arg.isBlank()) return ConvertResult.fail("权限节点名字不可为空");
          let split = arg.split(".");
          if (any(split, s => s.isBlank())) return ConvertResult.fail("权限节点名字中不可有两个连续的.字符");
          split = arg.split("*");
          if (split.length > 2) return ConvertResult.fail("权限节点名字中不可有超过一个*字符存在");
          if (split.length === 2) {
            if (!split[split.length - 1].isBlank()) return ConvertResult.fail("权限节点名字中*字符之后不可有其他内容");
            split[split.length - 2]
          }
          if (!arg.match(/[a-z\\d_.-]+/i)) return ConvertResult.fail("权限节点名字仅可由大小写字母, 阿拉伯数字, _-.字符组成");
          return ConvertResult.success(arg);
        }
      },
    ])
    .onCommand((handler, command, arg, args) => {

    })
    .build()
  )
  .register()