export class ConvertResult<T> {
  /**
   * 检查时出现的异常
   */
  error: string | null;
  /**
   * 转换的结果
   */
  result: T | null;

  static success<T>(result: T) {
    return new ConvertResult(null, result);
  }

  static fail(error: string) {
    return new ConvertResult(error, null);
  }

  private constructor(error: string | null, result: T | null) {
    this.error = error;
    this.result = result;
  }
}