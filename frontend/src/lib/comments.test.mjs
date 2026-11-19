import test from "node:test";
import assert from "node:assert";
import { parseStoredComments } from "./comments.mjs";

const valid = { id: 1, author: "Ana", text: "Bom projeto" };

test("sem nada salvo (getItem devolve null) a lista é vazia", () => {
  assert.deepStrictEqual(parseStoredComments(null), []);
  assert.deepStrictEqual(parseStoredComments(undefined), []);
  assert.deepStrictEqual(parseStoredComments(""), []);
});

test("regressão: nunca devolve a string '[]', que viraria dois itens vazios ao espalhar", () => {
  // Com o bug original, [...MOCK, ...("[]")] tinha 2 itens a mais, "[" e "]"
  const mock = ["c1", "c2"];
  assert.strictEqual([...mock, ...parseStoredComments(null)].length, 2);
  assert.strictEqual([...mock, ...parseStoredComments('"[]"')].length, 2);
});

test("lista vazia e JSON de lista válido", () => {
  assert.deepStrictEqual(parseStoredComments("[]"), []);
  assert.deepStrictEqual(parseStoredComments(JSON.stringify([valid])), [valid]);
});

test("JSON inválido ou que não é lista vira lista vazia, sem lançar erro", () => {
  for (const raw of ["não é json", "{", '{"a":1}', "42", "true", "null"]) {
    assert.deepStrictEqual(parseStoredComments(raw), [], raw);
  }
});

test("descarta itens que não são comentários completos e mantém os válidos", () => {
  const raw = JSON.stringify([
    null,
    5,
    "texto",
    { author: "sem id", text: "x" },
    { id: 2, author: 3, text: "autor não é texto" },
    { id: 3, author: "sem texto" },
    valid,
  ]);
  assert.deepStrictEqual(parseStoredComments(raw), [valid]);
});
