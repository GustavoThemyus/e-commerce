import ProductList from "./components/ProductList";
import BackButton from "./components/BackButton";
import RecommendedForYou from "./components/RecommendedForYou";
import { API_URL } from "@/lib/api";

export const dynamic = "force-dynamic";

export const metadata = {
  // Informações adicionais que descrevem o conteúdo de uma página
  title: "Home | E-Commerce",
  description: "Home Page",
};

export default async function Home() {
  let products = [];
  let error = null;

  // Busca os produtos na API (servidor)
  try {
    const response = await fetch(`${API_URL}/api/product`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept: "application/json",
        "Accept-Language": "en-US,en;q=0.9",
      },
      cache: "no-store", // Força fetch novo toda vez
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
    <main className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BackButton className="mb-6" />
        <div className="">
          <h1 className="text-2xl text-black text-center mb-8">STORE</h1>
        </div>

        {/* Se houver erro, mostra mensagem */}
        {error ? (
          <div className="text-center mt-20">
            <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md mx-auto">
              <h2 className="text-2xl font-bold mb-4 text-red-800">
                Oops! Something went wrong
              </h2>
              <p className="mb-4 text-neutral-800">
                We couldn't load the products. Please try again in a moment.
              </p>
              <p className="text-sm text-neutral-500">Error: {error}</p>
            </div>
          </div>
        ) : products.length === 0 ? (
          // Se não tiver produtos mas também não tiver erro
          <div className="text-center mt-20">
            <p className="text-xl text-neutral-700">No products found.</p>
          </div>
        ) : (
          // Se tudo deu certo, mostra os produtos
          <>
            <RecommendedForYou />
            <ProductList products={products} />
          </>
        )}
      </div>
    </main>
  );
}
