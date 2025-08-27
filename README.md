# Tool Execution Planning & Cancellation System

A Model Context Protocol (MCP) server for managing tool call sequences with contextual dependencies. This system helps AI coordinate multiple tool calls and handle failures through manual cancellation actions.

## What This System Actually Does

**This is NOT the MSA Saga pattern for distributed transactions.** Instead, this system manages "loose contextual connections" between tool calls. For example:

- If a "travel booking" tool call fails, a "hat purchase" tool call that is contextually linked should also be cancelled
- If a "database migration" fails, related "backup creation" and "notification sending" should be cancelled
- The AI is responsible for detecting failures and manually invoking cancellation tools

## Core Concept: Execution Support, Not Execution Guarantee

This system provides **execution support** for complex tool call sequences, not automatic execution guarantees. The AI must:

- Design robust plans with proper cancellation strategies
- Monitor execution status continuously
- Handle failures manually by calling cancellation tools
- Consider contextual dependencies between tool calls

## Available Tools

### Plan Management
- **`save_plan`** - Save a tool execution plan with contextual dependencies
- **`execute_plan`** - Execute a saved plan with optional configuration

### Execution Control
- **`status`** - Check execution status and progress
- **`control`** - Pause, resume, or cancel executions
- **`record_compensation`** - Log cancellation actions for audit trails

## Usage Examples

### 1. Save a Travel Planning Plan
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
        "cancellation": {
          "tool": "cancel_hotel",
          "parameters": {"booking_id": "{{hotel_booking_id}}"}
        }
      },
      {
        "id": "book_car",
        "name": "Book Rental Car",
        "tool": "book_car",
        "parameters": {"pickup_location": "Paris Airport", "dates": "2024-07-15 to 2024-07-22"},
        "cancellation": {
          "tool": "cancel_car",
          "parameters": {"booking_id": "{{car_booking_id}}"}
        }
      }
    ]
  }
}
```

### 2. Execute the Plan
```json
{
  "plan_id": "plan_abc123",
  "execution_options": {
    "concurrency": 1,
    "timeout": 30000,
    "pause_on_error": true
  }
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
  "action": "pause",
  "execution_id": "exec_xyz789"
}
```

### 5. Record Cancellation
```json
{
  "execution_id": "exec_xyz789",
  "step_id": "book_hotel",
  "reason": "Hotel unavailable for requested dates",
  "action_taken": "Cancelled hotel booking via cancel_hotel tool",
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

- **Contextual Dependencies**: Manage relationships between tool calls
- **Manual Cancellation**: AI-driven failure handling and rollback
- **Execution Monitoring**: Real-time status tracking and control
- **Audit Trail**: Comprehensive logging of all actions and cancellations
- **Flexible Planning**: Support for complex, multi-step workflows

## Important Notes

1. **This is NOT the MSA Saga pattern** - No automatic rollback or distributed transaction guarantees
2. **AI Responsibility** - The AI must monitor execution and handle failures manually
3. **Contextual Awareness** - Always consider how tool failures affect related operations
4. **Cancellation First** - Design plans with cancellation strategies from the beginning

## Development Status

- ✅ Core tools implemented
- ✅ MCP prompts and resources
- ✅ Basic execution framework
- 🔄 Database integration (in progress)
- 🔄 Advanced DAG execution (planned)
- 🔄 Parallel execution support (planned)

## Contributing

This project is designed to be simple and focused. Contributions should maintain the core principle of "execution support, not execution guarantee" while improving the user experience for AI-driven tool coordination.

## License

MIT License - See LICENSE file for details.
