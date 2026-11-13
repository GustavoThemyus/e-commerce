// O SDK do Resend usa o fetch global: trocamos por um falso, então nenhum e-mail é enviado
import test, { mock, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import { createResendEmailGateway } from "./ResendEmailGateway.js";
import { Order } from "../domain/Order.js";

const order = Order.create({
  customerEmail: "cliente@example.test",
  items: [
    { productId: 1, title: "Mochila", price: 109.95, quantity: 2, subtotal: 219.9 },
    { productId: 2, title: "Camiseta", price: 22.3, quantity: 1, subtotal: 22.3 },
  ],
});

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });

let originalKey;

beforeEach(() => {
  originalKey = process.env.RESEND_API_KEY;
  mock.method(console, "log", () => {}); // o gateway imprime a resposta do Resend
});

afterEach(() => {
  mock.restoreAll();
  if (originalKey === undefined) delete process.env.RESEND_API_KEY;
  else process.env.RESEND_API_KEY = originalKey;
});

test("sem RESEND_API_KEY recusa sem chamar a rede", async () => {
  delete process.env.RESEND_API_KEY;
  const fetchMock = mock.method(globalThis, "fetch", async () => json({}));

  await assert.rejects(
    createResendEmailGateway().sendPurchaseConfirmation(order),
    /RESEND_API_KEY não configurada/,
  );
  assert.strictEqual(fetchMock.mock.callCount(), 0);
});

test("envia o e-mail de confirmação com destinatário, total e itens", async () => {
  process.env.RESEND_API_KEY = "re_chave_de_teste";
  const fetchMock = mock.method(globalThis, "fetch", async () => json({ id: "email-1" }));

  const data = await createResendEmailGateway().sendPurchaseConfirmation(order);
  assert.deepStrictEqual(data, { id: "email-1" });

  const [url, options] = fetchMock.mock.calls[0].arguments;
  assert.match(String(url), /api\.resend\.com\/emails$/);
  assert.match(options.headers.get?.("authorization") ?? options.headers.Authorization, /re_chave_de_teste/);

  const sent = JSON.parse(options.body);
  assert.strictEqual(sent.to, "cliente@example.test");
  assert.strictEqual(sent.subject, "Purchase confirmation");
  assert.match(sent.html, /\$242\.20/); // total 219.90 + 22.30
  assert.match(sent.html, /Mochila — 2 x \$109\.95/);
  assert.match(sent.html, /Camiseta — 1 x \$22\.30/);
});

test("erro devolvido pela API do Resend vira exceção com a mensagem dele", async () => {
  process.env.RESEND_API_KEY = "re_chave_de_teste";
  mock.method(globalThis, "fetch", async () =>
    json({ name: "validation_error", statusCode: 422, message: "domínio não verificado" }, 422),
  );

  await assert.rejects(
    createResendEmailGateway().sendPurchaseConfirmation(order),
    /domínio não verificado/,
  );
});

test("erro do Resend sem mensagem usa o texto padrão", async () => {
  process.env.RESEND_API_KEY = "re_chave_de_teste";
  mock.method(globalThis, "fetch", async () => json({ name: "application_error", statusCode: 500 }, 500));

  await assert.rejects(
    createResendEmailGateway().sendPurchaseConfirmation(order),
    /Resend send failed/,
  );
});
