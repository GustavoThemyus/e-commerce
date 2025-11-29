"use client";
import Image from "next/image";
import { useState } from "react";
import { CircleCheck, Star } from "lucide-react";

export default function ProductCard({ product, addToCart }) {
  const [added, setAdded] = useState(false);
  return (
    <div className="bg-gray-300 rounded-xl flex flex-col justify-between h-92 p-4">
      <div className="flex justify-center items-center h-40 overflow-hidden">
        <Image
          width={400}
          height={400}
          src={product.image}
          alt={product.title}
          className="w-40 max-h-24 object-contain"
        />
      </div>

      <h3 className="text-black text-lg mt-10">{product.title}</h3>

      <div>
        <p
          className={`text-emerald-600 text-sm mb-2 text-center ml-45 transition-all duration-300 transform flex items-center justify-center gap-2 ${
            added ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          }`}
        >
          <CircleCheck className="w-4 h-4" />
          Added to cart
        </p>
      </div>

      <div>
        <p className="text-md flex">
          Rating: {product.rating.rate}
          <Star className="ml-1 h-4 w-4 text-orange-500 mt-0.5" />
        </p>
      </div>
      <div className="justify-between flex items-end">
        <p className="text-lg text-black pb-0 justify-between">
          $ {product.price.toFixed(2)}
        </p>

        <div className="flex gap-4">
          <button
            onClick={() => {
              addToCart(product);
              setAdded(true);

              setTimeout(() => setAdded(false), 2000);
            }}
            className="flex text-white bg-orange-700 border border-amber-700 rounded-3xl shadow px-14 py-2 cursor-pointer hover:brightness-95 transition-colors active:brightness-90"
          >
            Add to cart
          </button>
        </div>
      </div>
    </div>
  );
}
