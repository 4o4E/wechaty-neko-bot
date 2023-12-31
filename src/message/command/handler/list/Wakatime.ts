// import {CommandHandler, CommandType} from "@/message/command/handler/CommandHandler";
// import type {Command} from "@/message/command/Command";
// import {CommandManager} from "@/message/command/CommandManager";
// import axios, {HttpStatusCode} from "axios";
// import {FileBox} from "file-box";
// import {command} from "@/message/command/handler/builder/CommandBuilder";
//
// class Wakatime implements CommandHandler {
//   name = "Wakatime";
//   regex = /wakatime|waka/i;
//   usage = `!waka <wakatimeId> - 查看对应wakatime用户的语言使用统计渲染图片(用户需要使用wakatime才有数据)
// 可选参数:
//   -theme=tokyonight // 指定主题
//   -range=7d // 指定范围, 可选 7d, 30d, 6m, y(1年), a(全部)
//   -t=lang // 可选 lang, editor
// 可用主题: https://github.com/4o4E/github-readme-stats-render/blob/master/http-server-win/src/main/resources/config.yml`;
//   type = CommandType.ROOM_AND_PRIVATE;
//   permission = ["command.use.Wakatime"];
//
//   async onCommand(command: Command): Promise<void> {
//     if (command.args.length != 1) {
//       command.message.say(this.usage);
//       return;
//     }
//     let theme = command.options.get("theme") ?? "tokyonight";
//     let range = command.options.get("range") ?? "7d";
//     let type = command.options.get("t")?.toLocaleLowerCase() ?? 'lang';
//     if (type != 'lang' && type != 'editor') {
//       command.message.say(this.usage);
//       return;
//     }
//     let id = command.args[0]
//     axios.get(
//       `http://127.0.0.1:1179/wakatime/${type}/${id}/${range}?theme=${theme}`,
//       {
//         responseType: 'arraybuffer',
//         validateStatus: (_) => true
//       }
//     ).then(async resp => {
//       if (resp.status != HttpStatusCode.Ok) {
//         await command.say(`无效的wakatime用户: ${id}`);
//         return;
//       }
//       let file = FileBox.fromBuffer(Buffer.from(resp.data), "file.png");
//       await command.say(file);
//     });
//   }
// }
//
// const INSTANCE = new Wakatime();
// CommandManager.register(INSTANCE, INSTANCE.type);
//
// command("waka", /wakatime|waka/i, CommandType.ROOM_AND_PRIVATE)