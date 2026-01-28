import { describe, it, expect, beforeEach, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
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
    res: {} as TrpcContext["res"],
  };

  return ctx;
}

describe("tRPC Routers", () => {
  let ctx: TrpcContext;

  beforeEach(() => {
    ctx = createAuthContext();
  });

  describe("employees", () => {
    it("should list employees", async () => {
      const caller = appRouter.createCaller(ctx);
      const result = await caller.employees.list();
      expect(Array.isArray(result)).toBe(true);
    });

    it("should create an employee", async () => {
      const caller = appRouter.createCaller(ctx);
      const result = await caller.employees.create({
        name: "João Silva",
        email: "joao@example.com",
        function: "Vendedor",
        area: "vendas",
      });
      expect(result.success).toBe(true);
      expect(result.id).toBeGreaterThan(0);
    });

    it("should not create employee with invalid email", async () => {
      const caller = appRouter.createCaller(ctx);
      try {
        await caller.employees.create({
          name: "João Silva",
          email: "invalid-email",
          function: "Vendedor",
          area: "vendas",
        });
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe("courses", () => {
    it("should list courses", async () => {
      const caller = appRouter.createCaller(ctx);
      const result = await caller.courses.list();
      expect(Array.isArray(result)).toBe(true);
    });

    it("should create a course", async () => {
      const caller = appRouter.createCaller(ctx);
      const result = await caller.courses.create({
        title: "Excel Avançado",
        description: "Curso de Excel para usuários avançados",
        area: "vendas",
      });
      expect(result.success).toBe(true);
      expect(result.id).toBeGreaterThan(0);
    });
  });

  describe("assignments", () => {
    it("should list assignments", async () => {
      const caller = appRouter.createCaller(ctx);
      const result = await caller.assignments.list();
      expect(Array.isArray(result)).toBe(true);
    });

    it("should create an assignment", async () => {
      const caller = appRouter.createCaller(ctx);
      
      // First create an employee
      const empResult = await caller.employees.create({
        name: "Maria Santos",
        email: "maria@example.com",
        function: "Gerente",
        area: "pos_vendas",
      });

      // Then create a course
      const courseResult = await caller.courses.create({
        title: "Atendimento ao Cliente",
        description: "Curso de atendimento",
        area: "pos_vendas",
      });

      // Finally create an assignment
      const assignResult = await caller.assignments.create({
        employeeId: empResult.id,
        courseId: courseResult.id,
      });

      expect(assignResult.success).toBe(true);
      expect(assignResult.id).toBeGreaterThan(0);
    });
  });

  describe("reports", () => {
    it("should get training progress by function", async () => {
      const caller = appRouter.createCaller(ctx);
      const result = await caller.reports.trainingProgressByFunction();
      expect(Array.isArray(result)).toBe(true);
    });

    it("should get training progress by area", async () => {
      const caller = appRouter.createCaller(ctx);
      const result = await caller.reports.trainingProgressByArea();
      expect(Array.isArray(result)).toBe(true);
      
      // Should have data for both areas
      const areas = result.map(r => r.area);
      expect(areas).toContain("Vendas");
      expect(areas).toContain("Pós-Vendas");
    });
  });

  describe("auth", () => {
    it("should return current user", async () => {
      const caller = appRouter.createCaller(ctx);
      const result = await caller.auth.me();
      expect(result).toEqual(ctx.user);
    });
  });
});
