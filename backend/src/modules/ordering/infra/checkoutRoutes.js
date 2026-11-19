import { Router } from "express";
import rateLimit from "express-rate-limit";
import { PERMISSIONS } from "../../../shared/permissions.js";

// Checkout é público e dispara e-mail para o customer_email informado: sem limite, a loja vira
// um relé de spam e queima a cota do Resend
const checkoutLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many purchases, try again later" },
});

export function createCheckoutRoutes(
  controller,
  { authenticate, optionalAuthenticate, requirePermission },
) {
  const router = Router();

  // Aceita convidado (só e-mail) e usuário logado
  router.post("/checkout", checkoutLimiter, optionalAuthenticate, controller.create);

  router.get(
    "/orders",
    authenticate,
    requirePermission(PERMISSIONS.ORDER_READ_ANY, PERMISSIONS.ORDER_READ_OWN),
    controller.list,
  );

  return router;
}
