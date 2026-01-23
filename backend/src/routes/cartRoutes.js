import { Router } from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
} from "../controllers/cartController.js";

const router = Router();

router.get("/cart", getCart);
router.post("/cart", addToCart);
router.put("/cart", updateCartItem);
router.delete("/cart/:id", removeFromCart);

export default router;
