import {ConvertResult} from "@/message/command/handler/builder/ConvertResult";

/**
 * 参数信息
 */
export interface CommandArgValidation<T extends Object> {
  /**
   * 参数名字
   */
  name: string;

  /**
   * 参数是否必须
   */
  require: boolean;

  /**
   * 对输入参数进行检查
   *
   * @param arg 输入的参数
   * @return 若没有问题则输出null, 否则输出错误信息
   */
  checkConvert(arg: string): ConvertResult<T>;
}

export const NonBlankString = (arg: string): ConvertResult<string> => {
  if (arg.isBlank()) return ConvertResult.fail("字符串不可为空");
  return ConvertResult.success(arg);
}