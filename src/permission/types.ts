/**
 * 权限容器, 容器是一棵权限树的序列化版本
 */
export class PermissionContainer {
  /**
   * 该容器的名字
   */
  name: string
  /**
   * 该容器继承的权限组
   */
  parents: string[];
  /**
   * 该容器的权重
   */
  weight: number | null;
  /**
   * 该容器中的权限节点
   */
  values: { [props: string]: { value: PermissionValue, weight: number | null } };

  constructor(name: string, parents: string[], weight: number | null) {
    this.name = name;
    this.parents = parents;
    this.weight = weight;
  }
}

export type PermissionValue =
  | "true" // 允许
  | "false" // 拒绝
  | "admin" // 管理可执行
  | null // 未定义

/// 运行结构

/**
 * 权限树, 代表一个权限组
 */
export class PermissionTree {
  /**
   * 权限树(组)的名字
   */
  name: string;
  /**
   * 继承的权限组
   */
  parents: string[];
  /**
   * 权限组的权重
   */
  weight: number | null;
  /**
   * 所有的子节点
   */
  root: PermissionNode;

  constructor(name: string, parents: string[], weight: number | null) {
    this.name = name;
    this.parents = parents;
    this.weight = weight;
  }
}

/**
 * 权限节点
 */
export class PermissionNode {
  /**
   * 本级权限节点的名字
   */
  name!: string;
  /**
   * 绝对路径
   */
  path: string;
  /**
   * 本级权限节点的值
   */
  value: PermissionValue;
  /**
   * 本级权限节点的权重
   */
  weight: number | null;
  /**
   * `本级权限.*` 的引用
   */
  wildcard: PermissionNode | null;
  /**
   * 父节点引用
   */
  parent!: PermissionNode;
  /**
   * 所有的子节点
   */
  nodes: { [key: string]: PermissionNode } = {};

  constructor(
    name: string,
    parent: PermissionNode
  ) {
    this.name = name;
    this.parent = parent;
  }

  /**
   * 设置权限节点的信息
   * @param name 节点名字
   */
  get(name: string[]): PermissionNode {
    // 最终节点
    if (name.length === 0) {
      return this;
    }

    // 有后续节点
    let first = name.shift();
    return this.getOrBuild(first).get(name);
  }

  /**
   * 获取子节点, 当子节点不存在时创建新的
   *
   * @param name 子节点名字
   */
  getOrBuild(name: string): PermissionNode {
    let exists = this.nodes[name];
    if (exists) return exists;
    return this.nodes[name] = new PermissionNode(name, this);
  }
}

export function deserializeToTree(data: PermissionContainer): PermissionTree {
  let {name, values, weight, parents} = data
  let tree = new PermissionTree(name, parents, weight);
  for (let path in values) {
    let {value, weight} = values[path]
    let node = tree.root.get(path.split("."));
    if (node.name === "*") node.parent.wildcard = node;
    node.path = path;
    node.value = value;
    node.weight = weight;
  }
  return tree;
}

export function serializeFromTree(tree: PermissionTree): PermissionContainer {
  let data = new PermissionContainer(tree.name, tree.parents, tree.weight);
  visitNode(tree.root, (node: PermissionNode) => {
    data.values[node.path] = {weight: node.weight, value: node.value};
  });
  return data;
}

function visitNode(node: PermissionNode, callback: (PermissionNode) => void): void {
  if (!node) return;
  callback(node);
  for (let key in node.nodes) visitNode(node.nodes[key], callback);
}