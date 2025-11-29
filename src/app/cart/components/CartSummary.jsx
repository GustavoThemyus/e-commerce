// Total, botão finalizar, botão continuar
import { useState } from "react";
import Link from "next/link";
import { CheckCircle } from "lucide-react";

export function CartSummary({ products }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  // Calcula o preço total
  const total = products.reduce((soma, produto) => {
    return soma + produto.price * produto.quantity;
  }, 0);

  // Calcula o total de produtos
  const totalItems = products.reduce((soma, produto) => {
    return soma + produto.quantity;
  }, 0);

  // Função de finalizar a compra
  async function handleCheckout() {
    setIsProcessing(true);

    try {
      // Prepara os dados
      const orderData = {
        items: products.map((product) => ({
          productId: product.id,
          title: product.title,
          quantity: product.quantity,
          price: product.price,
          subtotal: product.price * product.quantity,
        })),
        total: total,
        totalItems: totalItems,
        date: new Date().toISOString(),
      };

      console.log("Order data:", orderData);

      // Simula envio ao backend
      await new Promise((resolve) => setTimeout(resolve, 1500));
      // Adicionar depois a chamada real:
      // const response = await fetch('api/tararam', {
      //  method: 'POST',
      //  body: JSON.stringify(orderData)
      //  })

      // Sucesso
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Error at finalization:", error);
      setErrorMessage("Error finalizing purchase..");
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="bg-zinc-950 border-2 border-zinc-800 w-[700px] rounded-lg p-6 sticky top-8">
      <h2 className="text-white text-xl mb-6">Order resume</h2>

      <div className="space-y-3 mb-6 flex flex-col">
        {/* subtotal */}
        <div className="text-white flex flex-col">
          <span>Subtotal: {totalItems} item(s)</span>
          <span>Total: ${total.toFixed(2)}</span>
        </div>

        <div className="flex gap-1">
          <span className="text-white">Fees:</span>
          <span className="text-emerald-400">Free</span>
        </div>

        {/* Total */}
        <div className="border-t border-zinc-700 pt-3 mt-3">
          <div className="flex justify-between text-white text-xl">
            <span>Total:</span>
            <span className="text-amber-200">${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Botões */}
      <div>
        <button
          onClick={handleCheckout}
          disabled={isProcessing}
          className={`w-full bg-emerald-500 border border-emerald-600 text-black py-3 px-2 rounded-3xl transition ${
            isProcessing
              ? "opacity-50 cursor-not-allowed"
              : "hover:brightness-95 hover:cursor-pointer active:brightness-90"
          }`}
        >
          {isProcessing ? "Processing..." : "Purchase"}
        </button>

        <Link
          href="/"
          className="text-white pt-5 hover:underline block w-fit mx-auto"
        >
          Continue shopping
        </Link>

        <div
          className={`flex items-center justify-center gap-2 text-emerald-400 text-sm transition-all duration-300 transform ${
            showSuccess
              ? "opacity-100 translate-y-0 h-auto mt-6"
              : "opacity-0 -translate-y-2 h-0 overflow-hidden"
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          <span>Purchase successful!</span>
        </div>
      </div>
    </div>
  );
}
