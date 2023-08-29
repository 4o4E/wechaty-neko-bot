// import axios, {AxiosRequestConfig} from "axios";
// import {SingleImageApiTemplate} from "@/message/command/handler/template/ImageApiTemplate";
// import {CommandType} from "@/message/command/handler/CommandHandler";
// import {Command} from "@/message/command/Command";
// import {CommandManager} from "@/message/command/CommandManager";
//
// class Cat extends SingleImageApiTemplate {
//   name = "Cat";
//   regex = /cat/i;
//   usage = "!cat - 获取一张🐱";
//   type = CommandType.ROOM_AND_PRIVATE;
//   permission = ["command.use.Cat"];
//
//   async query(command: Command): Promise<{ url: string; config: AxiosRequestConfig }> {
//     let resp = await axios.get("https://api.thecatapi.com/v1/images/search");
//     return {
//       url: resp.data[0].url,
//       config: {
//         responseType: 'arraybuffer',
//         validateStatus: (_) => true
//       }
//     }
//   }
//
// }
//
// const INSTANCE = new Cat();
// CommandManager.register(INSTANCE, INSTANCE.type);