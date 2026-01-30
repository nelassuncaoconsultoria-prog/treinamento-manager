-- Add storeId column to users table
ALTER TABLE users ADD COLUMN "storeId" integer;

-- Add comment to explain the column
COMMENT ON COLUMN users."storeId" IS 'ID da loja vinculada (null para admin que acessa todas)';
