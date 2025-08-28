import { MCPResource } from "mcp-framework";

class ToolExecutionExamplesResource extends MCPResource {
  uri = "resource://tool-execution/examples";
  name = "Tool Execution Examples and Templates";
  description = "Example tool execution plans and templates for common use cases with ledger recording";
  mimeType = "application/json";

  async read() {
    const examples = {
      "travel-planning": {
        name: "Travel Planning with Contextual Dependencies",
        description: "Example of planning a trip where hotel booking failure affects other bookings",
        warning: "⚠️ IMPORTANT: This system provides tools and infrastructure for managing sequential tool call sequences. YOU (AI) must handle failures and record actions in the ledger.",
        note: "This is NOT the MSA Saga pattern - sequential tool execution with ledger recording.",
        contextual_dependencies: "If hotel booking fails, car rental and activity bookings should also be stopped",
        ai_responsibilities: [
          "Monitor each tool call for failures",
          "Record actions in the ledger when tool calls fail",
          "Understand how failures affect related tool calls",
          "Handle failures manually and record in ledger"
        ],
        steps: [
          {
            id: "book-hotel",
            name: "Book Hotel",
            tool: "book_hotel",
            parameters: { location: "Paris", dates: "2024-06-01 to 2024-06-07" },
            cancellable: "partially-reversible",
            note: "AI must monitor this tool call and handle failures"
          },
          {
            id: "book-car",
            name: "Book Rental Car",
            tool: "book_car",
            parameters: { location: "Paris", dates: "2024-06-01 to 2024-06-07" },
            cancellable: "reversible",
            note: "If hotel booking fails, this should also be stopped"
          },
          {
            id: "book-activities",
            name: "Book Activities",
            tool: "book_activities",
            parameters: { location: "Paris", dates: "2024-06-01 to 2024-06-07" },
            cancellable: "reversible",
            note: "If hotel or car booking fails, this should be stopped"
          }
        ]
      },
      "data-processing": {
        name: "Data Processing Pipeline with Cleanup",
        description: "Example of processing data with cleanup on failure",
        warning: "⚠️ IMPORTANT: This system provides tools and infrastructure for managing sequential tool call sequences. YOU (AI) must handle failures and record actions in the ledger.",
        note: "This is NOT the MSA Saga pattern - sequential tool execution with ledger recording.",
        contextual_dependencies: "If data processing fails, downloaded files and temporary data should be cleaned up",
        ai_responsibilities: [
          "Monitor data operations for failures",
          "Clean up partial results when tool calls fail",
          "Ensure no orphaned files remain",
          "Handle cleanup operations manually and record in ledger"
        ],
        steps: [
          {
            id: "download-data",
            name: "Download Data Files",
            tool: "download_files",
            parameters: { url: "https://example.com/data.zip" },
            cancellable: "reversible",
            note: "AI must handle download failures and cleanup manually"
          },
          {
            id: "process-data",
            name: "Process Data Files",
            tool: "process_files",
            parameters: { directory: "data" },
            cancellable: "reversible",
            note: "If this fails, downloaded files should be cleaned up manually"
          },
          {
            id: "upload-results",
            name: "Upload Results",
            tool: "upload_results",
            parameters: { directory: "processed" },
            cancellable: "reversible",
            note: "If this fails, processed files should be cleaned up manually"
          }
        ]
      },
      "business-process": {
        name: "Business Process with Contextual Dependencies",
        description: "Example of business process where order failure affects inventory and shipping",
        warning: "⚠️ IMPORTANT: This system provides tools and infrastructure for managing sequential tool call sequences. YOU (AI) must handle failures and record actions in the ledger.",
        note: "This is NOT the MSA Saga pattern - sequential tool execution with ledger recording.",
        contextual_dependencies: "If order processing fails, inventory updates and shipping preparations should be stopped",
        ai_responsibilities: [
          "Monitor business operations for failures",
          "Stop related operations when tool calls fail",
          "Ensure business consistency across systems",
          "Handle operations manually and record in ledger"
        ],
        steps: [
          {
            id: "create-order",
            name: "Create Order",
            tool: "create_order",
            parameters: { customer_id: "{{customer_id}}", items: "{{items}}" },
            cancellable: "partially-reversible",
            note: "AI must handle order creation failures"
          },
          {
            id: "update-inventory",
            name: "Update Inventory",
            tool: "update_inventory",
            parameters: { order_id: "{{order_id}}" },
            cancellable: "reversible",
            note: "If order creation fails, this should not be executed"
          },
          {
            id: "prepare-shipping",
            name: "Prepare Shipping",
            tool: "prepare_shipping",
            parameters: { order_id: "{{order_id}}" },
            cancellable: "reversible",
            note: "If order or inventory update fails, this should be stopped"
          }
        ]
      }
    };

    return [
      {
        uri: this.uri,
        mimeType: this.mimeType,
        text: JSON.stringify(examples, null, 2),
      },
    ];
  }
}

export default {
  name: "execution_examples",
  title: "Execution Journal Examples",
  description: "Example execution plans and workflows with failure policies",
  content: `# Execution Journal Examples

## Example 1: Travel Booking Workflow

### Plan: Summer Vacation Planning
**Description**: Plan a complete summer vacation with hotel, car, and activities

**Steps:**
1. **Book Hotel** (partially-reversible)
   - Tool: book_hotel
   - Parameters: destination, dates, room type
   - Cancellable: "partially-reversible"
   - Failure Policy: 
     - propagate_to: ["book_car", "book_activities"]
     - action: "cancel_dependent"
     - reason: "Hotel is essential for vacation planning - car and activities depend on having a place to stay"

2. **Book Rental Car** (reversible)
   - Tool: book_car
   - Parameters: pickup location, dates, car type
   - Cancellable: "reversible"
   - Failure Policy:
     - propagate_to: ["book_activities"]
     - action: "continue_others"
     - reason: "Car is nice to have but not essential - activities can continue without it"

3. **Book Activities** (partially-reversible)
   - Tool: book_activities
   - Parameters: destination, dates, activity types
   - Cancellable: "partially-reversible"
   - Failure Policy:
     - propagate_to: []
     - action: "continue_others"
     - reason: "Activities are independent - failure doesn't affect other bookings"

**AI Responsibilities:**
- Monitor each booking step
- Apply failure policies automatically
- Record actions in the journal when policies are triggered
- Handle partial failures gracefully

## Example 2: Database Migration Workflow

### Plan: Production Database Migration
**Description**: Safely migrate production database with backup and rollback capability

**Steps:**
1. **Create Backup** (reversible)
   - Tool: create_backup
   - Parameters: database_name, backup_location
   - Cancellable: "reversible"
   - Failure Policy:
     - propagate_to: ["run_migration", "verify_migration", "send_notification"]
     - action: "cancel_all"
     - reason: "Backup is critical - cannot proceed with migration without it"

2. **Run Migration** (irreversible)
   - Tool: run_migration
   - Parameters: migration_script, target_version
   - Cancellable: "irreversible"
   - Failure Policy:
     - propagate_to: ["verify_migration", "send_notification"]
     - action: "cancel_dependent"
     - reason: "Migration failed - verification and notification are not relevant"

3. **Verify Migration** (partially-reversible)
   - Tool: verify_migration
   - Parameters: test_queries, validation_rules
   - Cancellable: "partially-reversible"
   - Failure Policy:
     - propagate_to: ["send_notification"]
     - action: "manual_decision"
     - reason: "Verification failure requires manual assessment of migration success"

4. **Send Notifications** (irreversible)
   - Tool: send_notification
   - Parameters: recipients, message
   - Cancellable: "irreversible"
   - Failure Policy:
     - propagate_to: []
     - action: "continue_others"
     - reason: "Notification failure doesn't affect the migration itself"

**AI Responsibilities:**
- Monitor backup creation success
- Apply failure policies automatically
- Record manual decisions when manual_decision is required
- Handle verification failures appropriately
- Record all actions in the journal

## Example 3: File Processing Workflow

### Plan: Document Processing Pipeline
**Description**: Process uploaded documents through validation, conversion, and storage

**Steps:**
1. **Validate Upload** (reversible)
   - Tool: validate_document
   - Parameters: file_path, validation_rules
   - Cancellable: "reversible"
   - Failure Policy:
     - propagate_to: ["convert_document", "store_document", "update_index"]
     - action: "cancel_dependent"
     - reason: "Invalid document cannot be processed further"

2. **Convert Format** (partially-reversible)
   - Tool: convert_document
   - Parameters: source_format, target_format
   - Cancellable: "partially-reversible"
   - Failure Policy:
     - propagate_to: ["store_document", "update_index"]
     - action: "cancel_dependent"
     - reason: "Conversion failure prevents storage and indexing"

3. **Store Document** (reversible)
   - Tool: store_document
   - Parameters: storage_location, metadata
   - Cancellable: "reversible"
   - Failure Policy:
     - propagate_to: ["update_index"]
     - action: "cancel_dependent"
     - reason: "Cannot index document that wasn't stored"

4. **Update Index** (reversible)
   - Tool: update_index
   - Parameters: document_id, search_terms
   - Cancellable: "reversible"
   - Failure Policy:
     - propagate_to: []
     - action: "continue_others"
     - reason: "Index failure doesn't affect the stored document"

**AI Responsibilities:**
- Monitor validation results
- Apply failure policies automatically
- Record conversion attempts and results
- Handle storage failures appropriately
- Use journal for audit trail

## Key Principles

1. **Sequential Execution**: All examples show sequential tool execution
2. **Cancellability Metadata**: Each step includes clear cancellability information
3. **Failure Policies**: Each step defines how failures affect other steps
4. **Journal Recording**: AI must record all decisions and actions
5. **Contextual Awareness**: Consider how failures affect subsequent steps

## Failure Policy Guidelines

### When to Use Each Policy:

- **cancel_all**: Critical infrastructure failures (backup, authentication)
- **cancel_dependent**: Logical dependencies (hotel → car → activities)
- **continue_others**: Independent operations (notifications, logging)
- **manual_decision**: Complex failures requiring human judgment

### Best Practices:

- Always include failure policies for critical steps
- Consider business logic when designing policies
- Document the reasoning behind each policy
- Test failure scenarios during planning
- Record all policy applications in the journal

## Notes

- All examples use sequential tool execution
- Failure policies provide clear guidance for AI decision-making
- Journal recording is essential for audit trails
- Cancellability metadata guides decision-making
- Manual intervention is expected and should be recorded`
};
