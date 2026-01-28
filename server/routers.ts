import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";
import { notifyOwner } from "./_core/notification";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ============ STORES ============
  stores: router({
    list: protectedProcedure.query(async () => {
      return db.getStores();
    }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getStoreById(input.id);
      }),
  }),

  // ============ EMPLOYEES ============
  employees: router({
    list: protectedProcedure
      .input(z.object({ storeId: z.number() }))
      .query(async ({ input }) => {
        return db.getEmployeesByStore(input.storeId);
      }),

    create: protectedProcedure
      .input(z.object({
        storeId: z.number(),
        name: z.string().min(1),
        email: z.string().email(),
        function: z.string().min(1),
        area: z.enum(["vendas", "pos_vendas"]),
      }))
      .mutation(async ({ input }) => {
        try {
          const result = await db.createEmployee({
            storeId: input.storeId,
            name: input.name,
            email: input.email,
            function: input.function,
            area: input.area,
            status: "ativo",
          });
          return { success: true, id: result[0]?.insertId || 0 };
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erro ao criar funcionário",
          });
        }
      }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getEmployeeById(input.id);
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        email: z.string().email().optional(),
        function: z.string().optional(),
        area: z.enum(["vendas", "pos_vendas"]).optional(),
        status: z.enum(["ativo", "inativo"]).optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateEmployee(id, data);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteEmployee(input.id);
        return { success: true };
      }),
  }),

  // ============ COURSES ============
  courses: router({
    list: protectedProcedure
      .input(z.object({ storeId: z.number() }))
      .query(async ({ input }) => {
        return db.getCoursesByStore(input.storeId);
      }),

    create: protectedProcedure
      .input(z.object({
        storeId: z.number(),
        title: z.string().min(1),
        description: z.string().optional(),
        area: z.enum(["vendas", "pos_vendas"]),
      }))
      .mutation(async ({ input }) => {
        try {
          const result = await db.createCourse({
            storeId: input.storeId,
            title: input.title,
            description: input.description,
            area: input.area,
          });
          return { success: true, id: result[0]?.insertId || 0 };
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erro ao criar curso",
          });
        }
      }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getCourseById(input.id);
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        area: z.enum(["vendas", "pos_vendas"]).optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateCourse(id, data);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteCourse(input.id);
        return { success: true };
      }),
  }),

  // ============ COURSE ASSIGNMENTS ============
  assignments: router({
    list: protectedProcedure
      .input(z.object({ storeId: z.number() }))
      .query(async ({ input }) => {
        return db.getAssignmentsByStore(input.storeId);
      }),

    listByEmployee: protectedProcedure
      .input(z.object({ employeeId: z.number() }))
      .query(async ({ input }) => {
        return db.getCourseAssignmentsByEmployee(input.employeeId);
      }),

    create: protectedProcedure
      .input(z.object({
        storeId: z.number(),
        employeeId: z.number(),
        courseId: z.number(),
      }))
      .mutation(async ({ input }) => {
        try {
          const result = await db.createCourseAssignment({
            storeId: input.storeId,
            employeeId: input.employeeId,
            courseId: input.courseId,
            status: "pendente",
          });
          return { success: true, id: result[0]?.insertId || 0 };
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erro ao atribuir curso",
          });
        }
      }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getCourseAssignmentById(input.id);
      }),

    complete: protectedProcedure
      .input(z.object({
        id: z.number(),
        certificateUrl: z.string().optional(),
        certificateKey: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const assignment = await db.getCourseAssignmentById(input.id);
        if (!assignment) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Atribuição não encontrada",
          });
        }

        await db.updateCourseAssignment(input.id, {
          status: "concluido",
          completedAt: new Date(),
          certificateUrl: input.certificateUrl,
          certificateKey: input.certificateKey,
        });

        // Notificar o owner
        const employee = await db.getEmployeeById(assignment.employeeId);
        const course = await db.getCourseById(assignment.courseId);
        const store = await db.getStoreById(assignment.storeId);
        if (employee && course && store) {
          await notifyOwner({
            title: "Treinamento Concluído",
            content: `${employee.name} completou o treinamento "${course.title}" na loja ${store.storeName} (área de ${employee.area === "vendas" ? "Vendas" : "Pós-Vendas"}).`,
          });
        }

        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteCourseAssignment(input.id);
        return { success: true };
      }),
  }),

  // ============ REPORTS ============
  reports: router({
    trainingProgressByFunction: protectedProcedure
      .input(z.object({ storeId: z.number() }))
      .query(async ({ input }) => {
        const assignments = await db.getAssignmentsByStore(input.storeId);
        const employees = await db.getEmployeesByStore(input.storeId);
        const courses = await db.getCoursesByStore(input.storeId);

        // Agrupar por função
        const reportByFunction: Record<string, any> = {};

        for (const employee of employees) {
          if (!reportByFunction[employee.function]) {
            reportByFunction[employee.function] = {
              function: employee.function,
              area: employee.area,
              totalEmployees: 0,
              totalCourses: 0,
              completedCourses: 0,
              pendingCourses: 0,
              employees: [],
              completionPercentage: 0,
            };
          }

          const employeeAssignments = assignments.filter(a => a.employeeId === employee.id);
          const completedCount = employeeAssignments.filter(a => a.status === "concluido").length;

          reportByFunction[employee.function].totalEmployees += 1;
          reportByFunction[employee.function].totalCourses += employeeAssignments.length;
          reportByFunction[employee.function].completedCourses += completedCount;
          reportByFunction[employee.function].pendingCourses += employeeAssignments.filter(a => a.status === "pendente").length;
        }

        // Calcular percentual de conclusão
        for (const func in reportByFunction) {
          const total = reportByFunction[func].totalCourses;
          const completed = reportByFunction[func].completedCourses;
          reportByFunction[func].completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;
        }

        return Object.values(reportByFunction);
      }),

    trainingProgressByArea: protectedProcedure
      .input(z.object({ storeId: z.number() }))
      .query(async ({ input }) => {
        const assignments = await db.getAssignmentsByStore(input.storeId);
        const employees = await db.getEmployeesByStore(input.storeId);

        const reportByArea: Record<string, any> = {
          "Vendas": {
            area: "Vendas",
            totalEmployees: 0,
            totalCourses: 0,
            completedCourses: 0,
            pendingCourses: 0,
            completionPercentage: 0,
            functions: {},
          },
          "Pós-Vendas": {
            area: "Pós-Vendas",
            totalEmployees: 0,
            totalCourses: 0,
            completedCourses: 0,
            pendingCourses: 0,
            completionPercentage: 0,
            functions: {},
          },
        };

        for (const employee of employees) {
          const areaKey = employee.area === "vendas" ? "Vendas" : "Pós-Vendas";
          const employeeAssignments = assignments.filter(a => a.employeeId === employee.id);
          const completedCount = employeeAssignments.filter(a => a.status === "concluido").length;

          reportByArea[areaKey].totalEmployees += 1;
          reportByArea[areaKey].totalCourses += employeeAssignments.length;
          reportByArea[areaKey].completedCourses += completedCount;
          reportByArea[areaKey].pendingCourses += employeeAssignments.filter(a => a.status === "pendente").length;

          if (!reportByArea[areaKey].functions[employee.function]) {
            reportByArea[areaKey].functions[employee.function] = {
              totalEmployees: 0,
              completedCourses: 0,
              pendingCourses: 0,
            };
          }
          reportByArea[areaKey].functions[employee.function].totalEmployees += 1;
          reportByArea[areaKey].functions[employee.function].completedCourses += completedCount;
          reportByArea[areaKey].functions[employee.function].pendingCourses += employeeAssignments.filter(a => a.status === "pendente").length;
        }

        // Calcular percentual de conclusão
        for (const area in reportByArea) {
          const total = reportByArea[area].totalCourses;
          const completed = reportByArea[area].completedCourses;
          reportByArea[area].completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;
        }

        return Object.values(reportByArea);
      }),
  }),
});

export type AppRouter = typeof appRouter;
