import fs from "fs";

/**
 * # 存储结构
 *
 * data文件夹下每个文件保存一个权限容器的内容, `default.json` 保存默认权限的内容(代码中定义的权限节点不在 `default.json`
 * 中)
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
 * | 权限组权限节点 | 自定义 |
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
 */
class PermissionManager {
  dirPath = "config/permission";
  defaultPath = `${this.dirPath}/default.json`;
  dataDir = `${this.dirPath}/data`;
  content: PermissionStorage;

  defaultPermission: DefaultPermissionStorage;
  contactPermission: Map<string, PermissionValue>

  saveDefault() {
    fs.mkdirSync(this.dirPath);
    fs.mkdirSync(this.dataDir);
    if (!fs.existsSync(this.defaultPath)) fs.writeFileSync(this.defaultPath, "{}");
  }

  load() {
    this.defaultPermission = JSON.parse(fs.readFileSync(this.defaultPath).toString("utf8"));
    fs.readdirSync(this.dataDir).forEach(name => {
      let container: PermissionContainer = JSON.parse(fs.readFileSync(`${this.dataDir}/${name}`).toString('utf8'));
    })
  }
}

/// 存储结构

export class DefaultPermissionStorage {
  [key: string]: PermissionValue
}

/**
 * 储存的权限格式
 */
export class PermissionStorage {
  /**
   * 保存的默认权限
   */
  default: Map<string, PermissionValue>;
  /**
   * 所有会话的权限
   */
  contact: ContactStorage;
}

export class ContactStorage {
  /**
   * 存储的会话权限, key: 用户id/群id, value: 权限实体
   */
  [props: string]: PermissionContainer
}

/**
 * 权限容器, 容器是一棵权限树的序列化版本
 */
export class PermissionContainer {
  /**
   * 该容器的名字
   */
  name: string
  /**
   * 该容器中的权限节点
   */
  values: PermissionValues;
  /**
   * 该容器继承的权限组
   */
  parents: string[];
}

export class PermissionValues {
  /**
   * 存储的权限, key: 权限节点名字, value: 权限值
   */
  [props: string]: PermissionValue
}

type PermissionValue =
  | "true" // 允许
  | "false" // 拒绝
  | "admin" // 管理可执行
  | null // 未定义

/// 运行结构

/**
 * 运行时, 权限节点将会被拆分成对象, 若该节点是根节点, 则 `name` 代表这棵权限树是归属于哪个
 */
export class PermissionNode {
  /**
   * 本级权限节点的名字
   */
  name: string;
  /**
   * 本级权限节点的值
   */
  value: PermissionValue | null;
  /**
   * 本级权限节点的权重
   */
  weight: number | null;
  /**
   * `本级权限.*` 的值
   */
  wildcard: PermissionValue | null;
  /**
   * 所有的子节点
   */
  nodes = new Map<string, PermissionNode>();

  constructor(
    name: string,
    value: PermissionValue | null = null,
    weight: number | null = null,
    wildcard: PermissionValue | null = null,
    nodes: Map<string, PermissionNode> = new Map<string, PermissionNode>()
  ) {
    this.name = name;
    this.value = value;
    this.weight = weight;
    this.wildcard = wildcard;
    this.nodes = nodes;
  }

  getOrBuild(name: string) {
    let exists = this.nodes.get(name);
    if (exists) return exists;

    let node = new PermissionNode(name);
    this.nodes.set(name, node);
    return node;
  }
}

export function buildPermissionTree(data: PermissionContainer) {

}