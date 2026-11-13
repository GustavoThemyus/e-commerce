import { AppError } from "../errors/AppError.js";

// Express 5 encaminha rejeições de handlers async para cá
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.status).json({ error: err.message });
  }

  // Erros 4xx de bibliotecas (ex.: JSON malformado no body-parser) marcam a mensagem
  // como segura para o cliente com `expose`
  const status = err.status ?? err.statusCode;
  if (status >= 400 && status < 500 && err.expose) {
    return res.status(status).json({ error: err.message });
  }

  console.error("Unhandled error:", err);
  return res.status(500).json({ error: "Internal server error" });
}
