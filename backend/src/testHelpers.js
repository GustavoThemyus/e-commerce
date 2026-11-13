// Apoio dos testes de auth/RBAC. Não termina em .test.js, então o runner não o executa.
// Antes dos imports que leem process.env (imports em ESM são hoisted)
import "dotenv/config";

import request from "supertest";
import pool from "./shared/config/database.js";
import app from "./app.js";

const PASSWORD = "senha-de-teste-123";

export function uniqueEmail(label) {
  return `${label}-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.test`;
}

export async function registerAndLogin(label) {
  const email = uniqueEmail(label);
  await request(app).post("/api/auth/register").send({ email, password: PASSWORD });
  const login = await request(app)
    .post("/api/auth/login")
    .send({ email, password: PASSWORD });
  return { email, password: PASSWORD, token: login.body.token, id: login.body.user.id };
}

export async function makeAdmin(userId) {
  await pool.query(
    `INSERT INTO user_roles (user_id, role_id)
     SELECT $1, id FROM roles WHERE name = 'admin'`,
    [userId],
  );
}

// Remove o que os testes criaram. sales não tem cascade a partir de users, então vai pelo e-mail.
export async function cleanup({ userIds = [], emails = [], productIds = [] }) {
  if (emails.length) {
    await pool.query("DELETE FROM sales WHERE customer_email = ANY($1)", [emails]);
  }
  if (userIds.length) {
    await pool.query("DELETE FROM users WHERE id = ANY($1)", [userIds]);
  }
  if (productIds.length) {
    await pool.query("DELETE FROM products WHERE id = ANY($1)", [productIds]);
  }
}

export { pool, app };
