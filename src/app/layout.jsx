import "./globals.css";
import Header from "./components/Header";
import { CartProvider } from "@/context/CartContext";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <CartProvider>
          <Header />

          <div className="w-full px-4 sm:px-6 lg:px-8">{children}</div>
        </CartProvider>
      </body>
    </html>
  );
}
