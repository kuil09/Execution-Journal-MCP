import { MCPServer } from "mcp-framework";
import RecordPlanTool from "./tools/RecordPlanTool.js";
import RecordExecutionStartTool from "./tools/RecordExecutionStartTool.js";
import QueryLedgerTool from "./tools/QueryLedgerTool.js";
import RecordDecisionTool from "./tools/RecordDecisionTool.js";
import RecordActionTool from "./tools/RecordActionTool.js";
import ExecutionPlanningPrompt from "./prompts/ExecutionPlanningPrompt.js";
import ExecutionDocumentationResource from "./resources/ExecutionDocumentationResource.js";
import ExecutionExamplesResource from "./resources/ExecutionExamplesResource.js";

const server = new MCPServer({
  name: "execution-journal",
  version: "0.0.1"
});

// Note: Tool and resource registration methods may vary by MCP Framework version
// The server will handle registration automatically based on the exported classes

console.log("Execution Journal MCP Server starting...");
console.log("Available tools:");
console.log("- RecordPlanTool");
console.log("- RecordExecutionStartTool");
console.log("- QueryLedgerTool");
console.log("- RecordDecisionTool");
console.log("- RecordActionTool");

server.start();