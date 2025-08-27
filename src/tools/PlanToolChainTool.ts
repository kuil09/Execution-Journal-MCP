import { MCPTool } from "mcp-framework";
import { z } from "zod";
import { PlanRepository } from "../storage/plan-repository.js";

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
  description = "Generate AI goal-based tool execution chain plans";

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
    
    // AI goal analysis and tool chain generation logic
    const planId = `plan_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    
    // Simple example - travel booking scenario
    const steps = this.generateStepsForGoal(goal, available_tools);
    
    const plan = {
      plan_id: planId,
      name: `Generated plan for: ${goal}`,
      steps: steps,
      estimated_duration: this.calculateDuration(steps),
      risk_assessment: this.assessRisk(steps)
    };
    
    // persist plan
    const repo = new PlanRepository();
    repo.save({ plan_id: planId, name: plan.name, steps, created_at: new Date().toISOString() });
    
    return {
      content: [
        {
          type: "text",
          text: `📋 Tool chain plan has been generated!\n\n` +
                `Plan ID: ${planId}\n` +
                `Goal: ${goal}\n` +
                `Number of steps: ${steps.length}\n` +
                `Estimated duration: ${plan.estimated_duration}\n\n` +
                `Plan steps:\n${steps.map((step: any, i: number) => `${i+1}. ${step.name || step.tool_name}`).join('\n')}\n\n` +
                `Next step: Execute this plan using the execute_tool_chain tool.`
        }
      ]
    };
  }

  private generateStepsForGoal(goal: string, available_tools: string[]) {
    // Simple heuristic-based plan generation
    // In practice, more sophisticated AI-based plan generation logic is needed
    
    if (goal.includes('travel') || goal.includes('business_trip')) {
      return [
        {
          id: 'search_flights',
          name: 'Flight Search',
          tool_name: available_tools.find(t => t.includes('flight')) || 'flight_search',
          parameters: {},
          compensation: {
            tool_name: 'flight_cancel',
            parameters: {},
            auto_execute: true
          }
        },
        {
          id: 'book_hotel',
          name: 'Hotel Booking',
          tool_name: available_tools.find(t => t.includes('hotel')) || 'hotel_booking',
          parameters: {},
          depends_on: ['search_flights'],
          compensation: {
            tool_name: 'hotel_cancel',
            parameters: {},
            auto_execute: true
          }
        },
        {
          id: 'reserve_transport',
          name: 'Transport Reservation',
          tool_name: available_tools.find(t => t.includes('transport')) || 'transport_booking',
          parameters: {},
          depends_on: ['search_flights']
        }
      ];
    }

    if (goal.includes('deploy') || goal.includes('deployment')) {
      return [
        {
          id: 'run_tests',
          name: 'Run Tests',
          tool_name: 'run_tests',
          parameters: {}
        },
        {
          id: 'build_project',
          name: 'Build Project',
          tool_name: 'build_project',
          parameters: {},
          depends_on: ['run_tests']
        },
        {
          id: 'deploy_staging',
          name: 'Deploy to Staging',
          tool_name: 'deploy_staging',
          parameters: {},
          depends_on: ['build_project']
        },
        {
          id: 'deploy_production',
          name: 'Deploy to Production',
          tool_name: 'deploy_production',
          parameters: {},
          depends_on: ['deploy_staging']
        }
      ];
    }
    
    // Default single step plan
    return [
      {
        id: 'execute_goal',
        name: goal,
        tool_name: available_tools[0] || 'generic_executor',
        parameters: { goal }
      }
    ];
  }

  private calculateDuration(steps: any[]): string {
    return `approximately ${steps.length * 2} minutes`;
  }

  private assessRisk(steps: any[]): 'low' | 'medium' | 'high' {
    if (steps.length > 5) return 'high';
    if (steps.length > 3) return 'medium';
    return 'low';
  }
}

export default PlanToolChainTool;