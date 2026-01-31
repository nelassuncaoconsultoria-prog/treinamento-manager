import { getDb } from './server/_core/db.js';
import bcrypt from 'bcryptjs';

const db = getDb();

async function createAdmin() {
  try {
    const hashedPassword = await bcrypt.hash('Senh@123', 10);
    
    const result = await db.execute(
      `INSERT INTO users (name, email, loginMethod, role, storeId, createdAt, updatedAt, lastSignedIn) 
       VALUES (?, ?, ?, ?, ?, NOW(), NOW(), NOW())`,
      ['Nelcleton Assunção', 'gestao.qualidade@megaveiculos.com', 'local', 'admin', null]
    );
    
    console.log('✅ Usuário administrador criado com sucesso!');
    console.log('Email: gestao.qualidade@megaveiculos.com');
    console.log('Senha: Senh@123');
    console.log('Role: admin');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error.message);
    process.exit(1);
  }
}

createAdmin();
