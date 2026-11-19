import test, { mock, afterEach } from "node:test";
import assert from "node:assert";
import express from "express";
import request from "supertest";
import { createHealthRouter } from "./health.js";

afterEach(() => mock.restoreAll());

const appWith = (pool) => express().use(createHealthRouter({ pool }));

test("/health responde 200 quando o banco responde", async () => {
  const queries = [];
  const pool = { query: async (sql) => (queries.push(sql), { rows: [] }) };

  const res = await request(appWith(pool)).get("/health");
  assert.strictEqual(res.status, 200);
  assert.deepStrictEqual(res.body, { status: "ok" });
  assert.deepStrictEqual(queries, ["SELECT 1"]);
});

test("/health responde 503 sem revelar o motivo quando o banco cai", async () => {
  const logged = mock.method(console, "error", () => {});
  const pool = {
    query: async () => {
      throw new Error('password authentication failed for user "postgres"');
    },
  };

  const res = await request(appWith(pool)).get("/health");
  assert.strictEqual(res.status, 503);
  assert.deepStrictEqual(res.body, { status: "unavailable" });
  assert.ok(!JSON.stringify(res.body).includes("password"));
  assert.strictEqual(logged.mock.callCount(), 1, "o motivo real fica só no log do servidor");
});
