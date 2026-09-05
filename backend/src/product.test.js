import test from "node:test";
import assert from "node:assert";
import request from "supertest";
import app from "./app.js";

test("GET/product retorna 200", async () => {
  const res = await request(app).get("/api/product");
  assert.strictEqual(res.status, 200);
});

test("GET/product/:id retorna 200", async () => {
  const res = await request(app).get("/api/product/1");
  assert.strictEqual(res.status, 200);
});
