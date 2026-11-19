import ProductPageClient from "./ProductPageClient";
import { notFound } from "next/navigation";
import { API_URL } from "@/lib/api";

async function fetchProduct(id) {
  const numericId = Number(id);

  if (!Number.isInteger(numericId) || numericId <= 0) {
    throw new Error("NOT_FOUND");
  }

  const response = await fetch(
    `${API_URL}/api/product/${numericId}`,
    {
      headers: {
        Accept: "application/json",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      cache: "no-store",
    }
  );

  // O backend responde 404 com {"error": "..."}: sem esta checagem esse JSON seria tratado como
  // um produto e a página quebraria com 500 em vez de mostrar "Product not found"
  if (response.status === 404) {
    throw new Error("NOT_FOUND");
  }

  if (!response.ok) {
    throw new Error(`Product request failed with HTTP ${response.status}`);
  }

  const text = await response.text();

  if (!text) {
    throw new Error("NOT_FOUND");
  }

  return JSON.parse(text);
}

// Recomendação é um extra: se a API falhar, a página do produto abre sem ela
async function fetchRecommendations(id) {
  try {
    const response = await fetch(`${API_URL}/api/product/${id}/recommendations`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    return response.ok ? await response.json() : [];
  } catch {
    return [];
  }
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
    const recommendations = await fetchRecommendations(product.id);
    return (
      <ProductPageClient product={product} recommendations={recommendations} />
    );
  } catch (err) {
    if (err.message === "NOT_FOUND") {
      notFound();
    }
    throw err;
  }
}
