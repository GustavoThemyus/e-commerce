import { Router } from "express";
import { body } from "express-validator";
import { validate } from "../../../shared/middlewares/validate.js";

const quantity = body("quantity")
  .isInt({ min: 1 })
  .withMessage("quantity must be a positive integer")
  .toInt();

const addItem = [
  body("product.id")
    .isInt({ min: 1 })
    .withMessage("product.id must be a positive integer")
    .toInt(),
  quantity,
];

const updateItem = [
  body("id").isInt({ min: 1 }).withMessage("id must be a positive integer").toInt(),
  quantity,
];

export function createCartRoutes(controller) {
  const router = Router();

  router.get("/cart", controller.get);
  router.post("/cart", validate(addItem), controller.add);
  router.put("/cart", validate(updateItem), controller.update);
  router.delete("/cart/:id", controller.remove);

  return router;
}
