// Dá uma role a um usuário já cadastrado. O registro público só cria "customer",
// então é por aqui que o primeiro admin nasce.
//   npm run grant-role -- usuario@email.com admin
import "dotenv/config";
import pool from "../src/shared/config/database.js";

const [email, roleName] = process.argv.slice(2);

if (!email || !roleName) {
  console.error("Uso: npm run grant-role -- <email> <role>");
  process.exit(1);
}

try {
  const result = await pool.query(
    `INSERT INTO user_roles (user_id, role_id)
     SELECT u.id, r.id FROM users u, roles r
     WHERE u.email = $1 AND r.name = $2
     ON CONFLICT DO NOTHING`,
    [email.trim().toLowerCase(), roleName],
  );

  if (result.rowCount === 0) {
    const [user, role] = await Promise.all([
      pool.query("SELECT 1 FROM users WHERE email = $1", [email.trim().toLowerCase()]),
      pool.query("SELECT 1 FROM roles WHERE name = $1", [roleName]),
    ]);
    if (user.rowCount === 0) console.error(`Usuário não encontrado: ${email}`);
    else if (role.rowCount === 0) console.error(`Role não existe: ${roleName}`);
    else console.log(`${email} já tinha a role ${roleName}.`);
    process.exitCode = user.rowCount && role.rowCount ? 0 : 1;
  } else {
    console.log(`Role ${roleName} concedida a ${email}.`);
  }
} finally {
  await pool.end();
}
