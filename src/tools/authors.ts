// 作者相关 MCP 工具

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { client } from '../api/client.js';
import { buildFieldsParam, DEFAULT_AUTHOR_FIELDS, DEFAULT_PAPER_FIELDS } from '../utils/fields.js';
import { formatAuthorLine, formatPaperLine, textResponse, withErrorHandling } from './shared.js';

export function registerAuthorTools(server: McpServer) {
  // 搜索作者
  server.registerTool(
    'search_authors',
    {
      title: 'Search Authors',
      description: '搜索学术作者',
      inputSchema: {
        query: z.string().describe('作者姓名搜索词'),
        limit: z.number().max(1000).default(10).describe('返回数量，最大 1000'),
        offset: z.number().default(0).describe('分页偏移量'),
      },
    },
    async ({ query, limit, offset }) =>
      withErrorHandling(async () => {
        const result = await client.searchAuthors({
          query,
          fields: buildFieldsParam(DEFAULT_AUTHOR_FIELDS),
          limit,
          offset,
        });

        if (result.data.length === 0) {
          return textResponse(`未找到与 "${query}" 匹配的作者`);
        }

        const text = `找到 ${result.total} 位作者，返回第 ${offset + 1}-${offset + result.data.length} 位：\n\n` +
          result.data.map((author, i) => formatAuthorLine(author, offset + i + 1)).join('\n\n');

        return textResponse(text);
      })
  );

  // 获取作者详情
  server.registerTool(
    'get_author',
    {
      title: 'Get Author Details',
      description: '获取作者详细信息',
      inputSchema: {
        authorId: z.string().describe('Semantic Scholar 作者 ID'),
        fields: z.array(z.string()).optional().describe('返回字段'),
      },
    },
    async ({ authorId, fields }) =>
      withErrorHandling(async () => {
        const author = await client.getAuthor(
          authorId,
          buildFieldsParam(fields || [...DEFAULT_AUTHOR_FIELDS, 'homepage', 'url'], DEFAULT_AUTHOR_FIELDS)
        );

        const affiliations = author.affiliations?.join(', ') || '未知机构';
        const text = [
          `姓名: ${author.name}`,
          `机构: ${affiliations}`,
          `h-index: ${author.hIndex || 0}`,
          `论文数: ${author.paperCount || 0}`,
          `总引用数: ${author.citationCount || 0}`,
          author.homepage ? `主页: ${author.homepage}` : null,
          author.url ? `Semantic Scholar: ${author.url}` : null,
          `\n作者 ID: ${author.authorId}`,
        ].filter(Boolean).join('\n');

        return textResponse(text);
      })
  );

  // 获取作者论文
  server.registerTool(
    'get_author_papers',
    {
      title: 'Get Author Papers',
      description: '获取指定作者的论文列表',
      inputSchema: {
        authorId: z.string().describe('作者 ID'),
        limit: z.number().max(1000).default(20).describe('返回数量，最大 1000'),
        offset: z.number().default(0).describe('分页偏移量'),
      },
    },
    async ({ authorId, limit, offset }) =>
      withErrorHandling(async () => {
        const result = await client.getAuthorPapers(authorId, {
          fields: buildFieldsParam(DEFAULT_PAPER_FIELDS),
          limit,
          offset,
        });

        if (result.data.length === 0) {
          return textResponse('该作者暂无论文记录');
        }

        const text = `该作者的论文（第 ${offset + 1}-${offset + result.data.length} 篇）：\n\n` +
          result.data.map((paper, i) => formatPaperLine(paper, offset + i + 1)).join('\n\n');

        return textResponse(text);
      })
  );
}
