import { MCPTool } from "mcp-framework";
import { z } from "zod";
import { getDb } from "../core/db.js";

interface TestConnectionInput {}

class TestConnectionTool extends MCPTool<TestConnectionInput> {
  name = "test_saga_connection";
  description = "SAGA MCP Server connection and status test";

  schema = {};

  async execute(input: TestConnectionInput) {
    // basic health-check: ensure DB is reachable and tables exist
    const db = getDb();
    const tables = db
      .prepare(
        `SELECT name FROM sqlite_master WHERE type='table' AND name IN ('plans','saga_instances','saga_steps','saga_events') ORDER BY name`
      )
      .all()
      .map((r: any) => r.name);
    const status = {
      server: "SAGA MCP Server",
      version: "1.0.0",
      status: tables.length === 4 ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      dbTables: tables,
    };

    return {
      content: [
        {
          type: "text",
          text: `🎉 SAGA MCP Server health check\n\n${JSON.stringify(status, null, 2)}`
        }
      ]
    };
  }
}

export default TestConnectionTool;