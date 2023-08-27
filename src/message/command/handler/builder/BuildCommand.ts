import {CommandBuilder} from "@/message/command/handler/builder/CommandBuilder";
import {CommandType} from "@/message/command/handler/CommandHandler";
import {PermValue} from "@/permission/types";
import {CommandArgValidation} from "@/message/command/handler/builder/CommandArgValidation";
import {ConvertResult} from "@/message/command/handler/builder/ConvertResult";

export function buildCommand(name: string, regex: RegExp, type?: CommandType) {
  return new CommandBuilder(name, regex, type);
}

buildCommand("example", /example/i, CommandType.ROOM_AND_PRIVATE)
  .perm(PermValue.ADMIN)
  .onCommand((handler, command, arg, args) => handler.trySubCommand(command, args))
  // example action1
  .sub(buildCommand("action1", /action1/i)
    .onCommand((handler, command, arg, args) => {
      command.say("result1");
    })
    .build()
  )
  // example action2
  .sub(buildCommand("action2", /action2/i)
    .onCommand((handler, command, arg, args) => {
      command.say("result2");
    })
    .build()
  )
  // example action a|b|c {number}
  .sub(buildCommand("action", /action/i)
    .valid([
      new class implements CommandArgValidation<any> {
        name: "arg1";
        desc: "a|b|c";
        require: true;

        checkConvert(arg: string): ConvertResult<any> {
          switch (arg) {
            case "a":
            case "b":
            case "c":
              return ConvertResult.success(arg);
            default:
              return ConvertResult.fail(`${arg}不在允许的a|b|c范围中`)
          }
        }
      },
      new class implements CommandArgValidation<any> {
        name: "number";
        desc: "require number";
        require: true;

        checkConvert(arg: string): ConvertResult<any> {
          let result = parseInt(arg);
          if (isNaN(result)) return ConvertResult.fail(`${arg}不是有效数字`)
          return ConvertResult.success(result);
        }
      },
    ])
    .onCommand((handler, command, arg, args) => {
      command.say("result2");
    })
    .build()
  )
  .register()