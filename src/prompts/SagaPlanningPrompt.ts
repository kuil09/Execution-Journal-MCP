import { MCPPrompt } from "mcp-framework";
import { z } from "zod";

interface ToolExecutionPlanningInput {
  goal: string;
  complexity?: "simple" | "medium" | "complex";
  domain?: string;
}

class ToolExecutionPlanningPrompt extends MCPPrompt<ToolExecutionPlanningInput> {
  name = "tool-execution-planning";
  description = "Provides comprehensive guidance for creating tool execution plans with contextual dependencies";

  schema = {
    goal: {
      type: z.string(),
      description: "The main objective or goal to achieve",
      required: true,
    },
    complexity: {
      type: z.enum(["simple", "medium", "complex"]),
      description: "Expected complexity level of the plan",
      required: false,
    },
    domain: {
      type: z.string(),
      description: "Domain or context of the operation (e.g., 'database', 'api', 'file-system')",
      required: false,
    },
  };

  async generateMessages({ goal, complexity = "medium", domain = "general" }: ToolExecutionPlanningInput) {
    const complexityGuidance: Record<string, string> = {
      simple: "Focus on a few sequential tool calls with clear error handling.",
      medium: "Sequence tool calls carefully; define when to stop on failure.",
      complex: "Break into phases, but keep execution sequential; document failure handling."
    };

    return [
      {
        role: "system",
        content: {
          type: "text",
          text: `You are a tool execution planning expert. Your role is to help create sequential plans for executing tool calls and record manual actions in a ledger.

IMPORTANT: This system provides execution SUPPORT, not execution GUARANTEES. You (the AI) are responsible for:
- Designing sequential plans with cancellability metadata for each tool call
- Detecting failures and deciding when to stop the entire plan
- Recording manual actions in the ledger
- Monitoring execution status and handling errors
- Ensuring data consistency through proper planning

The system does NOT automatically:
- Retry failed tool calls
- Execute compensation actions
- Handle rollbacks
- Guarantee successful completion

NOTE: This is NOT the MSA Saga pattern. This is a tool execution planning and ledger system for managing sequential tool calls.`
        }
      },
      {
        role: "user",
        content: {
          type: "text",
          text: `Create a tool execution plan for: "${goal}"

Context:
- Complexity: ${complexity}
- Domain: ${domain}

${complexityGuidance[complexity]}

Please provide:
1. A structured sequential plan with clear tool call order
2. Cancellability metadata for each step (reversible/partially-reversible/irreversible)
3. Manual failure handling notes for each tool call (what to do if it fails)
4. Risk assessment and failure points
5. JSON format for the plan structure
6. Your monitoring and ledger recording strategy

CRITICAL REMINDERS:
- This system provides tools and infrastructure for managing sequential tool call sequences
- Always include cancellability metadata for every tool call
- Plan for manual intervention when tool calls fail
- Monitor execution status continuously
- Be prepared to record actions in the ledger
- This is NOT the MSA Saga pattern - it's a tool execution planning and ledger system
- Focus on contextual dependencies: if one tool call fails, what should be stopped next?

Remember: This system provides execution SUPPORT, not execution GUARANTEES. You must design sequential plans and record actions in the ledger.`
        }
      }
    ];
  }
}

export default ToolExecutionPlanningPrompt;
