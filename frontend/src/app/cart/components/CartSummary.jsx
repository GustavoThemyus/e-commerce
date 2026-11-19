// Total, botão finalizar, botão continuar
import { useContext, useState } from "react";
import Link from "next/link";
import { CircleX, Info } from "lucide-react";
import { API_URL } from "@/lib/api";
import { AuthContext } from "@/context/AuthContext";

export function CartSummary({ products, onPurchased }) {
  const { user, token, logout } = useContext(AuthContext);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

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

    // Logado: o backend usa o e-mail da conta
    if (!user && !email) {
      setEmailError("Email is required.");
      return;
    }

    if (!user && !isValidEmail(email)) {
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
        customer_email: user ? user.email : email,
      };

      const response = await fetch(`${API_URL}/api/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(orderData),
      });

      if (response.status === 401 && token) {
        // Sessão expirou: sai da conta e deixa comprar como convidado
        logout();
        throw new Error("Session expired");
      }

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Checkout failed");
      }

      const data = await response.json();

      // Sucesso: quem decide o que fazer com o carrinho é a página
      onPurchased(
        data.emailSent
          ? "Purchase successful! A confirmation email is on its way."
          : "Purchase completed, but the confirmation email could not be sent (testing mode).",
      );
    } catch (error) {
      console.error("Error at finalization:", error);
      // Mensagens do servidor (limite de compras, produto inválido...) servem ao usuário;
      // falha de rede não, então troca por um texto claro
      setErrorMessage(
        error.message === "Failed to fetch"
          ? "Could not reach the server. Please try again."
          : error.message || "Error finalizing purchase.",
      );
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="border border-neutral-200 w-full sm:max-w-md rounded-xl p-4 sm:p-6 mx-auto lg:sticky lg:top-8">
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
        <div className="border-t border-neutral-200 pt-3 mt-3">
          <div className="flex justify-between text-black text-xl">
            <span>Total:</span>
            <span className="text-orange-400">${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {user ? (
        <p className="text-sm">
          Purchasing as <strong>{user.email}</strong>
        </p>
      ) : (
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
      )}

      {/* Aviso de demonstração: vale para convidado e para logado */}
      <p className="flex items-start gap-2 mt-4 text-xs text-neutral-500">
        <Info className="w-4 h-4 shrink-0" aria-hidden="true" />
        <span>
          Demo store: no real payment is charged. Confirmation emails are only
          delivered to the project owner.
        </span>
      </p>

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

        {errorMessage && (
          <p
            role="alert"
            className="flex items-center justify-center gap-2 text-sm text-red-600 mt-6"
          >
            <CircleX className="w-4 h-4" />
            {errorMessage}
          </p>
        )}
      </div>
    </div>
  );
}
