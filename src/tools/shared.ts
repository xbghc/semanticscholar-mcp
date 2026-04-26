import type { Author, Paper } from '../api/types.js';
import { formatToolError } from '../utils/errors.js';

type ToolContent = { type: 'text'; text: string };
export type ToolResponse = { content: ToolContent[]; isError?: boolean };

export function textResponse(text: string): ToolResponse {
  return { content: [{ type: 'text', text }] };
}

export function errorResponse(error: unknown): ToolResponse {
  return {
    content: [{ type: 'text', text: formatToolError(error) }],
    isError: true,
  };
}

export async function withErrorHandling(handler: () => Promise<ToolResponse>): Promise<ToolResponse> {
  try {
    return await handler();
  } catch (error) {
    return errorResponse(error);
  }
}

export function formatPaperLine(paper: Paper, index: number, includePdf = false): string {
  const authors = paper.authors?.map(a => a.name).join(', ') || '未知作者';
  const pdf = includePdf && paper.openAccessPdf?.url ? `\n   PDF: ${paper.openAccessPdf.url}` : '';

  return `${index}. ${paper.title}\n   作者: ${authors}\n   年份: ${paper.year || '未知'} | 引用: ${paper.citationCount || 0}${pdf}\n   ID: ${paper.paperId}`;
}

export function formatAuthorLine(author: Author, index: number): string {
  const affiliations = author.affiliations?.join(', ') || '未知机构';

  return `${index}. ${author.name}\n   机构: ${affiliations}\n   h-index: ${author.hIndex || 0} | 论文数: ${author.paperCount || 0} | 引用数: ${author.citationCount || 0}\n   ID: ${author.authorId}`;
}
