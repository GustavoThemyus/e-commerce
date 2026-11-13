import test from "node:test";
import assert from "node:assert";
import { Order, CHECKOUT_REQUIRED_MESSAGE } from "./Order.js";
import { AppError } from "../../../shared/errors/AppError.js";

const line = (productId, price, quantity) => ({ productId, price, quantity });

test("Order.create exige e-mail e ao menos um item", () => {
  for (const bad of [
    { customerEmail: "", items: [line(1, 1, 1)] },
    { customerEmail: undefined, items: [line(1, 1, 1)] },
    { customerEmail: "a@b.c", items: [] },
    { customerEmail: "a@b.c", items: undefined },
  ]) {
    assert.throws(
      () => Order.create(bad),
      (err) =>
        err instanceof AppError &&
        err.status === 400 &&
        err.message === CHECKOUT_REQUIRED_MESSAGE,
    );
  }
});

test("Order.create sem userId é compra de convidado", () => {
  const order = Order.create({ customerEmail: "a@b.c", items: [line(1, 1, 1)] });
  assert.strictEqual(order.userId, null);
});

test("total é somado em centavos, sem erro de ponto flutuante", () => {
  // 109.95 * 3 em ponto flutuante dá 329.84999999999997
  const order = Order.create({ customerEmail: "a@b.c", items: [line(1, 109.95, 3)] });
  assert.strictEqual(order.total, 329.85);

  const mixed = Order.create({
    customerEmail: "a@b.c",
    items: [line(1, 0.1, 1), line(2, 0.2, 1)], // 0.1 + 0.2 = 0.30000000000000004
  });
  assert.strictEqual(mixed.total, 0.3);
});

test("quantityByProduct soma linhas repetidas do mesmo produto", () => {
  const order = Order.create({
    customerEmail: "a@b.c",
    items: [line(1, 5, 2), line(2, 5, 1), line(1, 5, 3)],
  });
  assert.deepStrictEqual([...order.quantityByProduct], [[1, 5], [2, 1]]);
});

test("preços cujo valor x 100 não é inteiro em ponto flutuante ainda dão o total exato", () => {
  // 4.35 * 100 = 434.99999999999994 e 0.57 * 100 = 56.99999999999999 em ponto flutuante
  const cases = [
    [[line(1, 4.35, 3)], 13.05],
    [[line(1, 0.57, 3)], 1.71],
    [[line(1, 19.99, 3)], 59.97],
    [[line(1, 4.35, 1), line(2, 0.57, 1), line(3, 19.99, 1)], 24.91],
  ];
  for (const [items, expected] of cases) {
    assert.strictEqual(Order.create({ customerEmail: "a@b.c", items }).total, expected);
  }
});
