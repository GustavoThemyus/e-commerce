import { AppError } from "../../../shared/errors/AppError.js";
import {
  buildSimilarityModel,
  rankSimilarTo,
} from "../domain/itemCollaborativeFiltering.js";
import { withTopRatedFallback } from "./withTopRatedFallback.js";

export function makeRecommendForProduct({ purchaseHistory, productCatalog }) {
  return async function recommendForProduct({ productId, limit }) {
    const [product] = await productCatalog.findByIds([productId]);
    if (!product) {
      throw new AppError(404, "Product not found");
    }

    const baskets = await purchaseHistory.findBaskets();
    const model = buildSimilarityModel(baskets.values());

    return withTopRatedFallback({
      ranked: rankSimilarTo(model, productId, limit),
      exclude: [productId],
      limit,
      productCatalog,
    });
  };
}
