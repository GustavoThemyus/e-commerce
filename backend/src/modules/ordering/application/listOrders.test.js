import test from "node:test";
import assert from "node:assert";
import { makeListOrders } from "./listOrders.js";
import { AppError } from "../../../shared/errors/AppError.js";

function setup() {
  const calls = [];
  const orderRepository = {
    findAll: async () => (calls.push("all"), ["todos"]),
    findByUserId: async (id) => (calls.push(`user:${id}`), ["meus"]),
  };
  return { calls, listOrders: makeListOrders({ orderRepository }) };
}

test("order:read:any vê todos os pedidos", async () => {
  const { listOrders, calls } = setup();
  const result = await listOrders({
    user: { id: 1, permissions: ["order:read:any", "order:read:own"] },
  });
  assert.deepStrictEqual(result, ["todos"]);
  assert.deepStrictEqual(calls, ["all"]);
});

test("order:read:own vê só os próprios", async () => {
  const { listOrders, calls } = setup();
  const result = await listOrders({ user: { id: 42, permissions: ["order:read:own"] } });
  assert.deepStrictEqual(result, ["meus"]);
  assert.deepStrictEqual(calls, ["user:42"]);
});

test("sem nenhuma permissão de pedidos é 403 e não consulta o banco", async () => {
  const { listOrders, calls } = setup();
  await assert.rejects(
    listOrders({ user: { id: 1, permissions: ["product:write"] } }),
    (err) => err instanceof AppError && err.status === 403,
  );
  assert.deepStrictEqual(calls, []);
});
