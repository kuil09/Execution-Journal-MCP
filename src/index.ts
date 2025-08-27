import { MCPServer } from "mcp-framework";

// 명령행 인수 파싱
const args = process.argv.slice(2);
const transportType = args[0] || 'stdio';

console.log(`🚀 Starting SAGA MCP Server with ${transportType} transport...`);

let server: MCPServer;

switch (transportType) {
  case 'stdio':
    server = new MCPServer();
    break;
    
  case 'sse':
    server = new MCPServer({
      transport: {
        type: "sse",
        options: {
          port: 8080,
          cors: { allowOrigin: "*" }
        }
      }
    });
    break;
    
  case 'http':
    server = new MCPServer({
      transport: {
        type: "http-stream",
        options: {
          port: 8080,
          endpoint: "/mcp",
          cors: { allowOrigin: "*" }
        }
      }
    });
    break;
    
  default:
    console.log(`
❌ Invalid transport type: ${transportType}

Available options:
  - stdio    (default) - Standard input/output for Claude Desktop
  - sse      - Server-Sent Events on port 8080
  - http     - HTTP Stream on port 8080

Usage:
  npm start                    # Use stdio (default)
  npm start stdio             # Use stdio
  npm start sse               # Use SSE transport
  npm start http              # Use HTTP Stream transport
    `);
    process.exit(1);
}

// 서버 시작
server.start().then(() => {
  console.log(`✅ SAGA MCP Server started successfully with ${transportType} transport`);
  
  if (transportType !== 'stdio') {
    console.log(`🌐 Server accessible at: http://localhost:8080`);
    if (transportType === 'sse') {
      console.log(`📡 SSE endpoint: http://localhost:8080/sse`);
      console.log(`💬 Message endpoint: http://localhost:8080/messages`);
    } else if (transportType === 'http') {
      console.log(`📡 MCP endpoint: http://localhost:8080/mcp`);
    }
  }
}).catch((error) => {
  console.error(`❌ Failed to start server:`, error);
  process.exit(1);
});