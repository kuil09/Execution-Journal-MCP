export default {
  name: "execution_documentation",
  title: "Execution Journal Documentation",
  description: "Comprehensive documentation for the execution journal system",
  content: `# Execution Journal System Documentation

## Overview

The Execution Journal is an MCP server that helps AI coordinate sequential tool calls and maintain a durable record of execution workflows, decisions, and actions.

## Core Concept

**This is NOT the MSA Saga pattern for distributed transactions.** Instead, this system manages "loose contextual connections" between tool calls and provides a journal for recording AI decisions and actions.

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

## Best Practices

1. **Plan Design**
   - Keep steps focused and atomic
   - Consider failure scenarios
   - Design for manual intervention

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

1. Create a plan with cancellability metadata
2. Start execution and record in journal
3. Monitor progress using query_ledger
4. Record decisions and actions as they occur
5. Use journal for audit trail and decision history`
};
