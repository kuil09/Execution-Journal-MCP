# SAGA MCP Server - TODO

## 🎯 Project Overview
**Goal**: Build a bulletproof AI tool execution system using SAGA pattern that handles failures, tracks progress, and maintains state across chat sessions.

## ✅ Completed (Phase 1 & 2)

### Phase 1: Foundation ✅ DONE
- [x] MCP Framework CLI installed and project created
- [x] Additional dependencies installed (better-sqlite3, uuid, winston, zod)  
- [x] SAGA directory structure created
- [x] Core SAGA types defined (`src/types/saga.ts`)
- [x] TestConnectionTool implemented and working
- [x] Server builds and runs successfully

### Phase 2: Core MCP Tools ✅ DONE  
- [x] **PlanToolChainTool** - AI goal-based tool chain planning
  - Smart step generation for travel/deployment scenarios
  - Dependency management and compensation planning
- [x] **ExecuteToolChainTool** - Asynchronous tool chain execution  
  - Mock execution with real-time progress tracking
  - Auto-compensation and error handling options
- [x] **GetExecutionStatusTool** - Real-time execution status monitoring
  - Step-by-step detailed progress display
  - Dynamic status simulation based on time

## 🚧 Next Steps (Priority Order)

### Phase 3: SAGA Backend Implementation ✅ COMPLETED
- [x] **Core SAGA Manager** (`src/core/saga-manager.ts`)
  - [x] SAGAManager class with create, execute methods (pause/resume/compensate not yet implemented)
  - [x] Basic event sourcing implementation (database storage)
  - [x] Step dependency definition (stored in plan but not executed with DAG logic)
  - [x] Compensation transaction definition (stored in plan but not automatically executed)

- [x] **Storage Layer** (`src/storage/`)
  - [x] SQLite event store implementation (`sqlite-event-store.ts`)  
  - [x] SAGA instance persistence (`saga-repository.ts`)
  - [x] Execution context serialization/deserialization
  - [x] Cross-session state recovery

- [ ] **Tool Coordinator** (`src/core/tool-coordinator.ts`)
  - [ ] Real MCP tool discovery and invocation
  - [ ] Tool result validation and error handling
  - [ ] Retry logic with exponential backoff
  - [ ] Tool timeout management

### Phase 4: AI-Directed Planning & Execution Control (HIGH PRIORITY)
- [x] **AI-Directed Plan Management**
  - [x] `save_plan` tool - AI creates custom plan structures
  - [x] `list_plans` tool - Browse saved plans
  - [x] `update_plan` tool - Modify existing plans
  - [x] `delete_plan` tool - Remove unused plans

- [x] **Enhanced Execution Control**
  - [x] `pause_execution` tool - Pause running executions
  - [x] `resume_execution` tool - Resume paused executions
  - [x] `cancel_execution` tool - Cancel running executions
  - [x] Execution state management (paused, cancelled, etc.)

- [ ] **Advanced Plan Structures**
  - [ ] DAG-based workflow support with dependencies
  - [ ] Conditional execution logic
  - [ ] Parallel step execution
  - [ ] Compensation strategy definition

- [ ] **Context Management**
  - [ ] `save_execution_context` tool
  - [ ] `load_execution_context` tool  
  - [ ] Context variables and state persistence
  - [ ] Cross-session continuity testing

### Phase 5: Advanced Features & Production Readiness (MEDIUM PRIORITY)
- [ ] **Compensation System**
  - [ ] Automatic rollback tool generation
  - [ ] Manual compensation step definition
  - [ ] Partial failure recovery strategies

- [ ] **Monitoring & Observability**
  - [ ] Winston logger integration
  - [ ] Execution metrics and timing
  - [ ] Error tracking and alerting
  - [ ] Performance monitoring

- [ ] **Testing**
  - [ ] Unit tests for all SAGA components
  - [ ] Integration tests for tool chains
  - [ ] End-to-end scenario testing
  - [ ] Failure recovery testing

### Phase 6: Production Readiness (LOW PRIORITY)
- [ ] **Documentation**
  - [ ] API documentation with MCP protocol details
  - [ ] AI usage examples and tutorials
  - [ ] Best practices guide for AI agents
  - [ ] Troubleshooting guide

- [ ] **Optimization**
  - [ ] Resource pooling and caching
  - [ ] Performance tuning and scaling
  - [ ] Security hardening
  - [ ] Deployment automation

## 🧪 Test Scenarios

### Current Working Flow (Phase 3)
```
1. test_saga_connection → ✅ Server connection verified + DB health check
2. plan_tool_chain("Busan business trip") → 📋 3-step plan generated + DB persistence
3. execute_tool_chain(plan_id) → ⚡ SAGA execution started with SQLite storage
4. get_execution_status(execution_id) → 📊 Real-time progress from database
```

### Target Complete Flow (Phase 4+)
```
1. AI creates custom plan → save_plan with DAG structure
2. AI executes saved plan → execute_tool_chain with plan_id
3. AI controls execution → pause/resume/cancel as needed
4. AI monitors progress → real-time status and context management
```

## 📁 Current Project Structure
```
saga-mcp-server/
├── src/
│   ├── tools/                   # ✅ 11 MCP tools implemented
│   │   ├── TestConnectionTool.ts
│   │   ├── PlanToolChainTool.ts
│   │   ├── ExecuteToolChainTool.ts
│   │   ├── GetExecutionStatusTool.ts
│   │   ├── SavePlanTool.ts      # ✅ AI creates custom plans
│   │   ├── ListPlansTool.ts     # ✅ Browse saved plans
│   │   ├── UpdatePlanTool.ts    # ✅ Modify existing plans
│   │   ├── DeletePlanTool.ts    # ✅ Remove unused plans
│   │   ├── PauseExecutionTool.ts # ✅ Pause running executions
│   │   ├── ResumeExecutionTool.ts # ✅ Resume paused executions
│   │   └── CancelExecutionTool.ts # ✅ Cancel running executions
│   ├── types/                   # ✅ SAGA type definitions (basic)
│   │   └── saga.ts
│   ├── core/                    # ✅ SAGA engine + DB manager (basic)
│   │   ├── saga-manager.ts
│   │   └── db.ts
│   ├── storage/                 # ✅ Persistence layer
│   │   ├── plan-repository.ts
│   │   └── saga-repository.ts
│   ├── utils/                   # 🚧 Next: Helper utilities
│   └── index.ts
├── data/                        # ✅ SQLite database (auto-created)
├── examples/                    # Usage examples
├── tests/                       # Test files
└── ...
```

## 🔧 Development Commands
```bash
npm run build    # Build and validate tools
npm run start    # Start MCP server
npm run dev      # Build + start combined
```

## 🎯 Success Metrics
- [x] ✅ "Book a trip to Jeju Island" → Basic workflow execution with SQLite persistence
- [x] 🔄 Compensation transaction definition (structure defined, execution pending)
- [x] 💾 Cross-session context recovery via SQLite database
- [x] 📊 Real-time progress tracking from database
- [x] 🛡️ Basic error detection and status tracking (failure handling limited)
- [x] 🌐 Multi-transport support (stdio, SSE, HTTP Stream)
- [x] 🎯 AI-directed custom plan creation and management
- [x] ⏸️ Execution control (pause/resume/cancel)
- [ ] 🔗 DAG-based workflow execution (dependencies stored but ignored)
- [ ] 📝 Advanced context management and persistence

## 📅 Milestones
- **Week 1**: ✅ Phase 3 - SAGA Backend (COMPLETED)
- **Week 2**: ✅ Phase 4 - AI-Directed Planning (COMPLETED)
- **Week 2-3**: ✅ Phase 4 - Enhanced Execution Control (COMPLETED)
- **Week 3**: Phase 5 - Advanced Features & Production Readiness (6 hours)
- **Week 4**: Phase 6 - Production Polish & Documentation (4 hours)

## 🚀 **Current Status: Phase 4 (AI-Directed Planning) PARTIALLY COMPLETED!**

### ✅ **What's Working Now:**
- **11 MCP Tools**: All tools successfully loaded and validated (4 original + 4 plan management + 3 exec control)
- **SQLite Database**: Automatic table creation and data persistence
- **SAGA Manager**: Basic execution lifecycle management (create, execute, pause, resume, cancel, monitor)
- **Cross-session State**: Execution state persists across server restarts
- **Health Monitoring**: Real-time database health checks
- **Multi-Transport Support**: stdio, SSE, HTTP Stream all supported
- **CLI Transport Selection**: Choose transport method via command line arguments
- **Plan Management**: AI can create, list, update, and delete custom plans

### 🔄 **Next Priority (Phase 4 Remaining):**
- **Advanced Plan Management**: DAG-based workflow execution (dependencies currently stored but ignored)
- **Context Management**: Cross-session execution context persistence

---
*Last Updated: 2025-08-27*
*Status: Phase 4 (AI-Directed Planning) PARTIALLY COMPLETED, Enhanced Execution Control Completed*

## 🔄 **Key Insights from Discussion:**
- **MCP Metadata**: Already provided by MCP Framework automatically - no need to implement
- **AI-Directed Planning**: ✅ COMPLETED - AI can now create, save, and manage custom plan structures
- **Current Limitation**: `PlanToolChainTool` still uses hardcoded logic, but new `save_plan` tool allows AI-defined plans
- **Focus Areas**: Execution control (pause/resume/cancel), DAG-based workflow execution, context management
- **Important Note**: This is a "execution support" system, not a "guaranteed execution" system. AI must design robust plans and handle failures appropriately.

## ⚠️ **Current Limitations & What AI Should Know**

### **실행 보장이 아닌 실행 지원 시스템**
- **DAG 의존성**: `depends_on` 필드는 저장되지만 실행 시 무시됨 (순차 실행)
- **보상 트랜잭션**: `compensation` 정의는 저장되지만 자동 실행 안됨
- **재시도 정책**: `retry_policy` 정의는 저장되지만 실제 적용 안됨
- **실제 도구 실행**: 현재는 500ms 대기만 함 (실제 MCP 도구 호출 안됨)

### **AI가 책임져야 할 부분**
- **플랜 설계**: 의존성, 보상 전략, 재시도 정책을 명시적으로 정의
- **실패 처리**: 각 스텝의 실패 시나리오와 복구 방법을 계획
- **검증**: 플랜의 논리적 일관성과 실행 가능성 검증
- **모니터링**: 실행 상태를 지속적으로 확인하고 필요시 개입

### **현재 제공하는 것**
- **플랜 저장/관리**: AI가 만든 복잡한 워크플로우를 DB에 저장
- **실행 추적**: 각 스텝의 상태와 진행 상황을 실시간 모니터링
- **상태 지속성**: 서버 재시작 후에도 실행 상태 복구
- **기본 오류 감지**: 스텝 실패 시 상태 기록 및 알림