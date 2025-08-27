import { MCPResource } from "mcp-framework";

class ToolExecutionExamplesResource extends MCPResource {
  uri = "resource://tool-execution/examples";
  name = "Tool Execution Examples and Templates";
  description = "Example tool execution plans and templates for common use cases with contextual dependencies";
  mimeType = "application/json";

  async read() {
    const examples = {
      "travel-planning": {
        name: "Travel Planning with Contextual Dependencies",
        description: "Example of planning a trip where hotel booking failure affects other bookings",
        warning: "⚠️ IMPORTANT: This system provides tools and infrastructure for managing tool call sequences with contextual dependencies. YOU (AI) must handle failures and execute compensation actions manually.",
        note: "This is NOT the MSA Saga pattern - it's a tool execution planning system for managing contextual dependencies.",
        contextual_dependencies: "If hotel booking fails, car rental and activity bookings should also be compensated",
        ai_responsibilities: [
          "Monitor each tool call for failures",
          "Call compensation tools when tool calls fail",
          "Understand how failures affect related tool calls",
          "Handle compensations manually based on context"
        ],
        steps: [
          {
            id: "book-hotel",
            name: "Book Hotel",
            tool_name: "book_hotel",
            parameters: { location: "Paris", dates: "2024-06-01 to 2024-06-07" },
            compensation: {
              tool_name: "cancel_hotel",
              parameters: { booking_id: "{{hotel_booking_id}}" }
            },
            note: "AI must monitor this tool call and handle failures"
          },
          {
            id: "book-car",
            name: "Book Rental Car",
            tool_name: "book_car",
            parameters: { location: "Paris", dates: "2024-06-01 to 2024-06-07" },
            depends_on: ["book-hotel"],
            compensation: {
              tool_name: "cancel_car",
              parameters: { booking_id: "{{car_booking_id}}" }
            },
            note: "If hotel booking fails, this should also be compensated"
          },
          {
            id: "book-activities",
            name: "Book Activities",
            tool_name: "book_activities",
            parameters: { location: "Paris", dates: "2024-06-01 to 2024-06-07" },
            depends_on: ["book-hotel", "book-car"],
            compensation: {
              tool_name: "cancel_activities",
              parameters: { booking_id: "{{activity_booking_id}}" }
            },
            note: "If hotel or car booking fails, this should also be compensated"
          }
        ]
      },
      "data-processing": {
        name: "Data Processing Pipeline with Cleanup",
        description: "Example of processing data with cleanup on failure",
        warning: "⚠️ IMPORTANT: This system provides tools and infrastructure for managing tool call sequences with contextual dependencies. YOU (AI) must handle failures and execute compensation actions manually.",
        note: "This is NOT the MSA Saga pattern - it's a tool execution planning system for managing contextual dependencies.",
        contextual_dependencies: "If data processing fails, downloaded files and temporary data should be cleaned up",
        ai_responsibilities: [
          "Monitor data operations for failures",
          "Clean up partial results when tool calls fail",
          "Ensure no orphaned files remain",
          "Handle cleanup operations manually"
        ],
        steps: [
          {
            id: "download-data",
            name: "Download Data Files",
            tool_name: "download_files",
            parameters: { url: "https://example.com/data.zip" },
            compensation: {
              tool_name: "cleanup_files",
              parameters: { pattern: "*.zip" }
            },
            note: "AI must handle download failures and cleanup"
          },
          {
            id: "process-data",
            name: "Process Data Files",
            tool_name: "process_files",
            parameters: { directory: "data" },
            compensation: {
              tool_name: "cleanup_files",
              parameters: { pattern: "processed/*" }
            },
            note: "If this fails, downloaded files should be cleaned up"
          },
          {
            id: "upload-results",
            name: "Upload Results",
            tool_name: "upload_results",
            parameters: { directory: "processed" },
            compensation: {
              tool_name: "cleanup_files",
              parameters: { pattern: "processed/*" }
            },
            note: "If this fails, processed files should be cleaned up"
          }
        ]
      },
      "business-process": {
        name: "Business Process with Contextual Dependencies",
        description: "Example of business process where order failure affects inventory and shipping",
        warning: "⚠️ IMPORTANT: This system provides tools and infrastructure for managing tool call sequences with contextual dependencies. YOU (AI) must handle failures and execute compensation actions manually.",
        note: "This is NOT the MSA Saga pattern - it's a tool execution planning system for managing contextual dependencies.",
        contextual_dependencies: "If order processing fails, inventory updates and shipping preparations should be compensated",
        ai_responsibilities: [
          "Monitor business operations for failures",
          "Cancel related operations when tool calls fail",
          "Ensure business consistency across systems",
          "Handle compensation operations manually"
        ],
        steps: [
          {
            id: "create-order",
            name: "Create Order",
            tool_name: "create_order",
            parameters: { customer_id: "{{customer_id}}", items: "{{items}}" },
            compensation: {
              tool_name: "cancel_order",
              parameters: { order_id: "{{order_id}}" }
            },
            note: "AI must handle order creation failures"
          },
          {
            id: "update-inventory",
            name: "Update Inventory",
            tool_name: "update_inventory",
            parameters: { order_id: "{{order_id}}" },
            depends_on: ["create-order"],
            compensation: {
              tool_name: "restore_inventory",
              parameters: { order_id: "{{order_id}}" }
            },
            note: "If order creation fails, this should not be executed"
          },
          {
            id: "prepare-shipping",
            name: "Prepare Shipping",
            tool_name: "prepare_shipping",
            parameters: { order_id: "{{order_id}}" },
            depends_on: ["create-order", "update-inventory"],
            compensation: {
              tool_name: "cancel_shipping",
              parameters: { order_id: "{{order_id}}" }
            },
            note: "If order or inventory update fails, this should be compensated"
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

export default ToolExecutionExamplesResource;
