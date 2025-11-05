import "./globals.css";
import { Header } from "./components/header";

export const metadata = {
  // Informações adicionais que descrevem o conteúdo de uma página
  title: "E-Commerce",
  description: "E-Commerce with purchase by adding products at Shopping Cart",
  openGraph: {
    // Responsável pela pré visualização ao compartilhar o link do projeto
    title: "E-Commerce",
    description: "E-Commerce with purchase by adding products at Shopping Cart",
  },
};


export default function RootLayout({ children }) {
  // O export default pode ser colocado já junto da função, pra ficar mais legível de que ela é a função Pai
  return (
    <html lang="en">
      <body className={`antialiased`}>
        <Header />
        {children}
      </body>
    </html>
  );
}
