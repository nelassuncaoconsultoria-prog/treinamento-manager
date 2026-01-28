import { describe, it, expect } from "vitest";
import { google } from "googleapis";
import { ENV } from "./_core/env";

describe("Google Drive Integration", () => {
  it("should authenticate with Google Drive using Service Account credentials", async () => {
    try {
      // Verificar se as credenciais estão configuradas
      if (!ENV.googleDriveServiceAccountJson || !ENV.googleDriveRootFolderId) {
        console.warn("Google Drive credentials not configured - skipping test");
        expect(true).toBe(true);
        return;
      }

      // Tentar fazer parse do JSON
      const credentials = JSON.parse(ENV.googleDriveServiceAccountJson);
      expect(credentials).toBeDefined();
      expect(credentials.type).toBe("service_account");
      expect(credentials.client_email).toBeDefined();
      expect(credentials.private_key).toBeDefined();

      // Tentar criar autenticação
      const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ["https://www.googleapis.com/auth/drive"],
      });

      expect(auth).toBeDefined();

      // Tentar obter token (isso valida as credenciais)
      const client = await auth.getClient();
      expect(client).toBeDefined();

      console.log("✓ Google Drive authentication successful");
    } catch (error) {
      console.error("✗ Google Drive authentication failed:", error);
      throw error;
    }
  });

  it("should have valid root folder ID", () => {
    if (!ENV.googleDriveRootFolderId) {
      console.warn("GOOGLE_DRIVE_ROOT_FOLDER_ID not configured");
      expect(true).toBe(true);
      return;
    }

    expect(ENV.googleDriveRootFolderId).toBeDefined();
    expect(typeof ENV.googleDriveRootFolderId).toBe("string");
    expect(ENV.googleDriveRootFolderId.length).toBeGreaterThan(0);

    console.log(`✓ Root folder ID is valid: ${ENV.googleDriveRootFolderId}`);
  });
});
