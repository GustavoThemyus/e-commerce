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
    <div className="flex flex-col items-center justify-center">
      <h1 className="text-center font-bold mt-9 text-3xl">
        404 page not found
      </h1>
      <p className="text-xl">
        This page that the user tried to access doesn't exist
      </p>
      <Link href="/" className="mt-4 font-bold text-white bg-zinc-900 p-2">
        Back to Home
      </Link>
    </div>
  );
}
