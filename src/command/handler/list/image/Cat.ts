import axios, {AxiosRequestConfig} from "axios";
import {SingleImageApiTemplate} from "../../template/ImageApiTemplate";
import {CommandHandlerType} from "../../CommandHandler";
import {Command} from "../../../Command";
import {CommandManager} from "../../../manager/CommandManager";

class Cat extends SingleImageApiTemplate {
  name = "Cat";
  regex = /cat/i;
  usage = "!cat - 获取一张🐱";
  type = CommandHandlerType.ALL;

  async query(command: Command): Promise<{ url: string; config: AxiosRequestConfig }> {
    let resp = await axios.get("https://api.thecatapi.com/v1/images/search");
    return {
      url: resp.data[0].url,
      config: {
        responseType: 'arraybuffer',
        validateStatus: (_) => true
      }
    }
  }

}

const INSTANCE = new Cat();
CommandManager.register(INSTANCE, INSTANCE.type);