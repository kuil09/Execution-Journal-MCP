# SAGA MCP Server

A Model Context Protocol (MCP) server that implements the SAGA pattern for managing complex, multi-step workflows with **execution support** (not execution guarantees).

## ⚠️ **Important: Execution Support, Not Execution Guarantee**

This system provides tools and infrastructure to help you create robust execution plans, but **YOU (the AI) are responsible for**:

- Designing resilient plans with compensation actions
- Detecting failures and deciding when to rollback
- Explicitly invoking compensation tools
- Monitoring execution status and handling errors
- Ensuring data consistency through proper planning

**The system does NOT automatically:**
- Retry failed steps
- Execute compensation actions
- Handle rollbacks
- Guarantee successful completion

## Concept

The SAGA pattern breaks down complex operations into a series of local transactions, where each transaction has a corresponding compensation action. When a step fails, the system can rollback previous steps using these compensation actions.

**Key Principle**: This system provides the infrastructure and tools for SAGA execution, but AI must design robust plans and handle failures explicitly.

## Project Structure

```
src/
├── tools/
│   └── SagaHubTool.ts          # Single unified tool for all operations
├── prompts/
│   └── SagaPlanningPrompt.ts   # AI guidance for creating SAGA plans
├── resources/
│   ├── SagaDocumentationResource.ts  # Comprehensive documentation
│   └── SagaExamplesResource.ts       # Example plans and templates
├── core/
│   ├── saga-manager.ts         # SAGA lifecycle management
│   ├── tool-coordinator.ts     # Tool execution with retry logic
│   └── execution-scheduler.ts  # DAG-based execution (planned)
└── storage/
    ├── plan-repository.ts      # Plan persistence
    └── saga-repository.ts      # SAGA instance persistence
```

## Usage

### Single Tool Interface

All operations are available through the `saga` tool:

```typescript
// Save a plan
{
  "action": "save_plan",
  "plan": {
    "name": "Database Migration",
    "steps": [
      {
        "id": "backup",
        "name": "Backup Database",
        "tool": "backup_db",
        "parameters": { "db": "production" },
        "compensation": {
          "tool": "restore_db",
          "parameters": { "db": "production" }
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

// Pause execution
{
  "action": "pause",
  "execution_id": "exec-456"
}

// Record compensation (AI must call this explicitly!)
{
  "action": "record_compensation",
  "execution_id": "exec-456",
  "step_id": "backup",
  "compensation_data": {
    "reason": "Backup failed",
    "action_taken": "Restored from previous backup"
  }
}
```

## AI Responsibilities

### 1. Plan Design
- Create comprehensive plans with clear steps
- Define compensation actions for each step
- Consider failure scenarios and rollback strategies
- Use the `saga-planning` prompt for guidance

### 2. Failure Handling
- Monitor execution status continuously
- Detect when steps fail or timeout
- Explicitly call compensation tools
- Decide when to pause, resume, or cancel

### 3. Compensation Management
- Record compensation actions using `record_compensation`
- Execute rollback operations manually
- Ensure data consistency through proper planning
- Document what was rolled back and why

## Available Capabilities

### Tools
- **`saga`**: Unified interface for all SAGA operations

### Prompts  
- **`saga-planning`**: Guidance for creating robust SAGA plans

### Resources
- **`saga/documentation`**: Comprehensive system documentation
- **`saga/examples`**: Real-world SAGA plan examples

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

## Contributing

This is a work in progress. The system provides the foundation for SAGA pattern implementation, but advanced features like automatic compensation, DAG execution, and real-time monitoring are planned for future releases.
