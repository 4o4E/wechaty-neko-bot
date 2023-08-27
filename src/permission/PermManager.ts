import fs from "fs";
import {
  DEFAULT_GROUP_WEIGHT,
  deserializeToTree,
  PermNode,
  PermTree, PermValue,
  serializeFromTree,
} from "@/permission/types";
import * as path from "path";
import {mkdirs, safeWrite} from "@/util/path";
import {Savable} from "@/config/Savable";
import {debug} from "@/util/log";

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
 * | 用户权限节点 | `{userId}` |
 * | 群聊权限节点 | `{roomId}.{userId}` |
 * | 权限组权限节点 | 自定义(名字不可带有特殊符号) |
 *
 * [通配符特殊处理](./types.ts)
 */
class _PermManager extends Savable {
  dirPath = `config${path.sep}permission`;
  dataDir = `${this.dirPath}${path.sep}data`;

  /**
   * 内置的权限注册, 代码注册的权限由此对象管理
   */
  internal = new PermTree("_internal", [], -1);
  /**
   * 所有权限组, 包括用户和群用户的
   */
  group: { [key: string]: PermTree } = {}

  saveDefault() {
    mkdirs(this.dataDir);
  }

  load() {
    this.saveDefault();
    fs.readdirSync(this.dataDir).forEach(name => {
      if (!name.endsWith(".json")) return;
      let tree = deserializeToTree(JSON.parse(fs.readFileSync(`${this.dataDir}${path.sep}${name}`).toString('utf8')));
      this.group[tree.name] = tree;
    });
  }

  save() {
    let written = new Array<string>()
    for (let key in this.group) {
      let tree = this.group[key];
      written.unshift(`${tree.name}.json`)
      safeWrite(`${this.dataDir}${path.sep}${tree.name}.json`, JSON.stringify(serializeFromTree(tree)));
    }
    // 删除未被写入的.json文件
    fs.readdirSync(this.dataDir).forEach(file => {
      if (written.includes(file) || file.endsWith(".json")) return;
      fs.unlinkSync(`${this.dataDir}${path.sep}${file}`);
    });
  }

  registerInternalPermission(name: string, value: PermValue) {
    let node = this.internal.getOrBuild(name.split("."));
    if (!node.value) {
      node.value = value;
      return value;
    }
    if (node.value === value) return value;
    throw new Error(`已有注册过的权限节点${node.path}: ${node.value}`);
  }

  hasPerm(roomId: string | null, userId: string, permission: string): PermNode {
    if (roomId) return this.hasPermInGroup(roomId, userId, permission);
    return this.hasPermInPrivate(userId, permission);
  }

  hasPermInGroup(roomId: string, userId: string, perm: string): PermNode | null {
    let allMatches = new Set<PermNode>();
    // 等待遍历
    let waitForMatch = ["*.*", `*.${userId}`, `${roomId}.*`, `${roomId}.${userId}`]
      .map(name => this.group[name])
      .filter(tree => tree != null);
    waitForMatch.push(this.internal);
    // 已遍历的
    let matched = new Array<PermTree>();
    // 遍历所有
    for (const tree of waitForMatch) {
      tree.getAllMatches(perm, allMatches, waitForMatch, matched);
    }

    // 对收集到的权限节点进行排序
    let array = Array.from(allMatches).sort((a, b) => {
      if (a.root.weight !== b.root.weight) return b.root.weight - a.root.weight;
      if (a.weight !== b.weight) return b.weight - a.weight;
      // 路径越长代表距离越短
      return b.path.length - a.path.length;
    });
    // 没有匹配的
    if (array.length === 0) {
      debug(() => `检查'${roomId}.${userId}'的权限${perm}, 未找到匹配的权限节点`);
      return null;
    }
    // 仅有一个匹配的权限
    if (array.length === 1) {
      let node = array[0];
      debug(() => `检查'${roomId}.${userId}'的权限${perm}, 仅有一个节点匹配: ${node.root.name}:${node.path} (weight: ${node.weight}, value: ${node.value})`);
      return node;
    }
    debug(() => {
      let info = array.map(node => `${node.root.name}:${node.path} (weight: ${node.weight}, value: ${node.value})`);
      return `检查'${roomId}.${userId}'的权限${perm}, 匹配的权限节点${allMatches.size}个:\n${info.join("\n")}`;
    });

    let maxPermWeight = array[0].weight
    let maxGroupWeight = array[0].root.weight

    // 存在多个同权限组权重同权限权重的匹配权限节点
    if (array[1].weight === maxPermWeight
      && array[1].root.weight === maxGroupWeight
      && array[0].path.length === array[1].path.length
    ) {
      throw new Error("存在多个同权限组权重同权限权重的匹配权限节点");
    }

    return array[0];
  }

  hasPermInPrivate(userId: string, perm: string): PermNode | null {
    let allMatches = new Set<PermNode>();
    // 等待遍历
    let waitForMatch = ["*.*", `*.${userId}`, `.${userId}`]
      .map(name => this.group[name])
      .filter(tree => tree != null);
    waitForMatch.push(this.internal);
    // 已遍历的
    let matched = new Array<PermTree>();
    // 遍历所有
    for (const tree of waitForMatch) {
      tree.getAllMatches(perm, allMatches, waitForMatch, matched);
    }

    // 对收集到的权限节点进行排序
    let array = Array.from(allMatches).sort((a, b) => {
      if (a.root.weight !== b.root.weight) return b.root.weight - a.root.weight;
      if (a.weight !== b.weight) return b.weight - a.weight;
      // 路径越长代表距离越短
      return b.path.length - a.path.length;
    });
    // 没有匹配的
    if (array.length === 0) {
      debug(() => `检查'${userId}'的权限${perm}, 未找到匹配的权限节点`);
      return null;
    }
    // 仅有一个匹配的权限
    if (array.length === 1) {
      let node = array[0];
      debug(() => `检查'${userId}'的权限${perm}, 仅有一个节点匹配: ${node.root.name}:${node.path} (weight: ${node.weight}, value: ${node.value})`);
      return node;
    }
    debug(() => {
      let info = array.map(node => `${node.root.name}:${node.path} (weight: ${node.weight}, value: ${node.value})`);
      return `检查'${userId}'的权限${perm}, 匹配的权限节点${allMatches.size}个:\n${info.join("\n")}`;
    });

    let maxPermWeight = array[0].weight
    let maxGroupWeight = array[0].root.weight

    // 存在多个同权限组权重同权限权重的匹配权限节点
    if (array[1].weight === maxPermWeight
      && array[1].root.weight === maxGroupWeight
      && array[0].path.length === array[1].path.length
    ) {
      throw new Error("存在多个同权限组权重同权限权重的匹配权限节点");
    }

    return array[0];
  }

  /**
   * 检查权限组名字, 并通过权限组名字推断其权重
   *
   * @param input 权限组名字
   * @return 权重, 若权限组名字不合法则返回null
   */
  checkPermGroupName(input: string): number | null {
    let split = input.split(".");
    // 包含多个.
    if (split.length > 2) return null;
    // 群权限
    if (split.length === 2) {
      let [gid, uid] = split;
      if (gid === "" || uid === "") return null;
      if (gid === "*" && uid === "*") return DEFAULT_GROUP_WEIGHT.DEFAULT;
      if (gid === "*") return DEFAULT_GROUP_WEIGHT.MEMBER_IN_ALL_ROOM;
      if (uid === "*") return DEFAULT_GROUP_WEIGHT.ALL_MEMBER_IN_ROOM;
      return DEFAULT_GROUP_WEIGHT.MEMBER_IN_ROOM;
    }
    // 成员权限
    let [uid] = split;
    if (uid === "") return null;
    return DEFAULT_GROUP_WEIGHT.USER;
  }

  setPerm(id: string, weight: number, perm: string, value: PermValue): PermNode {
    let tree = this.group[id];
    if (!tree) {
      tree = new PermTree(id, [], this.checkPermGroupName(id));
      this.group[id] = tree;
    }
    let node = tree.getOrBuild(perm.split("."));
    node.value = value;
    return node;
  }

  unsetPerm(id: string, perm: string): boolean {
    let tree = this.group[id];
    if (!tree) return false;
    let node = tree.getOrNull(perm.split("."));
    if (!node) return false;
    delete node.parent.nodes[node.name];
  }
}

export const PermManager = new _PermManager();
