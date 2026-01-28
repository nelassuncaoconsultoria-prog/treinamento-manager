import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number = 1): TrpcContext {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `sample-user-${userId}`,
    email: `sample${userId}@example.com`,
    name: `Sample User ${userId}`,
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return ctx;
}

describe("Employee Area Selection Bug Fix", () => {
  it("should save 'pos_vendas' area correctly without converting to 'vendas'", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Get the first available store
    const stores = await caller.stores.list();
    if (!stores || stores.length === 0) {
      throw new Error("No stores available for testing");
    }
    const storeId = stores[0].id;

    // Create an employee with pos_vendas area
    const result = await caller.employees.create({
      storeId,
      name: "Test Employee",
      email: `employee-${Date.now()}@test.com`,
      function: "Gerente",
      area: "pos_vendas",
    });

    expect(result.success).toBe(true);

    // Fetch the employee to verify the area was saved correctly
    const employees = await caller.employees.list({ storeId });
    const createdEmployee = employees.find((e) => e.name === "Test Employee");

    expect(createdEmployee).toBeDefined();
    expect(createdEmployee?.area).toBe("pos_vendas");
    expect(createdEmployee?.area).not.toBe("vendas");
  });

  it("should save 'vendas' area correctly", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Get the first available store
    const stores = await caller.stores.list();
    if (!stores || stores.length === 0) {
      throw new Error("No stores available for testing");
    }
    const storeId = stores[0].id;

    // Create an employee with vendas area
    const result = await caller.employees.create({
      storeId,
      name: "Test Employee Vendas",
      email: `employee-vendas-${Date.now()}@test.com`,
      function: "Vendedor",
      area: "vendas",
    });

    expect(result.success).toBe(true);

    // Fetch the employee to verify the area was saved correctly
    const employees = await caller.employees.list({ storeId });
    const createdEmployee = employees.find((e) => e.name === "Test Employee Vendas");

    expect(createdEmployee).toBeDefined();
    expect(createdEmployee?.area).toBe("vendas");
  });

  it("should not confuse areas when creating multiple employees", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Get the first available store
    const stores = await caller.stores.list();
    if (!stores || stores.length === 0) {
      throw new Error("No stores available for testing");
    }
    const storeId = stores[0].id;

    const timestamp = Date.now();

    // Create multiple employees with different areas
    const vendas1Result = await caller.employees.create({
      storeId,
      name: `Vendedor 1 ${timestamp}`,
      email: `v1-${timestamp}@test.com`,
      function: "Vendedor",
      area: "vendas",
    });

    const posVendas1Result = await caller.employees.create({
      storeId,
      name: `Pos-Vendedor 1 ${timestamp}`,
      email: `pv1-${timestamp}@test.com`,
      function: "Tecnico",
      area: "pos_vendas",
    });

    const vendas2Result = await caller.employees.create({
      storeId,
      name: `Vendedor 2 ${timestamp}`,
      email: `v2-${timestamp}@test.com`,
      function: "Gerente de Vendas",
      area: "vendas",
    });

    expect(vendas1Result.success).toBe(true);
    expect(posVendas1Result.success).toBe(true);
    expect(vendas2Result.success).toBe(true);

    // Fetch all employees to verify
    const employees = await caller.employees.list({ storeId });

    // Find the employees we just created by email (more reliable)
    const vendas1 = employees.find((e) => e.email === `v1-${timestamp}@test.com`);
    const posVendas1 = employees.find((e) => e.email === `pv1-${timestamp}@test.com`);
    const vendas2 = employees.find((e) => e.email === `v2-${timestamp}@test.com`);

    // Verify each employee has the correct area
    expect(vendas1).toBeDefined();
    expect(posVendas1).toBeDefined();
    expect(vendas2).toBeDefined();

    expect(vendas1?.area).toBe("vendas");
    expect(posVendas1?.area).toBe("pos_vendas");
    expect(vendas2?.area).toBe("vendas");

    // Verify that pos_vendas is not being converted to vendas
    expect(posVendas1?.area).not.toBe("vendas");
  });
});
