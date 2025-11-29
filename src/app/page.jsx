import { ChevronLeft } from "lucide-react";
import ProductList from "./components/ProductList";

export const metadata = {
  // Informações adicionais que descrevem o conteúdo de uma página
  title: "E-Commerce | Home",
  description: "Home Page",
  openGraph: {
    // Responsável pela pré visualização ao compartilhar o link do projeto
    title: "E-Commerce",
    description: "E-Commerce with purchase by adding products at Shopping Cart",
  },
};

// Home é server component
export default async function Home() {
  let products = [];
  let error = null;

  // Busca os produtos na API (servidor)
  try {
    const response = await fetch("https://fakestoreapi.com/products", {
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
      cache: "no-store", // ← Força fetch novo toda vez
    });
    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
    products = await response.json();
  } catch (err) {
    console.error(
      "We were unable do load the products. Please, try again later.",
      err
    );
    error = err.message;
  }

  return (
    <main className="p-8 bg-zinc-950">
      <div className="mt-8 mb-10">
        <button className="text-white absolute left-22 flex gap-1 cursor-pointer">
          <ChevronLeft />
          Previous
        </button>
        <h1 className="text-3xl text-white text-center">STORE</h1>
      </div>

      {/* Se houver erro, mostra mensagem */}
      {error ? (
        <div className="text-center text-white mt-20">
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-8 max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-4">
              Ops! Something goes wrong
            </h2>
            <p className="mb-4">Couldn't load products..</p>
            <p className="text-sm text-gray-400 mb-6">Erro: {error}</p>
          </div>
        </div>
      ) : products.length === 0 ? (
        // Se não tiver produtos mas também não tiver erro
        <div className="text-center text-white mt-20">
          <p className="text-xl">No products found.</p>
        </div>
      ) : (
        // Se tudo deu certo, mostra os produtos
        <ProductList products={products} />
      )}
    </main>
  );
}
