# Tool Execution Planning & Cancellation System

A Model Context Protocol (MCP) server that helps AI plan, execute, and manage complex tool call sequences with **execution support** (not execution guarantees).

## 🎯 **What This System Actually Does**

This is **NOT** the MSA Saga pattern. This system is designed to:

1. **Plan Tool Executions**: AI creates step-by-step plans for calling multiple tools
2. **Track Execution Progress**: Monitor which tools succeeded, failed, or are in progress
3. **Handle Failures Gracefully**: When a tool fails, AI can cancel the entire plan
4. **Record Compensation Actions**: Log what was done and what needs to be undone
5. **Provide Execution Control**: Pause, resume, or cancel tool execution plans

## ⚠️ **Important: Execution Support, Not Execution Guarantee**

This system provides tools and infrastructure to help you create robust tool execution plans, but **YOU (the AI) are responsible for**:

- Designing resilient plans with compensation actions
- Detecting failures and deciding when to cancel plans
- Explicitly invoking cancellation/compensation tools
- Monitoring execution status and handling errors
- Ensuring data consistency through proper planning

**The system does NOT automatically:**
- Retry failed tool calls
- Execute compensation actions
- Handle rollbacks
- Guarantee successful completion

## Concept

This system helps you manage complex sequences of tool calls by:
- Breaking down complex operations into sequential tool calls
- Tracking the progress of each tool call
- Providing a way to cancel the entire plan if something goes wrong
- Recording what was accomplished so you can manually undo if needed

**Key Principle**: This system provides the infrastructure and tools for managing tool execution plans, but AI must design robust plans and handle failures explicitly.

## Project Structure

```
src/
├── tools/
│   └── SagaHubTool.ts          # Single unified tool for all operations
├── prompts/
│   └── SagaPlanningPrompt.ts   # AI guidance for creating tool execution plans
├── resources/
│   ├── SagaDocumentationResource.ts  # Comprehensive documentation
│   └── SagaExamplesResource.ts       # Example plans and templates
├── core/
│   ├── saga-manager.ts         # Tool execution plan lifecycle management
│   ├── tool-coordinator.ts     # Tool execution with retry logic
│   └── execution-scheduler.ts  # Sequential execution (planned)
└── storage/
    ├── plan-repository.ts      # Plan persistence
    └── saga-repository.ts      # Execution instance persistence
```

## Usage

### Single Tool Interface

All operations are available through the `saga` tool:

```typescript
// Save a tool execution plan
{
  "action": "save_plan",
  "plan": {
    "name": "Database Setup",
    "steps": [
      {
        "id": "create-db",
        "name": "Create Database",
        "tool": "create_database",
        "parameters": { "name": "production" },
        "compensation": {
          "tool": "delete_database",
          "parameters": { "name": "production" }
        }
      }
    ]
  }
}

// Execute a plan
{
  "action": "execute",
  "plan_id": "plan-123"
}

// Check status
{
  "action": "status",
  "execution_id": "exec-456"
}

// Cancel execution if something goes wrong
{
  "action": "cancel",
  "execution_id": "exec-456"
}

// Record what was undone (AI must call this explicitly!)
{
  "action": "record_compensation",
  "execution_id": "exec-456",
  "step_id": "create-db",
  "compensation_data": {
    "reason": "Database creation failed",
    "action_taken": "Deleted partially created database"
  }
}
```

## AI Responsibilities

### 1. Plan Design
- Create comprehensive plans with clear tool call sequences
- Define compensation actions for each tool call
- Consider failure scenarios and cancellation strategies
- Use the `saga-planning` prompt for guidance

### 2. Failure Handling
- Monitor execution status continuously
- Detect when tool calls fail or timeout
- Explicitly call cancellation tools when needed
- Decide when to pause, resume, or cancel

### 3. Compensation Management
- Record compensation actions using `record_compensation`
- Execute rollback operations manually
- Ensure data consistency through proper planning
- Document what was undone and why

## Available Capabilities

### Tools
- **`saga`**: Unified interface for all tool execution planning operations

### Prompts  
- **`saga-planning`**: Guidance for creating robust tool execution plans

### Resources
- **`saga/documentation`**: Comprehensive system documentation
- **`saga/examples`**: Real-world tool execution plan examples

## Installation

```bash
npm install
npm run build
npm start
```

## Transport Options

- **stdio** (default): For Claude Desktop
- **sse**: Server-Sent Events on port 8080
- **http**: HTTP Stream on port 8080

## Current Limitations

- **Sequential Execution**: Tools are called one after another (no parallel execution yet)
- **Auto-compensation**: Not implemented - AI must handle manually
- **Retry Logic**: Basic retry in tool coordinator only
- **Mock Tools**: Tools are simulated, not real external services

## What AI Should Know

1. **This is a tool execution planning and management system**
2. **You design the plans and handle failures**
3. **Cancellation and compensation must be explicitly invoked**
4. **Monitor execution status continuously**
5. **Use the provided tools to manage your tool call sequences**

## Contributing

This is a work in progress. The system provides the foundation for managing complex tool execution sequences, but advanced features like automatic compensation, parallel execution, and real-time monitoring are planned for future releases.
