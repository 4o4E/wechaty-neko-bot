import {AxiosRequestConfig} from "axios";
import {SingleImageApiTemplate} from "@/message/command/handler/template/ImageApiTemplate";
import {CommandHandlerType} from "@/message/command/handler/CommandHandler";
import {Command} from "@/message/command/Command";
import {CommandManager} from "@/message/command/manager/CommandManager";

class Lazy extends SingleImageApiTemplate {
  name = "Lazy";
  regex = /lazy|moyu|摸鱼/i;
  usage = "!fox - 获取摸鱼日历";
  type = CommandHandlerType.ALL;
  permission = ["command.use.Lazy"];

  async query(command: Command): Promise<{ url: string; config: AxiosRequestConfig }> {
    return {
      url: "https://api.vvhan.com/api/moyu",
      config: {
        responseType: 'arraybuffer',
        validateStatus: (_) => true
      }
    }
  }

}

const INSTANCE = new Lazy();
CommandManager.register(INSTANCE, INSTANCE.type);