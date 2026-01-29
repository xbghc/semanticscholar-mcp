// 推荐相关 MCP 工具

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { client } from '../api/client.js';
import { buildFieldsParam, DEFAULT_PAPER_FIELDS } from '../utils/fields.js';
import { formatToolError } from '../utils/errors.js';

export function registerRecommendationTools(server: McpServer) {
  // 获取推荐论文
  server.registerTool(
    'get_recommendations',
    {
      title: 'Get Paper Recommendations',
      description: '基于指定论文获取推荐的相关论文',
      inputSchema: {
        positivePaperIds: z.array(z.string()).describe('正向参考论文 ID 列表（想要找类似的论文）'),
        negativePaperIds: z.array(z.string()).optional().describe('负向参考论文 ID 列表（想要避免类似的论文）'),
        limit: z.number().max(500).default(10).describe('推荐数量，最大 500'),
      },
    },
    async ({ positivePaperIds, negativePaperIds, limit }) => {
      try {
        const result = await client.getRecommendations({
          positivePaperIds,
          negativePaperIds,
          fields: buildFieldsParam(DEFAULT_PAPER_FIELDS),
          limit,
        });

        if (result.recommendedPapers.length === 0) {
          return {
            content: [{ type: 'text', text: '未找到推荐论文，请尝试使用其他参考论文' }],
          };
        }

        const text = `基于 ${positivePaperIds.length} 篇参考论文，推荐 ${result.recommendedPapers.length} 篇相关论文：\n\n` +
          result.recommendedPapers.map((paper, i) => {
            const authors = paper.authors?.map(a => a.name).join(', ') || '未知作者';
            const pdf = paper.openAccessPdf?.url ? `\n   PDF: ${paper.openAccessPdf.url}` : '';
            return `${i + 1}. ${paper.title}\n   作者: ${authors}\n   年份: ${paper.year || '未知'} | 引用: ${paper.citationCount || 0}${pdf}\n   ID: ${paper.paperId}`;
          }).join('\n\n');

        return {
          content: [{ type: 'text', text }],
        };
      } catch (error) {
        return {
          content: [{ type: 'text', text: formatToolError(error) }],
          isError: true,
        };
      }
    }
  );
}
