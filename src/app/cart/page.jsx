"use client";
import { useContext, useEffect, useState } from "react";
import { CartContext } from "@/context/CartContext";
import CartList from "./components/CartList";
import EmptyCart from "./components/EmptyCart";
import { CartSummary } from "./components/CartSummary";

export default function Cart() {
  const { cart } = useContext(CartContext);
  const [isClient, setIsClient] = useState(false);

  // Só renderiza depois que está no cliente
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <main className="bg-zinc-950 text-white text-center mt-20">
        Loading...
      </main>
    );
  }

  if (!cart || cart.length === 0) {
    return <EmptyCart />;
  }

  return (
    <main className="p-8 bg-zinc-950 min-h-screen">
      <h1 className="text-3xl text-white text-center mb-8">
        MY CART ({cart.length})
      </h1>

      <div className="max-w-max mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <CartList products={cart} />
        </div>
        <div>
          <CartSummary products={cart} />
        </div>
      </div>
    </main>
  );
}
