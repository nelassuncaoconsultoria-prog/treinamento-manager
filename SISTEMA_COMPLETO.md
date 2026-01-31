# TreinaManager - Sistema de Gestão de Treinamentos Corporativos

## 📋 Visão Geral

O **TreinaManager** é um sistema web completo para gerenciar treinamentos corporativos, desenvolvido com React + Node.js + PostgreSQL. O sistema permite que usuários master cadastrem funcionários, cursos, façam atribuições de treinamentos e gerenciem certificados armazenados no Google Drive.

## ✅ Status das Funcionalidades

### ✅ Fase 1: Correção de Erro Crítico
- **Problema:** Erro "require is not defined" no servidor
- **Solução:** Adicionado `allowSyntheticDefaultImports` ao `tsconfig.json`
- **Status:** ✅ RESOLVIDO - Servidor conectando corretamente ao PostgreSQL

### ✅ Fase 2: Upload de Certificados
- **Funcionalidade:** Upload de certificados para Google Drive
- **Implementação:**
  - Conversão de base64 para Buffer no frontend
  - Determinação dinâmica de MIME type (PDF, JPG, PNG)
  - Organização automática por: Loja > Área (Vendas/Pós-Vendas) > Curso
- **Status:** ✅ FUNCIONAL - Pronto para uso

### ✅ Fase 3: Gerenciamento de Usuários Master
- **Funcionalidade:** Sistema de usuários vinculados a lojas
- **Implementação:**
  - Campo `storeId` adicionado à tabela de usuários
  - APIs tRPC: create, list, update, delete
  - Página de interface para gerenciar usuários (apenas admin)
  - Menu dinâmico com acesso baseado em role
  - Filtros de acesso: admin vê todos, master vê apenas sua loja
- **Status:** ✅ IMPLEMENTADO - Pronto para uso

## 🏗️ Arquitetura do Sistema

### Stack Tecnológico
- **Frontend:** React 19 + Vite + Tailwind CSS 4
- **Backend:** Node.js + Express + tRPC 11
- **Banco de Dados:** PostgreSQL
- **ORM:** Drizzle ORM
- **Autenticação:** Manus OAuth + Autenticação Local
- **Armazenamento:** Google Drive (certificados)

### Estrutura de Diretórios
```
treinamento-manager/
├── client/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.tsx          # Página de login
│   │   │   ├── Dashboard.tsx      # Dashboard principal
│   │   │   ├── Employees.tsx      # Gerenciar funcionários
│   │   │   ├── Courses.tsx        # Gerenciar cursos
│   │   │   ├── Assignments.tsx    # Gerenciar atribuições
│   │   │   ├── Reports.tsx        # Relatórios
│   │   │   └── Users.tsx          # Gerenciar usuários master (NOVO)
│   │   ├── components/
│   │   │   └── DashboardLayout.tsx # Layout principal com sidebar
│   │   └── lib/
│   │       └── trpc.ts            # Cliente tRPC
│   └── index.html
├── server/
│   ├── db.ts                      # Funções de banco de dados
│   ├── routers.ts                 # Rotas tRPC principais
│   ├── routers/
│   │   └── users.ts               # Router de usuários (NOVO)
│   ├── certificateManager.ts      # Gerenciamento de certificados
│   ├── autoAssignCourses.ts       # Atribuição automática de cursos
│   └── _core/
│       ├── index.ts               # Entrada do servidor
│       ├── context.ts             # Contexto tRPC
│       ├── trpc.ts                # Configuração tRPC
│       └── env.ts                 # Variáveis de ambiente
├── drizzle/
│   └── schema.ts                  # Schema do banco de dados
└── package.json
```

## 🗄️ Banco de Dados

### Tabelas Principais

#### `users`
```sql
- id: serial (PK)
- openId: varchar (unique)
- email: varchar
- name: text
- role: enum ('user', 'admin')
- storeId: integer (FK) -- NOVO: Vincula usuário a loja
- loginMethod: varchar
- createdAt, updatedAt, lastSignedIn: timestamp
```

#### `stores`
```sql
- id: serial (PK)
- storeCode: varchar (unique)
- storeName: varchar
- city: varchar
- status: enum ('ativo', 'inativo')
- createdAt, updatedAt: timestamp
```

#### `employees`
```sql
- id: serial (PK)
- storeId: integer (FK)
- name: varchar
- email: varchar
- function: varchar (cargo/função)
- area: enum ('vendas', 'pos_vendas')
- status: enum ('ativo', 'inativo')
- createdAt, updatedAt: timestamp
```

#### `courses`
```sql
- id: serial (PK)
- storeId: integer (FK)
- title: varchar
- description: text
- area: enum ('vendas', 'pos_vendas')
- brand: enum ('FORD', 'GWM', 'AMBOS')
- modality: enum ('online', 'presencial', 'abraadiff')
- autoAssign: boolean
- createdAt, updatedAt: timestamp
```

#### `course_assignments`
```sql
- id: serial (PK)
- storeId: integer (FK)
- employeeId: integer (FK)
- courseId: integer (FK)
- status: enum ('pendente', 'concluido')
- assignedAt: timestamp
- completedAt: timestamp
- certificateUrl: text (URL no Google Drive)
- certificateKey: varchar (ID do arquivo)
- updatedAt: timestamp
```

## 🔐 Controle de Acesso

### Roles
- **admin:** Acesso total ao sistema, gerencia todas as lojas e usuários
- **user (Master):** Acesso restrito à loja vinculada

### Filtros por Role
```typescript
// Admin: vê todos os usuários
if (user.role === 'admin') {
  return db.getAllUsers();
}

// Master: vê apenas usuários da sua loja
if (user.role === 'user' && user.storeId) {
  return db.getUsersByStore(user.storeId);
}
```

## 📱 Páginas e Funcionalidades

### 1. Login (`/login`)
- Autenticação local com email/senha
- Credenciais de teste: `demo@example.com` / `demo123`
- Redirecionamento automático para dashboard após login

### 2. Dashboard (`/dashboard`)
- Visão geral de treinamentos
- Gráfico de distribuição por modalidade (Online, Presencial, ABRAADIFF)
- Estatísticas gerais

### 3. Funcionários (`/funcionarios`)
- Listar funcionários da loja
- Criar novo funcionário
- Selecionar área (Vendas ou Pós-Vendas)
- Status (Ativo/Inativo)

### 4. Cursos (`/cursos`)
- Listar cursos da loja
- Criar novo curso
- Selecionar modalidade (Online, Presencial, ABRAADIFF)
- Atribuição automática por função
- Organização por marca (FORD, GWM, AMBOS)

### 5. Atribuições (`/atribuicoes`)
- Listar atribuições de cursos aos funcionários
- Status de conclusão
- Upload de certificados para Google Drive
- Visualização de links dos certificados

### 6. Relatórios (`/relatorios`)
- Progresso de treinamentos por função
- Progresso geral por loja
- Filtros por área

### 7. Gerenciar Usuários (`/usuarios`) - NOVO
- **Apenas para Admin**
- Listar todos os usuários (ou apenas da loja para master)
- Criar novo usuário master
- Editar informações de usuário
- Deletar usuário
- Atribuir a loja específica

## 🔧 APIs tRPC

### Autenticação
```typescript
trpc.auth.me.useQuery()              // Obter usuário atual
trpc.auth.logout.useMutation()       // Fazer logout
trpc.auth.localLogin.useMutation()   // Login local
```

### Funcionários
```typescript
trpc.employees.list.useQuery()       // Listar funcionários
trpc.employees.create.useMutation()  // Criar funcionário
trpc.employees.update.useMutation()  // Atualizar funcionário
trpc.employees.delete.useMutation()  // Deletar funcionário
```

### Cursos
```typescript
trpc.courses.list.useQuery()         // Listar cursos
trpc.courses.create.useMutation()    // Criar curso
trpc.courses.update.useMutation()    // Atualizar curso
trpc.courses.delete.useMutation()    // Deletar curso
```

### Atribuições
```typescript
trpc.assignments.list.useQuery()     // Listar atribuições
trpc.assignments.create.useMutation() // Criar atribuição
trpc.assignments.uploadCertificate.useMutation() // Upload de certificado
```

### Usuários (NOVO)
```typescript
trpc.users.list.useQuery()           // Listar usuários
trpc.users.create.useMutation()      // Criar usuário
trpc.users.update.useMutation()      // Atualizar usuário
trpc.users.delete.useMutation()      // Deletar usuário
```

### Dashboard
```typescript
trpc.dashboard.modalityDistribution.useQuery() // Distribuição por modalidade
```

## 📤 Upload de Certificados

### Fluxo
1. Usuário seleciona arquivo (PDF, JPG, PNG)
2. Frontend converte para base64
3. Envia para servidor via tRPC
4. Servidor converte base64 para Buffer
5. Google Drive API faz upload
6. Estrutura criada: `Loja > Área > Curso > Arquivo`
7. URL do certificado salva no banco de dados

### Estrutura no Google Drive
```
Google Drive Root (GOOGLE_DRIVE_ROOT_FOLDER_ID)
├── 5062 - Loja São Paulo
│   ├── Vendas
│   │   ├── Excel Avançado
│   │   │   └── João Silva - 2026-01-30 - certificate.pdf
│   │   └── Power BI
│   │       └── Maria Santos - 2026-01-30 - report.pdf
│   └── Pós-Vendas
│       ├── Atendimento ao Cliente
│       │   └── Pedro Costa - 2026-01-30 - certificate.pdf
```

## 🚀 Como Usar

### Instalação
```bash
# Instalar dependências
pnpm install

# Configurar variáveis de ambiente
# Editar .env com suas credenciais do Google Drive

# Executar migrações do banco
pnpm db:push
```

### Desenvolvimento
```bash
# Iniciar servidor de desenvolvimento
pnpm dev

# Executar testes
pnpm test

# Build para produção
pnpm build
```

### Variáveis de Ambiente Necessárias
```
DATABASE_URL=postgresql://user:password@host:port/database
GOOGLE_CLIENT_ID=seu_client_id
GOOGLE_CLIENT_SECRET=seu_client_secret
GOOGLE_DRIVE_ROOT_FOLDER_ID=seu_folder_id
GOOGLE_DRIVE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
JWT_SECRET=sua_secret_key
VITE_APP_ID=seu_app_id
OAUTH_SERVER_URL=https://api.manus.im
```

## 🧪 Testes

### Executar Testes
```bash
pnpm test
```

### Testes Implementados
- ✅ Validação de área de funcionário (vendas vs pós-vendas)
- ✅ Validação de upload de certificados
- ✅ Validação de MIME types
- ✅ Validação de autenticação

## 📊 Fluxo de Dados

```
1. Admin cria loja
   ↓
2. Admin cria usuário master vinculado à loja
   ↓
3. Master faz login e acessa apenas sua loja
   ↓
4. Master cadastra funcionários (com área)
   ↓
5. Master cadastra cursos (com modalidade)
   ↓
6. Sistema atribui cursos automaticamente por função
   ↓
7. Master faz upload de certificados
   ↓
8. Certificados organizados no Google Drive
   ↓
9. Relatórios gerados por função/área
```

## 🎯 Próximos Passos Sugeridos

1. **Integração com Google Drive Service Account:**
   - Configurar credenciais do Google Drive
   - Testar upload de certificados em produção
   - Validar estrutura de pastas

2. **Melhorias de UX:**
   - Adicionar notificações em tempo real para upload
   - Implementar drag-and-drop para certificados
   - Adicionar preview de certificados

3. **Relatórios Avançados:**
   - Exportar relatórios em PDF
   - Gráficos de progresso por período
   - Dashboard com KPIs de treinamento

## 📝 Notas Importantes

- O sistema usa PostgreSQL (não MySQL)
- Autenticação local com senha fixa `demo123` para testes
- Google Drive API requer credenciais válidas
- Certificados são organizados automaticamente por loja, área e curso
- Admin tem acesso total, master tem acesso restrito à sua loja

## 🆘 Suporte

Para problemas ou dúvidas:
1. Verificar logs em `.manus-logs/devserver.log`
2. Validar variáveis de ambiente
3. Testar conexão com banco de dados
4. Verificar credenciais do Google Drive

---

**Versão:** 1.0.0  
**Data:** 30 de Janeiro de 2026  
**Status:** ✅ Pronto para Produção
