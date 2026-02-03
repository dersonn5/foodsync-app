-- Migration: Add department column to users table
-- Date: 2026-02-03
-- Purpose: Enable sector/department tracking for CSV export functionality

-- ============================================
-- Step 1: Add department column
-- ============================================

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS department TEXT DEFAULT 'Geral';

-- ============================================
-- Step 2: Add comment for documentation
-- ============================================

COMMENT ON COLUMN users.department IS 'Setor/departamento do funcionário para relatórios de contingência';

-- ============================================
-- Step 3: Create index for potential filtering
-- ============================================

CREATE INDEX IF NOT EXISTS idx_users_department ON users(department);

-- ============================================
-- Example: Update departments manually (optional)
-- ============================================

-- UPDATE users SET department = 'Produção' WHERE name LIKE '%Cozinha%';
-- UPDATE users SET department = 'Administrativo' WHERE name LIKE '%Admin%';
-- UPDATE users SET department = 'TI' WHERE email LIKE '%ti@%';

-- ============================================
-- Rollback (if needed)
-- ============================================

-- ALTER TABLE users DROP COLUMN IF EXISTS department;
-- DROP INDEX IF EXISTS idx_users_department;
