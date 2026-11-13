import { AppError } from "../../../shared/errors/AppError.js";

export function createCheckoutController({ checkout, listOrders }) {
  return {
    async create(req, res) {
      if (!req.body) {
        throw new AppError(400, "Missing JSON body");
      }

      const { customer_email, items } = req.body;
      const { total, emailSent } = await checkout({
        customerEmail: customer_email,
        items,
        user: req.user,
      });

      res.status(201).json({
        message: emailSent
          ? "Purchase completed and email sent"
          : "Purchase completed, but email could not be sent in testing mode",
        total,
        emailSent,
      });
    },

    async list(req, res) {
      res.json(await listOrders({ user: req.user }));
    },
  };
}
