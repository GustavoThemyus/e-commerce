// Transforma o ranking (ids + pontuação) em produtos e completa até `limit` com os mais bem
// avaliados quando o histórico de compras não basta (loja nova, produto sem compras).
export const REASON = {
  ALSO_BOUGHT: "also-bought",
  TOP_RATED: "top-rated",
};

const round = (n) => Math.round(n * 10000) / 10000;

export async function withTopRatedFallback({ ranked, exclude, limit, productCatalog }) {
  const found = await productCatalog.findByIds(ranked.map((r) => r.productId));
  const byId = new Map(found.map((p) => [p.id, p]));

  const recommendations = ranked
    .filter((r) => byId.has(r.productId))
    .map((r) => ({
      ...byId.get(r.productId),
      recommendation: { reason: REASON.ALSO_BOUGHT, score: round(r.score) },
    }));

  if (recommendations.length < limit) {
    const taken = [...exclude, ...recommendations.map((p) => p.id)];
    const topRated = await productCatalog.findTopRated(limit - recommendations.length, taken);

    for (const product of topRated) {
      recommendations.push({
        ...product,
        recommendation: { reason: REASON.TOP_RATED, score: null },
      });
    }
  }

  return recommendations;
}
