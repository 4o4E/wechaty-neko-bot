import fs from "fs";
import {deserializeToTree, PermissionNode, PermissionTree, serializeFromTree,} from "@/permission/types";
import * as path from "path";
import {mkdirs, safeWrite} from "@/util/path";
import {Savable} from "@/config/Savable";

/**
 * # 存储结构
 *
 * data文件夹下每个文件保存一个权限容器的内容, `default.json` 保存默认权限的内容(代码中定义的权限节点不在 `default.json` 中)
 * - 权限组的文件以id命名, 通配符用-代替
 * - 自定义权限组命名正则 `[^\/*?:"<>]`
 *
 * ```plaintext
 * permission
 * ├─data
 * │  ├─custom_group.json
 * │  ├─gid.uid.json
 * │  └─.uid.json
 * └─default.json
 * ```
 *
 * # 运行结构
 *
 * ## 权限容器/权限树
 *
 * `用户`(`user`), `群聊`(`room`), `权限组`(`group`)都是权限容器, 用户和群只是id特殊的权限容器
 *
 * | 节点类型 | 命名规则  |
 * |---|---|
 * | 用户权限节点 | `.{userId}` |
 * | 群聊权限节点 | `{groupId}.{userId}` |
 * | 权限组权限节点 | 自定义(名字不可带有特殊符号) |
 *
 * 包含
 *
 * - `name`: 当前容器的名字
 * - `parents`: 继承的权限组
 * - `node`: 权限树根节点(Node)
 *
 * 通配符特殊处理
 *
 * - `*.*`: 匹配任何情况, 包括任意私聊和群聊, 在通配符中优先级最低
 * - `{groupId}.*`: 匹配群聊中的任意用户, 在通配符中优先级中等
 * - `*.{userId}`: 匹配任意用户, 包括私聊和群聊, 在通配符中优先级最高
 *
 * ## 权限节点(Node)
 *
 * 包含
 *
 * - `name`: 当前节点的名字
 * - `path`: 节点路径(名字前面的内容)
 * - `value`: 当前节点的值
 * - `weight`: 当前节点权重
 * - `wildcard`: 通配符(`.*`)是特殊的子节点故单独保存
 * - `nodes`: 子节点(Node)
 *
 * ## 权限查询
 *
 * ### 群聊
 *
 * - 获取`userId`和`groupId`以及查询的权限节点名字(比如`command.use.Help`)
 * - 针对通配符查询对应容器(3种通配符)
 * - 查询对应的权限(`{groupId}.{userId}`)
 * - 获取所有匹配的权限树
 * - 递归遍历权限树及其继承的权限树找出所有匹配权限节点名字的
 * - 从所有匹配的选项中找出优先级最高的
 *
 * ### 权限节点匹配
 *
 * - 会匹配父节点的通配符(a.b.c会匹配a.*), 但是最终以距离最近的进行计算
 * - 通配符`.*`仅在权限节点名字的最后时有用, 在其他情况下不会特殊处理
 */
class _PermissionManager extends Savable {
  dirPath = `config${path.sep}permission`;
  dataDir = `${this.dirPath}${path.sep}data`;

  /**
   * 内置的权限注册, 代码注册的权限由此对象管理
   */
  internalPermission = new PermissionTree("_internal", [], -1);
  contactPermission: { [key: string]: PermissionTree } = {}

  saveDefault() {
    mkdirs(this.dataDir);
  }

  load() {
    this.saveDefault();
    fs.readdirSync(this.dataDir).forEach(name => {
      if (!name.endsWith(".json")) return;
      let tree = deserializeToTree(JSON.parse(fs.readFileSync(`${this.dataDir}${path.sep}${name}`).toString('utf8')));
      this.contactPermission[tree.name] = tree;
    });
  }

  save() {
    let written = new Array<string>()
    for (let key in this.contactPermission) {
      let tree = this.contactPermission[key];
      written.unshift(`${tree.name}.json`)
      safeWrite(`${this.dataDir}${path.sep}${tree.name}.json`, JSON.stringify(serializeFromTree(tree)));
    }
    // 删除未被写入的.json文件
    fs.readdirSync(this.dataDir).forEach(file => {
      if (written.includes(file) || file.endsWith(".json")) return;
      fs.unlinkSync(`${this.dataDir}${path.sep}${file}`);
    });
  }

  hasPerm(roomId: string | null, userId: string, permission: string) {
    let matches = ["*.*", `*.${userId}`, `${roomId}.*`, `${roomId}.${userId}`];
  }

  hasPermInGroup(roomId: string, userId: string, perm: string) {
    let allMatches = new Set<PermissionNode>();
    this.internalPermission.getAllMatches(perm, allMatches);
    ["*.*", `*.${userId}`, `${roomId}.*`, `${roomId}.${userId}`].map(name => {
      this.contactPermission[name]?.getAllMatches(perm, allMatches);
    });
    let array = Array.from(allMatches);

    array.sort((a,b) => {
      if (a.root.weight !== b.root.weight) return a.root.weight - b.root.weight;
      return a.weight - b.weight;
    });

  }

  hasPermInPrivate(roomId: string, userId: string, permission: string) {
    let matches = ["*.*", `*.${userId}`, `${roomId}.${userId}`];
  }
}

export const PermissionManager = new _PermissionManager();
