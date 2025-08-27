import { MCPResource } from "mcp-framework";
import fs from "node:fs/promises";
import path from "node:path";

class SagaDocumentationResource extends MCPResource {
  uri = "resource://saga/documentation";
  name = "SAGA Documentation";
  description = "Comprehensive documentation for SAGA pattern implementation and usage";
  mimeType = "text/markdown";

  async read() {
    try {
      const readmePath = path.join(process.cwd(), "README.md");
      const todoPath = path.join(process.cwd(), "TODO.md");
      
      const [readmeContent, todoContent] = await Promise.all([
        fs.readFile(readmePath, "utf-8").catch(() => "# SAGA MCP Server\n\nDocumentation not available"),
        fs.readFile(todoPath, "utf-8").catch(() => "# TODO\n\nTask list not available")
      ]);

      const combinedContent = `# SAGA MCP Server Documentation

## Overview
${readmeContent.split("## ")[1] || "SAGA pattern implementation for MCP"}

## Current Status
${todoContent.split("## ")[1] || "Status information not available"}

## 🚨 CRITICAL: System Limitations & AI Responsibilities

### What This System IS:
- **Execution Support Infrastructure**: Tools, storage, and monitoring for SAGA workflows
- **Plan Management**: Save, load, and organize execution plans
- **Basic Execution Control**: Start, pause, resume, cancel workflows
- **Status Monitoring**: Track execution progress and step results
- **Compensation Recording**: Log rollback actions (but NOT execute them)

### What This System is NOT:
- **Execution Guarantee System**: Does NOT automatically ensure successful completion
- **Auto-Recovery System**: Does NOT automatically handle failures or rollbacks
- **DAG Executor**: Dependencies are stored but executed sequentially
- **Intelligent Retry System**: Basic retry only, no smart failure handling

## Key Concepts
- **Execution Support, Not Execution Guarantee**: The system provides tools and infrastructure for robust execution, but AI must design resilient plans
- **Compensation-First Design**: Every step should have a corresponding compensation action
- **Failure Handling**: AI must explicitly handle failures and invoke compensation tools
- **DAG Workflows**: Plans can define dependencies, but execution is currently sequential

## AI Responsibilities (Critical for Success)

### 1. Plan Design
- Create comprehensive plans with clear steps
- Define compensation actions for each step
- Consider failure scenarios and rollback strategies
- Plan for manual intervention when things go wrong

### 2. Failure Handling
- Monitor execution status continuously
- Detect when steps fail or timeout
- Explicitly call compensation tools
- Decide when to pause, resume, or cancel

### 3. Compensation Management
- Record compensation actions using record_compensation
- Execute rollback operations manually
- Ensure data consistency through proper planning
- Document what was rolled back and why

## Usage Guidelines
1. Always design plans with failure scenarios in mind
2. Include compensation actions for each step
3. Test your plans with the available tools
4. Monitor execution status and handle failures gracefully
5. Be prepared to manually intervene when failures occur

## Current Limitations
- **DAG Dependencies**: Stored in plans but not yet executed
- **Auto-compensation**: Not implemented - AI must handle manually
- **Retry Logic**: Basic retry in tool coordinator only
- **Mock Tools**: Tools are simulated, not real external services

## What AI Should Know
1. **This is a planning and execution support system**
2. **You design the plans and handle failures**
3. **Compensation actions must be explicitly invoked**
4. **Monitor execution status continuously**
5. **Use the provided tools to manage the workflow**
6. **Success depends on your careful planning and monitoring**
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

export default SagaDocumentationResource;
