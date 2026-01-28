-- Create enums
CREATE TYPE role AS ENUM ('user', 'admin');
CREATE TYPE area AS ENUM ('vendas', 'pos_vendas');
CREATE TYPE employee_status AS ENUM ('ativo', 'inativo');
CREATE TYPE brand AS ENUM ('FORD', 'GWM', 'AMBOS');
CREATE TYPE modality AS ENUM ('online', 'presencial', 'abraadiff');
CREATE TYPE assignment_status AS ENUM ('pendente', 'concluido');
CREATE TYPE store_status AS ENUM ('ativo', 'inativo');

-- Create users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  "openId" VARCHAR(64) NOT NULL UNIQUE,
  name TEXT,
  email VARCHAR(320),
  "loginMethod" VARCHAR(64),
  role role NOT NULL DEFAULT 'user',
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "lastSignedIn" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create employees table
CREATE TABLE employees (
  id SERIAL PRIMARY KEY,
  "storeId" INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(320) NOT NULL,
  function VARCHAR(255) NOT NULL,
  area area NOT NULL,
  status employee_status NOT NULL DEFAULT 'ativo',
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create courses table
CREATE TABLE courses (
  id SERIAL PRIMARY KEY,
  "storeId" INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  area area NOT NULL,
  brand brand NOT NULL DEFAULT 'AMBOS',
  modality modality NOT NULL DEFAULT 'online',
  "autoAssign" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create course_assignments table
CREATE TABLE course_assignments (
  id SERIAL PRIMARY KEY,
  "storeId" INTEGER NOT NULL,
  "employeeId" INTEGER NOT NULL,
  "courseId" INTEGER NOT NULL,
  status assignment_status NOT NULL DEFAULT 'pendente',
  "assignedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "completedAt" TIMESTAMP,
  "certificateUrl" TEXT,
  "certificateKey" VARCHAR(512),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create google_drive_config table
CREATE TABLE google_drive_config (
  id SERIAL PRIMARY KEY,
  "accessToken" TEXT NOT NULL,
  "refreshToken" TEXT,
  "expiresAt" TIMESTAMP,
  "rootFolderId" VARCHAR(255),
  "vendaFolderId" VARCHAR(255),
  "posVendaFolderId" VARCHAR(255),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create course_folders table
CREATE TABLE course_folders (
  id SERIAL PRIMARY KEY,
  "courseId" INTEGER NOT NULL,
  area area NOT NULL,
  "folderId" VARCHAR(255) NOT NULL,
  "folderPath" VARCHAR(512),
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create stores table
CREATE TABLE stores (
  id SERIAL PRIMARY KEY,
  "storeCode" VARCHAR(50) NOT NULL UNIQUE,
  "storeName" VARCHAR(255) NOT NULL,
  city VARCHAR(255),
  status store_status NOT NULL DEFAULT 'ativo',
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create course_required_functions table
CREATE TABLE course_required_functions (
  id SERIAL PRIMARY KEY,
  "courseId" INTEGER NOT NULL,
  function VARCHAR(255) NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create drizzle schema for migrations tracking
CREATE SCHEMA IF NOT EXISTS drizzle;

-- Create drizzle migrations table
CREATE TABLE IF NOT EXISTS drizzle.__drizzle_migrations (
  id SERIAL PRIMARY KEY,
  hash TEXT NOT NULL UNIQUE,
  created_at BIGINT
);
