// 错误处理工具

export class SemanticScholarError extends Error {
  constructor(
    public statusCode: number,
    public response: string
  ) {
    super(`Semantic Scholar API Error (${statusCode}): ${response}`);
    this.name = 'SemanticScholarError';
  }
}

export function formatToolError(error: unknown): string {
  if (error instanceof SemanticScholarError) {
    switch (error.statusCode) {
      case 400:
        return '请求参数错误，请检查输入';
      case 404:
        return '未找到指定的论文或作者';
      case 429:
        return 'API 请求过于频繁，请稍后重试';
      case 500:
        return 'Semantic Scholar 服务器错误，请稍后重试';
      default:
        return `API 错误: ${error.message}`;
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}
