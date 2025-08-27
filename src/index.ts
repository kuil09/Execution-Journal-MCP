import { MCPServer } from "mcp-framework";

// Import tools, prompts, and resources
import SagaHubTool from "./tools/SagaHubTool.js";
import SagaPlanningPrompt from "./prompts/SagaPlanningPrompt.js";
import SagaDocumentationResource from "./resources/SagaDocumentationResource.js";
import SagaExamplesResource from "./resources/SagaExamplesResource.js";

// 명령행 인수 파싱
const args = process.argv.slice(2);
const transportType = args[0] || 'stdio';

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
    console.error(`Invalid transport type: ${transportType}`);
    console.error(`Available options: stdio, sse, http`);
    process.exit(1);
}

// Register tools, prompts, and resources
// Note: MCP Framework registration methods may vary by version
try {
  // Try different registration methods based on MCP Framework version
  if ('tool' in server) {
    (server as any).tool(SagaHubTool);
  } else if ('addTool' in server) {
    (server as any).addTool(SagaHubTool);
  }
  
  if ('prompt' in server) {
    (server as any).prompt(SagaPlanningPrompt);
  } else if ('addPrompt' in server) {
    (server as any).addPrompt(SagaPlanningPrompt);
  }
  
  if ('resource' in server) {
    (server as any).resource(SagaDocumentationResource);
    (server as any).resource(SagaExamplesResource);
  } else if ('addResource' in server) {
    (server as any).addResource(SagaDocumentationResource);
    (server as any).addResource(SagaExamplesResource);
  }
} catch (error) {
  // Silent registration - MCP Framework will handle errors
}

// 서버 시작
server.start().catch((error) => {
  console.error(`Failed to start server:`, error);
  process.exit(1);
});