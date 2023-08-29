import {warn} from "@/util/log";
import {PermManager} from "@/permission/PermManager";

import {PermNode} from "@/permission/PermNode";

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
      // todo waitForMatch.push(this.parents)
      PermManager.group[name]?.getAllMatches(perm, matches, waitForMatch, matched);
    }
  }


  getAll(): PermNode[] {
    return this.node.collectAll(new Array<PermNode>());
  }
}