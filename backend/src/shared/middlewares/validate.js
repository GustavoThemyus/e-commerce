import { validationResult } from "express-validator";
import { AppError } from "../errors/AppError.js";

// Roda as cadeias do express-validator e responde 400 com a primeira mensagem
export function validate(chains) {
  return async (req, res, next) => {
    for (const chain of chains) {
      await chain.run(req);
    }

    const result = validationResult(req);
    if (!result.isEmpty()) {
      throw new AppError(400, result.array({ onlyFirstError: true })[0].msg);
    }

    next();
  };
}
