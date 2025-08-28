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
  description: "Example execution plans and workflows",
  content: `# Execution Journal Examples

## Example 1: Travel Booking Workflow

### Plan: Summer Vacation Planning
**Description**: Plan a complete summer vacation with hotel, car, and activities

**Steps:**
1. **Book Hotel** (reversible)
   - Tool: book_hotel
   - Parameters: destination, dates, room type
   - Cancellable: "reversible"

2. **Book Rental Car** (reversible)
   - Tool: book_car
   - Parameters: pickup location, dates, car type
   - Cancellable: "reversible"

3. **Book Activities** (partially-reversible)
   - Tool: book_activities
   - Parameters: destination, dates, activity types
   - Cancellable: "partially-reversible"

**AI Responsibilities:**
- Monitor each booking step
- Record actions in the journal if cancellations needed
- Handle partial failures gracefully

## Example 2: Database Migration Workflow

### Plan: Production Database Migration
**Description**: Safely migrate production database with backup and rollback capability

**Steps:**
1. **Create Backup** (reversible)
   - Tool: create_backup
   - Parameters: database_name, backup_location
   - Cancellable: "reversible"

2. **Run Migration** (irreversible)
   - Tool: run_migration
   - Parameters: migration_script, target_version
   - Cancellable: "irreversible"

3. **Verify Migration** (partially-reversible)
   - Tool: verify_migration
   - Parameters: test_queries, validation_rules
   - Cancellable: "partially-reversible"

4. **Send Notifications** (irreversible)
   - Tool: send_notification
   - Parameters: recipients, message
   - Cancellable: "irreversible"

**AI Responsibilities:**
- Monitor backup creation success
- Record decision to proceed with migration
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

2. **Convert Format** (partially-reversible)
   - Tool: convert_document
   - Parameters: source_format, target_format
   - Cancellable: "partially-reversible"

3. **Store Document** (reversible)
   - Tool: store_document
   - Parameters: storage_location, metadata
   - Cancellable: "reversible"

4. **Update Index** (reversible)
   - Tool: update_index
   - Parameters: document_id, search_terms
   - Cancellable: "reversible"

**AI Responsibilities:**
- Monitor validation results
- Record conversion attempts and results
- Handle storage failures appropriately
- Use journal for audit trail

## Key Principles

1. **Sequential Execution**: All examples show sequential tool execution
2. **Cancellability Metadata**: Each step includes clear cancellability information
3. **Journal Recording**: AI must record all decisions and actions
4. **Manual Intervention**: Plan for manual handling of failures
5. **Contextual Awareness**: Consider how failures affect subsequent steps

## Best Practices

- Always include cancellability metadata
- Design for failure scenarios
- Record decisions promptly in the journal
- Monitor execution status continuously
- Plan for manual intervention when needed

## Warnings

⚠️ **This is NOT the MSA Saga pattern**
- No automatic rollback or compensation
- AI must handle failures manually
- Focus on recording actions, not executing them
- System provides support, not guarantees

## Notes

- All examples use sequential tool execution
- Journal recording is essential for audit trails
- Cancellability metadata guides decision-making
- Manual intervention is expected and should be recorded`
};
