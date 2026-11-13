// Gera compras sintéticas para as recomendações terem o que mostrar. A loja nova não tem
// histórico, então sem isto tudo cai no fallback de "mais bem avaliados".
//   npm run seed:demo            recria os dados de demonstração
//   npm run seed:demo -- --clear só remove
//
// Cada comprador tem um gosto (uma categoria preferida, ~80% das compras) para o algoritmo
// encontrar padrão. A semente é fixa: rodar de novo gera exatamente os mesmos dados.
import "dotenv/config";
import pool from "../src/shared/config/database.js";
import { Order } from "../src/modules/ordering/domain/Order.js";
import { createOrderRepository } from "../src/modules/ordering/infra/OrderRepository.js";

const BUYERS = 60;
const DEMO_DOMAIN = "@demo.example";

// PRNG determinístico (mulberry32)
function createRandom(seed) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

try {
  // sale_items sai junto, por ON DELETE CASCADE
  const removed = await pool.query("DELETE FROM sales WHERE customer_email LIKE $1", [
    `%${DEMO_DOMAIN}`,
  ]);
  console.log(`Removidas ${removed.rowCount} compras de demonstração anteriores.`);

  if (process.argv.includes("--clear")) process.exit(0);

  const { rows: products } = await pool.query(
    "SELECT id, title, price, category FROM products ORDER BY id",
  );
  const categories = [...new Set(products.map((p) => p.category))];
  const byCategory = new Map(
    categories.map((c) => [c, products.filter((p) => p.category === c)]),
  );

  const random = createRandom(42);
  const pick = (list) => list[Math.floor(random() * list.length)];
  const orders = createOrderRepository(pool);

  for (let i = 0; i < BUYERS; i++) {
    const favorite = categories[i % categories.length];
    const size = 2 + Math.floor(random() * 4); // 2 a 5 produtos
    const chosen = new Map();

    while (chosen.size < size) {
      const pool_ = random() < 0.8 ? byCategory.get(favorite) : products;
      const product = pick(pool_);
      chosen.set(product.id, product);
    }

    const items = [...chosen.values()].map((p) => {
      const quantity = 1 + Math.floor(random() * 2);
      const price = Number(p.price);
      return {
        productId: p.id,
        title: p.title,
        price,
        quantity,
        subtotal: Math.round(price * 100 * quantity) / 100,
      };
    });

    await orders.save(
      Order.create({ customerEmail: `buyer-${i + 1}${DEMO_DOMAIN}`, items }),
    );
  }

  console.log(`Criadas ${BUYERS} compras de demonstração (${categories.length} perfis de gosto).`);
} finally {
  await pool.end();
}
