export function createUserRepository(pool) {
  return {
    // Cria o usuário já com a role "customer". Devolve null se o e-mail já existe.
    async create({ email, passwordHash }) {
      const result = await pool.query(
        `WITH new_user AS (
           INSERT INTO users (email, password_hash)
           VALUES ($1, $2)
           ON CONFLICT (email) DO NOTHING
           RETURNING id, email
         ), role_link AS (
           INSERT INTO user_roles (user_id, role_id)
           SELECT new_user.id, roles.id FROM new_user, roles WHERE roles.name = 'customer'
         )
         SELECT id, email FROM new_user`,
        [email, passwordHash],
      );
      return result.rows[0] ?? null;
    },

    async findByEmail(email) {
      const result = await pool.query(
        "SELECT id, email, password_hash FROM users WHERE email = $1",
        [email],
      );
      return result.rows[0];
    },

    // Permissões vêm do banco a cada requisição: revogar uma role vale na hora,
    // sem esperar o token expirar
    async findWithPermissions(id) {
      const result = await pool.query(
        `SELECT u.id, u.email,
                COALESCE(array_agg(DISTINCT p.name) FILTER (WHERE p.name IS NOT NULL), '{}') AS permissions
         FROM users u
         LEFT JOIN user_roles ur ON ur.user_id = u.id
         LEFT JOIN role_permissions rp ON rp.role_id = ur.role_id
         LEFT JOIN permissions p ON p.id = rp.permission_id
         WHERE u.id = $1
         GROUP BY u.id`,
        [id],
      );
      return result.rows[0];
    },
  };
}
