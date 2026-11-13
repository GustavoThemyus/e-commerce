import { AppError } from "../../../shared/errors/AppError.js";

const DEFAULT_PRODUCT_LIMIT = 4;
const DEFAULT_USER_LIMIT = 8;

export function createRecommendationController({ recommendForProduct, recommendForUser }) {
  return {
    async forProduct(req, res) {
      const productId = Number(req.params.id);
      if (!Number.isInteger(productId) || productId < 1) {
        throw new AppError(404, "Product not found");
      }

      res.json(
        await recommendForProduct({
          productId,
          limit: req.query.limit ?? DEFAULT_PRODUCT_LIMIT,
        }),
      );
    },

    async forUser(req, res) {
      res.json(
        await recommendForUser({
          user: req.user,
          limit: req.query.limit ?? DEFAULT_USER_LIMIT,
        }),
      );
    },
  };
}
