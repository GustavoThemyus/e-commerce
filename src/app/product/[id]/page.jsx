import ProductPageClient from "./ProductPageClient";
import { notFound } from "next/navigation";

async function fetchProduct(id) {
  const numericId = Number(id);

  if (!Number.isInteger(numericId) || numericId <= 0) {
    throw new Error("NOT_FOUND");
  }

  const response = await fetch(
    `https://fakestoreapi.com/products/${numericId}`,
    {
      headers: { Accept: "application/json" },
      cache: "no-store",
    }
  );

  const text = await response.text();

  if (!text) {
    throw new Error("NOT_FOUND");
  }

  return JSON.parse(text);
}

export async function generateMetadata({ params }) {
  const { id } = await params;

  try {
    const product = await fetchProduct(id);

    return {
      title: `${product.title} | E-Commerce`,
      description: product.description,
    };
  } catch {
    return {
      title: "Product | E-Commerce",
      description: "Product details",
    };
  }
}

export default async function ProductPage({ params }) {
  const { id } = await params;

  try {
    const product = await fetchProduct(id);
    return <ProductPageClient product={product} />;
  } catch (err) {
    if (err.message === "NOT_FOUND") {
      notFound();
    }
    throw err;
  }
}
