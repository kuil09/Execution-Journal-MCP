import { MCPTool } from "mcp-framework";
import { z } from "zod";

interface PlanToolChainInput {
  goal: string;
  available_tools?: string[];
  constraints?: {
    max_steps?: number;
    timeout_minutes?: number;
    parallel_allowed?: boolean;
  };
}

class PlanToolChainTool extends MCPTool<PlanToolChainInput> {
  name = "plan_tool_chain";
  description = "Get guidance and examples for designing AI-directed tool execution plans. For complex workflows, use save_plan tool directly.";

  schema = {
    goal: {
      type: z.string(),
      description: "Goal to achieve",
    },
    available_tools: {
      type: z.array(z.string()).optional(),
      description: "List of available tools",
    },
    constraints: {
      type: z.object({
        max_steps: z.number().optional(),
        timeout_minutes: z.number().optional(),
        parallel_allowed: z.boolean().optional(),
      }).optional(),
      description: "Execution constraints",
    },
  };

  async execute(input: PlanToolChainInput) {
    const { goal, available_tools = [], constraints = {} } = input;
    
    return {
      content: [
        {
          type: "text",
          text: this.generatePlanningGuidance(goal, available_tools, constraints)
        }
      ]
    };
  }

  private generatePlanningGuidance(goal: string, available_tools: string[], constraints: any): string {
    const toolsSection = available_tools.length > 0 
      ? `## 🛠️ **Available Tools**\n${available_tools.map(tool => `- ${tool}`).join('\n')}\n\n`
      : '';
    
    const constraintsSection = (constraints.max_steps || constraints.timeout_minutes || constraints.parallel_allowed !== undefined)
      ? `## ⚠️ **Constraints**\n${
          constraints.max_steps ? `- Max steps: ${constraints.max_steps}\n` : ''
        }${
          constraints.timeout_minutes ? `- Timeout: ${constraints.timeout_minutes} minutes\n` : ''
        }${
          constraints.parallel_allowed !== undefined 
            ? `- Parallel execution: ${constraints.parallel_allowed ? 'Allowed' : 'Not allowed'}\n`
            : ''
        }\n`
      : '';

    return `
🎯 **Planning Guidance for: ${goal}**

## 📋 **How to Design Your Plan**

1. **Use \`save_plan\` tool** for complex workflows with dependencies
2. **Use \`plan_tool_chain\` tool** for simple, sequential workflows
3. **Consider failure scenarios** and define compensation steps

${toolsSection}${constraintsSection}## 📝 **Plan Structure Examples**

### Simple Sequential Plan:
\`\`\`json
{
  "name": "Simple Task",
  "steps": [
    {
      "id": "step1",
      "name": "First Step",
      "tool_name": "tool1",
      "parameters": {}
    }
  ]
}
\`\`\`

### Complex Plan with Dependencies:
\`\`\`json
{
  "name": "Complex Workflow",
  "steps": [
    {
      "id": "step1",
      "name": "Prerequisite",
      "tool_name": "tool1",
      "parameters": {},
      "compensation": {
        "tool_name": "undo_tool1",
        "parameters": {},
        "auto_execute": true
      }
    },
    {
      "id": "step2",
      "name": "Dependent Step",
      "tool_name": "tool2",
      "parameters": {},
      "depends_on": ["step1"],
      "retry_policy": {
        "max_attempts": 3,
        "backoff_strategy": "exponential"
      }
    }
  ]
}
\`\`\`

## 🚀 **Next Steps**

1. **Design your plan** using the examples above
2. **Save your plan** using \`save_plan\` tool
3. **Execute your plan** using \`execute_tool_chain\` tool
4. **Monitor progress** using \`get_execution_status\` tool

## ⚠️ **Important Notes**

- **Dependencies** are defined but currently executed sequentially
- **Compensation** steps are defined but not automatically executed
- **Retry policies** are defined but not yet implemented
- For production use, design robust error handling and compensation strategies
`;
  }
}

export default PlanToolChainTool;