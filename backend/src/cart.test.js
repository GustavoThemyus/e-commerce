import test from "node:test";
import assert from "node:assert";
import request from "supertest";
import app from "./app.js";

test("GET/cart retorna 200", async () => {
  const res = await request(app).get("/api/cart");
  assert.strictEqual(res.status, 200);
});

test("POST/cart retorna 201", async () => {
  const res = await request(app)
    .post("/api/cart")
    .send({
      product: {
        id: 1,
        name: "Fjallraven - Foldsack No. 1 Backpack, Fits 15 Laptops",
        price: 109.95,
      },
      quantity: 2,
    });
  assert.strictEqual(res.status, 201);
});

test("PUT/cart retorna 200", async () => {
  const create = await request(app)
    .post("/api/cart")
    .send({
      product: {
        id: 1,
        name: "Fjallraven - Foldsack No. 1 Backpack, Fits 15 Laptops",
        price: 109.95,
      },
      quantity: 2,
    });
  const res = await request(app).put("/api/cart").send({ id: 1, quantity: 3 });
  assert.strictEqual(res.status, 200);
});

test("DELETE/cart retorna 200", async () => {
  const create = await request(app)
    .post("/api/cart")
    .send({
      product: {
        id: 1,
        name: "Fjallraven - Foldsack No. 1 Backpack, Fits 15 Laptops",
        price: 109.95,
      },
      quantity: 2,
    });
  const res = await request(app).delete("/api/cart/1");
  assert.strictEqual(res.status, 200);
});
