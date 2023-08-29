import {ConvertResult} from "@/message/command/handler/builder/ConvertResult";

/**
 * 对指令选项的校验
 */
export interface OptionInfo {
  /**
   * 参数key名字
   */
  name: string;

  /**
   * 参数介绍
   */
  desc: string;

  /**
   * 该option是否必须
   */
  require: boolean;

  /**
   * value是否可选
   */
  optional: boolean;

  /**
   * 是否隐藏此option
   */
  hide: boolean;

  /**
   * 对输入的value进行检查
   *
   * @param value 输入的value
   * @return 若没有问题则输出转换结果, 否则输出错误信息
   */
  checkConvert(value: string): ConvertResult;
}