import {CommandHandler, CommandType} from "@/message/command/handler/CommandHandler";
import type {Command} from "@/message/command/Command";
import {CommandManager} from "@/message/command/CommandManager";
import {enableDebug, switchDebug} from "@/util/log";
import {BaseSubCommand} from "@/message/command/handler/template/BaseSubCommand";
import {SubHandler} from "@/message/command/handler/template/SubHandler";

class Permission extends BaseSubCommand {
  override sub: SubHandler[] = (() => {
    let arr = [
      new class extends SubHandler {
        name: string;
        permission: Array<string>;
        regex: RegExp;
        usage: string;

        onSubCommand(command: Command, arg: string, args: string[]) {
        }
      }
    ];
    for (let handler of arr) {
      handler.parent = this;
    }
    return arr
  })();
  name = "Permission";
  regex = /perm(permission)?/i;
  type = CommandType.ROOM_AND_PRIVATE;
  usage = this.generateUsage();
  permission = [];
}

const INSTANCE = new Permission();
CommandManager.register(INSTANCE, INSTANCE.type);