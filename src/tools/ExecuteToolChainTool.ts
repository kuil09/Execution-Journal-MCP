import { MCPTool } from "mcp-framework";
import { z } from "zod";

interface ExecuteToolChainInput {
  plan_id: string;
  context?: Record<string, any>;
  execution_options?: {
    auto_compensate?: boolean;
    pause_on_error?: boolean;
  };
}

class ExecuteToolChainTool extends MCPTool<ExecuteToolChainInput> {
  name = "execute_tool_chain";
  description = "계획된 도구 체인을 실행하고 진행 상황 추적";

  schema = {
    plan_id: {
      type: z.string(),
      description: "실행할 계획 ID",
    },
    context: {
      type: z.record(z.any()).optional(),
      description: "실행 컨텍스트",
    },
    execution_options: {
      type: z.object({
        auto_compensate: z.boolean().optional(),
        pause_on_error: z.boolean().optional(),
      }).optional(),
      description: "실행 옵션",
    },
  };

  async execute(input: ExecuteToolChainInput) {
    const { plan_id, context = {}, execution_options = {} } = input;
    
    // SAGA 인스턴스 생성
    const executionId = `exec_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    
    // TODO: 실제 SAGA Manager를 통한 실행 시작
    // const sagaInstance = await this.sagaManager.createSAGA(plan_id, context);
    // this.sagaManager.executeAsync(sagaInstance.id, execution_options);
    
    // 임시 구현 - 실제 실행 시뮬레이션
    const mockExecution = {
      execution_id: executionId,
      plan_id: plan_id,
      status: 'started',
      current_step: 'initializing',
      progress: '0/3 steps',
      started_at: new Date().toISOString(),
      steps: [
        {
          step_id: 'search_flights',
          name: '항공편 검색',
          status: 'pending',
          tool_name: 'flight_search'
        },
        {
          step_id: 'book_hotel',
          name: '호텔 예약',
          status: 'pending',
          tool_name: 'hotel_booking'
        },
        {
          step_id: 'reserve_transport',
          name: '교통수단 예약',
          status: 'pending',
          tool_name: 'transport_booking'
        }
      ]
    };
    
    // 실행 상태를 메모리에 저장 (임시)
    this.storeExecutionState(executionId, mockExecution);
    
    // 첫 번째 단계 시작 시뮬레이션
    setTimeout(() => {
      this.simulateStepExecution(executionId, 'search_flights');
    }, 1000);
    
    return {
      content: [
        {
          type: "text", 
          text: `⚡ 도구 체인 실행이 시작되었습니다!\n\n` +
                `Execution ID: ${executionId}\n` +
                `Plan ID: ${plan_id}\n` +
                `상태: ${mockExecution.status}\n` +
                `진행률: ${mockExecution.progress}\n\n` +
                `실행 옵션:\n` +
                `- 자동 보상: ${execution_options.auto_compensate ?? true}\n` +
                `- 오류 시 일시정지: ${execution_options.pause_on_error ?? false}\n\n` +
                `📊 get_execution_status 도구로 진행 상황을 확인하세요.\n` +
                `🔧 Execution ID: ${executionId} 를 사용하여 상태를 조회할 수 있습니다.`
        }
      ]
    };
  }

  private executionStates = new Map<string, any>();

  private storeExecutionState(executionId: string, state: any) {
    this.executionStates.set(executionId, state);
  }

  private simulateStepExecution(executionId: string, stepId: string) {
    const state = this.executionStates.get(executionId);
    if (!state) return;

    // 단계 상태 업데이트
    const step = state.steps.find((s: any) => s.step_id === stepId);
    if (step) {
      step.status = 'running';
      step.started_at = new Date().toISOString();
      state.current_step = stepId;
      state.progress = `${state.steps.filter((s: any) => s.status === 'completed').length}/${state.steps.length} steps`;
    }

    this.executionStates.set(executionId, state);

    // 2초 후 완료 시뮬레이션
    setTimeout(() => {
      this.completeStepExecution(executionId, stepId);
    }, 2000);
  }

  private completeStepExecution(executionId: string, stepId: string) {
    const state = this.executionStates.get(executionId);
    if (!state) return;

    const step = state.steps.find((s: any) => s.step_id === stepId);
    if (step) {
      step.status = 'completed';
      step.completed_at = new Date().toISOString();
      step.result = { success: true, message: `${step.name} 완료됨` };
    }

    // 다음 단계 찾기
    const nextStep = state.steps.find((s: any) => s.status === 'pending');
    if (nextStep) {
      setTimeout(() => {
        this.simulateStepExecution(executionId, nextStep.step_id);
      }, 500);
    } else {
      // 모든 단계 완료
      state.status = 'completed';
      state.current_step = 'finished';
      state.progress = `${state.steps.length}/${state.steps.length} steps`;
      state.completed_at = new Date().toISOString();
    }

    this.executionStates.set(executionId, state);
  }

  // 외부에서 실행 상태를 조회할 수 있도록 하는 메서드
  static getExecutionState(executionId: string): any {
    // 실제로는 싱글톤 패턴이나 전역 저장소를 사용해야 함
    return ExecuteToolChainTool.prototype.executionStates?.get(executionId);
  }
}

export default ExecuteToolChainTool;