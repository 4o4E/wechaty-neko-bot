import axios, {AxiosRequestConfig} from "axios";
import {SingleImageApiTemplate} from "../../template/ImageApiTemplate";
import {CommandHandlerType} from "../../CommandHandler";
import {Command} from "../../../Command";
import {CommandManager} from "../../../manager/CommandManager";

class Fox extends SingleImageApiTemplate {
  name = "Fox";
  regex = /fox/i;
  usage = "!fox - 获取一张🦊";
  type = CommandHandlerType.ALL;

  cache = new Array<string>();

  async query(command: Command): Promise<{ url: string; config: AxiosRequestConfig }> {
    let url = this.cache.pop();
    if (!url) {
      let resp = await axios.get("https://api.fox.pics/v1/get-random-foxes")
      this.cache = resp.data as string[];
      url = this.cache.pop();
    }
    return {
      url: url,
      config: {
        responseType: 'arraybuffer',
        validateStatus: (_) => true
      }
    }
  }

}

const INSTANCE = new Fox();
CommandManager.register(INSTANCE, INSTANCE.type);