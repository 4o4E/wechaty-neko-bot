import {CommandHandler, CommandType} from "@/message/command/handler/CommandHandler";
import type {Command} from "@/message/command/Command";
import {CommandManager} from "@/message/command/CommandManager";
import {enableDebug, switchDebug} from "@/util/log";
import {buildCommand} from "@/message/command/handler/builder/BuildCommand";
import {PermValue} from "@/permission/types";

buildCommand("debug", /debug/i, CommandType.ROOM_AND_PRIVATE)
  .perm(PermValue.ADMIN)
  .usage("切换debug")
  .onCommand((_, command) => {
    switchDebug();
    command.say(enableDebug ? "已开启debug" : "已关闭debug");
  }).register()