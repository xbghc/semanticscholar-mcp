// MCP 工具注册入口

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerPaperTools } from './papers.js';
import { registerAuthorTools } from './authors.js';
import { registerRecommendationTools } from './recommendations.js';

export function registerAllTools(server: McpServer) {
  registerPaperTools(server);
  registerAuthorTools(server);
  registerRecommendationTools(server);
}

export { registerPaperTools, registerAuthorTools, registerRecommendationTools };
