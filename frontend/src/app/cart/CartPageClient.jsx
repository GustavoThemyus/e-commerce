"use client";
import { useContext, useEffect, useState } from "react";
import { CartContext } from "@/context/CartContext";
import CartList from "./components/CartList";
import EmptyCart from "./components/EmptyCart";
import { CartSummary } from "./components/CartSummary";
import BackButton from "../components/BackButton";

export default function Cart() {
  const { cart } = useContext(CartContext);
  const [isClient, setIsClient] = useState(false);

  // Só renderiza depois que está no cliente
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <main className="text-black text-center mt-20">Loading...</main>;
  }

  if (!cart || cart.length === 0) {
    return <EmptyCart />;
  }

  return (
    <main className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <BackButton />
        <h1 className="text-2xl text-black text-center mb-8">
          MY CART ({cart.length})
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-start">
          <CartList products={cart} />
          <CartSummary products={cart} />
        </div>
      </div>
    </main>
  );
}
