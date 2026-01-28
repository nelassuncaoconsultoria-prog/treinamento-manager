import * as db from './db';
import { CourseBrand } from '../drizzle/schema';

/**
 * Obtém as lojas que devem receber um curso baseado na marca
 */
export function getStoresForBrand(brand: CourseBrand): number[] {
  // 5062 - Ford Mega Porto Velho
  // 4270 - Ford Mega Ariquemes
  // GWM - GWM Mega Motors Porto Velho (ID 3)

  if (brand === 'FORD') {
    return [1, 2]; // IDs das lojas Ford
  } else if (brand === 'GWM') {
    return [3]; // ID da loja GWM
  } else {
    return [1, 2, 3]; // Todas as lojas
  }
}

/**
 * Atribui automaticamente um curso aos funcionários das lojas apropriadas
 */
export async function autoAssignCourseToStores(courseId: number): Promise<number> {
  try {
    const course = await db.getCourseById(courseId);
    if (!course || !course.autoAssign) {
      return 0;
    }

    // Obter as lojas que devem receber este curso
    const storeIds = getStoresForBrand(course.brand);
    let totalAssignments = 0;

    // Para cada loja, atribuir o curso a todos os funcionários
    for (const storeId of storeIds) {
      const employees = await db.getEmployeesByStore(storeId);
      
      for (const employee of employees) {
        // Verificar se já existe atribuição
        const existing = await db.getCourseAssignmentsByEmployee(employee.id);
        const alreadyAssigned = existing.some(a => a.courseId === courseId);
        
        if (!alreadyAssigned) {
          // Criar nova atribuição
          await db.createCourseAssignment({
            storeId,
            employeeId: employee.id,
            courseId,
            status: 'pendente',
          });
          totalAssignments++;
        }
      }
    }

    return totalAssignments;
  } catch (error) {
    console.error('Erro ao atribuir curso automaticamente:', error);
    throw error;
  }
}

/**
 * Reatribui um curso quando sua marca é alterada
 */
export async function reAssignCourseByBrand(courseId: number, oldBrand: CourseBrand, newBrand: CourseBrand): Promise<void> {
  try {
    const course = await db.getCourseById(courseId);
    if (!course || !course.autoAssign) {
      return;
    }

    const oldStores = getStoresForBrand(oldBrand);
    const newStores = getStoresForBrand(newBrand);

    // Remover atribuições de lojas que não devem mais ter este curso
    const storesToRemove = oldStores.filter(s => !newStores.includes(s));
    for (const storeId of storesToRemove) {
      const assignments = await db.getAssignmentsByStore(storeId);
      const courseAssignments = assignments.filter(a => a.courseId === courseId && a.status === 'pendente');
      
      for (const assignment of courseAssignments) {
        await db.deleteCourseAssignment(assignment.id);
      }
    }

    // Adicionar atribuições para novas lojas
    const storesToAdd = newStores.filter(s => !oldStores.includes(s));
    for (const storeId of storesToAdd) {
      const employees = await db.getEmployeesByStore(storeId);
      
      for (const employee of employees) {
        const existing = await db.getCourseAssignmentsByEmployee(employee.id);
        const alreadyAssigned = existing.some(a => a.courseId === courseId);
        
        if (!alreadyAssigned) {
          await db.createCourseAssignment({
            storeId,
            employeeId: employee.id,
            courseId,
            status: 'pendente',
          });
        }
      }
    }
  } catch (error) {
    console.error('Erro ao reatribuir curso:', error);
    throw error;
  }
}

/**
 * Atribui um novo funcionário a todos os cursos pendentes da sua loja
 */
export async function assignPendingCoursesToEmployee(employeeId: number, storeId: number): Promise<number> {
  try {
    const courses = await db.getCoursesByStore(storeId);
    let totalAssignments = 0;

    for (const course of courses) {
      if (!course.autoAssign) continue;

      // Verificar se o funcionário já tem este curso atribuído
      const existing = await db.getCourseAssignmentsByEmployee(employeeId);
      const alreadyAssigned = existing.some(a => a.courseId === course.id);

      if (!alreadyAssigned) {
        // Verificar se a marca do curso é compatível com a loja
        const storeIds = getStoresForBrand(course.brand);
        if (storeIds.includes(storeId)) {
          await db.createCourseAssignment({
            storeId,
            employeeId,
            courseId: course.id,
            status: 'pendente',
          });
          totalAssignments++;
        }
      }
    }

    return totalAssignments;
  } catch (error) {
    console.error('Erro ao atribuir cursos pendentes ao funcionário:', error);
    throw error;
  }
}
