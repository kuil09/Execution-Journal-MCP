import { MCPPrompt } from "mcp-framework";
import { z } from "zod";

interface SagaPlanningInput {
  goal: string;
  complexity?: "simple" | "medium" | "complex";
  domain?: string;
}

class SagaPlanningPrompt extends MCPPrompt<SagaPlanningInput> {
  name = "saga-planning";
  description = "Provides comprehensive guidance for creating SAGA execution plans";

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

  async generateMessages({ goal, complexity = "medium", domain = "general" }: SagaPlanningInput) {
    const complexityGuidance: Record<string, string> = {
      simple: "For simple operations, focus on 2-3 sequential tool calls with basic error handling.",
      medium: "For medium complexity, consider tool call sequences and include compensation logic.",
      complex: "For complex workflows, break down into logical phases and ensure comprehensive rollback strategies."
    };

    return [
      {
        role: "system",
        content: {
          type: "text",
          text: `You are a tool execution planning expert. Your role is to help create robust plans for executing sequences of tool calls that can handle failures gracefully through compensation actions.

IMPORTANT: This system provides execution SUPPORT, not execution GUARANTEES. You (the AI) are responsible for:
- Designing resilient plans with compensation actions for each tool call
- Detecting failures and deciding when to cancel the entire plan
- Explicitly invoking cancellation/compensation tools
- Monitoring execution status and handling errors
- Ensuring data consistency through proper planning

The system does NOT automatically:
- Retry failed tool calls
- Execute compensation actions
- Handle rollbacks
- Guarantee successful completion

NOTE: This is NOT the MSA Saga pattern. This is a tool execution planning and cancellation system.`
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
1. A structured plan with clear tool call sequences
2. Dependencies between tool calls (if any) - Note: Currently executed sequentially
3. Compensation actions for each tool call - YOU must execute these manually
4. Risk assessment and failure points
5. JSON format for the plan structure
6. Your monitoring and failure handling strategy

CRITICAL REMINDERS:
- This system provides tools and infrastructure for managing tool call sequences
- Always include compensation actions for every tool call
- Plan for manual intervention when tool calls fail
- Monitor execution status continuously
- Be prepared to call cancellation tools explicitly
- This is NOT the MSA Saga pattern - it's a tool execution planning system

Remember: This system provides execution SUPPORT, not execution GUARANTEES. You must design robust plans and handle failures explicitly.`
        }
      }
    ];
  }
}

export default SagaPlanningPrompt;
