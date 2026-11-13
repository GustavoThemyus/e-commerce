import { Router } from "express";
import { query } from "express-validator";
import { validate } from "../../../shared/middlewares/validate.js";

const limitQuery = [
  query("limit")
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage("limit must be an integer between 1 and 20")
    .toInt(),
];

export function createRecommendationRoutes(controller, { authenticate }) {
  const router = Router();

  router.get(
    "/product/:id/recommendations",
    validate(limitQuery),
    controller.forProduct,
  );
  router.get("/recommendations", authenticate, validate(limitQuery), controller.forUser);

  return router;
}
