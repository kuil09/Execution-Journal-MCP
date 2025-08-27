import { MCPResource } from "mcp-framework";

class SagaExamplesResource extends MCPResource {
  uri = "resource://saga/examples";
  name = "SAGA Examples and Templates";
  description = "Example SAGA plans and templates for common use cases";
  mimeType = "application/json";

  async read() {
    const examples = {
      "database-migration": {
        name: "Database Migration",
        description: "Example of migrating data between databases with rollback capability",
        warning: "⚠️ IMPORTANT: This system provides tools and infrastructure. YOU (AI) must handle failures and execute compensation actions manually.",
        ai_responsibilities: [
          "Monitor each step for failures",
          "Call compensation tools when steps fail",
          "Ensure data consistency through proper planning",
          "Handle rollbacks manually"
        ],
        steps: [
          {
            id: "backup-source",
            name: "Backup Source Database",
            tool: "backup_database",
            parameters: { source: "production_db" },
            compensation: {
              tool: "restore_database",
              parameters: { target: "production_db", backup: "{{backup_id}}" }
            },
            note: "AI must monitor this step and handle failures"
          },
          {
            id: "migrate-data",
            name: "Migrate Data",
            tool: "migrate_data",
            parameters: { source: "production_db", target: "new_db" },
            compensation: {
              tool: "rollback_migration",
              parameters: { target: "new_db" }
            },
            note: "If this fails, AI must call compensation tools"
          },
          {
            id: "verify-migration",
            name: "Verify Migration",
            tool: "verify_data_integrity",
            parameters: { source: "production_db", target: "new_db" },
            compensation: {
              tool: "rollback_migration",
              parameters: { target: "new_db" }
            },
            note: "AI must verify success and handle verification failures"
          }
        ]
      },
      "file-processing": {
        name: "File Processing Pipeline",
        description: "Example of processing files with cleanup on failure",
        warning: "⚠️ IMPORTANT: This system provides tools and infrastructure. YOU (AI) must handle failures and execute compensation actions manually.",
        ai_responsibilities: [
          "Monitor file operations for failures",
          "Clean up partial results when steps fail",
          "Ensure no orphaned files remain",
          "Handle cleanup operations manually"
        ],
        steps: [
          {
            id: "download-files",
            name: "Download Files",
            tool: "download_files",
            parameters: { url: "https://example.com/files.zip" },
            compensation: {
              tool: "cleanup_files",
              parameters: { pattern: "*.zip" }
            },
            note: "AI must handle download failures and cleanup"
          },
          {
            id: "extract-files",
            name: "Extract Files",
            tool: "extract_archive",
            parameters: { archive: "files.zip" },
            compensation: {
              tool: "cleanup_files",
              parameters: { pattern: "extracted/*" }
            },
            note: "AI must handle extraction failures and cleanup"
          },
          {
            id: "process-files",
            name: "Process Files",
            tool: "process_files",
            parameters: { directory: "extracted" },
            compensation: {
              tool: "cleanup_files",
              parameters: { pattern: "processed/*" }
            },
            note: "AI must handle processing failures and cleanup"
          }
        ]
      },
      "api-integration": {
        name: "API Integration",
        description: "Example of integrating multiple APIs with compensation",
        warning: "⚠️ IMPORTANT: This system provides tools and infrastructure. YOU (AI) must handle failures and execute compensation actions manually.",
        ai_responsibilities: [
          "Monitor API calls for failures",
          "Rollback successful operations when later steps fail",
          "Ensure data consistency across systems",
          "Handle compensation operations manually"
        ],
        steps: [
          {
            id: "create-user",
            name: "Create User in CRM",
            tool: "create_crm_user",
            parameters: { userData: "{{user_data}}" },
            compensation: {
              tool: "delete_crm_user",
              parameters: { userId: "{{crm_user_id}}" }
            },
            note: "AI must handle CRM creation failures"
          },
          {
            id: "setup-billing",
            name: "Setup Billing Account",
            tool: "create_billing_account",
            parameters: { userId: "{{crm_user_id}}" },
            compensation: {
              tool: "cancel_billing_account",
              parameters: { accountId: "{{billing_account_id}}" }
            },
            note: "If this fails, AI must delete the CRM user"
          },
          {
            id: "send-welcome",
            name: "Send Welcome Email",
            tool: "send_email",
            parameters: { template: "welcome", userId: "{{crm_user_id}}" },
            compensation: {
              tool: "cancel_email",
              parameters: { emailId: "{{email_id}}" }
            },
            note: "If this fails, AI must cancel billing and delete user"
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

export default SagaExamplesResource;
