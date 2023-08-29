/**
 * 校验和转换的结果
 */
export class ConvertResult {
  /**
   * 检查时出现的异常
   */
  error: string | null;
  /**
   * 转换的结果
   */
  result: any | null;

  static success(result: any) {
    return new ConvertResult(null, result);
  }

  static fail(error: string) {
    return new ConvertResult(error, null);
  }

  private constructor(error: string | null, result: any) {
    this.error = error;
    this.result = result;
  }
}