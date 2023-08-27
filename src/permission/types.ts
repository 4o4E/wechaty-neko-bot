import {PermManager} from "@/permission/PermManager";
import {warn} from "@/util/log";

/**
 * 权限容器, 容器是一棵权限树的序列化版本
 */
export class PermContainer {
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
  values: { [props: string]: { value: PermValue, weight: number | null } };

  constructor(name: string, parents: string[], weight: number | null) {
    this.name = name;
    this.parents = parents;
    this.weight = weight;
  }
}

export enum PermValue {
  TRUE, // 允许
  FALSE, // 拒绝
  ADMIN, // 管理可执行
  NULL // 未定义
}

/**
 * 权限组默认权重
 */
export const DEFAULT_GROUP_WEIGHT = {
  /**
   * 指定群中指定成员的权限(`{roomId}.{userId}`)权重
   */
  MEMBER_IN_ROOM: 1000,
  /**
   * 指定user的权限(`{roomId}.{userId}`)权重
   */
  USER: 1000,
  /**
   * 指定群中所有成员的权限(`{roomId}.*`)权重
   */
  ALL_MEMBER_IN_ROOM: 100,
  /**
   * 指定用户在所有群的权限(`*.{userId}`)权重
   */
  MEMBER_IN_ALL_ROOM: 10,
  /**
   * DEFAULT权限组(`*.*`)权重
   */
  DEFAULT: 1
}

/**
 * 权限节点默认权重
 */
export const DEFAULT_NODE_WEIGHT = {
  /**
   * 默认通配符权限节点(`xxx.*`)权重
   */
  WILDCARD: 1,
  /**
   * 默认通配符权限节点(`xxx.*`)权重
   */
  NORMAL: 10
}

/// 运行结构

/**
 * 权限树, 代表一个权限组
 */
export class PermTree {
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
  node: PermNode;

  constructor(name: string, parents: string[], weight: number) {
    this.name = name;
    this.parents = parents;
    this.weight = weight;
  }

  getOrNull(name: string[]): PermNode | null {
    return this.node.getOrBuild(name, this);
  }

  getOrBuild(name: string[]): PermNode {
    return this.node.getOrBuild(name, this);
  }

  /**
   * 获取所有匹配的节点
   *
   * @param perm 目标权限节点
   * @param matches 存放匹配节点的容器
   * @param waitForMatch 等待遍历的容器的集合
   * @param matched 已遍历的容器的集合
   */
  getAllMatches(
    perm: string,
    matches: Set<PermNode>,
    waitForMatch: PermTree[],
    matched: PermTree[]
  ): void {
    // 若自己已被遍历过, 则打印错误并跳过自己
    if (matched.includes(this)) {
      warn(() => `检查权限${perm}时权限组${this.name}已被遍历过, 跳过`);
      return;
    }
    matched.push(this);
    // 收集匹配的权限节点
    this.node.collect(perm.split("."), matches);
    // 遍历继承的权限组
    for (let name in parent) {
      PermManager.group[name]?.getAllMatches(perm, matches, waitForMatch, matched);
    }
  }
}

/**
 * 权限节点
 */
export class PermNode {
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
  value: PermValue;
  /**
   * 本级权限节点的权重
   */
  weight: number | null;
  /**
   * `本级权限.*` 的引用
   */
  wildcard: PermNode | null;
  /**
   * 父节点引用
   */
  parent!: PermNode;
  /**
   * 根节点引用
   */
  root!: PermTree;
  /**
   * 所有的子节点
   */
  nodes: { [key: string]: PermNode } = {};

  constructor(
    name: string,
    parent: PermNode,
    root: PermTree
  ) {
    this.name = name;
    this.parent = parent;
    this.root = root;
  }

  /**
   * 获取子节点, 不存在时返回null
   *
   * @param name 节点名字
   */
  getOrNull(name: string[]): PermNode | null {
    return this.nodes[name.shift()]?.getOrNull(name);
  }

  /**
   * 获取子节点, 当子节点不存在时创建新的
   *
   * @param name 节点名字
   * @param tree 属于的权限树
   */
  getOrBuild(name: string[], tree: PermTree): PermNode {
    // 最终节点
    if (name.length === 0) {
      return this;
    }

    // 有后续节点
    let first = name.shift();
    let exists = this.nodes[first];
    if (!exists) exists = this.nodes[first] = new PermNode(first, this, tree)
    return exists.getOrBuild(name, tree);
  }

  collect(split: string[], matches: Set<PermNode>) {
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

export function deserializeToTree(data: PermContainer): PermTree {
  let {name, values, weight, parents} = data
  let tree = new PermTree(name, parents, weight);
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

export function serializeFromTree(tree: PermTree): PermContainer {
  let data = new PermContainer(tree.name, tree.parents, tree.weight);
  visitNode(tree.node, (node: PermNode) => {
    data.values[node.path] = {weight: node.weight, value: node.value};
  });
  return data;
}

function visitNode(node: PermNode, callback: (PermissionNode) => void): void {
  if (!node) return;
  callback(node);
  for (let key in node.nodes) visitNode(node.nodes[key], callback);
}