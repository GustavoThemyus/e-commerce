"use client";
import { useContext } from "react";
import ProductCard from "./ProductCard";
import { CartContext } from "@/context/CartContext";

export default function ProductList({ products }) {
  const { addToCart, isHydrated } = useContext(CartContext);

  if (!isHydrated) {
    return (
      <div className="grid grid-cols-4 gap-16 px-16">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-gray-200 rounded-xl shadow p-6 animate-pulse"
          >
            <div className="h-24 bg-gray-300 rounded mb-4"></div>
            <div className="h-4 bg-gray-300 rounded mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-16 px-16">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          addToCart={() => addToCart(product)}
        />
      ))}
    </div>
  );
}
