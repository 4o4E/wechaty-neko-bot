import axios, {AxiosRequestConfig} from "axios";
import {SingleImageApiTemplate} from "../../template/ImageApiTemplate";
import {CommandHandlerType} from "../../CommandHandler";
import {Command} from "../../../Command";
import {CommandManager} from "../../../manager/CommandManager";

class Bird extends SingleImageApiTemplate {
  name = "Bird";
  regex = /bird/i;
  usage = "!bird - 获取一张🕊";
  type = CommandHandlerType.ALL;

  async query(command: Command): Promise<{ url: string; config: AxiosRequestConfig }> {
    let resp = await axios.get("https://v2.yiff.rest/animals/birb?notes=disabled", {
      headers: {
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36"
      }
    });
    return {
      url: resp.data.images[0].url,
      config: {
        responseType: 'arraybuffer',
        validateStatus: (_) => true,
        headers: {
          "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36"
        }
      }
    }
  }

}

const INSTANCE = new Bird();
CommandManager.register(INSTANCE, INSTANCE.type);