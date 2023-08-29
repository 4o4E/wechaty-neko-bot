// import axios, {AxiosRequestConfig} from "axios";
// import {SingleImageApiTemplate} from "@/message/command/handler/template/ImageApiTemplate";
// import {CommandType} from "@/message/command/handler/CommandHandler";
// import {Command} from "@/message/command/Command";
// import {CommandManager} from "@/message/command/CommandManager";
//
// class Dog extends SingleImageApiTemplate {
//   name = "Dog";
//   regex = /dog/i;
//   usage = "!dog - 获取一张🐕";
//   type = CommandType.ROOM_AND_PRIVATE;
//   permission = ["command.use.Dog"];
//
//   async query(command: Command): Promise<{ url: string; config: AxiosRequestConfig }> {
//     let resp = await axios.get("https://shibe.online/api/shibes");
//     return {
//       url: resp.data[0],
//       config: {
//         responseType: 'arraybuffer',
//         validateStatus: (_) => true
//       }
//     }
//   }
//
// }
//
// const INSTANCE = new Dog();
// CommandManager.register(INSTANCE, INSTANCE.type);