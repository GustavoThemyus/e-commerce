// Total, botão finalizar, botão continuar
import { useState } from "react";
import Link from "next/link";
import { CheckCircle, Ban, CircleX } from "lucide-react";

export function CartSummary({ products }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Calcula o preço total
  const total = products.reduce((soma, produto) => {
    return soma + produto.price * produto.quantity;
  }, 0);

  // Calcula o total de produtos
  const totalItems = products.reduce((soma, produto) => {
    return soma + produto.quantity;
  }, 0);

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // Função de finalizar a compra
  async function handleCheckout() {
    setEmailError("");
    setErrorMessage("");
    setShowSuccess(false);

    if (!email) {
      setEmailError("Email is required.");
      return;
    }

    if (!isValidEmail(email)) {
      setEmailError("Please, enter a valid email address.");
      return;
    }

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
        customer_email: email,
      };

      const response = await fetch("http://localhost:3333/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Checkout failed");
      }

      const data = await response.json();
      if (data.emailSent) {
        setSuccessMessage("Purchase successfull!");
      } else {
        setSuccessMessage(
          "Purchase completed, but email could not be sent (testing mode).",
        );
      }

      // Sucesso
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    } catch (error) {
      console.error("Error at finalization:", error);
      setErrorMessage("Error finalizing purchase.");
    } finally {
      setIsProcessing(false);
      setEmail("");
    }
  }

  return (
    <div className="border border-neutral-400 w-full sm:max-w-md rounded-lg p-4 sm:p-6 mx-auto lg:sticky lg:top-8">
      <h2 className="text-black font-semibold text-2xl mb-6">Order Resume:</h2>

      <div className="space-y-3 mb-6 flex flex-col">
        {/* subtotal */}
        <div className="text-black flex flex-col">
          <span>Quantity: {totalItems} item(s)</span>
          <span>Subotal: ${total.toFixed(2)}</span>
        </div>

        <div className="flex gap-1">
          <span className="text-black">Fees:</span>
          <span className="text-emerald-600">Free</span>
        </div>

        {/* Total */}
        <div className="border-t border-black pt-3 mt-3">
          <div className="flex justify-between text-black text-xl">
            <span>Total:</span>
            <span className="text-orange-400">${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">
          Fill in one with a (real) valid email address
        </label>

        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setEmailError("");
          }}
          placeholder="your@email.com"
          className={`border border-neutral-300 outline-0 rounded-lg px-3 py-2 transition ${
            emailError
              ? "border-red-300 focus:ring-1 focus:ring-red-400"
              : "border-neutral-100 focus:ring-1 focus:ring-neutral-200"
          }`}
          required
        />
      </div>

      {/* Botões */}
      <div>
        <button
          onClick={handleCheckout}
          disabled={isProcessing}
          className={`w-full mt-4 bg-emerald-500 text-white py-3 px-2 rounded-3xl transition ${
            isProcessing
              ? "opacity-50 cursor-not-allowed"
              : "hover:brightness-95 hover:cursor-pointer active:brightness-90"
          }`}
        >
          {isProcessing ? "Processing..." : "Purchase"}
        </button>

        <Link
          href="/"
          className="text-black pt-5 hover:underline block w-fit mx-auto"
        >
          Continue shopping
        </Link>

        <div
          className={`flex items-center justify-center gap-2 text-sm transition-all duration-500 transform ${
            showSuccess
              ? "opacity-100 translate-y-0 h-auto mt-6"
              : "opacity-0 -translate-y-2 h-0 overflow-hidden"
          }`}
        >
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span className="text-emerald-600">{successMessage}</span>
        </div>
      </div>
    </div>
  );
}
