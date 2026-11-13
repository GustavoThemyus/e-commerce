import {
  buildSimilarityModel,
  rankForOwned,
} from "../domain/itemCollaborativeFiltering.js";
import { withTopRatedFallback } from "./withTopRatedFallback.js";

export function makeRecommendForUser({ purchaseHistory, productCatalog }) {
  return async function recommendForUser({ user, limit }) {
    const baskets = await purchaseHistory.findBaskets();
    const owned = baskets.get(user.email.toLowerCase()) ?? [];
    const model = buildSimilarityModel(baskets.values());

    return withTopRatedFallback({
      ranked: rankForOwned(model, owned, limit),
      exclude: owned,
      limit,
      productCatalog,
    });
  };
}
