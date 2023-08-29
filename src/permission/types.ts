import {PermTree} from "@/permission/PermTree";
import {PermNode} from "@/permission/PermNode";
import {PermContainer} from "@/permission/PermContainer";

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