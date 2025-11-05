// 'use client' aqui, se eu quiser que esse componente seja renderizado no lado do cliente

export const metadata = {
  // Informações adicionais que descrevem o conteúdo de uma página
  title: "E-Commerce | Shopping Cart",
  description: "Add and payment products",
  openGraph: {
    // Responsável pela pré visualização ao compartilhar o link do projeto
    title: "E-Commerce",
    description: "E-Commerce with purchase by adding products at Shopping Cart",
  },
};

export default async function ShoppingCart() {
  const response = await fetch("https://dummyjason.com/posts");
  return (
    <div>
      <h1>Página do Carrinho de Compras</h1>
    </div>
  );
}
