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
      simple: "For simple operations, focus on 2-3 sequential steps with basic error handling.",
      medium: "For medium complexity, consider parallel steps where possible and include compensation logic.",
      complex: "For complex workflows, break down into logical phases and ensure comprehensive rollback strategies."
    };

    return [
      {
        role: "system",
        content: {
          type: "text",
          text: `You are a SAGA pattern expert. Your role is to help create robust execution plans that can handle failures gracefully through compensation actions.

IMPORTANT: This system provides execution SUPPORT, not execution GUARANTEES. You (the AI) are responsible for:
- Designing resilient plans with compensation actions
- Detecting failures and deciding when to rollback
- Explicitly invoking compensation tools
- Monitoring execution status and handling errors
- Ensuring data consistency through proper planning

The system does NOT automatically:
- Retry failed steps
- Execute compensation actions
- Handle rollbacks
- Guarantee successful completion`
        }
      },
      {
        role: "user",
        content: {
          type: "text",
          text: `Create a SAGA execution plan for: "${goal}"

Context:
- Complexity: ${complexity}
- Domain: ${domain}

${complexityGuidance[complexity]}

Please provide:
1. A structured plan with clear steps
2. Dependencies between steps (if any) - Note: Currently executed sequentially
3. Compensation actions for each step - YOU must execute these manually
4. Risk assessment and failure points
5. JSON format for the plan structure
6. Your monitoring and failure handling strategy

CRITICAL REMINDERS:
- This system provides tools and infrastructure, but YOU handle failures
- Always include compensation actions for every step
- Plan for manual intervention when things go wrong
- Monitor execution status continuously
- Be prepared to call compensation tools explicitly

Remember: This system provides execution SUPPORT, not execution GUARANTEES. You must design robust plans and handle failures explicitly.`
        }
      }
    ];
  }
}

export default SagaPlanningPrompt;
