import {PermTree} from "@/permission/PermTree";
import {PermValue} from "@/permission/types";

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

  /**
   * 通过路径收集所有匹配的节点
   *
   * @param split 路径
   * @param matches 匹配的节点
   */
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

  /**
   * 遍历所有有效子节点(节点内有权限值)并收集到result数组中
   *
   * @param result 结果集
   */
  collectAll(result: PermNode[]) {
    if (this.value) result.push(this);
    // 遍历子节点
    for (let key in this.nodes) {
      this.nodes[key].collectAll(result);
    }
    return result;
  }
}