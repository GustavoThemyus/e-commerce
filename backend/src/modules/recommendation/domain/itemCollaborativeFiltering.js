// Filtragem colaborativa item-item, sem dependência de banco ou framework.
//
// Entrada: cestas de compra, uma lista de ids de produto por comprador (sinal implícito e
// binário: comprou ou não comprou, a quantidade não pesa).
// Similaridade entre dois produtos = cosseno entre os vetores de compradores:
//   sim(a, b) = |compradores de a e b| / sqrt(|compradores de a| * |compradores de b|)
// vai de 0 (ninguém comprou os dois) a 1 (sempre comprados juntos).

export function buildSimilarityModel(baskets) {
  const buyers = new Map(); // produto -> quantas cestas o contêm
  const together = new Map(); // produto -> (outro produto -> cestas com os dois)

  for (const basket of baskets) {
    const items = [...new Set(basket)];

    for (const a of items) {
      buyers.set(a, (buyers.get(a) ?? 0) + 1);

      for (const b of items) {
        if (a === b) continue;
        if (!together.has(a)) together.set(a, new Map());
        const row = together.get(a);
        row.set(b, (row.get(b) ?? 0) + 1);
      }
    }
  }

  return {
    // Mapa produto -> similaridade com `productId`. Vazio se nunca foi comprado junto de nada.
    similarTo(productId) {
      const similar = new Map();
      for (const [other, count] of together.get(productId) ?? []) {
        similar.set(other, count / Math.sqrt(buyers.get(productId) * buyers.get(other)));
      }
      return similar;
    },
  };
}

// Maior pontuação primeiro. O desempate por id deixa o resultado determinístico.
function rank(scores, limit) {
  return [...scores]
    .map(([productId, score]) => ({ productId, score }))
    .sort((x, y) => y.score - x.score || x.productId - y.productId)
    .slice(0, limit);
}

// "Quem comprou este também comprou": os produtos mais parecidos com um produto
export function rankSimilarTo(model, productId, limit) {
  return rank(model.similarTo(productId), limit);
}

// Para um comprador: soma a similaridade de cada candidato com tudo que ele já tem.
// O que ele já comprou nunca é recomendado.
export function rankForOwned(model, ownedProductIds, limit) {
  const owned = new Set(ownedProductIds);
  const scores = new Map();

  for (const mine of owned) {
    for (const [candidate, similarity] of model.similarTo(mine)) {
      if (owned.has(candidate)) continue;
      scores.set(candidate, (scores.get(candidate) ?? 0) + similarity);
    }
  }

  return rank(scores, limit);
}
