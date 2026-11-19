// Cenários HTTP de catálogo, carrinho e checkout que os outros arquivos não cobrem
import test, { after } from "node:test";
import assert from "node:assert";
import request from "supertest";
import { app, pool, uniqueEmail, cleanup } from "./testHelpers.js";
import { parseOrigins } from "./shared/config/env.js";

const guestEmail = uniqueEmail("endpoints");
const item = (id, quantity) => ({ product: { id, title: `P${id}`, price: 10 }, quantity });

after(async () => {
  await cleanup({ emails: [guestEmail] });
  await pool.end();
});

// ---------- GET /api/product ----------
test("GET /product lista os 20 produtos com preço numérico e rating aninhado", async () => {
  const res = await request(app).get("/api/product");
  assert.strictEqual(res.status, 200);
  assert.ok(res.body.length >= 20);

  const first = res.body.find((p) => p.id === 1);
  assert.strictEqual(typeof first.price, "number");
  assert.strictEqual(typeof first.rating.rate, "number");
  assert.strictEqual(typeof first.rating.count, "number");
  assert.ok(!("rating_rate" in first), "colunas planas não vazam para a API");
});

// ---------- GET /api/product/:id ----------
test("GET /product/:id devolve o produto", async () => {
  const res = await request(app).get("/api/product/1");
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.id, 1);
  assert.ok(res.body.title);
});

test("GET /product/:id inexistente ou inválido retorna 404", async () => {
  for (const id of ["999999", "abc", "0", "-1", "1.5"]) {
    const res = await request(app).get(`/api/product/${id}`);
    assert.strictEqual(res.status, 404, id);
    assert.deepStrictEqual(res.body, { error: "Product not found" }, id);
  }
});

test("PUT /product/:id sem token retorna 401, mesmo com id inválido", async () => {
  const res = await request(app).put("/api/product/abc").send({ title: "x", price: 1 });
  assert.strictEqual(res.status, 401);
});

// ---------- /api/cart ----------
test("GET /cart começa vazio", async () => {
  const res = await request(app).get("/api/cart");
  assert.strictEqual(res.status, 200);
  assert.deepStrictEqual(res.body, []);
});

test("POST /cart adiciona e devolve o carrinho; o mesmo produto soma a quantidade", async () => {
  const first = await request(app).post("/api/cart").send(item(1, 2));
  assert.strictEqual(first.status, 201);
  assert.strictEqual(first.body.length, 1);
  assert.strictEqual(first.body[0].quantity, 2);

  const again = await request(app).post("/api/cart").send(item(1, 3));
  assert.strictEqual(again.status, 201);
  assert.strictEqual(again.body.length, 1);
  assert.strictEqual(again.body[0].quantity, 5);

  const other = await request(app).post("/api/cart").send(item(2, 1));
  assert.strictEqual(other.body.length, 2);
});

test("POST /cart rejeita corpo inválido com 400", async () => {
  const bad = [
    {},
    { quantity: 1 },
    { product: {}, quantity: 1 },
    { product: { id: "abc" }, quantity: 1 },
    { product: { id: 1 } },
    { product: { id: 1 }, quantity: 0 },
    { product: { id: 1 }, quantity: -2 },
    { product: { id: 1 }, quantity: 1.5 },
  ];
  for (const body of bad) {
    const res = await request(app).post("/api/cart").send(body);
    assert.strictEqual(res.status, 400, JSON.stringify(body));
  }
  const noBody = await request(app).post("/api/cart");
  assert.strictEqual(noBody.status, 400);
});

test("PUT /cart altera a quantidade só do item pedido", async () => {
  const res = await request(app).put("/api/cart").send({ id: 1, quantity: 9 });
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.find((i) => i.id === 1).quantity, 9);
  assert.strictEqual(res.body.find((i) => i.id === 2).quantity, 1);
});

test("PUT /cart com id que não está no carrinho não muda nada", async () => {
  const before = (await request(app).get("/api/cart")).body;
  const res = await request(app).put("/api/cart").send({ id: 77, quantity: 4 });
  assert.strictEqual(res.status, 200);
  assert.deepStrictEqual(res.body, before);
});

test("PUT /cart rejeita corpo inválido com 400", async () => {
  for (const body of [{}, { id: 1 }, { quantity: 1 }, { id: "x", quantity: 1 }, { id: 1, quantity: 0 }]) {
    const res = await request(app).put("/api/cart").send(body);
    assert.strictEqual(res.status, 400, JSON.stringify(body));
  }
});

test("DELETE /cart/:id remove o item; id ausente ou não numérico mantém o carrinho", async () => {
  const removed = await request(app).delete("/api/cart/2");
  assert.strictEqual(removed.status, 200);
  assert.deepStrictEqual(removed.body.map((i) => i.id), [1]);

  for (const id of ["999", "abc"]) {
    const res = await request(app).delete(`/api/cart/${id}`);
    assert.strictEqual(res.status, 200, id);
    assert.deepStrictEqual(res.body.map((i) => i.id), [1], id);
  }
});

// ---------- POST /api/checkout ----------
test("POST /checkout sem corpo retorna 400 'Missing JSON body'", async () => {
  const res = await request(app).post("/api/checkout");
  assert.strictEqual(res.status, 400);
  assert.deepStrictEqual(res.body, { error: "Missing JSON body" });
});

test("POST /checkout com items que não é lista retorna 400", async () => {
  for (const items of ["abc", {}, 5, null]) {
    const res = await request(app)
      .post("/api/checkout")
      .send({ customer_email: guestEmail, items });
    assert.strictEqual(res.status, 400, JSON.stringify(items));
  }
});

test("POST /checkout grava a compra, devolve o total e esvazia o carrinho", async () => {
  assert.strictEqual((await request(app).get("/api/cart")).body.length, 1);

  const res = await request(app)
    .post("/api/checkout")
    .send({ customer_email: guestEmail, items: [{ productId: 1, quantity: 2 }] });
  assert.strictEqual(res.status, 201);
  assert.strictEqual(res.body.total, 219.9);
  assert.strictEqual(typeof res.body.emailSent, "boolean");
  assert.ok(res.body.message);

  const { rows } = await pool.query(
    "SELECT user_id, total FROM sales WHERE customer_email = $1",
    [guestEmail],
  );
  assert.strictEqual(rows.length, 1);
  assert.strictEqual(rows[0].user_id, null, "convidado não tem user_id");
  assert.strictEqual(Number(rows[0].total), 219.9);

  assert.deepStrictEqual((await request(app).get("/api/cart")).body, []);
});

// ---------- GET /health ----------
test("GET /health responde 200 com o banco no ar", async () => {
  const res = await request(app).get("/health");
  assert.strictEqual(res.status, 200);
  assert.deepStrictEqual(res.body, { status: "ok" });
});

// ---------- CORS ----------
test("CORS libera a origem do frontend e só ela", async () => {
  const [allowed] = parseOrigins(process.env.CORS_ORIGIN);

  const ok = await request(app).get("/api/product/1").set("Origin", allowed);
  assert.strictEqual(ok.headers["access-control-allow-origin"], allowed);
  assert.match(ok.headers.vary, /Origin/);

  const other = await request(app).get("/api/product/1").set("Origin", "https://evil.example");
  assert.strictEqual(other.headers["access-control-allow-origin"], undefined);
});

test("preflight do navegador (checkout com Authorization) é aceito para a origem do frontend", async () => {
  const [allowed] = parseOrigins(process.env.CORS_ORIGIN);

  const res = await request(app)
    .options("/api/checkout")
    .set("Origin", allowed)
    .set("Access-Control-Request-Method", "POST")
    .set("Access-Control-Request-Headers", "authorization,content-type");

  assert.strictEqual(res.status, 204);
  assert.strictEqual(res.headers["access-control-allow-origin"], allowed);
  assert.match(res.headers["access-control-allow-headers"], /authorization/i);
});
