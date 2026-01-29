// 论文相关 MCP 工具

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { client } from '../api/client.js';
import { buildFieldsParam, DEFAULT_PAPER_FIELDS, DEFAULT_CITATION_FIELDS } from '../utils/fields.js';
import { formatToolError } from '../utils/errors.js';

export function registerPaperTools(server: McpServer) {
  // 搜索论文
  server.registerTool(
    'search_papers',
    {
      title: 'Search Papers',
      description: '搜索学术论文，支持关键词搜索和过滤条件',
      inputSchema: {
        query: z.string().describe('搜索关键词'),
        year: z.string().optional().describe('年份范围，如 "2020-2024" 或 "2023"'),
        fieldsOfStudy: z.array(z.string()).optional().describe('学科领域，如 ["Computer Science", "Medicine"]'),
        minCitationCount: z.number().optional().describe('最小引用数'),
        openAccessPdf: z.boolean().optional().describe('仅返回有开放获取 PDF 的论文'),
        limit: z.number().max(100).default(10).describe('返回结果数量，最大 100'),
        offset: z.number().default(0).describe('分页偏移量'),
      },
    },
    async ({ query, year, fieldsOfStudy, minCitationCount, openAccessPdf, limit, offset }) => {
      try {
        const result = await client.searchPapers({
          query,
          fields: buildFieldsParam(DEFAULT_PAPER_FIELDS),
          year,
          fieldsOfStudy,
          minCitationCount,
          openAccessPdf,
          limit,
          offset,
        });

        const text = `找到 ${result.total} 篇论文，返回第 ${offset + 1}-${offset + result.data.length} 篇：\n\n` +
          result.data.map((paper, i) => {
            const authors = paper.authors?.map(a => a.name).join(', ') || '未知作者';
            const pdf = paper.openAccessPdf?.url ? `\n   PDF: ${paper.openAccessPdf.url}` : '';
            return `${offset + i + 1}. ${paper.title}\n   作者: ${authors}\n   年份: ${paper.year || '未知'} | 引用: ${paper.citationCount || 0}${pdf}\n   ID: ${paper.paperId}`;
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

  // 获取论文详情
  server.registerTool(
    'get_paper',
    {
      title: 'Get Paper Details',
      description: '获取论文详细信息，支持多种 ID 格式（Semantic Scholar ID、DOI、ArXiv ID、PMID 等）',
      inputSchema: {
        paperId: z.string().describe('论文 ID，支持格式：Semantic Scholar ID、DOI:xxx、ARXIV:xxx、PMID:xxx、CorpusId:xxx'),
        fields: z.array(z.string()).optional().describe('返回字段，如 ["title", "abstract", "authors", "year"]'),
      },
    },
    async ({ paperId, fields }) => {
      try {
        const paper = await client.getPaper(
          paperId,
          buildFieldsParam(fields || [...DEFAULT_PAPER_FIELDS, 'abstract', 'venue', 'referenceCount'])
        );

        const authors = paper.authors?.map(a => a.name).join(', ') || '未知作者';
        const text = [
          `标题: ${paper.title}`,
          `作者: ${authors}`,
          `年份: ${paper.year || '未知'}`,
          paper.venue ? `发表于: ${paper.venue}` : null,
          `引用数: ${paper.citationCount || 0}`,
          `参考文献数: ${paper.referenceCount || 0}`,
          paper.isOpenAccess ? `开放获取: 是` : null,
          paper.openAccessPdf?.url ? `PDF: ${paper.openAccessPdf.url}` : null,
          `\n摘要:\n${paper.abstract || '无摘要'}`,
          `\nSemantic Scholar ID: ${paper.paperId}`,
          paper.externalIds?.DOI ? `DOI: ${paper.externalIds.DOI}` : null,
          paper.externalIds?.ArXiv ? `ArXiv: ${paper.externalIds.ArXiv}` : null,
        ].filter(Boolean).join('\n');

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

  // 获取引用该论文的文献
  server.registerTool(
    'get_paper_citations',
    {
      title: 'Get Paper Citations',
      description: '获取引用指定论文的文献列表（谁引用了这篇论文）',
      inputSchema: {
        paperId: z.string().describe('论文 ID'),
        limit: z.number().max(1000).default(20).describe('返回数量，最大 1000'),
        offset: z.number().default(0).describe('分页偏移量'),
      },
    },
    async ({ paperId, limit, offset }) => {
      try {
        const result = await client.getPaperCitations(paperId, {
          fields: `citingPaper.${DEFAULT_CITATION_FIELDS.join(',citingPaper.')}`,
          limit,
          offset,
        });

        if (result.data.length === 0) {
          return {
            content: [{ type: 'text', text: '该论文暂无引用记录' }],
          };
        }

        const text = `引用该论文的文献（第 ${offset + 1}-${offset + result.data.length} 篇）：\n\n` +
          result.data.map((citation, i) => {
            const paper = citation.citingPaper;
            const authors = paper.authors?.map(a => a.name).join(', ') || '未知作者';
            return `${offset + i + 1}. ${paper.title}\n   作者: ${authors}\n   年份: ${paper.year || '未知'} | 引用: ${paper.citationCount || 0}\n   ID: ${paper.paperId}`;
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

  // 获取论文参考文献
  server.registerTool(
    'get_paper_references',
    {
      title: 'Get Paper References',
      description: '获取论文的参考文献列表（这篇论文引用了什么）',
      inputSchema: {
        paperId: z.string().describe('论文 ID'),
        limit: z.number().max(1000).default(20).describe('返回数量，最大 1000'),
        offset: z.number().default(0).describe('分页偏移量'),
      },
    },
    async ({ paperId, limit, offset }) => {
      try {
        const result = await client.getPaperReferences(paperId, {
          fields: `citedPaper.${DEFAULT_CITATION_FIELDS.join(',citedPaper.')}`,
          limit,
          offset,
        });

        if (result.data.length === 0) {
          return {
            content: [{ type: 'text', text: '该论文暂无参考文献记录' }],
          };
        }

        const text = `该论文的参考文献（第 ${offset + 1}-${offset + result.data.length} 篇）：\n\n` +
          result.data.map((ref, i) => {
            const paper = ref.citedPaper;
            const authors = paper.authors?.map(a => a.name).join(', ') || '未知作者';
            return `${offset + i + 1}. ${paper.title}\n   作者: ${authors}\n   年份: ${paper.year || '未知'} | 引用: ${paper.citationCount || 0}\n   ID: ${paper.paperId}`;
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

  // 批量获取论文
  server.registerTool(
    'batch_get_papers',
    {
      title: 'Batch Get Papers',
      description: '批量获取多篇论文的详细信息（最多 500 篇）',
      inputSchema: {
        paperIds: z.array(z.string()).max(500).describe('论文 ID 列表，最多 500 个'),
        fields: z.array(z.string()).optional().describe('返回字段'),
      },
    },
    async ({ paperIds, fields }) => {
      try {
        const papers = await client.batchGetPapers(
          paperIds,
          buildFieldsParam(fields || DEFAULT_PAPER_FIELDS)
        );

        const validPapers = papers.filter((p): p is NonNullable<typeof p> => p !== null);
        const text = `成功获取 ${validPapers.length}/${paperIds.length} 篇论文：\n\n` +
          validPapers.map((paper, i) => {
            const authors = paper.authors?.map(a => a.name).join(', ') || '未知作者';
            return `${i + 1}. ${paper.title}\n   作者: ${authors}\n   年份: ${paper.year || '未知'} | 引用: ${paper.citationCount || 0}\n   ID: ${paper.paperId}`;
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
