// Precisa vir antes dos imports que leem process.env (imports em ESM são hoisted)
import "dotenv/config";

import express from "express";
import cors from "cors";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import checkoutRoutes from "./routes/checkoutRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", productRoutes);
app.use("/api", cartRoutes);
app.use("/api", checkoutRoutes);

export default app;
