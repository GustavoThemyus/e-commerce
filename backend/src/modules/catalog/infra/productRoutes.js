import { Router } from "express";
import { body } from "express-validator";
import { validate } from "../../../shared/middlewares/validate.js";
import { PERMISSIONS } from "../../../shared/permissions.js";

const productBody = [
  body("title")
    .isString()
    .withMessage("Title is required")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Title is required"),
  body("price")
    .isFloat({ gt: 0, lt: 100000000 })
    .withMessage("Price must be a number greater than zero")
    .toFloat(),
  body(["description", "category"])
    .optional({ values: "null" })
    .isString()
    .withMessage("Description and category must be text"),
  body("image")
    .optional({ values: "null" })
    .isURL({ protocols: ["http", "https"], require_protocol: true })
    .withMessage("Image must be an http(s) URL"),
];

export function createProductRoutes(controller, { authenticate, requirePermission }) {
  const router = Router();
  const canWrite = [authenticate, requirePermission(PERMISSIONS.PRODUCT_WRITE)];

  router.get("/product", controller.list);
  router.get("/product/:id", controller.get);
  router.post("/product", ...canWrite, validate(productBody), controller.create);
  router.put("/product/:id", ...canWrite, validate(productBody), controller.update);

  return router;
}
