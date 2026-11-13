// Caso de uso com dependências falsas: cobre o envio de e-mail com sucesso, que os testes HTTP
// não alcançam (sem RESEND_API_KEY o e-mail sempre falha) e as garantias de ordem/atomicidade
import test, { mock, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import { makeCheckout } from "./checkout.js";
import { AppError } from "../../../shared/errors/AppError.js";

const catalog = [
  { id: 1, title: "Mochila", price: 109.95 },
  { id: 2, title: "Camiseta", price: 22.3 },
];

function setup({ emailFails = false, saveFails = false } = {}) {
  const events = [];
  const saved = [];
  const deps = {
    orderRepository: {
      save: async (order) => {
        events.push("save");
        if (saveFails) throw new Error("banco fora do ar");
        saved.push(order);
      },
    },
    productCatalog: {
      findByIds: async (ids) => catalog.filter((p) => ids.includes(p.id)),
    },
    emailGateway: {
      sendPurchaseConfirmation: async () => {
        events.push("email");
        if (emailFails) throw new Error("resend fora do ar");
      },
    },
    clearCart: () => events.push("clearCart"),
  };
  return { checkout: makeCheckout(deps), events, saved };
}

beforeEach(() => mock.method(console, "error", () => {}));
afterEach(() => mock.restoreAll());

test("compra com e-mail enviado: salva, envia, esvazia o carrinho, nessa ordem", async () => {
  const { checkout, events, saved } = setup();
  const result = await checkout({
    customerEmail: "a@b.c",
    items: [{ productId: 1, quantity: 2 }],
  });

  assert.deepStrictEqual(result, { total: 219.9, emailSent: true });
  assert.deepStrictEqual(events, ["save", "email", "clearCart"]);
  assert.strictEqual(saved[0].customerEmail, "a@b.c");
  assert.strictEqual(saved[0].userId, null);
});

test("falha no e-mail não desfaz a compra: emailSent false, venda salva, carrinho limpo", async () => {
  const { checkout, events } = setup({ emailFails: true });
  const result = await checkout({
    customerEmail: "a@b.c",
    items: [{ productId: 1, quantity: 1 }],
  });

  assert.strictEqual(result.emailSent, false);
  assert.deepStrictEqual(events, ["save", "email", "clearCart"]);
});

test("falha ao salvar: propaga o erro, não envia e-mail e não esvazia o carrinho", async () => {
  const { checkout, events } = setup({ saveFails: true });
  await assert.rejects(
    checkout({ customerEmail: "a@b.c", items: [{ productId: 1, quantity: 1 }] }),
    /banco fora do ar/,
  );
  assert.deepStrictEqual(events, ["save"]);
});

test("usuário logado: vale o e-mail e o id da conta, não o do corpo", async () => {
  const { checkout, saved } = setup();
  await checkout({
    customerEmail: "outro@x.test",
    items: [{ productId: 2, quantity: 1 }],
    user: { id: 9, email: "conta@x.test" },
  });

  assert.strictEqual(saved[0].customerEmail, "conta@x.test");
  assert.strictEqual(saved[0].userId, 9);
});

test("preço e título vêm do catálogo, nunca do cliente", async () => {
  const { checkout, saved } = setup();
  await checkout({
    customerEmail: "a@b.c",
    items: [{ productId: 1, quantity: 1, price: 0.01, title: "grátis" }],
  });

  assert.strictEqual(saved[0].items[0].price, 109.95);
  assert.strictEqual(saved[0].items[0].title, "Mochila");
});

test("produto fora do catálogo é 400 e nada é salvo", async () => {
  const { checkout, events } = setup();
  await assert.rejects(
    checkout({ customerEmail: "a@b.c", items: [{ productId: 404, quantity: 1 }] }),
    (err) => err instanceof AppError && err.status === 400 && /404/.test(err.message),
  );
  assert.deepStrictEqual(events, []);
});

test("quantidade acima do limite de 1000 é 400", async () => {
  const { checkout } = setup();
  for (const quantity of [1001, 0, -1, 1.5, "x"]) {
    await assert.rejects(
      checkout({ customerEmail: "a@b.c", items: [{ productId: 1, quantity }] }),
      (err) => err.status === 400,
      String(quantity),
    );
  }
  // 1000 ainda passa
  await checkout({ customerEmail: "a@b.c", items: [{ productId: 1, quantity: 1000 }] });
});
