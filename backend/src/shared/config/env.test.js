import test from "node:test";
import assert from "node:assert";
import {
  DEFAULT_CORS_ORIGIN,
  parseOrigins,
  parsePort,
  parseTrustProxy,
} from "./env.js";

test("parseOrigins: sem valor (ou vazio, como no .env.example copiado) usa o padrão local", () => {
  for (const value of [undefined, "", "   ", ",,"]) {
    assert.deepStrictEqual(parseOrigins(value), [DEFAULT_CORS_ORIGIN], JSON.stringify(value));
  }
});

test("parseOrigins: aceita várias origens e ignora espaços", () => {
  assert.deepStrictEqual(
    parseOrigins(" https://a.vercel.app , https://b.example.com "),
    ["https://a.vercel.app", "https://b.example.com"],
  );
});

test("parseOrigins: tira a barra do fim, que o cabeçalho Origin nunca tem", () => {
  assert.deepStrictEqual(parseOrigins("https://a.vercel.app/"), ["https://a.vercel.app"]);
  assert.deepStrictEqual(parseOrigins("https://a.vercel.app///"), ["https://a.vercel.app"]);
});

test("parsePort: padrão quando ausente, número quando válido, erro quando inválido", () => {
  assert.strictEqual(parsePort(undefined), 3333);
  assert.strictEqual(parsePort(""), 3333);
  assert.strictEqual(parsePort(undefined, 4000), 4000);
  assert.strictEqual(parsePort("10000"), 10000);

  for (const bad of ["abc", "0", "-1", "70000", "80.5"]) {
    assert.throws(() => parsePort(bad), /PORT inválida/, bad);
  }
});

test("parseTrustProxy: indefinido sem proxy, inteiro quando válido, erro quando inválido", () => {
  assert.strictEqual(parseTrustProxy(undefined), undefined);
  assert.strictEqual(parseTrustProxy(""), undefined);
  assert.strictEqual(parseTrustProxy("1"), 1);
  assert.strictEqual(parseTrustProxy("0"), 0);

  for (const bad of ["true", "-1", "1.5", "11", "abc"]) {
    assert.throws(() => parseTrustProxy(bad), /TRUST_PROXY inválida/, bad);
  }
});
