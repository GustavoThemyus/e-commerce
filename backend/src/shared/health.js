import { Router } from "express";

// Health check para a hospedagem e para monitor externo. Só confirma que o banco responde e
// nunca devolve o motivo da falha, que ficaria visível para qualquer um.
export function createHealthRouter({ pool }) {
  const router = Router();

  router.get("/health", async (req, res) => {
    try {
      await pool.query("SELECT 1");
      res.json({ status: "ok" });
    } catch (err) {
      console.error("Health check failed:", err.message);
      res.status(503).json({ status: "unavailable" });
    }
  });

  return router;
}
