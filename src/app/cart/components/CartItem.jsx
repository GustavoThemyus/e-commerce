"use client";
import Image from "next/image";
import { useContext } from "react";
import { CartContext } from "@/context/CartContext";
import { Minus, Plus } from "lucide-react";

export default function CartItem({ product }) {
  const { removeFromCart, increaseQuantity, decreaseQuantity } =
    useContext(CartContext);

  return (
    <div className="flex flex-col justify-between bg-gray-200 shadow rounded-xl w-[600px] min-h-20 px-6">
      <div className="flex justify-center items-center h-20 mt-6 overflow-hidden">
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
            className="px-10 py-1 text-red-700 bg-gray-200 border border-red-700 rounded-3xl hover:brightness-95 transition-colors hover:cursor-pointer active:brightness-90"
          >
            Exclude
          </button>
          <button
            onClick={() => decreaseQuantity(product.id)}
            className="p-2 border text-black border-neutral-300 bg-gray-200 hover:brightness-95 active:brightness-90 rounded-3xl transition"
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
            className="p-3 border text-black border-neutral-300 bg-gray-200 hover:brightness-95 active:brightness-90 rounded-3xl transition"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
