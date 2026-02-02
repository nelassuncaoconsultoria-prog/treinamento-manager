import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import * as db from "../db";
import { TRPCError } from "@trpc/server";

export const usersRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    // Admin vê todos os usuários, master vê apenas usuários da sua loja
    if (ctx.user?.role === 'admin') {
      return db.getAllUsers();
    } else if (ctx.user?.storeId) {
      return db.getUsersByStore(ctx.user.storeId);
    }
    return [];
  }),

  create: protectedProcedure
    .input(z.object({
      email: z.string().email(),
      name: z.string().min(1),
      password: z.string().min(6).optional(),
      storeId: z.number(),
      role: z.enum(['user', 'admin']).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Apenas admin pode criar usuários
      if (ctx.user?.role !== 'admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Apenas administradores podem criar usuários',
        });
      }

      try {
        const result = await db.createMasterUser({
          email: input.email,
          name: input.name,
          storeId: input.storeId,
          role: input.role || 'user',
          password: input.password,
        });
        return result;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Erro ao criar usuário',
        });
      }
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      storeId: z.number().optional(),
      role: z.enum(['user', 'admin']).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Apenas admin pode atualizar usuários
      if (ctx.user?.role !== 'admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Apenas administradores podem atualizar usuários',
        });
      }

      try {
        await db.updateMasterUser(input.id, {
          name: input.name,
          storeId: input.storeId,
          role: input.role,
        });
        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Erro ao atualizar usuário',
        });
      }
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      // Apenas admin pode deletar usuários
      if (ctx.user?.role !== 'admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Apenas administradores podem deletar usuários',
        });
      }

      try {
        await db.deleteMasterUser(input.id);
        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Erro ao deletar usuário',
        });
      }
    }),
});
