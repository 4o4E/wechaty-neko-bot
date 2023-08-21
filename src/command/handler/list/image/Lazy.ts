import {AxiosRequestConfig} from "axios";
import {SingleImageApiTemplate} from "../../template/ImageApiTemplate";
import {CommandHandlerType} from "../../CommandHandler";
import {Command} from "../../../Command";
import {CommandManager} from "../../../manager/CommandManager";

class Lazy extends SingleImageApiTemplate {
  name = "Lazy";
  regex = /lazy|moyu|摸鱼/i;
  usage = "!fox - 获取摸鱼日历";
  type = CommandHandlerType.ALL;

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