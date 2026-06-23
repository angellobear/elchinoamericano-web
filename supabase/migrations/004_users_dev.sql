-- =========================================================
-- El Chino Americano — Dev Users Seed
-- ⚠️  DEVELOPMENT ONLY — change passwords before production
-- Run after 001_schema.sql + 002_seed.sql
-- =========================================================
--
-- Passwords (bcrypt $2b$12$, change after first login):
--   superadmin@elchinoamericano.com  →  SuperAdmin.2025!
--   admin@elchinoamericano.com       →  Admin.2025!
--   vendedor@elchinoamericano.com    →  Empleado.2025!
--
-- Regenerate hashes:
--   node -e "const b=require('bcryptjs'); console.log(b.hashSync('NuevaPass123!', 12))"
-- =========================================================

INSERT INTO users (id, email, password_hash, full_name, role_id, is_active) VALUES
  (
    'a1b2c3d4-0001-0000-0000-000000000001',
    'superadmin@elchinoamericano.com',
    '$2b$12$FqjMHT2Xz6TiQRFjg3wGW.l/9q9u3EVf3r8WF2bZtgOBf0TPE6mRy',
    'Super Administrador',
    (SELECT id FROM roles WHERE name = 'superadmin'),
    TRUE
  ),
  (
    'a1b2c3d4-0002-0000-0000-000000000002',
    'admin@elchinoamericano.com',
    '$2b$12$kyUVc7FRw8UknmFYrpQuH.0JNCQxTWsSp3fexjKWnekwQIKiQnIh6',
    'Administrador General',
    (SELECT id FROM roles WHERE name = 'admin'),
    TRUE
  ),
  (
    'a1b2c3d4-0003-0000-0000-000000000003',
    'vendedor@elchinoamericano.com',
    '$2b$12$1W72UM2byRk9H8aPj6fe1Ols/qT/yMB5RKDjnbbaLnAjdhggp9dIW',
    'Vendedor Uno',
    (SELECT id FROM roles WHERE name = 'employee'),
    TRUE
  );
