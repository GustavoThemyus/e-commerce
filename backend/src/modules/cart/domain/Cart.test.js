import test from "node:test";
import assert from "node:assert";
import { Cart, MAX_DISTINCT_ITEMS } from "./Cart.js";
import { AppError } from "../../../shared/errors/AppError.js";

const fill = (cart, count) => {
  for (let id = 1; id <= count; id++) cart.add({ id }, 1);
};

test("o carrinho aceita até o teto de itens distintos", () => {
  const cart = new Cart();
  fill(cart, MAX_DISTINCT_ITEMS);
  assert.strictEqual(cart.items.length, MAX_DISTINCT_ITEMS);
});

test("passar do teto com um item novo é 400 'Cart is full' e o carrinho não muda", () => {
  const cart = new Cart();
  fill(cart, MAX_DISTINCT_ITEMS);

  assert.throws(
    () => cart.add({ id: 999 }, 1),
    (err) => err instanceof AppError && err.status === 400 && err.message === "Cart is full",
  );
  assert.strictEqual(cart.items.length, MAX_DISTINCT_ITEMS);
});

test("com o carrinho cheio ainda dá para aumentar a quantidade de um item que já está nele", () => {
  const cart = new Cart();
  fill(cart, MAX_DISTINCT_ITEMS);

  cart.add({ id: 1 }, 4);
  assert.strictEqual(cart.items.find((i) => i.id === 1).quantity, 5);
  assert.strictEqual(cart.items.length, MAX_DISTINCT_ITEMS);
});

test("remover um item abre espaço para um novo", () => {
  const cart = new Cart();
  fill(cart, MAX_DISTINCT_ITEMS);

  cart.remove(1);
  cart.add({ id: 999 }, 1);
  assert.strictEqual(cart.items.length, MAX_DISTINCT_ITEMS);
});
