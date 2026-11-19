import { Router } from "express";
import rateLimit from "express-rate-limit";
import { body } from "express-validator";
import { validate } from "../../../shared/middlewares/validate.js";

// bcrypt só considera os primeiros 72 bytes da senha
const credentials = [
  body("email")
    .isString()
    .withMessage("A valid email is required")
    .bail()
    .trim()
    .toLowerCase()
    .isEmail()
    .withMessage("A valid email is required"),
  body("password")
    .isString()
    .withMessage("Password is required")
    .bail()
    .isLength({ min: 8, max: 72 })
    .withMessage("Password must be between 8 and 72 characters"),
];

// Freia tentativa de adivinhar senha. Conta cada requisição, acertando ou não.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many attempts, try again later" },
});

// Cadastro é público: sem limite, dá para encher o banco de contas e gastar CPU com bcrypt
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many sign ups, try again later" },
});

export function createAuthRoutes({ controller, authenticate }) {
  const router = Router();

  router.post("/auth/register", registerLimiter, validate(credentials), controller.register);
  router.post("/auth/login", loginLimiter, validate(credentials), controller.login);
  router.get("/auth/me", authenticate, controller.me);

  return router;
}
