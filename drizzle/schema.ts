import { integer, pgEnum, pgTable, text, timestamp, varchar, boolean, numeric, serial } from "drizzle-orm/pg-core";

/**
 * Enums for PostgreSQL
 */
export const roleEnum = pgEnum("role", ["user", "admin"]);
export const areaEnum = pgEnum("area", ["vendas", "pos_vendas"]);
export const employeeStatusEnum = pgEnum("employee_status", ["ativo", "inativo"]);
export const brandEnum = pgEnum("brand", ["FORD", "GWM", "AMBOS"]);
export const modalityEnum = pgEnum("modality", ["online", "presencial", "abraadiff"]);
export const assignmentStatusEnum = pgEnum("assignment_status", ["pendente", "concluido"]);
export const storeStatusEnum = pgEnum("store_status", ["ativo", "inativo"]);

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = pgTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: serial("id").primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  storeId: integer("storeId"), // ID da loja vinculada (null para admin que acessa todas)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Funcionários da empresa
 * Armazena informações de cada funcionário que realizará treinamentos
 */
export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  storeId: integer("storeId").notNull(), // ID da loja
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  function: varchar("function", { length: 255 }).notNull(), // Cargo/Função do funcionário
  area: areaEnum("area").notNull(), // Área: Vendas ou Pós-Vendas
  status: employeeStatusEnum("status").default("ativo").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = typeof employees.$inferInsert;

/**
 * Cursos de treinamento
 * Armazena os cursos disponíveis para os funcionários
 */
export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  storeId: integer("storeId").notNull(), // ID da loja
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  area: areaEnum("area").notNull(), // Área associada ao curso
  brand: brandEnum("brand").default("AMBOS").notNull(), // Marca do veículo: FORD, GWM ou AMBOS
  modality: modalityEnum("modality").default("online").notNull(), // Modalidade: Online, Presencial ou ABRAADIFF
  autoAssign: boolean("autoAssign").default(true).notNull(), // Se deve atribuir automaticamente aos funcionários
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Course = typeof courses.$inferSelect;
export type InsertCourse = typeof courses.$inferInsert;
export type CourseBrand = "FORD" | "GWM" | "AMBOS";
export type CourseModality = "online" | "presencial" | "abraadiff";

/**
 * Atribuições de cursos aos funcionários
 * Rastreia quais cursos foram atribuídos a cada funcionário e seu status
 */
export const courseAssignments = pgTable("course_assignments", {
  id: serial("id").primaryKey(),
  storeId: integer("storeId").notNull(), // ID da loja
  employeeId: integer("employeeId").notNull(),
  courseId: integer("courseId").notNull(),
  status: assignmentStatusEnum("status").default("pendente").notNull(),
  assignedAt: timestamp("assignedAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"), // Data de conclusão do curso
  certificateUrl: text("certificateUrl"), // URL do certificado no Google Drive
  certificateKey: varchar("certificateKey", { length: 512 }), // Chave do arquivo no Google Drive
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type CourseAssignment = typeof courseAssignments.$inferSelect;
export type InsertCourseAssignment = typeof courseAssignments.$inferInsert;

/**
 * Configuração de integração com Google Drive
 * Armazena informações de autenticação e estrutura de pastas
 */
export const googleDriveConfig = pgTable("google_drive_config", {
  id: serial("id").primaryKey(),
  accessToken: text("accessToken").notNull(),
  refreshToken: text("refreshToken"),
  expiresAt: timestamp("expiresAt"),
  rootFolderId: varchar("rootFolderId", { length: 255 }), // ID da pasta raiz de treinamentos
  vendaFolderId: varchar("vendaFolderId", { length: 255 }), // ID da pasta de Vendas
  posVendaFolderId: varchar("posVendaFolderId", { length: 255 }), // ID da pasta de Pós-Vendas
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type GoogleDriveConfig = typeof googleDriveConfig.$inferSelect;
export type InsertGoogleDriveConfig = typeof googleDriveConfig.$inferInsert;

/**
 * Estrutura de pastas de cursos no Google Drive
 * Rastreia as pastas criadas para cada curso em cada área
 */
export const courseFolders = pgTable("course_folders", {
  id: serial("id").primaryKey(),
  courseId: integer("courseId").notNull(),
  area: areaEnum("area").notNull(),
  folderId: varchar("folderId", { length: 255 }).notNull(), // ID da pasta no Google Drive
  folderPath: varchar("folderPath", { length: 512 }), // Caminho da pasta (ex: Vendas/Curso XYZ)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CourseFolder = typeof courseFolders.$inferSelect;
export type InsertCourseFolder = typeof courseFolders.$inferInsert;

/**
 * Lojas/Filiais
 * Armazena as diferentes lojas que usarão o sistema
 */
export const stores = pgTable("stores", {
  id: serial("id").primaryKey(),
  storeCode: varchar("storeCode", { length: 50 }).notNull().unique(), // Código da loja (ex: 5062)
  storeName: varchar("storeName", { length: 255 }).notNull(), // Nome da loja
  city: varchar("city", { length: 255 }), // Cidade
  status: storeStatusEnum("status").default("ativo").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Store = typeof stores.$inferSelect;
export type InsertStore = typeof stores.$inferInsert;

/**
 * Funções obrigatórias para cursos
 * Armazena quais funções são obrigatórias para cada curso
 * Um curso pode ter múltiplas funções obrigatórias
 */
export const courseRequiredFunctions = pgTable("course_required_functions", {
  id: serial("id").primaryKey(),
  courseId: integer("courseId").notNull(), // ID do curso
  function: varchar("function", { length: 255 }).notNull(), // Nome da função obrigatória
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CourseRequiredFunction = typeof courseRequiredFunctions.$inferSelect;
export type InsertCourseRequiredFunction = typeof courseRequiredFunctions.$inferInsert;
