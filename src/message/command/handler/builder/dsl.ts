import {command, CommandBuilder, subCommand} from "@/message/command/handler/builder/CommandBuilder";
import {CommandType} from "@/message/command/handler/CommandHandler";
import {PermValue} from "@/permission/types";
import {ArgInfo} from "@/message/command/handler/builder/ArgInfo";
import {ConvertResult} from "@/message/command/handler/builder/ConvertResult";


command("example", /example/i, CommandType.ROOM_AND_PRIVATE)
  .perm(PermValue.ADMIN)
  // example action1
  .sub(subCommand("action1", /action1/i)
    .onCommand(async (_handler, command) => {
      await command.say("result1");
    })
    .build()
  )
  // example action2
  .sub(subCommand("action2", /action2/i)
    .onCommand(async (_handler, command) => {
      await command.say("result2");
    })
    .build()
  )
  // example action a|b|c {number}
  .sub(subCommand("action", /action/i)
    .valid([
      new ArgInfo(
        "arg1",
        "a|b|c",
        true,
        (arg) => {
        switch (arg) {
          case "a":
          case "b":
          case "c":
            return ConvertResult.success(arg);
          default:
            return ConvertResult.fail(`${arg}不在允许的a|b|c范围中`)
        }
      }
      ),
      new ArgInfo(
        "number",
        "require number",
        true,
        (arg) => {
        let result = parseInt(arg);
        if (isNaN(result)) return ConvertResult.fail(`${arg}不是有效数字`)
        return ConvertResult.success(result);
      }
      ),
    ])
    .onCommand(async (handler, command, _arg, args) => {
      // 检查args
      let processedArgs = handler.processArgs(args);
      if (typeof processedArgs === "string") {
        await command.say(processedArgs);
        return;
      }
      let [action, number] = processedArgs;
      await command.say(`${action}: ${number}`);
    })
    .build()
  )
  .register()