// MCP 服务器主逻辑

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerAllTools } from './tools/index.js';

export function createServer(): McpServer {
  const server = new McpServer({
    name: 'semanticscholar',
    version: '1.0.0',
  });

  // 注册所有工具
  registerAllTools(server);

  return server;
}
