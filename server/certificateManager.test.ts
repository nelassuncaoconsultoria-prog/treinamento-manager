import { describe, it, expect, vi, beforeAll } from "vitest";
import { testGoogleDriveConnection } from "./certificateManager";
import * as env from "./_core/env";

describe("certificateManager", () => {
  it("deve validar que as credenciais do Google Drive estão configuradas", async () => {
    // Verificar se as variáveis de ambiente estão definidas
    const hasServiceAccountJson = !!env.ENV.googleDriveServiceAccountJson;
    const hasRootFolderId = !!env.ENV.googleDriveRootFolderId;

    expect(hasServiceAccountJson).toBe(true);
    expect(hasRootFolderId).toBe(true);

    if (hasServiceAccountJson && hasRootFolderId) {
      // Se as credenciais estão configuradas, testar a conexão
      const isConnected = await testGoogleDriveConnection();
      expect(isConnected).toBe(true);
    }
  });

  it("deve validar que as credenciais JSON são válidas", () => {
    try {
      const credentials = JSON.parse(env.ENV.googleDriveServiceAccountJson);
      expect(credentials).toBeDefined();
      expect(credentials.type).toBe("service_account");
      expect(credentials.project_id).toBeDefined();
      expect(credentials.private_key).toBeDefined();
      expect(credentials.client_email).toBeDefined();
    } catch (error) {
      // Se não conseguir fazer parse, significa que as credenciais não foram fornecidas ainda
      expect(env.ENV.googleDriveServiceAccountJson).toBe("");
    }
  });

  it("deve retornar false quando as credenciais não estão configuradas", async () => {
    // Temporariamente simular credenciais vazias
    const originalJson = env.ENV.googleDriveServiceAccountJson;
    const originalFolderId = env.ENV.googleDriveRootFolderId;

    // @ts-ignore - Apenas para teste
    env.ENV.googleDriveServiceAccountJson = "";
    // @ts-ignore - Apenas para teste
    env.ENV.googleDriveRootFolderId = "";

    const isConnected = await testGoogleDriveConnection();
    expect(isConnected).toBe(false);

    // Restaurar valores originais
    // @ts-ignore
    env.ENV.googleDriveServiceAccountJson = originalJson;
    // @ts-ignore
    env.ENV.googleDriveRootFolderId = originalFolderId;
  });
});
