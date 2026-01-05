"use client";

import ProductImage from "./components/ProductImage";
import ProductInfo from "./components/ProductInfo";
import ProductActions from "./components/ProductActions";

export default function ProductPageClient({ product }) {
  console.log("🔵 ProductPageClient received:", product);

  if (!product) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <main className="min-h-screen max-w-max gap-12">
      <h1 className="text-2xl text-black text-center mt-8">PRODUCT</h1>
      <div className="grid grid-cols-3">
        <div>
          <ProductImage image={product.image} title={product.title} />
        </div>
        <div>
          <ProductInfo
            title={product.title}
            description={product.description}
            rating={product.rating}
            category={product.category}
            price={product.price}
          />
        </div>
        <div>
          <ProductActions product={product} />
        </div>
      </div>
    </main>
  );
}
