// MCP 服务器主逻辑

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerAllTools } from './tools/index.js';

const SERVER_INSTRUCTIONS = `
Semantic Scholar 学术搜索服务器 - 用于查找和分析学术论文、作者信息及引用关系。

## 使用场景

当用户有以下需求时，应该使用此服务器的工具：

1. **学术研究相关**
   - 查找特定主题的学术论文
   - 了解某个研究领域的最新进展
   - 寻找某篇论文的引用或参考文献
   - 查找某位学者的发表记录和研究方向

2. **文献综述**
   - 搜索某个关键词相关的高引用论文
   - 追踪某篇重要论文的影响力（谁引用了它）
   - 查找论文的原始参考文献

3. **作者信息查询**
   - 查找某位研究者的学术档案
   - 了解作者的 h-index、论文数量等指标
   - 获取某位作者的论文列表

## 关键词识别

当用户提到以下词汇时，考虑使用此服务器：
- 论文、paper、文献、研究、学术
- 引用、citation、参考文献、reference
- 作者、researcher、学者、教授
- DOI、ArXiv、PubMed
- h-index、引用数、影响因子
- 文献综述、literature review

## 工具选择指南

- \`search_papers\`: 关键词搜索论文，支持年份、学科、引用数过滤
- \`get_paper\`: 用 ID 获取单篇论文详情（支持 DOI、ArXiv ID 等）
- \`get_paper_citations\`: 查看谁引用了某篇论文
- \`get_paper_references\`: 查看某篇论文引用了什么
- \`search_authors\`: 搜索学术作者
- \`get_author\`: 获取作者详细信息
- \`get_author_papers\`: 获取作者的论文列表
- \`get_recommendations\`: 基于某篇论文推荐相似论文
`.trim();

export function createServer(): McpServer {
  const server = new McpServer(
    {
      name: 'semanticscholar',
      version: '1.0.0',
      description: '学术论文搜索服务器，提供 Semantic Scholar 数据库的论文检索、作者查询、引用分析和论文推荐功能',
    },
    {
      instructions: SERVER_INSTRUCTIONS,
    }
  );

  // 注册所有工具
  registerAllTools(server);

  return server;
}
