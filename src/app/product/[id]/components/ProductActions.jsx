"use client";
import { CartContext } from "@/context/CartContext";
import { useContext, useState } from "react";
import { Plus, Minus, CircleCheck } from "lucide-react";

export default function ProductActions({ product }) {
  const [added, setAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useContext(CartContext);
  const totalPrice = product.price * quantity;

  function handleAddToCart() {
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    setQuantity(1);
  }

  return (
    <div className="border border-neutral-300 rounded-lg p-4 sm:p-6 w-full max-w-md mx-auto space-y-4">
      <div className="gap-1">
        <h1 className="text-2xl">${totalPrice.toFixed(2)}</h1>
        <p>
          Deliver free: <span className="font-semibold">2 - 3 days</span>
        </p>
      </div>

      <div>
        <p>Quantity:</p>
        <div className="flex">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="p-2 border text-black border-neutral-300 hover:brightness-95 active:brightness-90 rounded-3xl cursor-pointer transition-all"
            disabled={quantity === 1}
          >
            <Minus
              size={16}
              className={quantity === 1 ? "text-neutral-400" : "text-black"}
            />
          </button>

          <span className="text-lg mt-1 w-12 text-center">{quantity}</span>

          <button
            onClick={() => setQuantity(quantity + 1)}
            className="p-3 border text-black border-neutral-300 hover:brightness-95 active:brightness-90 rounded-3xl cursor-pointer transition-all"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      <div className="relative">
        {/* Mensagem - absolute */}
        <p
          className={`absolute -top-6 right-4 text-emerald-700 text-sm whitespace-nowrap transition-all duration-300 flex items-center gap-2 ${
            added
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-2 pointer-events-none"
          }`}
        >
          <CircleCheck className="w-4 h-4" />
          Added to cart
        </p>

        {/* Botão */}
        <button
          onClick={() => {
            handleAddToCart();
            setAdded(true);
            setTimeout(() => setAdded(false), 2000);
          }}
          className="w-full border bg-orange-600 text-white py-2 rounded-3xl hover:brightness-95 active:brightness-90 transition-all cursor-pointer"
        >
          Add to cart
        </button>
      </div>

      <a href="/" className="block text-center hover:underline w-fit mx-auto">
        Continue shopping
      </a>
    </div>
  );
}
