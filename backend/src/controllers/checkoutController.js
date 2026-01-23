import pool from "../config/database.js";
import { clearCart } from "./cartController.js";
import { sendPurchaseEmail } from "../services/emailService.js";

export async function checkout(req, res) {
  try {
    if (!req.body) {
      return res.status(400).json({ error: "Missing JSON body" });
    }

    const { customer_email, items } = req.body;

    if (!customer_email || !items || items.length === 0) {
      return res.status(400).json({
        error: "Customer email and cart items are required.",
      });
    }

    const total = items.reduce(
      (sum, item) => sum + Number(item.price) * Number(item.quantity),
      0,
    );

    // 1) Always register the sale (this is the core of checkout)
    await pool.query(
      "INSERT INTO sales (customer_email, total, items) VALUES ($1, $2, $3)",
      [customer_email, total, JSON.stringify(items)],
    );

    // 2) Try to send email, but do not fail the purchase if it can't be sent
    let emailSent = true;
    try {
      await sendPurchaseEmail(customer_email, items, total);
    } catch (err) {
      emailSent = false;
      console.error("Email send failed:", err);
    }

    // 3) Clear cart after successful purchase
    clearCart();

    return res.status(201).json({
      message: emailSent
        ? "Purchase completed and email sent"
        : "Purchase completed, but email could not be sent in testing mode",
      total,
      emailSent,
    });
  } catch (error) {
    console.error("Checkout failed:", error);
    return res.status(500).json({
      error: error?.message || "Checkout failed",
    });
  }
}
