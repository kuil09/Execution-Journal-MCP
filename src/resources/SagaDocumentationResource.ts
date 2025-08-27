import { MCPResource } from "mcp-framework";
import fs from "node:fs/promises";
import path from "node:path";

class ToolExecutionDocumentationResource extends MCPResource {
  uri = "resource://tool-execution/documentation";
  name = "Tool Execution Planning Documentation";
  description = "Comprehensive documentation for tool execution planning and compensation system";
  mimeType = "text/markdown";

  async read() {
    try {
      const readmePath = path.join(process.cwd(), "README.md");
      const todoPath = path.join(process.cwd(), "TODO.md");
      
      const [readmeContent, todoContent] = await Promise.all([
        fs.readFile(readmePath, "utf-8").catch(() => "# Tool Execution Planning System\n\nDocumentation not available"),
        fs.readFile(todoPath, "utf-8").catch(() => "# TODO\n\nTask list not available")
      ]);

      const combinedContent = `# Tool Execution Planning & Compensation System Documentation

## Overview
${readmeContent.split("## ")[1] || "Tool execution planning implementation for MCP"}

## Current Status
${todoContent.split("## ")[1] || "Status information not available"}

## 🚨 CRITICAL: System Limitations & AI Responsibilities

### What This System IS:
- **Tool Execution Planning Infrastructure**: Tools, storage, and monitoring for managing tool call sequences
- **Plan Management**: Save, load, and organize tool execution plans
- **Basic Execution Control**: Start, pause, resume, cancel tool execution plans
- **Status Monitoring**: Track execution progress and tool call results
- **Compensation Recording**: Log compensation actions (but NOT execute them)

### What This System is NOT:
- **MSA Saga Pattern**: This is NOT the microservices saga pattern
- **Execution Guarantee System**: Does NOT automatically ensure successful completion
- **Auto-Recovery System**: Does NOT automatically handle failures or compensations
- **Parallel Executor**: Tools are called sequentially (no parallel execution yet)
- **Intelligent Retry System**: Basic retry only, no smart failure handling

## Key Concepts
- **Execution Support, Not Execution Guarantee**: The system provides tools and infrastructure for robust tool execution planning, but AI must design resilient plans
- **Compensation-First Design**: Every tool call should have a corresponding compensation action
- **Failure Handling**: AI must explicitly handle failures and invoke compensation tools
- **Sequential Execution**: Tools are called one after another (parallel execution planned for future)
- **Contextual Dependencies**: Manage relationships between tool calls (e.g., hotel booking failure affects car rental and activity bookings)

## AI Responsibilities (Critical for Success)

### 1. Plan Design
- Create comprehensive plans with clear tool call sequences
- Define compensation actions for each tool call
- Consider failure scenarios and compensation strategies
- Plan for manual intervention when tool calls fail
- Identify contextual dependencies between tool calls

### 2. Failure Handling
- Monitor execution status continuously
- Detect when tool calls fail or timeout
- Explicitly call compensation tools when needed
- Decide when to pause, resume, or cancel
- Understand the ripple effects of failures

### 3. Compensation Management
- Record compensation actions using record_compensation
- Execute compensation operations manually
- Ensure data consistency through proper planning
- Document what was compensated and why
- Handle contextual dependencies (if A fails, compensate B and C)

## Usage Guidelines
1. Always design plans with failure scenarios in mind
2. Include compensation actions for every tool call
3. Test your plans with the available tools
4. Monitor execution status and handle failures gracefully
5. Be prepared to manually intervene when failures occur
6. Consider the broader context: what other operations depend on this one?

## Current Limitations
- **Sequential Execution**: Tools are called one after another (no parallel execution yet)
- **Auto-compensation**: Not implemented - AI must handle manually
- **Retry Logic**: Basic retry in tool coordinator only
- **Mock Tools**: Tools are simulated, not real external services

## What AI Should Know
1. **This is a tool execution planning and management system**
2. **You design the plans and handle failures**
3. **Compensation must be explicitly invoked**
4. **Monitor execution status continuously**
5. **Use the provided tools to manage your tool call sequences**
6. **Success depends on your careful planning and monitoring**
7. **This is NOT the MSA Saga pattern - it's a tool execution planning system**
8. **Focus on contextual dependencies: understand how tool calls relate to each other**
`;

      return [
        {
          uri: this.uri,
          mimeType: this.mimeType,
          text: combinedContent,
        },
      ];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return [
        {
          uri: this.uri,
          mimeType: this.mimeType,
          text: `# SAGA MCP Server\n\nError reading documentation: ${errorMessage}`,
        },
      ];
    }
  }
}

export default ToolExecutionDocumentationResource;
