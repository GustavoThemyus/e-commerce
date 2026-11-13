import test from "node:test";
import assert from "node:assert";
import { createOrderRepository } from "./OrderRepository.js";
import { Order } from "../domain/Order.js";

const line = (productId, quantity) => ({
  productId,
  title: `P${productId}`,
  price: 10,
  quantity,
  subtotal: 10 * quantity,
});

// Pool falso: registra cada comando e falha sob demanda
function fakePool({ failOn } = {}) {
  const log = [];
  const state = { released: 0 };
  const client = {
    async query(sql, params) {
      const command = sql.trim().split(/\s+/)[0];
      log.push({ command, sql, params });
      if (failOn && sql.includes(failOn)) throw new Error("falha simulada");
      return { rows: [{ id: 99 }] };
    },
    release() {
      state.released++;
    },
  };
  return { pool: { connect: async () => client }, log, state };
}

const order = Order.create({
  customerEmail: "a@b.c",
  userId: 5,
  items: [line(1, 2), line(2, 1), line(1, 3)],
});

test("save grava venda e itens dentro de uma transação e confirma", async () => {
  const { pool, log, state } = fakePool();
  await createOrderRepository(pool).save(order);

  assert.deepStrictEqual(
    log.map((l) => l.command),
    ["BEGIN", "INSERT", "INSERT", "COMMIT"],
  );
  assert.deepStrictEqual(log[1].params.slice(0, 1), ["a@b.c"]);
  assert.strictEqual(log[1].params[3], 5, "user_id vai junto");

  // Linhas repetidas do produto 1 viram uma só, com a quantidade somada
  assert.deepStrictEqual(log[2].params, [99, [1, 2], [5, 1]]);
  assert.strictEqual(state.released, 1);
});

test("falha ao gravar os itens desfaz a venda (ROLLBACK, sem COMMIT) e propaga o erro", async () => {
  const { pool, log, state } = fakePool({ failOn: "sale_items" });

  await assert.rejects(createOrderRepository(pool).save(order), /falha simulada/);

  const commands = log.map((l) => l.command);
  assert.ok(commands.includes("ROLLBACK"));
  assert.ok(!commands.includes("COMMIT"));
  assert.strictEqual(state.released, 1, "a conexão volta para o pool mesmo com erro");
});

test("falha ao gravar a venda também faz ROLLBACK e libera a conexão", async () => {
  const { pool, log, state } = fakePool({ failOn: "INTO sales" });
  await assert.rejects(createOrderRepository(pool).save(order), /falha simulada/);
  assert.deepStrictEqual(
    log.map((l) => l.command),
    ["BEGIN", "INSERT", "ROLLBACK"],
  );
  assert.strictEqual(state.released, 1);
});

test("findAll e findByUserId convertem o total para número", async () => {
  const rows = [
    { id: 1, customer_email: "a@b.c", total: "109.95", items: [], created_at: "t" },
  ];
  const queries = [];
  const pool = { query: async (sql, params) => (queries.push(params), { rows }) };
  const repo = createOrderRepository(pool);

  assert.deepStrictEqual((await repo.findAll())[0].total, 109.95);
  assert.deepStrictEqual((await repo.findByUserId(7))[0].total, 109.95);
  assert.deepStrictEqual(queries, [undefined, [7]]);
});
