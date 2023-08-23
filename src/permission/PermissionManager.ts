import {BaseConfig} from "@/config/BaseConfig";

/**
 * # 权限管理器
 *
 * 权限对象
 *
 * - 群成员, id是 `roomId.talkerId`, `roomId.*` 匹配对应群的所有群成员, `*.*` 匹配所有群的所有群成员
 * - 用户(私聊), `talkerId` 是权限节点, `*` 匹配所有群成员
 *
 * ## 默认权限优先级
 *
 * | 权限节点类型 | 默认权重 |
 * | --- | --- |
 * | `*`| 100 |
 * | `xxx.*` | 10 |
 * | `xxx.xxx` | 1 |
 * | 默认权限 | 0 |
 *
 * 数值越大优先级越高
 *
 * ## 检查权限
 *
 * - 获取 `权限节点名字` 和 `权限对象id`
 * - 通过 `权限对象id` 获取对应的权限容器
 * - 检索所有匹配的权限节点, 在其中选择优先级最高的, 距离节点最近的, 示例: (
 *   假设检索 `test.perm.A`, 结果中包含`test.*`, `test.perm.*`, `test.perm.A`,
 *   在其中筛选优先级最高的有 `test.*`, `test.perm.*`, 忽略权重较低的 `test.perm.A`
 *   在 `test.*`, `test.perm.*` 中选择距离节点最近的 `test.perm.*`作为结果,
 *   若其中有自定义权重并且权重更高的节点, 则使用权重高的
 *   )
 */
class PermissionManager extends BaseConfig<PermissionStorage> {
  filePath = "config/permission.json";
  content: PermissionStorage;

  permission;

  afterLoad() {

  }
}

/**
 * 会话(用户/群)的权限
 * 在群里设置权限时
 */
class ContactPermissionStorage {
  /**
   * 定义的默认权限
   */
  default: PermissionEntity[];
  /**
   * 定义的权限
   */
  defined: PermissionEntity[];
}

/**
 * 储存的权限格式
 */
class PermissionStorage {
  /**
   * 存储的会话权限
   */
  [props: string]: ContactPermissionStorage
}

class PermissionEntity {
  /**
   * 权限节点
   */
  node: string;
  /**
   * 默认值
   */
  default: PermissionLevel;
  /**
   * 当前设置的值
   */
  current: PermissionLevel;
}

type PermissionLevel =
  | true // 允许
  | false // 拒绝
  | "admin" // 管理有
  | null // 未定义