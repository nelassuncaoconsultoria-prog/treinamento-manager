import { eq, and, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, employees, InsertEmployee, courses, InsertCourse, courseAssignments, InsertCourseAssignment, googleDriveConfig, InsertGoogleDriveConfig, courseFolders, InsertCourseFolder, stores, InsertStore } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
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

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
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
  
  const result = await db.insert(employees).values(data);
  return result;
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
  
  const result = await db.insert(courses).values(data);
  return result;
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
  
  const result = await db.insert(courseAssignments).values(data);
  return result;
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
