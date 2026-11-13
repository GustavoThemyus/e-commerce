// database.js valida DATABASE_URL ao ser importado, então cada cenário roda num processo filho
import "dotenv/config";

import test, { mock } from "node:test";
import assert from "node:assert";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const databaseModule = fileURLToPath(new URL("./database.js", import.meta.url));

function importWith(databaseUrl) {
  const env = { ...process.env };
  delete env.DATABASE_URL;
  if (databaseUrl !== undefined) env.DATABASE_URL = databaseUrl;

  return spawnSync(
    process.execPath,
    ["--input-type=module", "-e", `const { default: pool } = await import(${JSON.stringify(databaseModule)}); await pool.end();`],
    { env, encoding: "utf8" },
  );
}

test("sem DATABASE_URL o import falha com instrução de como configurar", () => {
  const result = importWith(undefined);
  assert.notStrictEqual(result.status, 0);
  assert.match(result.stderr, /DATABASE_URL não definida/);
});

test("placeholder do .env.example é recusado", () => {
  for (const url of [
    "postgresql://postgres.<ref>:<senha>@aws-0-<regiao>.pooler.supabase.com:5432/postgres",
    "postgresql://postgres:[YOUR-PASSWORD]@db.example.com:5432/postgres",
  ]) {
    const result = importWith(url);
    assert.notStrictEqual(result.status, 0, url);
    assert.match(result.stderr, /placeholder/, url);
  }
});

test("URI inválida é recusada", () => {
  const result = importWith("isto não é uma uri");
  assert.notStrictEqual(result.status, 0);
  assert.match(result.stderr, /não é uma URI válida/);
});

test("URI local e URI remota (com SSL) são aceitas", () => {
  for (const url of [
    "postgresql://postgres:postgres@localhost:5432/ecommerce",
    "postgresql://postgres:postgres@127.0.0.1:5432/ecommerce",
    "postgresql://usuario:senha@db.exemplo.com:5432/postgres",
  ]) {
    const result = importWith(url);
    assert.strictEqual(result.status, 0, `${url}\n${result.stderr}`);
  }
});

test("erro em conexão ociosa é registrado em vez de derrubar o processo", async () => {
  const { default: pool } = await import("./database.js");
  const logged = mock.method(console, "error", () => {});

  pool.emit("error", new Error("conexão caiu"));

  assert.strictEqual(logged.mock.callCount(), 1);
  assert.match(logged.mock.calls[0].arguments.join(" "), /conexão caiu/);
  mock.restoreAll();
  await pool.end();
});
