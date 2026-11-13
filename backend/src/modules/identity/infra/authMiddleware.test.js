import test from "node:test";
import assert from "node:assert";
import { createAuthMiddleware } from "./authMiddleware.js";
import { AppError } from "../../../shared/errors/AppError.js";

const user = { id: 1, email: "a@b.c", permissions: ["order:read:own"] };

function setup({ knownUser = user, validId = 1 } = {}) {
  const auth = createAuthMiddleware({
    tokenService: { verify: (token) => (token === "bom" ? validId : null) },
    userRepository: { findWithPermissions: async (id) => (id === knownUser?.id ? knownUser : undefined) },
  });
  return auth;
}

const reqWith = (authorization) => ({ get: (name) => (name === "Authorization" ? authorization : undefined) });

async function runs(middleware, req) {
  let nextCalled = 0;
  await middleware(req, {}, () => nextCalled++);
  return nextCalled;
}

const unauthorized = (message) => (err) =>
  err instanceof AppError && err.status === 401 && err.message === message;

test("authenticate: token válido carrega o usuário em req.user e segue", async () => {
  const req = reqWith("Bearer bom");
  assert.strictEqual(await runs(setup().authenticate, req), 1);
  assert.deepStrictEqual(req.user, user);
});

test("authenticate: sem cabeçalho é 401 'Authentication required'", async () => {
  await assert.rejects(runs(setup().authenticate, reqWith(undefined)), unauthorized("Authentication required"));
});

test("authenticate: esquema errado, token ausente ou inválido é 401 'Invalid or expired token'", async () => {
  for (const header of ["Basic bom", "Bearer", "Bearer ruim", "bom", "Bearer  "]) {
    await assert.rejects(
      runs(setup().authenticate, reqWith(header)),
      unauthorized("Invalid or expired token"),
      header,
    );
  }
});

test("authenticate: token válido de usuário que não existe mais é 401", async () => {
  const auth = setup({ knownUser: null }); // null: undefined cairia no valor padrão
  await assert.rejects(runs(auth.authenticate, reqWith("Bearer bom")), unauthorized("Invalid or expired token"));
});

test("optionalAuthenticate: sem cabeçalho segue como convidado (req.user nulo)", async () => {
  const req = reqWith(undefined);
  assert.strictEqual(await runs(setup().optionalAuthenticate, req), 1);
  assert.strictEqual(req.user, null);
});

test("optionalAuthenticate: com cabeçalho válido identifica o usuário", async () => {
  const req = reqWith("Bearer bom");
  await runs(setup().optionalAuthenticate, req);
  assert.deepStrictEqual(req.user, user);
});

test("optionalAuthenticate: cabeçalho inválido é 401, não vira convidado", async () => {
  await assert.rejects(runs(setup().optionalAuthenticate, reqWith("Bearer ruim")), unauthorized("Invalid or expired token"));
});

test("requirePermission: sem req.user é 401", () => {
  const guard = setup().requirePermission("product:write");
  assert.throws(() => guard({}, {}, () => {}), unauthorized("Authentication required"));
});

test("requirePermission: sem a permissão é 403", () => {
  const guard = setup().requirePermission("product:write");
  assert.throws(
    () => guard({ user }, {}, () => {}),
    (err) => err instanceof AppError && err.status === 403 && err.message === "Forbidden",
  );
});

test("requirePermission: basta ter uma das permissões listadas", () => {
  let passed = 0;
  setup().requirePermission("product:write", "order:read:own")({ user }, {}, () => passed++);
  assert.strictEqual(passed, 1);
});
