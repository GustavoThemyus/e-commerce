import test from "node:test";
import assert from "node:assert";
import request from "supertest";
import app from "./app.js";

test("POST/checkout retorna 201", async () => {
  const res = await request(app)
    .post("/api/checkout")
    .send({
      customer_email: "gustavothemyus@gmail.com",
      items: [
        {
          id: 1,
          title: "Fjallraven - Foldsack No. 1 Backpack, Fits 15 Laptops",
          price: 109.95,
          quantity: 1,
        },
      ],
    });
  assert.strictEqual(res.status, 201);
});
