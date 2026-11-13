import test from "node:test";
import assert from "node:assert";
import jwt from "jsonwebtoken";
import { createTokenService } from "./jwtTokenService.js";

const secret = "segredo-de-teste-com-tamanho-razoavel";
const tokens = createTokenService(secret);

test("sem segredo o serviço nem é criado", () => {
  assert.throws(() => createTokenService(""), /JWT_SECRET não definida/);
  assert.throws(() => createTokenService(undefined), /JWT_SECRET não definida/);
});

test("sign e verify devolvem o id do usuário", () => {
  assert.strictEqual(tokens.verify(tokens.sign(42)), 42);
});

test("o token expira em 1 hora e não carrega dados além do id", () => {
  const payload = jwt.decode(tokens.sign(7));
  assert.strictEqual(payload.sub, "7");
  assert.strictEqual(payload.exp - payload.iat, 3600);
  assert.deepStrictEqual(Object.keys(payload).sort(), ["exp", "iat", "sub"]);
});

test("verify recusa lixo, token de outro segredo, expirado e sem assinatura", () => {
  assert.strictEqual(tokens.verify("lixo"), null);
  assert.strictEqual(tokens.verify(""), null);

  const outro = jwt.sign({}, "outro-segredo", { subject: "1", expiresIn: "1h" });
  assert.strictEqual(tokens.verify(outro), null);

  const expirado = jwt.sign({}, secret, { subject: "1", expiresIn: -10 });
  assert.strictEqual(tokens.verify(expirado), null);

  // alg "none": o atacante tenta passar sem assinatura
  const semAssinatura = jwt.sign({ sub: "1" }, "", { algorithm: "none" });
  assert.strictEqual(tokens.verify(semAssinatura), null);
});

test("verify recusa algoritmo diferente do HS256", () => {
  const hs512 = jwt.sign({}, secret, { subject: "1", algorithm: "HS512" });
  assert.strictEqual(tokens.verify(hs512), null);
});

test("verify recusa subject que não é um id inteiro, ou que não existe", () => {
  for (const subject of ["abc", "1.5"]) {
    const token = jwt.sign({}, secret, { subject, expiresIn: "1h" });
    assert.strictEqual(tokens.verify(token), null, `sub=${subject}`);
  }

  const semSubject = jwt.sign({}, secret, { expiresIn: "1h" });
  assert.strictEqual(tokens.verify(semSubject), null);
});
