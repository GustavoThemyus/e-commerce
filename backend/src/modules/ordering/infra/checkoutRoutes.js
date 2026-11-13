import { Router } from "express";
import { PERMISSIONS } from "../../../shared/permissions.js";

export function createCheckoutRoutes(
  controller,
  { authenticate, optionalAuthenticate, requirePermission },
) {
  const router = Router();

  // Aceita convidado (só e-mail) e usuário logado
  router.post("/checkout", optionalAuthenticate, controller.create);

  router.get(
    "/orders",
    authenticate,
    requirePermission(PERMISSIONS.ORDER_READ_ANY, PERMISSIONS.ORDER_READ_OWN),
    controller.list,
  );

  return router;
}
