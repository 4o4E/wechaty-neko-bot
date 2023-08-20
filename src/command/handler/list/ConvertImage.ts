import {CommandHandler, CommandHandlerType} from "../CommandHandler";
import type {Command} from "../../Command";
import * as PUPPET from "wechaty-puppet";
import type {FileBoxInterface} from "file-box";
import {CommandManager} from "../../manager/CommandManager";

class ConvertImage implements CommandHandler {
  name = "convert";
  regex = /convert/i;
  usage = "!convert [回复图片] - 将表情转成图片";
  type = CommandHandlerType.ALL;

  onCommand(command: Command): void {
    command.message.toRecalled().then((m) => {
      if (m === undefined) {
        command.sender.say(this.usage)
        return;
      }
      if (m.type() === PUPPET.types.Message.Emoticon) {
        m.toImage().artwork().then((value: FileBoxInterface) => {
          command.message.say(value)
        })
      }
    })
  }
}

const INSTANCE = new ConvertImage();
CommandManager.register(INSTANCE, INSTANCE.type)