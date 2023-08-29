// import {CommandHandler, CommandType} from "@/message/command/handler/CommandHandler";
// import type {Command} from "@/message/command/Command";
// import {CommandManager} from "@/message/command/CommandManager";
// import {enableDebug, switchDebug} from "@/util/log";
//
// class Environment implements CommandHandler {
//   name = "Environment";
//   regex = /env(environment)?/i;
//   usage = "!environment - 检测当前执行指令的环境";
//   type = CommandType.ROOM_AND_PRIVATE;
//   permission = new Array<string>();
//
//   onCommand(command: Command): void {
//     // 群聊
//     let room = command.message.room();
//     if (room !== null) {
//       await command.say(`roomId: \`${room.id}\`\nsenderId: \`${command.message.talker().id}\``);
//       return;
//     }
//     await command.say(`senderId: \`${command.message.talker().id}\``);
//   }
// }
//
// const INSTANCE = new Environment();
// CommandManager.register(INSTANCE, INSTANCE.type);