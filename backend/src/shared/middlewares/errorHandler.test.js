import test, { mock, afterEach } from "node:test";
import assert from "node:assert";
import { errorHandler } from "./errorHandler.js";
import { AppError } from "../errors/AppError.js";

afterEach(() => mock.restoreAll());

function respond(err) {
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
  errorHandler(err, {}, res, () => {});
  return out;
}

test("AppError responde com o status e a mensagem dela", () => {
  assert.deepStrictEqual(respond(new AppError(409, "Email already registered")), {
    status: 409,
    body: { error: "Email already registered" },
  });
});

test("erro 4xx de biblioteca marcado com expose (JSON malformado) mantém status e mensagem", () => {
  const parseError = Object.assign(new SyntaxError("Unexpected end of JSON input"), {
    status: 400,
    expose: true,
  });
  assert.deepStrictEqual(respond(parseError), {
    status: 400,
    body: { error: "Unexpected end of JSON input" },
  });
});

test("erro desconhecido vira 500 genérico, sem vazar a mensagem interna", () => {
  const logged = mock.method(console, "error", () => {});
  const out = respond(new Error('relation "secret_table" does not exist'));

  assert.strictEqual(out.status, 500);
  assert.deepStrictEqual(out.body, { error: "Internal server error" });
  assert.strictEqual(logged.mock.callCount(), 1, "o erro real fica só no log do servidor");
});

test("erro com status 4xx sem expose não vaza a mensagem", () => {
  mock.method(console, "error", () => {});
  const out = respond(Object.assign(new Error("detalhe interno"), { status: 404 }));
  assert.strictEqual(out.status, 500);
  assert.deepStrictEqual(out.body, { error: "Internal server error" });
});

test("erro com status 5xx é tratado como 500 genérico", () => {
  mock.method(console, "error", () => {});
  const out = respond(Object.assign(new Error("boom"), { status: 503, expose: true }));
  assert.strictEqual(out.status, 500);
});
