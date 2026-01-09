"use client";
import Image from "next/image";
import { useContext } from "react";
import { CartContext } from "@/context/CartContext";
import { Minus, Plus } from "lucide-react";

export default function CartItem({ product }) {
  const { removeFromCart, increaseQuantity, decreaseQuantity } =
    useContext(CartContext);

  return (
    <div className="flex flex-col justify-between border border-neutral-300 rounded-xl w-full sm:max-w-md min-h-20 px-4 sm:px-6 mx-auto">
      <div className="flex justify-center items-center h-28 sm:h-32 mt-4 sm:mt-6 overflow-hidden">
        <Image
          width={200}
          height={200}
          src={product.image}
          alt={product.title}
          className="w-20 h-20 max-h-32 object-contain"
        />
      </div>
      <h3 className="text-black text-md line-clamp-2 mt-10 mb-6">
        {product.title}
      </h3>
      <div className="flex justify-between mb-4">
        <p className="text-black text-lg mt-2">
          ${(product.price * product.quantity).toFixed(2)}
        </p>
        <div className="flex gap-4 text-white">
          <button
            onClick={() => removeFromCart(product.id)}
            className="px-10 py-1 text-red-700 border border-red-700 rounded-3xl hover:bg-red-700 hover:text-white active:brightness-90 transition-all cursor-pointer"
          >
            Exclude
          </button>
          <button
            onClick={() => decreaseQuantity(product.id)}
            className="p-2 text-black border border-neutral-300 hover:brightness-90 active:brightness-75 rounded-3xl cursor-pointer transition"
            disabled={product.quantity === 1}
          >
            <Minus
              size={18}
              className={
                product.quantity === 1 ? "text-neutral-400" : "text-black"
              }
            />
          </button>
          <p className="text-black mt-2">{product.quantity}</p>
          <button
            onClick={() => increaseQuantity(product.id)}
            className="p-3 text-black border border-neutral-300 hover:brightness-90 active:brightness-75 rounded-3xl cursor-pointer transition"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
