// Precisa vir antes dos imports que leem process.env (imports em ESM são hoisted)
import "dotenv/config";

import express from "express";
import cors from "cors";
import helmet from "helmet";
import pool from "./shared/config/database.js";
import { errorHandler } from "./shared/middlewares/errorHandler.js";
import { createIdentityModule } from "./modules/identity/index.js";
import { createCatalogModule } from "./modules/catalog/index.js";
import { createCartModule } from "./modules/cart/index.js";
import { createOrderingModule } from "./modules/ordering/index.js";
import { createRecommendationModule } from "./modules/recommendation/index.js";

// Composition root: é aqui que os módulos recebem suas dependências
const identity = createIdentityModule({ pool, jwtSecret: process.env.JWT_SECRET });
const catalog = createCatalogModule({ pool, auth: identity.auth });
const cart = createCartModule();
const ordering = createOrderingModule({
  pool,
  auth: identity.auth,
  productCatalog: catalog.productCatalog,
  clearCart: cart.cartService.clear,
});

const recommendation = createRecommendationModule({
  pool,
  auth: identity.auth,
  productCatalog: catalog.productCatalog,
});

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use("/api", identity.router);
app.use("/api", catalog.router);
app.use("/api", cart.router);
app.use("/api", ordering.router);
app.use("/api", recommendation.router);

app.use(errorHandler);

export default app;
