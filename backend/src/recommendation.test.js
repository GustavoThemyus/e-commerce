import test, { before, after } from "node:test";
import assert from "node:assert";
import request from "supertest";
import {
  app,
  pool,
  uniqueEmail,
  registerAndLogin,
  cleanup,
} from "./testHelpers.js";

// Produtos criados só para este teste: nenhum comprador de fora os compra, então os números
// abaixo não dependem do que mais exista no banco (dados de demonstração, outras compras).
// Compradores do X: 3 que levaram X+Y e o `shopper`, que levou só o X. Compradores do Y: 3.
// Similaridade X~Y = 3 / sqrt(4 * 3) = 0.866
const emails = [];
const productIds = [];
let x, y, lonely, dupProduct, shopper, newcomer;

async function createProduct(title) {
  const { rows } = await pool.query(
    "INSERT INTO products (title, price, rating_rate, rating_count) VALUES ($1, 10, 0, 0) RETURNING id",
    [title],
  );
  productIds.push(rows[0].id);
  return rows[0].id;
}

const bearer = (user) => ({ Authorization: `Bearer ${user.token}` });

before(async () => {
  x = await createProduct("Rec X");
  y = await createProduct("Rec Y");
  lonely = await createProduct("Rec sem compras");
  dupProduct = await createProduct("Rec duplicado");

  for (let i = 0; i < 3; i++) {
    const email = uniqueEmail("rec-buyer");
    emails.push(email);
    const res = await request(app)
      .post("/api/checkout")
      .send({
        customer_email: email,
        items: [{ productId: x, quantity: 1 }, { productId: y, quantity: 2 }],
      });
    assert.strictEqual(res.status, 201);
  }

  shopper = await registerAndLogin("rec-shopper");
  newcomer = await registerAndLogin("rec-newcomer");
  emails.push(shopper.email, newcomer.email);

  // Quem comprou só o X deve receber o Y
  const buy = await request(app)
    .post("/api/checkout")
    .set(bearer(shopper))
    .send({ items: [{ productId: x, quantity: 1 }] });
  assert.strictEqual(buy.status, 201);
});

after(async () => {
  await cleanup({
    userIds: [shopper, newcomer].filter(Boolean).map((u) => u.id),
    emails,
    productIds,
  });
  await pool.end();
});

test("checkout grava os itens normalizados e soma produto repetido", async () => {
  const email = uniqueEmail("rec-dup");
  emails.push(email);

  const res = await request(app)
    .post("/api/checkout")
    .send({
      customer_email: email,
      items: [
        { productId: dupProduct, quantity: 2 },
        { productId: dupProduct, quantity: 3 },
      ],
    });
  assert.strictEqual(res.status, 201);

  const { rows } = await pool.query(
    `SELECT si.product_id, si.quantity FROM sale_items si
     JOIN sales s ON s.id = si.sale_id WHERE s.customer_email = $1`,
    [email],
  );
  assert.deepStrictEqual(rows, [{ product_id: dupProduct, quantity: 5 }]);
});

test("GET /product/:id/recommendations: quem comprou X também comprou Y", async () => {
  const res = await request(app).get(`/api/product/${x}/recommendations`);
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body[0].id, y);
  assert.strictEqual(res.body[0].recommendation.reason, "also-bought");
  assert.strictEqual(res.body[0].recommendation.score, 0.866);
  assert.ok(res.body.every((p) => p.id !== x), "não recomenda o próprio produto");
});

test("completa com os mais bem avaliados e respeita o limite", async () => {
  const res = await request(app).get(`/api/product/${x}/recommendations?limit=5`);
  assert.strictEqual(res.body.length, 5);
  assert.deepStrictEqual(
    res.body.slice(1).map((p) => p.recommendation.reason),
    Array(4).fill("top-rated"),
  );
  assert.strictEqual(new Set(res.body.map((p) => p.id)).size, 5, "sem repetidos");
});

test("produto sem compras recebe só os mais bem avaliados", async () => {
  const res = await request(app).get(`/api/product/${lonely}/recommendations`);
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.length, 4);
  assert.ok(res.body.every((p) => p.recommendation.reason === "top-rated"));
  assert.ok(res.body.every((p) => p.id !== lonely));
});

test("produto inexistente retorna 404 e limit inválido retorna 400", async () => {
  assert.strictEqual(
    (await request(app).get("/api/product/999999/recommendations")).status,
    404,
  );
  assert.strictEqual(
    (await request(app).get("/api/product/abc/recommendations")).status,
    404,
  );
  for (const limit of ["0", "21", "abc"]) {
    const res = await request(app).get(`/api/product/${x}/recommendations?limit=${limit}`);
    assert.strictEqual(res.status, 400, limit);
  }
});

test("GET /recommendations exige login", async () => {
  assert.strictEqual((await request(app).get("/api/recommendations")).status, 401);
});

test("GET /recommendations: recomenda Y a quem comprou X e não repete o que já tem", async () => {
  const res = await request(app).get("/api/recommendations").set(bearer(shopper));
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body[0].id, y);
  assert.strictEqual(res.body[0].recommendation.reason, "also-bought");
  assert.strictEqual(res.body[0].recommendation.score, 0.866);
  assert.ok(res.body.every((p) => p.id !== x));
});

test("usuário sem compras recebe os mais bem avaliados", async () => {
  const res = await request(app).get("/api/recommendations").set(bearer(newcomer));
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.length, 8);
  assert.ok(res.body.every((p) => p.recommendation.reason === "top-rated"));
});
