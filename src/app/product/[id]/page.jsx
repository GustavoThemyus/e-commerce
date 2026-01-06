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
      headers: {
        Accept: "application/json",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
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
  const resolvedParams = await params;
  const { id } = resolvedParams;

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
  const resolvedParams = await params;
  const { id } = resolvedParams;

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
