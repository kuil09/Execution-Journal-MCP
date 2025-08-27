import { MCPServer } from "mcp-framework";

// Import tools, prompts, and resources
import SavePlanTool from "./tools/SavePlanTool.js";
import ExecutePlanTool from "./tools/ExecutePlanTool.js";
import StatusTool from "./tools/StatusTool.js";
import ControlTool from "./tools/ControlTool.js";
import RecordCompensationTool from "./tools/RecordCompensationTool.js";
import ToolExecutionPlanningPrompt from "./prompts/SagaPlanningPrompt.js";
import ToolExecutionDocumentationResource from "./resources/SagaDocumentationResource.js";
import ToolExecutionExamplesResource from "./resources/SagaExamplesResource.js";

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
    (server as any).tool(SavePlanTool);
    (server as any).tool(ExecutePlanTool);
    (server as any).tool(StatusTool);
    (server as any).tool(ControlTool);
    (server as any).tool(RecordCompensationTool);
  } else if ('addTool' in server) {
    (server as any).addTool(SavePlanTool);
    (server as any).addTool(ExecutePlanTool);
    (server as any).addTool(StatusTool);
    (server as any).addTool(ControlTool);
    (server as any).addTool(RecordCompensationTool);
  }
  
  if ('prompt' in server) {
    (server as any).prompt(ToolExecutionPlanningPrompt);
  } else if ('addPrompt' in server) {
    (server as any).addPrompt(ToolExecutionPlanningPrompt);
  }
  
  if ('resource' in server) {
    (server as any).resource(ToolExecutionDocumentationResource);
    (server as any).resource(ToolExecutionExamplesResource);
  } else if ('addResource' in server) {
    (server as any).addResource(ToolExecutionDocumentationResource);
    (server as any).addResource(ToolExecutionExamplesResource);
  }
} catch (error) {
  console.error("Failed to register components:", error);
}

// 서버 시작
server.start().catch((error) => {
  console.error(`Failed to start server:`, error);
  process.exit(1);
});