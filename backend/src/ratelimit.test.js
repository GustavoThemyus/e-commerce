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
