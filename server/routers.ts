import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";
import { notifyOwner } from "./_core/notification";
import { uploadCertificate } from "./certificateManager";
import { autoAssignCourseToStores, reAssignCourseByBrand, assignPendingCoursesToEmployee } from "./autoAssignCourses";
import { sdk } from "./_core/sdk";

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
    localLogin: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string().min(4),
      }))
      .mutation(async ({ input, ctx }) => {
        if (input.password !== 'demo123') {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Email ou senha inválidos',
          });
        }
        let user = await db.getUserByEmail(input.email);
        if (!user) {
          await db.createLocalUser(input.email, input.email.split('@')[0]);
          user = await db.getUserByEmail(input.email);
        }
        if (!user) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Erro ao criar usuário',
          });
        }
        const sessionToken = await sdk.createSessionToken(user.openId, {
          name: user.name || user.email || '',
        });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, cookieOptions);
        return {
          success: true,
          user,
        };
      })
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
          
          const employeeId = result;
          
          // Atribuir automaticamente os cursos pendentes da loja
          if (employeeId) {
            await assignPendingCoursesToEmployee(employeeId, input.storeId);
          }
          
          return { success: true, id: employeeId };
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

    autoAssignPending: protectedProcedure
      .input(z.object({
        storeId: z.number(),
        employeeId: z.number(),
      }))
      .mutation(async ({ input }) => {
        try {
          const totalAssignments = await assignPendingCoursesToEmployee(input.employeeId, input.storeId);
          return { success: true, totalAssignments };
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erro ao atribuir cursos pendentes",
          });
        }
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
        brand: z.enum(["FORD", "GWM", "AMBOS"]).default("AMBOS"),
        modality: z.enum(["online", "presencial", "abraadiff"]).default("online"),
        autoAssign: z.boolean().default(true),
        requiredFunctions: z.array(z.string()).optional(),
      }))
      .mutation(async ({ input }) => {
        try {
          const result = await db.createCourse({
            storeId: input.storeId,
            title: input.title,
            description: input.description,
            area: input.area,
            brand: input.brand,
            modality: input.modality,
            autoAssign: input.autoAssign,
          });
          
          const courseId = result;
          
          // Adicionar funções obrigatórias se fornecidas
          if (input.requiredFunctions && input.requiredFunctions.length > 0) {
            for (const func of input.requiredFunctions) {
              await db.addRequiredFunctionToCourse(courseId, func);
            }
            // Atribuir automaticamente aos funcionários com essas funções
            await db.assignCourseToEmployeesByFunction(input.storeId, courseId, input.requiredFunctions);
          } else if (input.autoAssign && courseId) {
            // Se não há funções obrigatórias, atribuir por marca
            await autoAssignCourseToStores(courseId);
          }
          
          return { success: true, id: courseId };
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
        brand: z.enum(["FORD", "GWM", "AMBOS"]).optional(),
        modality: z.enum(["online", "presencial", "abraadiff"]).optional(),
        autoAssign: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, brand, ...data } = input;
        const updateData: any = data;
        
        // Se a marca foi alterada, reatribuir o curso
        if (brand) {
          const course = await db.getCourseById(id);
          if (course && course.brand !== brand) {
            await reAssignCourseByBrand(id, course.brand, brand);
          }
          updateData.brand = brand;
        }
        
        await db.updateCourse(id, data);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteCourse(input.id);
        return { success: true };
      }),

    getRequiredFunctions: protectedProcedure
      .input(z.object({ courseId: z.number() }))
      .query(async ({ input }) => {
        return db.getRequiredFunctionsForCourse(input.courseId);
      }),

    addRequiredFunction: protectedProcedure
      .input(z.object({ courseId: z.number(), function: z.string() }))
      .mutation(async ({ input }) => {
        await db.addRequiredFunctionToCourse(input.courseId, input.function);
        return { success: true };
      }),

    removeRequiredFunction: protectedProcedure
      .input(z.object({ courseId: z.number(), function: z.string() }))
      .mutation(async ({ input }) => {
        await db.deleteRequiredFunctionFromCourse(input.courseId, input.function);
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

    getByEmployee: protectedProcedure
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
          return { success: true, id: result };
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erro ao atribuir curso",
          });
        }
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

    uploadCertificate: protectedProcedure
      .input(z.object({
        assignmentId: z.number(),
        fileName: z.string(),
        fileBuffer: z.string(), // Base64 encoded string
        mimeType: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        try {
          const assignment = await db.getCourseAssignmentById(input.assignmentId);
          if (!assignment) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Atribuição não encontrada",
            });
          }

          const employee = await db.getEmployeeById(assignment.employeeId);
          const course = await db.getCourseById(assignment.courseId);
          if (!employee || !course) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Funcionário ou curso não encontrado",
            });
          }

          // Fazer upload para Google Drive
          // Converter base64 para Buffer
          const buffer = Buffer.from(input.fileBuffer, 'base64');
          
          // Determinar mimeType baseado na extensão do arquivo
          let mimeType = input.mimeType || 'application/pdf';
          const fileExt = input.fileName.split('.').pop()?.toLowerCase();
          if (fileExt === 'jpg' || fileExt === 'jpeg') {
            mimeType = 'image/jpeg';
          } else if (fileExt === 'png') {
            mimeType = 'image/png';
          } else if (fileExt === 'pdf') {
            mimeType = 'application/pdf';
          }
          
          try {
            const { fileId, fileUrl } = await uploadCertificate(
              assignment.storeId,
              assignment.courseId,
              employee.area,
              input.fileName,
              buffer,
              employee.name,
              mimeType
            );

            // Atualizar atribuição com URL do certificado
            await db.updateCourseAssignment(input.assignmentId, {
              status: "concluido",
              completedAt: new Date(),
              certificateUrl: fileUrl,
              certificateKey: fileId,
            });

            // Notificar o owner
            const store = await db.getStoreById(assignment.storeId);
            if (store) {
              await notifyOwner({
                title: "Certificado Enviado",
                content: `${employee.name} completou o treinamento "${course.title}" na loja ${store.storeName}. Certificado armazenado no Google Drive.`,
              });
            }

            return { success: true, fileUrl, fileId };
          } catch (uploadError) {
            console.error('Erro detalhado no upload:', uploadError);
            const errorMessage = uploadError instanceof Error ? uploadError.message : String(uploadError);
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: `Erro ao fazer upload: ${errorMessage}`,
              cause: uploadError,
            });
          }


        } catch (error) {
          console.error("Erro ao fazer upload do certificado:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erro ao fazer upload do certificado",
          });
        }
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

        const progressByFunction: Record<string, { total: number; completed: number; percentage: number }> = {};

        for (const employee of employees) {
          if (!progressByFunction[employee.function]) {
            progressByFunction[employee.function] = { total: 0, completed: 0, percentage: 0 };
          }

          const employeeAssignments = assignments.filter(a => a.employeeId === employee.id);
          progressByFunction[employee.function].total += employeeAssignments.length;
          progressByFunction[employee.function].completed += employeeAssignments.filter(a => a.status === "concluido").length;
        }

        // Calcular percentuais
        for (const func in progressByFunction) {
          const data = progressByFunction[func];
          data.percentage = data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0;
        }

        return progressByFunction;
      }),

    trainingProgressByArea: protectedProcedure
      .input(z.object({ storeId: z.number() }))
      .query(async ({ input }) => {
        const assignments = await db.getAssignmentsByStore(input.storeId);
        const employees = await db.getEmployeesByStore(input.storeId);

        const progressByArea: Record<string, { total: number; completed: number; percentage: number }> = {
          vendas: { total: 0, completed: 0, percentage: 0 },
          pos_vendas: { total: 0, completed: 0, percentage: 0 },
        };

        for (const employee of employees) {
          const employeeAssignments = assignments.filter(a => a.employeeId === employee.id);
          progressByArea[employee.area].total += employeeAssignments.length;
          progressByArea[employee.area].completed += employeeAssignments.filter(a => a.status === "concluido").length;
        }

        // Calcular percentuais
        for (const area in progressByArea) {
          const data = progressByArea[area];
          data.percentage = data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0;
        }

        return progressByArea;
      }),

    overallProgress: protectedProcedure
      .input(z.object({ storeId: z.number() }))
      .query(async ({ input }) => {
        const assignments = await db.getAssignmentsByStore(input.storeId);
        const total = assignments.length;
        const completed = assignments.filter(a => a.status === "concluido").length;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        return {
          total,
          completed,
          pending: total - completed,
          percentage,
        };
      }),
  }),

  // ============ DASHBOARD ============
  dashboard: router({
    modalityDistribution: protectedProcedure
      .input(z.object({ storeId: z.number() }))
      .query(async ({ input }) => {
        return db.getModalityDistribution(input.storeId);
      }),
  }),
});

export type AppRouter = typeof appRouter;
