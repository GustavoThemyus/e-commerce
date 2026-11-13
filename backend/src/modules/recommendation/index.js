import { createPurchaseHistoryRepository } from "./infra/PurchaseHistoryRepository.js";
import { makeRecommendForProduct } from "./application/recommendForProduct.js";
import { makeRecommendForUser } from "./application/recommendForUser.js";
import { createRecommendationController } from "./infra/recommendationController.js";
import { createRecommendationRoutes } from "./infra/recommendationRoutes.js";

export function createRecommendationModule({ pool, auth, productCatalog }) {
  const purchaseHistory = createPurchaseHistoryRepository(pool);

  const controller = createRecommendationController({
    recommendForProduct: makeRecommendForProduct({ purchaseHistory, productCatalog }),
    recommendForUser: makeRecommendForUser({ purchaseHistory, productCatalog }),
  });

  return { router: createRecommendationRoutes(controller, auth) };
}
