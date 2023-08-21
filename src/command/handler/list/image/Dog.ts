import axios, {AxiosRequestConfig} from "axios";
import {SingleImageApiTemplate} from "../../template/ImageApiTemplate";
import {CommandHandlerType} from "../../CommandHandler";
import {Command} from "../../../Command";
import {CommandManager} from "../../../manager/CommandManager";

class Dog extends SingleImageApiTemplate {
  name = "Dog";
  regex = /dog/i;
  usage = "!dog - 获取一张🐕";
  type = CommandHandlerType.ALL;

  async query(command: Command): Promise<{ url: string; config: AxiosRequestConfig }> {
    let resp = await axios.get("https://shibe.online/api/shibes");
    return {
      url: resp.data[0],
      config: {
        responseType: 'arraybuffer',
        validateStatus: (_) => true
      }
    }
  }

}

const INSTANCE = new Dog();
CommandManager.register(INSTANCE, INSTANCE.type);