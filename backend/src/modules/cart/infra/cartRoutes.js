import { Router } from "express";

export function createCartRoutes(controller) {
  const router = Router();

  router.get("/cart", controller.get);
  router.post("/cart", controller.add);
  router.put("/cart", controller.update);
  router.delete("/cart/:id", controller.remove);

  return router;
}
