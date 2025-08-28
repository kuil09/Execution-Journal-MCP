# Tool Execution Planning (Ledger-first)

An MCP server that helps AI coordinate sequential tool calls and keep a ledger of decisions and compensations. The system does not execute rollbacks; it provides a durable memo pad.

## What This System Actually Does

**This is NOT the MSA Saga pattern for distributed transactions.** Instead, this system manages "loose contextual connections" between tool calls. For example:

- If a "travel booking" tool call fails, a contextually linked next step should be stopped
- If a "database migration" fails, related "backup creation" and "notification sending" should be reconsidered
- The AI is responsible for detecting failures and manually deciding actions; the server records them (ledger)

## Core Concept: Execution Support, Not Execution Guarantee (Ledger)

This system provides **execution support** for complex tool call sequences, not automatic execution guarantees. The AI must:

- Design sequential plans and declare which steps are cancellable
- Monitor execution status
- Handle failures manually and record actions using the ledger
- Consider contextual dependencies between tool calls

## Available Tools

### Plan Management
- **`save_plan`** - Save a sequential plan; each step may include `cancellable`
- **`execute_plan`** - Execute a saved plan (sequential)

### Execution Control
- **`status`** - Check execution status and progress
- **`control`** - Cancel execution
- **`record_compensation`** - Append a ledger event about manual compensation/cancellation

## Usage Examples

### 1. Save a Travel Planning Plan (with cancellability)
```json
{
  "plan": {
    "name": "Summer Vacation Planning",
    "description": "Plan a complete summer vacation with hotel, car, and activities",
    "steps": [
      {
        "id": "book_hotel",
        "name": "Book Hotel",
        "tool": "book_hotel",
        "parameters": {"destination": "Paris", "dates": "2024-07-15 to 2024-07-22"},
        "cancellable": "partially-reversible"
      },
      {
        "id": "book_car",
        "name": "Book Rental Car",
        "tool": "book_car",
        "parameters": {"pickup_location": "Paris Airport", "dates": "2024-07-15 to 2024-07-22"},
        "cancellable": "reversible"
      }
    ]
  }
}
```

### 2. Execute the Plan
```json
{
  "plan_id": "plan_abc123"
}
```

### 3. Check Status
```json
{
  "execution_id": "exec_xyz789",
  "include_step_details": true
}
```

### 4. Control Execution
```json
{
  "action": "cancel",
  "execution_id": "exec_xyz789"
}
```

### 5. Record Cancellation (Ledger)
```json
{
  "execution_id": "exec_xyz789",
  "step_id": "book_hotel",
  "reason": "Hotel unavailable for requested dates",
  "action_taken": "Cancelled booking (manual via vendor portal)",
  "details": {"alternative_dates": "2024-08-01 to 2024-08-08"}
}
```

## Project Structure

```
src/
├── tools/                    # Individual tool implementations
│   ├── SavePlanTool.ts      # Plan saving functionality
│   ├── ExecutePlanTool.ts   # Plan execution
│   ├── StatusTool.ts        # Status monitoring
│   ├── ControlTool.ts       # Execution control
│   └── RecordCompensationTool.ts # Cancellation logging
├── prompts/                  # AI guidance and templates
│   └── ToolExecutionPlanningPrompt.ts
├── resources/                # Documentation and examples
│   ├── ToolExecutionDocumentationResource.ts
│   └── ToolExecutionExamplesResource.ts
├── core/                     # Core system components
│   ├── db.ts                # Database initialization
│   └── saga-manager.ts      # Execution management
└── types/                    # TypeScript type definitions
    └── saga.ts              # Core interfaces
```

## Installation & Setup

```bash
# Clone the repository
git clone <repository-url>
cd Saga-MCP

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
    "tool-execution-planner": {
      "command": "node",
      "args": ["/path/to/dist/index.js"],
      "env": {}
    }
  }
}
```

## Key Features

- **Simple Sequential Execution**
- **Cancellability Metadata** per step (reversible/partially-reversible/irreversible)
- **Execution Monitoring**: Status tracking
- **Ledger**: Durable record of manual compensations/cancellations

## Important Notes

1. **This is NOT the MSA Saga pattern** - No automatic rollback or distributed transaction guarantees
2. **AI Responsibility** - The AI must monitor execution and handle failures manually
3. **Contextual Awareness** - Always consider how tool failures affect related operations
4. **Cancellation First** - Design plans with cancellation strategies from the beginning

## Development Status

- ✅ Core tools implemented
- ✅ MCP prompts and resources
- ✅ Basic execution framework
- ✅ Database-backed ledger events

## Contributing

This project is designed to be simple and focused. Contributions should maintain the core principle of "execution support, not execution guarantee" while improving the user experience for AI-driven tool coordination.

## License

MIT License - See LICENSE file for details.
