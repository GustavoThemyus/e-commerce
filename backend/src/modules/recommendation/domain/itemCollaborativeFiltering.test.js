import test from "node:test";
import assert from "node:assert";
import {
  buildSimilarityModel,
  rankSimilarTo,
  rankForOwned,
} from "./itemCollaborativeFiltering.js";

// Compradores: A={1,2}  B={1,2}  C={1,3}  D={2,3,4}
// Quantos compraram cada produto: 1->3, 2->3, 3->2, 4->1
// Em comum: (1,2)=2  (1,3)=1  (2,3)=1  (2,4)=1  (3,4)=1
const baskets = [[1, 2], [1, 2], [1, 3], [2, 3, 4]];
const model = buildSimilarityModel(baskets);

const near = (actual, expected) =>
  assert.ok(Math.abs(actual - expected) < 1e-9, `${actual} != ${expected}`);

test("similaridade de cosseno bate com o cálculo manual", () => {
  const sim1 = model.similarTo(1);
  near(sim1.get(2), 2 / Math.sqrt(3 * 3)); // 0.6667
  near(sim1.get(3), 1 / Math.sqrt(3 * 2)); // 0.4082
  assert.ok(!sim1.has(4)); // ninguém comprou 1 e 4 juntos
  assert.ok(!sim1.has(1)); // nunca é similar a si mesmo

  near(model.similarTo(3).get(4), 1 / Math.sqrt(2 * 1)); // 0.7071
});

test("a similaridade é simétrica", () => {
  near(model.similarTo(2).get(4), model.similarTo(4).get(2));
});

test("rankSimilarTo ordena do mais parecido para o menos", () => {
  const ranked = rankSimilarTo(model, 1, 10);
  assert.deepStrictEqual(ranked.map((r) => r.productId), [2, 3]);
  near(ranked[0].score, 2 / 3);
});

test("rankSimilarTo respeita o limite", () => {
  assert.strictEqual(rankSimilarTo(model, 1, 1).length, 1);
});

test("rankForOwned soma a similaridade e nunca recomenda o que a pessoa já tem", () => {
  // Quem tem {1,2}: o 3 pontua sim(1,3)+sim(2,3) = 0.8165, o 4 só sim(2,4) = 0.5774
  const ranked = rankForOwned(model, [1, 2], 10);
  assert.deepStrictEqual(ranked.map((r) => r.productId), [3, 4]);
  near(ranked[0].score, 2 / Math.sqrt(6));
  near(ranked[1].score, 1 / Math.sqrt(3));
});

test("sem histórico ou produto desconhecido, o resultado é vazio", () => {
  assert.deepStrictEqual(rankForOwned(model, [], 5), []);
  assert.deepStrictEqual(rankSimilarTo(model, 999, 5), []);
  assert.deepStrictEqual(rankSimilarTo(buildSimilarityModel([]), 1, 5), []);
});

test("produto repetido na mesma cesta conta uma vez só", () => {
  const dup = buildSimilarityModel([[1, 1, 2], [1, 2]]);
  near(dup.similarTo(1).get(2), 1); // sempre juntos
});

test("empate de pontuação desempata pelo menor id", () => {
  const tied = buildSimilarityModel([[1, 5], [1, 3]]);
  assert.deepStrictEqual(
    rankSimilarTo(tied, 1, 5).map((r) => r.productId),
    [3, 5],
  );
});
