import test, { before, after } from "node:test";
import assert from "node:assert";
import request from "supertest";
import {
  app,
  pool,
  uniqueEmail,
  registerAndLogin,
  makeAdmin,
  cleanup,
} from "./testHelpers.js";

const bearer = (user) => ({ Authorization: `Bearer ${user.token}` });
const guestEmail = uniqueEmail("guest");
const createdProductIds = [];
let customerA, customerB, admin;

before(async () => {
  customerA = await registerAndLogin("cust-a");
  customerB = await registerAndLogin("cust-b");
  admin = await registerAndLogin("admin");
  await makeAdmin(admin.id);
  // As permissões são lidas do banco a cada requisição, então o token do admin já vale
});

after(async () => {
  await cleanup({
    userIds: [customerA, customerB, admin].filter(Boolean).map((u) => u.id),
    emails: [customerA?.email, customerB?.email, guestEmail].filter(Boolean),
    productIds: createdProductIds,
  });
  await pool.end();
});

const newProduct = { title: "Produto de teste", price: 12.5, category: "test" };

test("POST /product: 401 sem token, 403 para customer, 201 para admin", async () => {
  const anon = await request(app).post("/api/product").send(newProduct);
  assert.strictEqual(anon.status, 401);

  const customer = await request(app)
    .post("/api/product")
    .set(bearer(customerA))
    .send(newProduct);
  assert.strictEqual(customer.status, 403);

  const res = await request(app)
    .post("/api/product")
    .set(bearer(admin))
    .send(newProduct);
  assert.strictEqual(res.status, 201);
  assert.strictEqual(res.body.title, newProduct.title);
  assert.strictEqual(res.body.price, 12.5);
  createdProductIds.push(res.body.id);
});

test("POST /product valida o corpo", async () => {
  for (const bad of [{ price: 10 }, { title: "x", price: -1 }, { title: "x", price: "abc" }]) {
    const res = await request(app).post("/api/product").set(bearer(admin)).send(bad);
    assert.strictEqual(res.status, 400, JSON.stringify(bad));
  }
});

test("PUT /product/:id: só admin edita, e o id do corpo é ignorado", async () => {
  const id = createdProductIds[0];

  const customer = await request(app)
    .put(`/api/product/${id}`)
    .set(bearer(customerA))
    .send({ ...newProduct, title: "hack" });
  assert.strictEqual(customer.status, 403);

  const res = await request(app)
    .put(`/api/product/${id}`)
    .set(bearer(admin))
    .send({ ...newProduct, id: 1, title: "Editado", price: 20 });
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.id, id);
  assert.strictEqual(res.body.title, "Editado");
  assert.strictEqual(res.body.price, 20);

  const missing = await request(app)
    .put("/api/product/999999")
    .set(bearer(admin))
    .send(newProduct);
  assert.strictEqual(missing.status, 404);
});

test("GET /orders exige login", async () => {
  const res = await request(app).get("/api/orders");
  assert.strictEqual(res.status, 401);
});

test("checkout logado usa o e-mail da conta e ignora o do corpo", async () => {
  const res = await request(app)
    .post("/api/checkout")
    .set(bearer(customerA))
    .send({
      customer_email: "outro@example.test",
      items: [{ productId: 1, quantity: 1 }],
    });
  assert.strictEqual(res.status, 201);

  const guest = await request(app)
    .post("/api/checkout")
    .send({ customer_email: guestEmail, items: [{ id: 1, quantity: 1 }] });
  assert.strictEqual(guest.status, 201);
});

test("GET /orders: customer vê só os próprios, admin vê todos", async () => {
  const own = await request(app).get("/api/orders").set(bearer(customerA));
  assert.strictEqual(own.status, 200);
  assert.ok(own.body.length >= 1);
  assert.ok(own.body.every((o) => o.customer_email === customerA.email));

  const other = await request(app).get("/api/orders").set(bearer(customerB));
  assert.strictEqual(other.status, 200);
  assert.deepStrictEqual(other.body, []);

  const all = await request(app).get("/api/orders").set(bearer(admin));
  assert.strictEqual(all.status, 200);
  const emails = all.body.map((o) => o.customer_email);
  assert.ok(emails.includes(customerA.email));
  assert.ok(emails.includes(guestEmail));
});

test("checkout ignora preço e título enviados pelo cliente", async () => {
  const product = (await request(app).get("/api/product/1")).body;

  const res = await request(app)
    .post("/api/checkout")
    .send({
      customer_email: guestEmail,
      items: [{ productId: 1, title: "grátis", price: 0.01, quantity: 3 }],
    });
  assert.strictEqual(res.status, 201);
  assert.strictEqual(res.body.total, Math.round(product.price * 100 * 3) / 100);

  const { rows } = await pool.query(
    "SELECT items FROM sales WHERE customer_email = $1 ORDER BY id DESC LIMIT 1",
    [guestEmail],
  );
  assert.strictEqual(rows[0].items[0].title, product.title);
  assert.strictEqual(rows[0].items[0].price, product.price);
});

test("checkout rejeita produto inexistente e quantidade inválida", async () => {
  const bad = [
    [{ productId: 999999, quantity: 1 }],
    [{ productId: 1, quantity: 0 }],
    [{ productId: 1, quantity: 1.5 }],
    [{ productId: 1, quantity: "abc" }],
    [{ productId: "abc", quantity: 1 }],
    ["texto"],
  ];

  for (const items of bad) {
    const res = await request(app)
      .post("/api/checkout")
      .send({ customer_email: guestEmail, items });
    assert.strictEqual(res.status, 400, JSON.stringify(items));
  }
});

test("checkout com token inválido retorna 401 em vez de virar convidado", async () => {
  const res = await request(app)
    .post("/api/checkout")
    .set("Authorization", "Bearer lixo")
    .send({ customer_email: guestEmail, items: [{ productId: 1, quantity: 1 }] });
  assert.strictEqual(res.status, 401);
});
