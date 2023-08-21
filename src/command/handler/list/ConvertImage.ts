import {CommandHandler, CommandHandlerType} from "../CommandHandler";
import type {Command} from "../../Command";
import * as PUPPET from "wechaty-puppet";
import {FileBox} from "file-box";
import {CommandManager} from "../../manager/CommandManager";
import {MessageManager} from "../../../MessageManager";
import {Message} from "wechaty";
import axios, {HttpStatusCode} from "axios";

class ConvertImage implements CommandHandler {
  name = "convert";
  regex = /convert/i;
  usage = "!convert - 将表情转成图片";
  type = CommandHandlerType.ALL;

  onCommand(command: Command): void {
    command.say("请在3分钟内发送表情");
    MessageManager.addCallback({
      sign: command.message.room() ? `${command.message.room()!.id}.${command.sender.id}` : command.sender.id,
      time: new Date().getTime(),
      callback: (message: Message): boolean => {
        if (message.type() === PUPPET.types.Message.Emoticon) {
          let text: string = message.payload.text;
          let url = text.split('cdnurl = "')[1]
            .split('"')[0]
            .replace(/&amp;amp;/g, "&");
          axios.get(url, {
            responseType: 'arraybuffer',
            validateStatus: (_) => true
          }).then(resp => {
            if (resp.status != HttpStatusCode.Ok) {
              command.say(`获取失败: ${url}`);
              return;
            }
            let file = FileBox.fromBuffer(Buffer.from(resp.data), "file.png");
            command.say(file).catch(err => {
              command.say(`发送失败: ${url}`);
              console.error(err);
            });
          });
          return true;
        }
        return false;
      }
    }, command.message.room() != undefined);
  }
}

const INSTANCE = new ConvertImage();
CommandManager.register(INSTANCE, INSTANCE.type);