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

/**
 * 默认指定群中所有成员的权限(`xxx.*`)权重
 */
export const DEFAULT_ALL_MEMBER_IN_GROUP_WEIGHT = 100

/**
 * 默认指定用户在所有群的权限(`*.xxx`)权重
 */
export const DEFAULT_MEMBER_IN_ALL_GROUP_WEIGHT = 10

/**
 * 默认`*.*`权重
 */
export const DEFAULT_ALL_GROUP_WILDCARD_WEIGHT = 1

/**
 * 默认权限节点(`xxx.xxx`)权重
 */
export const DEFAULT_NODE_WEIGHT = 10

/**
 * 默认通配符权限节点(`xxx.*`)权重
 */
export const DEFAULT_WILDCARD_WEIGHT = 1

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
  weight: number;
  /**
   * 所有的子节点
   */
  node: PermissionNode;

  constructor(name: string, parents: string[], weight: number) {
    this.name = name;
    this.parents = parents;
    this.weight = weight;
  }

  getOrBuild(name: string[]): PermissionNode {
    return this.node.get(name, this);
  }

  getAllMatches(perm: string, matches: Set<PermissionNode>): void {
    let split = perm.split(".");
    this.node.collect(split, matches);
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
   * 根节点引用
   */
  root!: PermissionTree;
  /**
   * 所有的子节点
   */
  nodes: { [key: string]: PermissionNode } = {};

  constructor(
    name: string,
    parent: PermissionNode,
    root: PermissionTree
  ) {
    this.name = name;
    this.parent = parent;
    this.root = root;
  }

  /**
   * 设置权限节点的信息
   * @param name 节点名字
   * @param tree 属于的权限树
   */
  get(name: string[], tree: PermissionTree): PermissionNode {
    // 最终节点
    if (name.length === 0) {
      return this;
    }

    // 有后续节点
    let first = name.shift();
    return this.getOrBuild(first, tree).get(name, tree);
  }

  /**
   * 获取子节点, 当子节点不存在时创建新的
   *
   * @param name 子节点名字
   * @param tree 属于的权限树
   */
  getOrBuild(name: string, tree: PermissionTree): PermissionNode {
    let exists = this.nodes[name];
    if (exists) return exists;
    return this.nodes[name] = new PermissionNode(name, this, tree);
  }

  collect(split: string[], matches: Set<PermissionNode>) {
    // 到此结束
    if (split.length === 0) {
      if (this.value) matches.add(this);
      return;
    }
    // 父节点通配符
    if (split.length > 1 && this.wildcard !== null) matches.add(this.wildcard);

    // 传递给匹配的子节点
    this.nodes[split.shift()].collect(split, matches);
  }
}

export function deserializeToTree(data: PermissionContainer): PermissionTree {
  let {name, values, weight, parents} = data
  let tree = new PermissionTree(name, parents, weight);
  for (let path in values) {
    let {value, weight} = values[path]
    let node = tree.getOrBuild(path.split("."));
    if (node.name === "*") node.parent.wildcard = node;
    node.path = path;
    node.value = value;
    node.weight = weight;
  }
  return tree;
}

export function serializeFromTree(tree: PermissionTree): PermissionContainer {
  let data = new PermissionContainer(tree.name, tree.parents, tree.weight);
  visitNode(tree.node, (node: PermissionNode) => {
    data.values[node.path] = {weight: node.weight, value: node.value};
  });
  return data;
}

function visitNode(node: PermissionNode, callback: (PermissionNode) => void): void {
  if (!node) return;
  callback(node);
  for (let key in node.nodes) visitNode(node.nodes[key], callback);
}