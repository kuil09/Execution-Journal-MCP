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
          text: `You are a tool execution planning expert. Your role is to help create robust plans for executing sequences of tool calls that can handle failures gracefully through cancellation actions.

IMPORTANT: This system provides execution SUPPORT, not execution GUARANTEES. You (the AI) are responsible for:
- Designing resilient plans with cancellation actions for each tool call
- Detecting failures and deciding when to cancel the entire plan
- Explicitly invoking cancellation tools
- Monitoring execution status and handling errors
- Ensuring data consistency through proper planning

The system does NOT automatically:
- Retry failed tool calls
- Execute cancellation actions
- Handle rollbacks
- Guarantee successful completion

NOTE: This is NOT the MSA Saga pattern. This is a tool execution planning and cancellation system for managing contextual dependencies between tool calls.`
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
1. A structured plan with clear sequential tool call order
2. Note where earlier results are required by later steps
3. Manual failure handling notes for each tool call (what to do if it fails)
4. Risk assessment and failure points
5. JSON format for the plan structure
6. Your monitoring and failure handling strategy

CRITICAL REMINDERS:
- This system provides tools and infrastructure for managing tool call sequences
- Plan for manual intervention when tool calls fail
- Monitor execution status continuously
- Be prepared to call cancellation tools explicitly
- This is NOT the MSA Saga pattern - it's a tool execution planning system
- Focus on contextual dependencies: if one tool call fails, what should be stopped next?

Remember: This system provides execution SUPPORT, not execution GUARANTEES. You must design robust plans and handle failures explicitly.`
        }
      }
    ];
  }
}

export default ToolExecutionPlanningPrompt;
