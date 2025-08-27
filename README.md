# saga-mcp-server

A Model Context Protocol (MCP) server built with mcp-framework.

## Concept: Execution Support, not Execution Guarantee
- This server provides execution SUPPORT primitives for AI agents using the SAGA pattern.
- The AI designs plans and drives execution; the server persists state, tracks progress, and exposes controls.
- Complex guarantees (DAG scheduling, retries, compensation execution) are roadmapped but not fully automatic yet.

### AI Responsibilities
- Design plans (DAG, dependencies, compensation, retry policy) and save them via `save_plan`.
- Start execution with `execute_tool_chain` and monitor with `get_execution_status`.
- On failures, explicitly invoke cancellation/compensation tools as needed (server does not auto-run them yet).
- Use pause/resume/cancel controls (coming) to manage long-running workflows.
- Note: `delete_plan` will fail if any executions exist for the plan. Cancel or wait for completion first.

### Compensation (AI-driven)
- The server does not auto-compensate. AI decides when/how to compensate.
- After invoking a compensation tool, call `record_compensation` to mark the affected step as compensated and log an event.
- Compensation ordering, retries, and policies should be encoded in the plan and enforced by the AI agent.

### Current Limitations (Important)
- Dependencies are stored but executed sequentially (no DAG scheduler yet).
- Compensation steps are defined in plans but not auto-executed by the server.
- Retry policies are defined but not yet applied at runtime.
- Tool invocation is mocked in the demo path; add real tool dispatch in a coordinator.

---

## Quick Start

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Start server with different transport options
npm start                    # stdio (default) - for Claude Desktop
npm run start:sse           # SSE transport on port 8080
npm run start:http          # HTTP Stream transport on port 8080
```

## Recommended AI Flow
1) Create/save a plan with explicit dependencies/compensation using `save_plan`.
2) Execute with `execute_tool_chain` and retrieve the `execution_id`.
3) Poll `get_execution_status` for progress and react to failures.
4) If a critical step fails, call your compensation tools and then `record_compensation`.
5) Optionally pause/resume/cancel.

## Project Structure

```
saga-mcp-server/
├── src/
│   ├── tools/        # MCP Tools
│   │   └── ExampleTool.ts
│   └── index.ts      # Server entry point
├── package.json
└── tsconfig.json
```

## Adding Components

The project comes with an example tool in `src/tools/ExampleTool.ts`. You can add more tools using the CLI:

```bash
# Add a new tool
mcp add tool my-tool

# Example tools you might create:
mcp add tool data-processor
mcp add tool api-client
mcp add tool file-handler
```

## Tool Development

Example tool structure:

```typescript
import { MCPTool } from "mcp-framework";
import { z } from "zod";

interface MyToolInput {
  message: string;
}

class MyTool extends MCPTool<MyToolInput> {
  name = "my_tool";
  description = "Describes what your tool does";

  schema = {
    message: {
      type: z.string(),
      description: "Description of this input parameter",
    },
  };

  async execute(input: MyToolInput) {
    // Your tool logic here
    return `Processed: ${input.message}`;
  }
}

export default MyTool;
```

## Publishing to npm

1. Update your package.json:
   - Ensure `name` is unique and follows npm naming conventions
   - Set appropriate `version`
   - Add `description`, `author`, `license`, etc.
   - Check `bin` points to the correct entry file

2. Build and test locally:
   ```bash
   npm run build
   npm link
   saga-mcp-server  # Test your CLI locally
   ```

3. Login to npm (create account if necessary):
   ```bash
   npm login
   ```

4. Publish your package:
   ```bash
   npm publish
   ```

After publishing, users can add it to their claude desktop client (read below) or run it with npx
```

## Using with Claude Desktop

### Local Development

Add this configuration to your Claude Desktop config file:

**MacOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "saga-mcp-server": {
      "command": "node",
      "args":["/absolute/path/to/saga-mcp-server/dist/index.js"]
    }
  }
}
```

### After Publishing

Add this configuration to your Claude Desktop config file:

**MacOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "saga-mcp-server": {
      "command": "npx",
      "args": ["saga-mcp-server"]
    }
  }
}
```

## Transport Options

### stdio (Default)
- **Use case**: Claude Desktop integration
- **Command**: `npm start` or `npm run start:stdio`
- **Features**: Standard input/output communication

### SSE (Server-Sent Events)
- **Use case**: Web applications, real-time updates
- **Command**: `npm run start:sse`
- **Port**: 8080
- **Endpoints**: 
  - `/sse` - SSE connection
  - `/messages` - Message handling

### HTTP Stream
- **Use case**: HTTP-based clients, API integration
- **Command**: `npm run start:http`
- **Port**: 8080
- **Endpoint**: `/mcp` - MCP protocol endpoint

## Building and Testing

1. Make changes to your tools
2. Run `npm run build` to compile
3. Choose your transport method and start the server
4. The server will automatically load your tools on startup

## Learn More

- [MCP Framework Github](https://github.com/QuantGeekDev/mcp-framework)
- [MCP Framework Docs](https://mcp-framework.com)
