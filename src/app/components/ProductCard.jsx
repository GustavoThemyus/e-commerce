"use client";
import Image from "next/image";
import { useState } from "react";
import { CircleCheck, Star } from "lucide-react";
import Link from "next/link";

export default function ProductCard({ product, addToCart }) {
  const [added, setAdded] = useState(false);

  return (
    <div className="rounded-xl border border-neutral-200 flex flex-col justify-between p-4 sm:p-6 h-full">
      <div className="flex justify-center items-center h-30 overflow-hidden">
        <Image
          width={400}
          height={400}
          src={product.image}
          alt={product.title}
          className="w-32 sm:w-40 max-h-28 object-contain"
        />
      </div>

      <h3 className="text-black text-lg mt-6">{product.title}</h3>

      <div className="flex gap-2 mt-2">
        <p className="text-md flex">
          {product.rating.rate}
          <Star className="ml-1 h-4 w-4 text-orange-500 mt-0.5" />
        </p>
        <p>({product.rating.count} reviews)</p>
      </div>

      <div className="mt-2">
        <p className="text-lg text-black mb-4">${product.price.toFixed(2)}</p>

        <div className="flex flex-col gap-3 relative">
          {/* MENSAGEM - position absolute */}
          <p
            className={`absolute -top-8 right-7 text-emerald-700 text-sm whitespace-nowrap transition-all duration-300 flex items-center gap-2 ${
              added
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-2 pointer-events-none"
            }`}
          >
            <CircleCheck className="w-4 h-4" />
            Added to cart
          </p>

          {/* BOTÃO ADD TO CART */}
          <button
            onClick={() => {
              addToCart(product);
              setAdded(true);
              setTimeout(() => setAdded(false), 2000);
            }}
            className="w-full flex justify-center text-white border bg-orange-600 rounded-3xl px-6 py-2 hover:brightness-95 active:brightness-90 transition-all cursor-pointer"
          >
            Add to cart
          </button>

          {/* BOTÃO VIEW DETAILS */}
          <Link
            href={`/product/${product.id}`}
            className="w-full flex justify-center text-zinc-900 border border-zinc-900 rounded-3xl px-6 py-2 hover:bg-zinc-800 hover:text-white active:brightness-90 transition-all cursor-pointer"
          >
            View details
          </Link>
        </div>
      </div>
    </div>
  );
}
