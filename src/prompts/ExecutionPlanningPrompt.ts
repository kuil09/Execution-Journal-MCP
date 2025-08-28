import { MCPPrompt } from "mcp-framework";
import { z } from "zod";

interface ToolExecutionPlanningInput {
  goal: string;
  complexity?: "simple" | "medium" | "complex";
  domain?: string;
}

export default class ExecutionPlanningPrompt {
  name = "execution_planning_prompt";
  description = "AI guidance for creating execution plans with cancellability metadata and failure policies";

  async generateMessages({ goal, complexity = "medium", domain = "general" }: {
    goal: string;
    complexity?: "simple" | "medium" | "complex";
    domain?: string;
  }) {
    const complexityGuidance: Record<string, string> = {
      simple: "Focus on a few sequential tool calls with clear failure handling.",
      medium: "Sequence tool calls carefully; define when to stop on failure.",
      complex: "Break into phases, but keep execution sequential; document failure handling."
    };

    return [
      {
        role: "system",
        content: {
          type: "text",
          text: `You are an AI assistant helping to create execution plans for sequential tool calls. 

## Your Responsibilities

1. **Plan Design**: Create sequential plans with clear step dependencies
2. **Cancellability Metadata**: Assign cancellability to each step:
   - "reversible": Can be completely undone
   - "partially-reversible": Can be partially undone
   - "irreversible": Cannot be undone
3. **Failure Policy Design**: Define how failures in one step affect other steps:
   - Which steps should be cancelled if this step fails?
   - What action should be taken with affected steps?
   - Why was this policy chosen?
4. **Ledger Recording**: Design plans that work with the journal system

## Plan Structure

Each plan should have:
- Clear name and description
- Sequential steps with tool names and parameters
- Cancellability metadata for each step
- Failure policies for handling step failures
- Consideration of contextual dependencies

## Failure Policy Options

- **cancel_all**: Cancel all remaining steps when this step fails
- **cancel_dependent**: Cancel only steps that depend on this step
- **continue_others**: Continue with other steps even if this fails
- **manual_decision**: Require manual decision on how to proceed

## Best Practices

- Keep steps focused and atomic
- Consider what happens if each step fails
- Design failure policies that make business sense
- Record manual actions when needed
- Use the journal system to track decisions

Remember: This system provides execution support, not execution guarantees. You must monitor execution and record all decisions/actions.`
        }
      },
      {
        role: "user",
        content: {
          type: "text",
          text: `Create an execution plan for: "${goal}"

Context:
- Complexity: ${complexity}
- Domain: ${domain}

${complexityGuidance[complexity]}

Please provide:
1. A structured sequential plan with clear tool call order
2. Cancellability metadata for each step (reversible/partially-reversible/irreversible)
3. Failure policies for each step (how failures affect other steps)
4. Manual failure handling notes for each tool call
5. Risk assessment and failure points
6. JSON format for the plan structure
7. Your monitoring and ledger recording strategy

CRITICAL REMINDERS:
- Always include failure policies for critical steps
- Consider business logic when designing policies
- Document the reasoning behind each policy
- Test failure scenarios during planning
- Record all policy applications in the journal`
        }
      }
    ];
  }
}
