import "./globals.css";
import Header from "./components/Header";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          <CartProvider>
            <Header />

            <div className="w-full px-4 sm:px-6 lg:px-8">{children}</div>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
