"use client";
import Image from "next/image";
import { useState } from "react";
import { CircleCheck } from "lucide-react";

export default function ProductCard({ product, addToCart }) {
  const [added, setAdded] = useState(false);
  return (
    <div className="bg-zinc-900 shadow rounded-lg flex flex-col justify-between h-92 p-4">
      <div className="flex justify-center items-center h-48 overflow-hidden">
        <Image
          width={400}
          height={400}
          src={product.image}
          alt={product.title}
          className="w-40 max-h-32 object-contain"
        />
      </div>

      <h3 className="text-white text-lg line-clamp-2 mt-10 mb-4">
        {product.title}
      </h3>

      <div>
        <p
          className={`text-emerald-400 text-sm mb-2 text-center ml-45 transition-all duration-300 transform flex items-center justify-center gap-2 ${
            added ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          }`}
        >
          <CircleCheck className="w-4 h-4" />
          Added to cart
        </p>
      </div>

      <div className="justify-between flex items-end">
        <p className="text-lg text-white pb-0 justify-between">
          $ {product.price.toFixed(2)}
        </p>

        <div className="flex gap-4">
          <button
            onClick={() => {
              addToCart(product);
              setAdded(true);

              setTimeout(() => setAdded(false), 2000);
            }}
            className="flex text-black bg-amber-300 border border-amber-400 rounded-3xl shadow px-14 py-2 cursor-pointer hover:brightness-95 active:brightness-90"
          >
            Add to cart
          </button>
        </div>
      </div>
    </div>
  );
}
