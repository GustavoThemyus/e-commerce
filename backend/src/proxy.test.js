// TRUST_PROXY é lida quando o app é carregado, então cada cenário roda num processo filho.
// O que está em jogo: atrás da Render todas as requisições chegam do IP do proxy. Sem
// confiar no X-Forwarded-For, um único visitante esgotaria o limite de login de todos.
import "dotenv/config";

import test from "node:test";
import assert from "node:assert";
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const backendDir = fileURLToPath(new URL("../", import.meta.url));
const appUrl = pathToFileURL(fileURLToPath(new URL("./app.js", import.meta.url))).href;

// 11 tentativas do visitante A, depois uma do visitante B (cabeçalho X-Forwarded-For)
const script = `
  import request from "supertest";
  const { default: app } = await import(${JSON.stringify(appUrl)});
  const attempt = (ip) => request(app).post("/api/auth/login").set("X-Forwarded-For", ip).send({});
  const visitorA = [];
  for (let i = 0; i < 11; i++) visitorA.push((await attempt("203.0.113.1")).status);
  const visitorB = (await attempt("203.0.113.2")).status;
  console.log(JSON.stringify({ visitorA, visitorB }));
  process.exit(0);
`;

function run(trustProxy) {
  const env = { ...process.env };
  delete env.TRUST_PROXY;
  if (trustProxy !== undefined) env.TRUST_PROXY = trustProxy;

  const result = spawnSync(process.execPath, ["--input-type=module", "-e", script], {
    cwd: backendDir,
    env,
    encoding: "utf8",
    timeout: 60_000,
  });
  assert.strictEqual(result.status, 0, result.stderr);
  return JSON.parse(result.stdout.trim().split("\n").pop());
}

test("com TRUST_PROXY=1 cada visitante (X-Forwarded-For) tem o próprio limite de login", () => {
  const { visitorA, visitorB } = run("1");

  assert.deepStrictEqual(visitorA.slice(0, 10), Array(10).fill(400));
  assert.strictEqual(visitorA[10], 429, "o visitante A estoura o limite");
  assert.strictEqual(visitorB, 400, "o visitante B não é bloqueado pelo A");
});

test("sem TRUST_PROXY o cabeçalho é ignorado e todos dividem o mesmo limite", () => {
  const { visitorA, visitorB } = run(undefined);

  assert.strictEqual(visitorA[10], 429);
  assert.strictEqual(visitorB, 429, "sem a variável o visitante B pagaria pelo A");
});

test("TRUST_PROXY inválida impede o app de subir", () => {
  const env = { ...process.env, TRUST_PROXY: "talvez" };
  const result = spawnSync(
    process.execPath,
    ["--input-type=module", "-e", `await import(${JSON.stringify(appUrl)}); process.exit(0);`],
    { cwd: backendDir, env, encoding: "utf8", timeout: 60_000 },
  );

  assert.notStrictEqual(result.status, 0);
  assert.match(result.stderr, /TRUST_PROXY inválida/);
});
