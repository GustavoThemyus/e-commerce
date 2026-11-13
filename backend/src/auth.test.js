import test, { after } from "node:test";
import assert from "node:assert";
import request from "supertest";
import { app, pool, uniqueEmail, cleanup } from "./testHelpers.js";

const password = "senha-de-teste-123";
const email = uniqueEmail("auth");
let userId;

after(async () => {
  await cleanup({ userIds: userId ? [userId] : [] });
  await pool.end();
});

test("register cria o usuário e não devolve a senha", async () => {
  const res = await request(app).post("/api/auth/register").send({ email, password });
  assert.strictEqual(res.status, 201);
  assert.strictEqual(res.body.email, email);
  assert.ok(res.body.id);
  assert.ok(!("password_hash" in res.body) && !("password" in res.body));
  userId = res.body.id;
});

test("register com e-mail repetido (mesmo em maiúsculas) retorna 409", async () => {
  const res = await request(app)
    .post("/api/auth/register")
    .send({ email: email.toUpperCase(), password });
  assert.strictEqual(res.status, 409);
});

test("register com senha curta ou e-mail inválido retorna 400", async () => {
  const short = await request(app)
    .post("/api/auth/register")
    .send({ email: uniqueEmail("short"), password: "123" });
  assert.strictEqual(short.status, 400);

  const bad = await request(app)
    .post("/api/auth/register")
    .send({ email: "nao-e-email", password });
  assert.strictEqual(bad.status, 400);

  const missing = await request(app).post("/api/auth/register").send({});
  assert.strictEqual(missing.status, 400);
});

test("login devolve token e as permissões do customer", async () => {
  const res = await request(app).post("/api/auth/login").send({ email, password });
  assert.strictEqual(res.status, 200);
  assert.ok(res.body.token);
  assert.deepStrictEqual(res.body.user.permissions, ["order:read:own"]);
});

test("login com senha errada e com e-mail inexistente dão a mesma resposta 401", async () => {
  const wrong = await request(app)
    .post("/api/auth/login")
    .send({ email, password: "outra-senha-qualquer" });
  const unknown = await request(app)
    .post("/api/auth/login")
    .send({ email: uniqueEmail("ghost"), password });

  assert.strictEqual(wrong.status, 401);
  assert.strictEqual(unknown.status, 401);
  assert.deepStrictEqual(wrong.body, unknown.body);
});

test("/auth/me exige token válido", async () => {
  const none = await request(app).get("/api/auth/me");
  assert.strictEqual(none.status, 401);

  const bad = await request(app)
    .get("/api/auth/me")
    .set("Authorization", "Bearer token-invalido");
  assert.strictEqual(bad.status, 401);

  const login = await request(app).post("/api/auth/login").send({ email, password });
  const ok = await request(app)
    .get("/api/auth/me")
    .set("Authorization", `Bearer ${login.body.token}`);
  assert.strictEqual(ok.status, 200);
  assert.strictEqual(ok.body.email, email);
});

test("JSON malformado retorna 400, não 500", async () => {
  const res = await request(app)
    .post("/api/auth/login")
    .set("Content-Type", "application/json")
    .send('{"email": ');
  assert.strictEqual(res.status, 400);
});

test("resposta traz cabeçalhos do helmet", async () => {
  const res = await request(app).get("/api/product/1");
  assert.strictEqual(res.headers["x-content-type-options"], "nosniff");
  assert.ok(!res.headers["x-powered-by"]);
});
