import { MCPTool } from "mcp-framework";
import { z } from "zod";

interface GetExecutionStatusInput {
  execution_id: string;
  include_step_details?: boolean;
}

class GetExecutionStatusTool extends MCPTool<GetExecutionStatusInput> {
  name = "get_execution_status";
  description = "실행 중인 도구 체인의 현재 상태 조회";

  schema = {
    execution_id: {
      type: z.string(),
      description: "조회할 실행 ID",
    },
    include_step_details: {
      type: z.boolean().optional(),
      description: "단계별 상세 정보 포함",
    },
  };

  async execute(input: GetExecutionStatusInput) {
    const { execution_id, include_step_details = false } = input;
    
    // TODO: 실제 SAGA Manager에서 상태 조회
    // const saga = await this.sagaManager.getSAGA(execution_id);
    
    // 임시 Mock 데이터 - 실제로는 저장소에서 조회
    const mockStatus = this.getMockExecutionStatus(execution_id);
    
    if (!mockStatus) {
      return {
        content: [
          {
            type: "text",
            text: `❌ 실행 ID '${execution_id}'를 찾을 수 없습니다.\n\n` +
                  `올바른 실행 ID인지 확인하거나 execute_tool_chain 도구로 새로운 실행을 시작하세요.`
          }
        ]
      };
    }
    
    let statusText = `📊 실행 상태 조회 결과\n\n` +
                     `Execution ID: ${execution_id}\n` +
                     `계획명: ${mockStatus.plan_name || mockStatus.plan_id}\n` +
                     `상태: ${this.getStatusEmoji(mockStatus.status)} ${mockStatus.status}\n` +
                     `현재 단계: ${mockStatus.current_step}\n` +
                     `진행률: ${mockStatus.progress}\n` +
                     `시작 시간: ${mockStatus.started_at}\n`;
    
    if (mockStatus.estimated_completion) {
      statusText += `예상 완료: ${mockStatus.estimated_completion}\n`;
    }

    if (mockStatus.completed_at) {
      statusText += `완료 시간: ${mockStatus.completed_at}\n`;
    }

    if (mockStatus.error) {
      statusText += `⚠️ 오류: ${mockStatus.error}\n`;
    }
    
    if (include_step_details && mockStatus.steps) {
      statusText += `\n📋 단계별 상세 정보:\n`;
      mockStatus.steps.forEach((step: any, i: number) => {
        const stepEmoji = this.getStepStatusEmoji(step.status);
        statusText += `${i+1}. ${stepEmoji} ${step.name}\n`;
        statusText += `   상태: ${step.status}\n`;
        statusText += `   도구: ${step.tool_name}\n`;
        
        if (step.started_at) {
          statusText += `   시작: ${step.started_at}\n`;
        }
        
        if (step.completed_at) {
          const duration = new Date(step.completed_at).getTime() - new Date(step.started_at).getTime();
          statusText += `   완료: ${step.completed_at} (${duration}ms)\n`;
        }
        
        if (step.result) {
          statusText += `   결과: ${JSON.stringify(step.result)}\n`;
        }
        
        if (step.error) {
          statusText += `   ❌ 오류: ${step.error}\n`;
        }
        
        statusText += '\n';
      });
    }

    // 다음 액션 제안
    if (mockStatus.status === 'running') {
      statusText += `\n💡 실행이 진행 중입니다. 잠시 후 다시 상태를 확인하세요.`;
    } else if (mockStatus.status === 'completed') {
      statusText += `\n✅ 모든 단계가 성공적으로 완료되었습니다!`;
    } else if (mockStatus.status === 'failed') {
      statusText += `\n❌ 실행이 실패했습니다. 보상 트랜잭션이 필요할 수 있습니다.`;
    }
    
    return {
      content: [
        {
          type: "text",
          text: statusText
        }
      ]
    };
  }

  private getMockExecutionStatus(executionId: string): any {
    // 실제로는 ExecuteToolChainTool에서 저장한 상태를 조회해야 함
    // 여기서는 시간 기반으로 진행 상황을 시뮬레이션
    const createdTime = this.extractTimestampFromId(executionId);
    const elapsed = Date.now() - createdTime;
    
    if (elapsed < 1000) {
      return {
        execution_id: executionId,
        plan_id: 'plan_example_123',
        plan_name: "여행 예약 워크플로우",
        status: "running",
        current_step: "initializing",
        progress: "0/3 steps",
        started_at: new Date(createdTime).toISOString(),
        estimated_completion: new Date(createdTime + 10000).toISOString(),
        steps: [
          { step_id: "search_flights", name: "항공편 검색", status: "pending", tool_name: "flight_search" },
          { step_id: "book_hotel", name: "호텔 예약", status: "pending", tool_name: "hotel_booking" },
          { step_id: "reserve_transport", name: "교통수단 예약", status: "pending", tool_name: "transport_booking" }
        ]
      };
    } else if (elapsed < 3000) {
      return {
        execution_id: executionId,
        plan_id: 'plan_example_123',
        plan_name: "여행 예약 워크플로우",
        status: "running",
        current_step: "search_flights",
        progress: "1/3 steps",
        started_at: new Date(createdTime).toISOString(),
        estimated_completion: new Date(createdTime + 10000).toISOString(),
        steps: [
          {
            step_id: "search_flights", 
            name: "항공편 검색", 
            status: "running",
            tool_name: "flight_search",
            started_at: new Date(createdTime + 1000).toISOString()
          },
          { step_id: "book_hotel", name: "호텔 예약", status: "pending", tool_name: "hotel_booking" },
          { step_id: "reserve_transport", name: "교통수단 예약", status: "pending", tool_name: "transport_booking" }
        ]
      };
    } else if (elapsed < 6000) {
      return {
        execution_id: executionId,
        plan_id: 'plan_example_123',
        plan_name: "여행 예약 워크플로우",
        status: "running",
        current_step: "book_hotel",
        progress: "1/3 steps completed",
        started_at: new Date(createdTime).toISOString(),
        estimated_completion: new Date(createdTime + 10000).toISOString(),
        steps: [
          {
            step_id: "search_flights",
            name: "항공편 검색",
            status: "completed",
            tool_name: "flight_search",
            started_at: new Date(createdTime + 1000).toISOString(),
            completed_at: new Date(createdTime + 3000).toISOString(),
            result: { flight_count: 5, selected: "KE1234" }
          },
          {
            step_id: "book_hotel",
            name: "호텔 예약",
            status: "running",
            tool_name: "hotel_booking",
            started_at: new Date(createdTime + 3500).toISOString()
          },
          { step_id: "reserve_transport", name: "교통수단 예약", status: "pending", tool_name: "transport_booking" }
        ]
      };
    } else {
      return {
        execution_id: executionId,
        plan_id: 'plan_example_123',
        plan_name: "여행 예약 워크플로우",
        status: "completed",
        current_step: "finished",
        progress: "3/3 steps completed",
        started_at: new Date(createdTime).toISOString(),
        completed_at: new Date(createdTime + 9000).toISOString(),
        steps: [
          {
            step_id: "search_flights",
            name: "항공편 검색",
            status: "completed",
            tool_name: "flight_search",
            started_at: new Date(createdTime + 1000).toISOString(),
            completed_at: new Date(createdTime + 3000).toISOString(),
            result: { flight_count: 5, selected: "KE1234" }
          },
          {
            step_id: "book_hotel",
            name: "호텔 예약",
            status: "completed",
            tool_name: "hotel_booking",
            started_at: new Date(createdTime + 3500).toISOString(),
            completed_at: new Date(createdTime + 6000).toISOString(),
            result: { hotel: "Lotte Hotel", confirmation: "HTL-456" }
          },
          {
            step_id: "reserve_transport",
            name: "교통수단 예약",
            status: "completed",
            tool_name: "transport_booking",
            started_at: new Date(createdTime + 6500).toISOString(),
            completed_at: new Date(createdTime + 9000).toISOString(),
            result: { transport: "KTX", ticket: "TRN-789" }
          }
        ]
      };
    }
  }

  private extractTimestampFromId(executionId: string): number {
    const match = executionId.match(/exec_(\d+)_/);
    return match ? parseInt(match[1]) : Date.now() - 10000;
  }

  private getStatusEmoji(status: string): string {
    const statusEmojis: Record<string, string> = {
      'planned': '📋',
      'running': '⚡',
      'paused': '⏸️',
      'completed': '✅',
      'failed': '❌',
      'compensating': '🔄',
      'compensated': '↩️'
    };
    return statusEmojis[status] || '❓';
  }

  private getStepStatusEmoji(status: string): string {
    const stepEmojis: Record<string, string> = {
      'pending': '⏳',
      'running': '⚡',
      'completed': '✅',
      'failed': '❌',
      'compensated': '↩️'
    };
    return stepEmojis[status] || '❓';
  }
}

export default GetExecutionStatusTool;