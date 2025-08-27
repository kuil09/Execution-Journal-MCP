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
  description = "AI 목표를 기반으로 도구 실행 체인 계획 생성";

  schema = {
    goal: {
      type: z.string(),
      description: "달성하고자 하는 목표",
    },
    available_tools: {
      type: z.array(z.string()).optional(),
      description: "사용 가능한 도구 목록",
    },
    constraints: {
      type: z.object({
        max_steps: z.number().optional(),
        timeout_minutes: z.number().optional(),
        parallel_allowed: z.boolean().optional(),
      }).optional(),
      description: "실행 제약 조건",
    },
  };

  async execute(input: PlanToolChainInput) {
    const { goal, available_tools = [], constraints = {} } = input;
    
    // AI 목표 분석 및 도구 체인 생성 로직
    const planId = `plan_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    
    // 간단한 예시 - 여행 예약 시나리오
    const steps = this.generateStepsForGoal(goal, available_tools);
    
    const plan = {
      plan_id: planId,
      name: `Generated plan for: ${goal}`,
      steps: steps,
      estimated_duration: this.calculateDuration(steps),
      risk_assessment: this.assessRisk(steps)
    };
    
    return {
      content: [
        {
          type: "text",
          text: `📋 도구 체인 계획이 생성되었습니다!\n\n` +
                `Plan ID: ${planId}\n` +
                `목표: ${goal}\n` +
                `단계 수: ${steps.length}\n` +
                `예상 소요시간: ${plan.estimated_duration}\n\n` +
                `계획 단계:\n${steps.map((step: any, i: number) => `${i+1}. ${step.name || step.tool_name}`).join('\n')}\n\n` +
                `다음 단계: execute_tool_chain 도구로 이 계획을 실행하세요.`
        }
      ]
    };
  }

  private generateStepsForGoal(goal: string, available_tools: string[]) {
    // 간단한 휴리스틱 기반 계획 생성
    // 실제로는 더 정교한 AI 기반 계획 생성 로직 필요
    
    if (goal.includes('여행') || goal.includes('travel') || goal.includes('출장')) {
      return [
        {
          id: 'search_flights',
          name: '항공편 검색',
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
          name: '호텔 예약',
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
          name: '교통수단 예약',
          tool_name: available_tools.find(t => t.includes('transport')) || 'transport_booking',
          parameters: {},
          depends_on: ['search_flights']
        }
      ];
    }

    if (goal.includes('배포') || goal.includes('deploy')) {
      return [
        {
          id: 'run_tests',
          name: '테스트 실행',
          tool_name: 'run_tests',
          parameters: {}
        },
        {
          id: 'build_project',
          name: '프로젝트 빌드',
          tool_name: 'build_project',
          parameters: {},
          depends_on: ['run_tests']
        },
        {
          id: 'deploy_staging',
          name: '스테이징 배포',
          tool_name: 'deploy_staging',
          parameters: {},
          depends_on: ['build_project']
        },
        {
          id: 'deploy_production',
          name: '프로덕션 배포',
          tool_name: 'deploy_production',
          parameters: {},
          depends_on: ['deploy_staging']
        }
      ];
    }
    
    // 기본 단일 단계 계획
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
    return `약 ${steps.length * 2}분`;
  }

  private assessRisk(steps: any[]): 'low' | 'medium' | 'high' {
    if (steps.length > 5) return 'high';
    if (steps.length > 3) return 'medium';
    return 'low';
  }
}

export default PlanToolChainTool;