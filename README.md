# Execution Journal

An MCP server that helps AI coordinate sequential tool calls and maintain a comprehensive journal of execution workflows, decisions, and actions.

## What This System Does

**Execution Journal** is a tool execution planning system that provides:

- **Sequential Planning**: Design and execute sequences of tool calls
- **Execution Tracking**: Monitor progress and status of each step
- **Decision Recording**: Log all decisions made during execution
- **Action Journal**: Record manual actions taken for audit trails
- **Contextual Awareness**: Understand relationships between tool calls
- **Failure Policies**: Define how failures in one step affect other steps
- **History Management**: Query and clean up execution history

## Core Concept

This system acts as a **durable memo pad** for AI actions and decisions. It doesn't execute rollbacks automatically - instead, it provides a comprehensive record of what was planned, what was executed, and what decisions were made along the way.

## Available Tools

### Plan Management
- **`record_plan`** - Create and store execution plans with cancellability metadata and failure policies
- **`record_execution_start`** - Start executing a plan and track progress

### Execution Control
- **`query_ledger`** - Check execution status, progress, and history for a specific execution
- **`query_history`** - Query execution history with comprehensive filtering and pagination
- **`record_decision`** - Log decisions made during execution (stop/continue)
- **`record_action`** - Record manual actions taken for audit purposes

### History Management
- **`cleanup_history`** - Clean up old and completed execution history to free up space

## Usage Examples

### 1. Create a Travel Planning Plan
```json
{
  "name": "Summer Vacation Planning",
  "description": "Plan a complete summer vacation with hotel, car, and activities",
  "steps": [
    {
      "id": "book_hotel",
      "name": "Book Hotel",
      "tool": "book_hotel",
      "parameters": {"destination": "Paris", "dates": "2024-07-15 to 2024-07-22"},
      "cancellable": "partially-reversible",
      "failure_policy": {
        "propagate_to": ["book_car", "book_activities"],
        "action": "cancel_dependent",
        "reason": "Hotel is essential for vacation planning"
      }
    },
    {
      "id": "book_car",
      "name": "Book Rental Car",
      "tool": "book_car",
      "parameters": {"pickup_location": "Paris Airport", "dates": "2024-07-15 to 2024-07-22"},
      "cancellable": "reversible",
      "failure_policy": {
        "propagate_to": ["book_activities"],
        "action": "continue_others",
        "reason": "Car is nice to have but not essential"
      }
    }
  ]
}
```

### 2. Start Execution
```json
{
  "plan_id": "plan_abc123",
  "notes": "Starting vacation planning execution"
}
```

### 3. Monitor Progress
```json
{
  "execution_id": "exec_xyz789",
  "include_step_details": true,
  "include_events": true
}
```

### 4. Query History
```json
{
  "query_type": "recent",
  "limit": 10,
  "include_plans": true,
  "include_step_details": false
}
```

### 5. Clean Up History
```json
{
  "cleanup_type": "completed_old",
  "older_than_days": 30,
  "dry_run": true
}
```

### 6. Record Decisions and Actions
```json
{
  "execution_id": "exec_xyz789",
  "action": "stop",
  "reason": "Hotel booking failed, stopping related bookings"
}
```

## Project Structure

```
src/
├── tools/                    # Tool implementations
│   ├── RecordPlanTool.ts     # Plan creation
│   ├── RecordExecutionStartTool.ts   # Execution start
│   ├── QueryLedgerTool.ts    # Status monitoring
│   ├── QueryHistoryTool.ts   # History querying
│   ├── RecordDecisionTool.ts # Decision logging
│   ├── RecordActionTool.ts   # Action recording
│   └── CleanupHistoryTool.ts # History cleanup
├── prompts/                  # AI guidance
│   └── ExecutionPlanningPrompt.ts
├── resources/                # Documentation and examples
│   ├── ExecutionDocumentationResource.ts
│   └── ExecutionExamplesResource.ts
├── core/                     # Core system components
│   ├── db.ts                # Database setup
│   └── execution-manager.ts # Execution orchestration
└── types/                    # TypeScript definitions
    └── execution.ts         # Core interfaces
```

## Installation & Setup

```bash
# Clone the repository
git clone <repository-url>
cd execution-journal

# Install dependencies
npm install

# Build the project
npm run build

# Start the server
npm start
```

## MCP Client Configuration

Add this to your MCP client configuration:

```json
{
  "mcpServers": {
    "execution-journal": {
      "command": "node",
      "args": ["/path/to/dist/index.js"],
      "env": {}
    }
  }
}
```

## Key Features

- **Sequential Execution**: Tools are called one after another
- **Cancellability Metadata**: Each step indicates reversibility level
- **Failure Policies**: Define how failures propagate to other steps
- **Comprehensive Journaling**: All decisions and actions are recorded
- **Execution Monitoring**: Real-time status tracking
- **History Management**: Query and clean up execution history
- **Audit Trail**: Complete history for compliance and debugging

## Cancellability Levels

- **`reversible`**: Can be completely undone
- **`partially-reversible`**: Can be partially undone  
- **`irreversible`**: Cannot be undone

## Failure Policy Options

- **`cancel_all`**: Cancel all remaining steps when this step fails
- **`cancel_dependent`**: Cancel only steps that depend on this step
- **`continue_others`**: Continue with other steps even if this fails
- **`manual_decision`**: Require manual decision on how to proceed

## History Query Types

- **`recent`**: Most recently updated executions
- **`incomplete`**: Pending or running executions
- **`failed`**: Failed or cancelled executions
- **`completed`**: Successfully completed executions
- **`all`**: All executions with pagination

## Cleanup Options

- **`completed_old`**: Remove old completed executions
- **`failed_old`**: Remove old failed executions
- **`orphaned_plans`**: Remove plans with no executions
- **`all_old`**: Remove all old items

## Best Practices

1. **Plan Design**: Keep steps focused and consider failure scenarios
2. **Failure Policies**: Design policies that make business sense
3. **Monitoring**: Check execution status regularly
4. **Decision Recording**: Log all decisions promptly
5. **Action Documentation**: Record what was done and why
6. **Context Awareness**: Understand how tool failures affect related operations
7. **History Management**: Regularly clean up old data to maintain performance

## Development Status

- ✅ Core tools implemented
- ✅ MCP integration complete
- ✅ Database-backed journaling
- ✅ Failure policy support
- ✅ History management tools
- ✅ Comprehensive documentation

## Contributing

This project focuses on simplicity and clarity. Contributions should maintain the core principle of providing execution support while improving the user experience for AI-driven tool coordination.

## License

MIT License - See LICENSE file for details.
