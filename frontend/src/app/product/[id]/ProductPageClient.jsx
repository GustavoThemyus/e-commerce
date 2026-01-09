"use client";

import ProductImage from "./components/ProductImage";
import ProductInfo from "./components/ProductInfo";
import ProductActions from "./components/ProductActions";
import BackButton from "@/app/components/BackButton";

export default function ProductPageClient({ product }) {
  if (!product) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <main className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <BackButton />

        <h1 className="text-2xl text-black text-center">PRODUCT</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <ProductImage image={product.image} title={product.title} />
          <ProductInfo
            title={product.title}
            description={product.description}
            rating={product.rating}
            category={product.category}
            price={product.price}
          />
          <ProductActions product={product} />
        </div>
      </div>
    </main>
  );
}
