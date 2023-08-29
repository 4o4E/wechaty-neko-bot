import {PermValue} from "@/permission/types";

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