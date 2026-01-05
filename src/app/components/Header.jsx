"use client";
import Link from "next/link";
import { Github, Linkedin } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { useContext } from "react";
import { CartContext } from "@/context/CartContext";

export default function Header() {
  const { cart, isHydrated } = useContext(CartContext);

  return (
    <header className="flex px-2 pt-4 pb-4 bg-gray-50 text-black border-b">
      <div className="flex items-center justify-between w-full mx-auto max-w-7xl px-10">
        {/* LADO ESQUERDO: Logo + Menu */}
        <div className="flex items-center gap-8">
          {/* Logo */}
          <div className="flex text-xl gap-3">
            <img
              src="/images/favicon.ico"
              width={25}
              height={25}
              className="object-contain"
              alt="E-commerce logo"
            />
            <h3 className="text-xl relative top-px">E-COMMERCE</h3>
          </div>

          {/* Menu de Navegação */}
          <nav>
            <ul className="flex items-center gap-8">
              <li className="hover:underline">
                <Link href="/">STORE</Link>
              </li>
              <li className="hover:underline">
                <Link href="/cart">
                  CART {isHydrated && cart.length > 0 && `(${cart.length})`}
                </Link>
              </li>
              <li className="hover:underline">
                <Link href="/about">ABOUT</Link>
              </li>
            </ul>
          </nav>
        </div>

        {/* LADO DIREITO: Contatos */}
        <div className="flex items-center gap-6">
          <span className="flex items-end">CONTACTS</span>
          <span className="text-xl">|</span>
          <Link
            href="https://www.linkedin.com/in/gustavothemyus/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Visit my LinkedIn"
          >
            <Linkedin className="hover:text-blue-700 transition-colors" />
          </Link>
          <Link
            href="https://github.com/GustavoThemyus"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Visit my GitHub"
          >
            <Github className="hover:text-purple-700 transition-colors" />
          </Link>
          <Link
            href="https://wa.me/5583998069429"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Visit my WhatsApp"
          >
            <SiWhatsapp
              size={22}
              className="hover:text-green-500 transition-colors"
            />
          </Link>
        </div>
      </div>
    </header>
  );
}
