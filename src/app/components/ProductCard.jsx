"use client";
import Image from "next/image";
import { useState } from "react";
import { CircleCheck, Star } from "lucide-react";

export default function ProductCard({ product, addToCart }) {
  const [added, setAdded] = useState(false);

  return (
    <div className="bg-gray-200 rounded-xl shadow flex flex-col justify-between h-92 p-6">
      <div className="flex justify-center items-center h-40 overflow-hidden">
        <Image
          width={400}
          height={400}
          src={product.image}
          alt={product.title}
          className="w-40 max-h-24 object-contain"
        />
      </div>

      <h3 className="text-black text-lg mt-8">{product.title}</h3>

      <div className="flex gap-2 mt-2">
        <p className="text-md flex">
          {product.rating.rate}
          <Star className="ml-1 h-4 w-4 text-orange-500 mt-0.5" />
        </p>
        <p>({product.rating.count} reviews)</p>
      </div>

      <div className="justify-between flex items-end mt-6">
        <p className="text-lg text-black pb-0 justify-between">
          $ {product.price.toFixed(2)}
        </p>

        <div className="flex gap-4 relative">
          {" "}
          {/* ← ADICIONA relative aqui */}
          {/* MENSAGEM - position absolute */}
          <p
            className={`absolute -top-8 left-1/2 -translate-x-1/2 text-emerald-700 text-sm whitespace-nowrap transition-all duration-300 flex items-center gap-2 ${
              added
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-2 pointer-events-none"
            }`}
          >
            <CircleCheck className="w-4 h-4" />
            Added to cart
          </p>
          {/* BOTÃO */}
          <button
            onClick={() => {
              addToCart(product);
              setAdded(true);
              setTimeout(() => setAdded(false), 2000);
            }}
            className="flex text-white bg-orange-600 border border-amber-600 rounded-3xl shadow px-14 py-2 cursor-pointer hover:brightness-95 transition-colors active:brightness-90"
          >
            Add to cart
          </button>
        </div>
      </div>
    </div>
  );
}
