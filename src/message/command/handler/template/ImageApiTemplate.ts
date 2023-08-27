import {CommandHandler, CommandType} from "@/message/command/handler/CommandHandler";
import type {Command} from "@/message/command/Command";
import axios, {AxiosRequestConfig, HttpStatusCode} from "axios";
import {FileBox} from "file-box";

/**
 * 通过api获取单个图片并发送的指令模板
 */
export abstract class SingleImageApiTemplate implements CommandHandler {
  abstract name: string;
  abstract regex: RegExp;
  abstract usage: string;
  abstract type: CommandType;
  abstract permission: string[];

  /**
   * 构造请求
   *
   * @param command 指令
   */
  abstract query(command: Command): Promise<{ url: string, config: AxiosRequestConfig } | null>

  onCommand(command: Command): void {
    this.query(command).then(query => {
      if (!query) {
        command.say(this.usage);
        return null;
      }
      let {url, config} = query;
      return axios.get(url, config);
    })?.then(resp => {
      if (resp.status != HttpStatusCode.Ok) {
        command.say("处理失败");
        return;
      }
      let url = resp.request.res.responseUrl as string;
      let name = url.substring(url.lastIndexOf("/") + 1);
      if (name.indexOf(".") === -1) name = `${name}.png`;
      let file = FileBox.fromBuffer(
        Buffer.from(resp.data),
        name
      );
      command.say(file).catch(err => {
        command.say(`发送失败: ${resp.config.url}`);
        console.error(err);
      });
    })
  }
}