export default class ExecutionDocumentationResource {
  uri = "resource://execution-journal/documentation";
  name = "Execution Journal Documentation";
  description = "Comprehensive documentation for the execution journal system";
  mimeType = "text/markdown";

  async read() {
    const content = `# Execution Journal System Documentation

## Overview

The Execution Journal is an MCP server that helps AI coordinate sequential tool calls and maintain a durable record of execution workflows, decisions, and actions.

## Core Concept

This system acts as a **durable memo pad** for AI actions and decisions. It doesn't execute rollbacks automatically - instead, it provides a comprehensive record of what was planned, what was executed, and what decisions were made along the way.

## System Architecture

### 1. Plan Management
- **Plans**: Define sequential sequences of tool calls
- **Steps**: Individual tool calls with cancellability metadata
- **Dependencies**: Sequential execution order

### 2. Execution Tracking
- **Execution Instances**: Running instances of plans
- **Step Status**: Track progress of each step
- **Journal Events**: Record decisions and actions

### 3. Journal System
- **Event Recording**: All decisions and actions are logged
- **Audit Trail**: Complete history of execution
- **Manual Intervention**: AI records what actions were taken

## Available Tools

### record_plan
Records a planned sequence of tool calls in the journal.

**Input Schema:**
- name: Plan name
- description: Plan description
- steps: Array of execution steps

**Step Schema:**
- id: Unique step identifier
- name: Human-readable step name
- tool: Tool name to execute
- parameters: Tool parameters
- cancellable: Cancellability metadata
- failure_policy: How failures affect other steps

### record_execution_start
Records the start of plan execution in the journal.

**Input Schema:**
- plan_id: ID of the plan to execute
- notes: Optional execution notes

### query_ledger
Queries the execution journal for status and history.

**Input Schema:**
- execution_id: Execution instance ID
- include_step_details: Include detailed step information
- include_events: Include journal events

### record_decision
Records a decision made during execution.

**Input Schema:**
- execution_id: Execution instance ID
- action: "stop" or "continue"
- reason: Reason for the decision
- details: Additional details

### record_action
Records any manual action taken during execution.

**Input Schema:**
- execution_id: Execution instance ID
- step_id: Optional step ID
- action_type: Type of action taken
- description: Description of the action
- details: Additional details

## Cancellability Metadata

Each step includes cancellability information:

- **reversible**: Can be completely undone
- **partially-reversible**: Can be partially undone
- **irreversible**: Cannot be undone

## Failure Policy Options

- **cancel_all**: Cancel all remaining steps when this step fails
- **cancel_dependent**: Cancel only steps that depend on this step
- **continue_others**: Continue with other steps even if this fails
- **manual_decision**: Require manual decision on how to proceed

## Best Practices

1. **Plan Design**
   - Keep steps focused and atomic
   - Consider failure scenarios
   - Design failure policies that make business sense

2. **Execution Monitoring**
   - Monitor status continuously
   - Record decisions promptly
   - Document all actions taken

3. **Journal Usage**
   - Record all decisions and actions
   - Provide clear descriptions
   - Include relevant context

## Important Notes

- This system provides execution support, not execution guarantees
- AI is responsible for monitoring and decision-making
- All actions are recorded in the journal
- No automatic rollback or compensation
- Focus on contextual awareness and manual intervention

## Example Workflow

1. Create a plan with cancellability metadata and failure policies
2. Start execution and record in journal
3. Monitor progress using query_ledger
4. Record decisions and actions as they occur
5. Use journal for audit trail and decision history`;

    return [
      {
        uri: this.uri,
        mimeType: this.mimeType,
        text: content,
      },
    ];
  }
}
