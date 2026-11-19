// Processo próprio (um arquivo de teste por processo): o carrinho é um estado global em memória
import test, { after } from "node:test";
import assert from "node:assert";
import request from "supertest";
import { app, pool } from "./testHelpers.js";

after(() => pool.end());

const add = (id, quantity = 1) =>
  request(app).post("/api/cart").send({ product: { id, title: `P${id}`, price: 1 }, quantity });

test("POST /cart devolve 400 'Cart is full' no 51º item distinto", async () => {
  for (let id = 1; id <= 50; id++) {
    const res = await add(id);
    assert.strictEqual(res.status, 201, `item ${id}`);
  }

  const overflow = await add(51);
  assert.strictEqual(overflow.status, 400);
  assert.deepStrictEqual(overflow.body, { error: "Cart is full" });

  assert.strictEqual((await request(app).get("/api/cart")).body.length, 50);
});

test("com o carrinho cheio, repetir um item soma a quantidade e remover libera espaço", async () => {
  const again = await add(1, 2);
  assert.strictEqual(again.status, 201);
  assert.strictEqual(again.body.find((i) => i.id === 1).quantity, 3);

  assert.strictEqual((await request(app).delete("/api/cart/50")).status, 200);
  assert.strictEqual((await add(51)).status, 201);
});
