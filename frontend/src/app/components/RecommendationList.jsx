"use client";
import { useContext } from "react";
import ProductCard from "./ProductCard";
import { CartContext } from "@/context/CartContext";

// Mostra recomendações separadas pela origem: o que veio do histórico de compras e o que
// só completou a lista com os mais bem avaliados. `titles` dá o título de cada grupo.
export default function RecommendationList({ products, titles }) {
  const { addToCart } = useContext(CartContext);

  if (!products || products.length === 0) return null;

  const groups = Object.entries(titles)
    .map(([reason, title]) => ({
      title,
      items: products.filter((p) => p.recommendation.reason === reason),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <div className="space-y-10">
      {groups.map((group) => (
        <section key={group.title} aria-label={group.title}>
          <h2 className="text-xl text-black mb-6">{group.title}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-10">
            {group.items.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                addToCart={() => addToCart(product)}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
