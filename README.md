# Semantic Scholar MCP Plugin

一个 Claude Code 插件，通过 MCP (Model Context Protocol) 提供 Semantic Scholar 学术搜索功能。

## 功能特性

- 论文搜索、详情查询、引用分析
- 作者搜索和学术档案查询
- 基于论文的智能推荐
- 支持多种论文 ID 格式 (DOI, ArXiv, PMID 等)
- 内置速率限制和自动重试机制

## 安装

### 前置要求

- Node.js >= 18
- Claude Code >= 1.0.33

### 安装步骤

```bash
# 克隆仓库
git clone https://github.com/xbghc/semanticscholar-mcp.git
cd semanticscholar-mcp

# 安装依赖
npm install

# 构建
npm run build
```

### 配置 API Key (可选)

Semantic Scholar API 可以无需认证使用，但有速率限制。申请 API Key 可获得更高的请求配额。

1. 访问 [Semantic Scholar API](https://www.semanticscholar.org/product/api) 申请 API Key
2. 设置环境变量：

```bash
export SEMANTIC_SCHOLAR_API_KEY="your-api-key"
```

## 使用方法

### 在 Claude Code 中加载插件

```bash
claude --plugin-dir /path/to/semanticscholar-mcp
```

### 可用工具

#### 论文相关

| 工具 | 描述 |
|------|------|
| `search_papers` | 搜索学术论文，支持年份、学科、引用数等过滤条件 |
| `get_paper` | 获取论文详情，支持多种 ID 格式 |
| `get_paper_citations` | 获取引用该论文的文献列表 |
| `get_paper_references` | 获取论文的参考文献列表 |
| `batch_get_papers` | 批量获取多篇论文详情 (最多 500 篇) |

#### 作者相关

| 工具 | 描述 |
|------|------|
| `search_authors` | 搜索学术作者 |
| `get_author` | 获取作者详情 (h-index, 论文数等) |
| `get_author_papers` | 获取指定作者的论文列表 |

#### 推荐

| 工具 | 描述 |
|------|------|
| `get_recommendations` | 基于指定论文获取推荐的相关论文 |

### 使用示例

在 Claude Code 中直接对话即可使用：

```
搜索关于 transformer attention 的论文

查看论文 ARXIV:1706.03762 的详细信息

找出引用了 "Attention Is All You Need" 的论文

推荐与这篇论文相似的研究
```

### 支持的论文 ID 格式

- Semantic Scholar ID: `204e3073870fae3d05bcbc2f6a8e263d9b72e776`
- DOI: `DOI:10.1038/nature12373`
- ArXiv: `ARXIV:1706.03762`
- PubMed: `PMID:19872477`
- Corpus ID: `CorpusId:123456`

## 开发

### 项目结构

```
semanticscholar-mcp/
├── .claude-plugin/
│   └── plugin.json          # 插件清单
├── .mcp.json                 # MCP 服务器配置
├── src/
│   ├── index.ts              # 入口文件
│   ├── server.ts             # MCP 服务器
│   ├── api/
│   │   ├── client.ts         # API 客户端
│   │   ├── rate-limiter.ts   # 速率限制 (p-queue)
│   │   ├── backoff.ts        # 指数退避重试
│   │   └── types.ts          # 类型定义
│   ├── tools/
│   │   ├── papers.ts         # 论文工具
│   │   ├── authors.ts        # 作者工具
│   │   └── recommendations.ts # 推荐工具
│   └── utils/
│       ├── errors.ts         # 错误处理
│       └── fields.ts         # 字段常量
├── tests/                    # 测试文件
├── package.json
└── tsconfig.json
```

### 常用命令

```bash
# 开发模式
npm run dev

# 构建
npm run build

# 运行测试
npm test

# 运行集成测试 (需要网络)
npm test -- tests/client.integration.test.ts
```

### 速率限制

| 模式 | 请求间隔 |
|------|----------|
| 有 API Key | 2 秒 |
| 无 API Key | 5 秒 |

遇到 429 错误时会自动指数退避重试 (1s → 2s → 4s → 8s → 16s)。

## API 参考

本插件基于 [Semantic Scholar Academic Graph API](https://api.semanticscholar.org/api-docs/)。

主要端点：
- `/graph/v1/paper/search` - 论文搜索
- `/graph/v1/paper/{paper_id}` - 论文详情
- `/graph/v1/author/search` - 作者搜索
- `/recommendations/v1/papers` - 论文推荐

## 许可证

MIT
