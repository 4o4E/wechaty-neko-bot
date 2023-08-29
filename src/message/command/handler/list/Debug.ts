import {CommandType} from "@/message/command/handler/CommandHandler";
import {enableDebug, switchDebug} from "@/util/log";
import {PermValue} from "@/permission/types";
import {command} from "@/message/command/handler/builder/CommandBuilder";

command("debug", /debug/i, CommandType.ROOM_AND_PRIVATE)
  .perm(PermValue.ADMIN)
  .usage("切换debug")
  .onCommand((_, command) => {
    switchDebug();
    command.say(enableDebug ? "已开启debug" : "已关闭debug");
  }).register();