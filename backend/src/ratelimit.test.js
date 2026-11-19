import test, { after } from "node:test";
import assert from "node:assert";
import request from "supertest";
import { app, pool, uniqueEmail } from "./testHelpers.js";

after(() => pool.end());

test("login bloqueia com 429 depois de 10 tentativas", async () => {
  const body = { email: uniqueEmail("brute"), password: "senha-errada-123" };
  const statuses = [];

  for (let i = 0; i < 11; i++) {
    const res = await request(app).post("/api/auth/login").send(body);
    statuses.push(res.status);
  }

  assert.deepStrictEqual(statuses.slice(0, 10), Array(10).fill(401));
  assert.strictEqual(statuses[10], 429);
});

test("cadastro bloqueia com 429 depois de 20 requisições", async () => {
  // Corpo vazio: o limite conta antes da validação, e assim nenhuma conta nem hash bcrypt é criado
  const statuses = [];
  for (let i = 0; i < 21; i++) {
    statuses.push((await request(app).post("/api/auth/register").send({})).status);
  }

  assert.deepStrictEqual(statuses.slice(0, 20), Array(20).fill(400));
  assert.strictEqual(statuses[20], 429);
});

test("checkout bloqueia com 429 depois de 30 requisições", async () => {
  const statuses = [];
  for (let i = 0; i < 31; i++) {
    statuses.push((await request(app).post("/api/checkout")).status);
  }

  assert.deepStrictEqual(statuses.slice(0, 30), Array(30).fill(400));
  assert.strictEqual(statuses[30], 429);
});
