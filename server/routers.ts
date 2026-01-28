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

  // ============ EMPLOYEES ============
  employees: router({
    list: protectedProcedure.query(async () => {
      return db.getEmployees();
    }),

    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        email: z.string().email(),
        function: z.string().min(1),
        area: z.enum(["vendas", "pos_vendas"]),
      }))
      .mutation(async ({ input }) => {
        try {
          const result = await db.createEmployee({
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
    list: protectedProcedure.query(async () => {
      return db.getCourses();
    }),

    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        area: z.enum(["vendas", "pos_vendas"]),
      }))
      .mutation(async ({ input }) => {
        try {
          const result = await db.createCourse({
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
    list: protectedProcedure.query(async () => {
      return db.getCourseAssignments();
    }),

    listByEmployee: protectedProcedure
      .input(z.object({ employeeId: z.number() }))
      .query(async ({ input }) => {
        return db.getCourseAssignmentsByEmployee(input.employeeId);
      }),

    create: protectedProcedure
      .input(z.object({
        employeeId: z.number(),
        courseId: z.number(),
      }))
      .mutation(async ({ input }) => {
        try {
          const result = await db.createCourseAssignment({
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
        if (employee && course) {
          await notifyOwner({
            title: "Treinamento Concluído",
            content: `${employee.name} completou o treinamento "${course.title}" na área de ${employee.area === "vendas" ? "Vendas" : "Pós-Vendas"}.`,
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
    trainingProgressByFunction: protectedProcedure.query(async () => {
      const assignments = await db.getCourseAssignments();
      const employees = await db.getEmployees();
      const courses = await db.getCourses();

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

        reportByFunction[employee.function].employees.push({
          id: employee.id,
          name: employee.name,
          email: employee.email,
          totalCourses: employeeAssignments.length,
          completedCourses: completedCount,
          completionPercentage: employeeAssignments.length > 0 ? Math.round((completedCount / employeeAssignments.length) * 100) : 0,
        });
      }

      // Calcular percentual de conclusão por função
      for (const func in reportByFunction) {
        const report = reportByFunction[func];
        report.completionPercentage = report.totalCourses > 0 ? Math.round((report.completedCourses / report.totalCourses) * 100) : 0;
      }

      return Object.values(reportByFunction);
    }),

    trainingProgressByArea: protectedProcedure.query(async () => {
      const assignments = await db.getCourseAssignments();
      const employees = await db.getEmployees();

      const reportByArea: Record<string, any> = {
        vendas: {
          area: "Vendas",
          totalEmployees: 0,
          totalCourses: 0,
          completedCourses: 0,
          pendingCourses: 0,
          completionPercentage: 0,
          functions: {},
        },
        pos_vendas: {
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
        const area = employee.area;
        const employeeAssignments = assignments.filter(a => a.employeeId === employee.id);
        const completedCount = employeeAssignments.filter(a => a.status === "concluido").length;

        reportByArea[area].totalEmployees += 1;
        reportByArea[area].totalCourses += employeeAssignments.length;
        reportByArea[area].completedCourses += completedCount;
        reportByArea[area].pendingCourses += employeeAssignments.filter(a => a.status === "pendente").length;

        if (!reportByArea[area].functions[employee.function]) {
          reportByArea[area].functions[employee.function] = {
            totalEmployees: 0,
            completedCourses: 0,
            totalCourses: 0,
          };
        }
        reportByArea[area].functions[employee.function].totalEmployees += 1;
        reportByArea[area].functions[employee.function].totalCourses += employeeAssignments.length;
        reportByArea[area].functions[employee.function].completedCourses += completedCount;
      }

      // Calcular percentuais
      for (const area in reportByArea) {
        const report = reportByArea[area];
        report.completionPercentage = report.totalCourses > 0 ? Math.round((report.completedCourses / report.totalCourses) * 100) : 0;
      }

      return Object.values(reportByArea);
    }),

    employeeProgress: protectedProcedure
      .input(z.object({ employeeId: z.number() }))
      .query(async ({ input }) => {
        const employee = await db.getEmployeeById(input.employeeId);
        if (!employee) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Funcionário não encontrado",
          });
        }

        const assignments = await db.getCourseAssignmentsByEmployee(input.employeeId);
        const courses = await db.getCourses();

        const courseDetails = assignments.map(assignment => {
          const course = courses.find(c => c.id === assignment.courseId);
          return {
            ...assignment,
            courseTitle: course?.title,
            courseDescription: course?.description,
          };
        });

        const completedCount = assignments.filter(a => a.status === "concluido").length;

        return {
          employee,
          assignments: courseDetails,
          totalCourses: assignments.length,
          completedCourses: completedCount,
          pendingCourses: assignments.length - completedCount,
          completionPercentage: assignments.length > 0 ? Math.round((completedCount / assignments.length) * 100) : 0,
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
