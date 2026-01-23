import { Router } from "express";
import { listProducts, getProduct } from "../controllers/productController.js";

const router = Router();

router.get("/product", listProducts);
router.get("/product/:id", getProduct);

export default router;
