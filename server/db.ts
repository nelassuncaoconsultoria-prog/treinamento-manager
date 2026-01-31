import { eq, and, desc, inArray, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { createPool } from "mysql2/promise";
import { InsertUser, users, employees, InsertEmployee, courses, InsertCourse, courseAssignments, InsertCourseAssignment, googleDriveConfig, InsertGoogleDriveConfig, courseFolders, InsertCourseFolder, stores, InsertStore, courseRequiredFunctions, InsertCourseRequiredFunction } from "../drizzle/schema";
import { ENV } from './_core/env';
import * as bcrypt from 'bcrypt';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const pool = await createPool({
        uri: process.env.DATABASE_URL,
        waitForConnections: true,
        connectionLimit: 5,
        queueLimit: 0,
      });
      _db = drizzle(pool);
      console.log("[Database] Connected successfully");
    } catch (error) {
      console.error("[Database] Failed to connect:", error);
      _db = null;
    }
  } else if (!_db) {
    console.warn("[Database] DATABASE_URL not set");
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    // For MySQL/TiDB, check if user exists and insert or update
    const existingUser = await db.select().from(users).where(eq(users.openId, values.openId)).limit(1);
    
    if (existingUser.length > 0) {
      // User exists, update
      await db.update(users).set(updateSet).where(eq(users.openId, values.openId));
    } else {
      // User doesn't exist, insert
      await db.insert(users).values(values);
    }
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ EMPLOYEES ============

export async function createEmployee(data: InsertEmployee) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(employees).values(data).returning({ id: employees.id });
  return result[0]?.id || 0;
}

export async function getEmployees() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(employees).orderBy(desc(employees.createdAt));
}

export async function getEmployeeById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(employees).where(eq(employees.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateEmployee(id: number, data: Partial<InsertEmployee>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.update(employees).set({ ...data, updatedAt: new Date() }).where(eq(employees.id, id));
}

export async function deleteEmployee(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.delete(employees).where(eq(employees.id, id));
}

// ============ COURSES ============

export async function createCourse(data: InsertCourse) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Insert and return the created course with ID
  const result = await db.insert(courses).values(data).returning({ id: courses.id });
  return result[0]?.id || 0;
}

export async function getCourses() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(courses).orderBy(desc(courses.createdAt));
}

export async function getCourseById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(courses).where(eq(courses.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateCourse(id: number, data: Partial<InsertCourse>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.update(courses).set({ ...data, updatedAt: new Date() }).where(eq(courses.id, id));
}

export async function deleteCourse(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.delete(courses).where(eq(courses.id, id));
}

// ============ COURSE ASSIGNMENTS ============

export async function createCourseAssignment(data: InsertCourseAssignment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(courseAssignments).values(data).returning({ id: courseAssignments.id });
  return result[0]?.id || 0;
}

export async function getCourseAssignments() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(courseAssignments).orderBy(desc(courseAssignments.assignedAt));
}

export async function getCourseAssignmentsByEmployee(employeeId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(courseAssignments).where(eq(courseAssignments.employeeId, employeeId));
}

export async function getCourseAssignmentById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(courseAssignments).where(eq(courseAssignments.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateCourseAssignment(id: number, data: Partial<InsertCourseAssignment>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.update(courseAssignments).set({ ...data, updatedAt: new Date() }).where(eq(courseAssignments.id, id));
}

export async function deleteCourseAssignment(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.delete(courseAssignments).where(eq(courseAssignments.id, id));
}

// ============ GOOGLE DRIVE CONFIG ============

export async function getGoogleDriveConfig() {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(googleDriveConfig).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateGoogleDriveConfig(data: Partial<InsertGoogleDriveConfig>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await getGoogleDriveConfig();
  if (existing) {
    return db.update(googleDriveConfig).set({ ...data, updatedAt: new Date() }).where(eq(googleDriveConfig.id, existing.id));
  } else {
    return db.insert(googleDriveConfig).values({ ...data } as InsertGoogleDriveConfig);
  }
}

// ============ COURSE FOLDERS ============

export async function createCourseFolder(data: InsertCourseFolder) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(courseFolders).values(data);
}

export async function getCourseFolders() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(courseFolders).orderBy(desc(courseFolders.createdAt));
}

export async function getCourseFolderByCourseAndArea(courseId: number, area: "vendas" | "pos_vendas") {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(courseFolders).where(
    and(eq(courseFolders.courseId, courseId), eq(courseFolders.area, area))
  ).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============ STORES ============

export async function getStores() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(stores).orderBy(desc(stores.createdAt));
}

export async function getStoreById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(stores).where(eq(stores.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getEmployeesByStore(storeId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(employees).where(eq(employees.storeId, storeId));
}

export async function getCoursesByStore(storeId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(courses).where(eq(courses.storeId, storeId));
}

export async function getAssignmentsByStore(storeId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(courseAssignments).where(eq(courseAssignments.storeId, storeId));
}


// ============ DASHBOARD ANALYTICS ============

export async function getModalityDistribution(storeId: number) {
  const db = await getDb();
  if (!db) return { online: 0, presencial: 0, abraadiff: 0 };
  
  const allCourses = await db.select().from(courses).where(eq(courses.storeId, storeId));
  
  const distribution = {
    online: 0,
    presencial: 0,
    abraadiff: 0,
  };
  
  allCourses.forEach(course => {
    if (course.modality === 'online') distribution.online++;
    else if (course.modality === 'presencial') distribution.presencial++;
    else if (course.modality === 'abraadiff') distribution.abraadiff++;
  });
  
  return distribution;
}

// ============ COURSE REQUIRED FUNCTIONS ============

export async function addRequiredFunctionToCourse(courseId: number, function_: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(courseRequiredFunctions).values({
    courseId,
    function: function_,
  });
}

export async function getRequiredFunctionsForCourse(courseId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(courseRequiredFunctions).where(eq(courseRequiredFunctions.courseId, courseId));
}

export async function deleteRequiredFunctionFromCourse(courseId: number, function_: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(courseRequiredFunctions)
    .where(and(
      eq(courseRequiredFunctions.courseId, courseId),
      eq(courseRequiredFunctions.function, function_)
    ));
}

export async function assignCourseToEmployeesByFunction(storeId: number, courseId: number, functions: string[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Buscar todos os funcionários da loja que têm uma das funções obrigatórias
  const employeesWithFunction = await db.select().from(employees).where(
    and(
      eq(employees.storeId, storeId),
      inArray(employees.function, functions)
    )
  );
  
  // Atribuir o curso a cada funcionário
  for (const employee of employeesWithFunction) {
    // Verificar se já existe atribuição
    const existing = await db.select().from(courseAssignments).where(
      and(
        eq(courseAssignments.employeeId, employee.id),
        eq(courseAssignments.courseId, courseId)
      )
    );
    
    if (existing.length === 0) {
      await db.insert(courseAssignments).values({
        storeId,
        employeeId: employee.id,
        courseId,
        status: "pendente",
      });
    }
  }
}


// ============ LOCAL AUTH ============

export async function createLocalUser(email: string, name: string, password?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Hash password if provided
  let passwordHash = null;
  if (password) {
    passwordHash = await bcrypt.hash(password, 10);
  }
  
  // Use email as openId for local auth
  const result = await db.insert(users).values({
    openId: email,
    email: email,
    name: name,
    loginMethod: "local",
    role: "user",
    storeId: null,
    passwordHash: passwordHash,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  });
  
  return result;
}

export async function verifyPassword(email: string, password: string): Promise<boolean> {
  const user = await getUserByEmail(email);
  if (!user || !user.passwordHash) {
    return false;
  }
  
  return bcrypt.compare(password, user.passwordHash);
}

export async function updateUserPassword(email: string, password: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const passwordHash = await bcrypt.hash(password, 10);
  
  await db.update(users)
    .set({ passwordHash, updatedAt: new Date() })
    .where(eq(users.email, email));
}


// ============ MASTER USERS MANAGEMENT ============

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(users).orderBy(desc(users.createdAt));
}

export async function getUsersByStore(storeId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(users).where(eq(users.storeId, storeId)).orderBy(desc(users.createdAt));
}

export async function createMasterUser(data: {
  email: string;
  name: string;
  storeId: number;
  role: 'user' | 'admin';
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(users).values({
    openId: `local-${data.email}-${Date.now()}`,
    email: data.email,
    name: data.name,
    storeId: data.storeId,
    role: data.role,
    loginMethod: 'local',
    lastSignedIn: new Date(),
  }).returning({ id: users.id });
  
  return result[0]?.id || 0;
}

export async function updateMasterUser(id: number, data: {
  name?: string;
  storeId?: number;
  role?: 'user' | 'admin';
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (data.name !== undefined) updateData.name = data.name;
  if (data.storeId !== undefined) updateData.storeId = data.storeId;
  if (data.role !== undefined) updateData.role = data.role;
  
  return db.update(users).set(updateData).where(eq(users.id, id));
}

export async function deleteMasterUser(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.delete(users).where(eq(users.id, id));
}
