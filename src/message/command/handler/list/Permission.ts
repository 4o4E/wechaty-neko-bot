import {CommandType} from "@/message/command/handler/CommandHandler";
import {command, subCommand} from "@/message/command/handler/builder/CommandBuilder";
import {ArgInfo} from "@/message/command/handler/builder/ArgInfo";
import {PermValue} from "@/permission/types";
import {ConvertResult} from "@/message/command/handler/builder/ConvertResult";
import {PermManager} from "@/permission/PermManager";

command("perm", /perm|permission/i, CommandType.ROOM_AND_PRIVATE)
  // perm list {group-name}
  .sub(subCommand("list", /list|l/i)
    .perm(PermValue.ADMIN)
    .arg([
      new ArgInfo("group", "权限组名字", true, (arg) => {
        let result = PermManager.checkPermGroupName(arg);
        if (typeof result === "string") return ConvertResult.fail(result);
        return ConvertResult.success(result.name);
      })
    ])
    .onCommand(async (handler, c, arg, args) => {
      let [name] = args;
      let tree = PermManager.group[name];
      if (!tree) {
        await c.say(`没有名为${name}的权限组`);
        return;
      }
      let result = new Array<string>();
      tree.getAll().forEach(node => result.push(
        "\n", node.path, ": ", PermValue[node.value],
        "(", node.weight.toString(), ")"
      ));
      await c.say(result.join("").substring(1));
    })
    .build()
  )