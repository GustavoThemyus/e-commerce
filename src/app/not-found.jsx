import Link from "next/link";

export const metadata = {
  // Informações adicionais que descrevem o conteúdo de uma página
  title: "E-Commerce | Page not found",
  description: "404 error",
  openGraph: {
    // Responsável pela pré visualização ao compartilhar o link do projeto
    title: "E-Commerce",
    description: "E-Commerce with purchase by adding products at Shopping Cart",
  },
};

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center px-4">
        <h2 className="text-3xl mb-4">404 page not found</h2>
        <p className="text-neutral-950 mb-6">
          This page that the user tried to access doesn't exist
        </p>
        <a
          href="/"
          className="rounded-3xl mt-4 font-bold text-white bg-orange-600 hover:brightness-95 py-3 px-4"
        >
          ← Back to Store
        </a>
      </div>
    </main>
  );
}
