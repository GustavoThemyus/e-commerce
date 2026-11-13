import test from "node:test";
import assert from "node:assert";
import { createCheckoutController } from "./checkoutController.js";

function run(handler, req) {
  const out = {};
  const res = {
    status(code) {
      out.status = code;
      return this;
    },
    json(body) {
      out.body = body;
      return this;
    },
  };
  return handler(req, res).then(() => out);
}

test("create: mensagem de sucesso quando o e-mail foi enviado", async () => {
  const controller = createCheckoutController({
    checkout: async () => ({ total: 10, emailSent: true }),
  });
  const out = await run(controller.create, { body: { customer_email: "a@b.c", items: [] } });

  assert.strictEqual(out.status, 201);
  assert.deepStrictEqual(out.body, {
    message: "Purchase completed and email sent",
    total: 10,
    emailSent: true,
  });
});

test("create: mensagem de aviso quando o e-mail não foi enviado", async () => {
  const controller = createCheckoutController({
    checkout: async () => ({ total: 10, emailSent: false }),
  });
  const out = await run(controller.create, { body: { customer_email: "a@b.c", items: [] } });

  assert.strictEqual(out.status, 201);
  assert.match(out.body.message, /email could not be sent/);
  assert.strictEqual(out.body.emailSent, false);
});

test("create: repassa e-mail, itens e usuário para o caso de uso", async () => {
  let received;
  const controller = createCheckoutController({
    checkout: async (input) => ((received = input), { total: 0, emailSent: true }),
  });
  const user = { id: 3, email: "u@x.test" };
  await run(controller.create, { body: { customer_email: "a@b.c", items: [1] }, user });

  assert.deepStrictEqual(received, { customerEmail: "a@b.c", items: [1], user });
});

test("create: corpo ausente é 400", async () => {
  const controller = createCheckoutController({ checkout: async () => ({}) });
  await assert.rejects(run(controller.create, {}), (err) => err.status === 400);
});
