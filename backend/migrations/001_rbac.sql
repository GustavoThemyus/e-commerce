-- Autenticação e controle de acesso por permissões (RBAC)
-- Idempotente: pode rodar em um banco que já tem o schema.sql aplicado.
--   docker:   docker exec -i ecommerce-db psql -U postgres -d ecommerce < backend/migrations/001_rbac.sql
--   supabase: cole no SQL Editor depois de rodar o schema.sql

CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  email         TEXT        NOT NULL UNIQUE,
  password_hash TEXT        NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS roles (
  id   SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS permissions (
  id   SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS role_permissions (
  role_id       INTEGER NOT NULL REFERENCES roles(id)       ON DELETE CASCADE,
  permission_id INTEGER NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS user_roles (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id)
);

-- Compra feita por um usuário logado. Nulo para compra como convidado.
ALTER TABLE sales
  ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_sales_user_id ON sales(user_id);

-- =====================================================
-- Roles e permissões iniciais
-- =====================================================
INSERT INTO roles (name) VALUES ('admin'), ('customer')
ON CONFLICT (name) DO NOTHING;

INSERT INTO permissions (name) VALUES
  ('product:write'),
  ('order:read:any'),
  ('order:read:own')
ON CONFLICT (name) DO NOTHING;

-- admin: tudo. customer: só os próprios pedidos.
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON (
  r.name = 'admin'
  OR (r.name = 'customer' AND p.name = 'order:read:own')
)
ON CONFLICT DO NOTHING;
