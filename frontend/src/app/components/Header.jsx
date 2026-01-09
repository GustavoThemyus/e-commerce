"use client";
import Link from "next/link";
import { Github, Linkedin } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { useContext } from "react";
import { CartContext } from "@/context/CartContext";

export default function Header() {
  const { cart, isHydrated } = useContext(CartContext);

  return (
    <header className="text-black border-b">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between">
          {/* ESQUERDA */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-8">
            {/* Logo */}
            <div className="flex items-center gap-3 text-xl">
              <img
                src="/images/favicon.ico"
                width={25}
                height={25}
                className="object-contain"
                alt="E-commerce logo"
              />
              <h3 className="relative top-px">E-COMMERCE</h3>
            </div>

            {/* Menu */}
            <nav>
              <ul className="flex gap-6 text-sm md:text-base">
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

          {/* DIREITA */}
          <div className="flex items-center gap-4 md:gap-6">
            <span className="hidden md:block">CONTACTS</span>
            <span className="hidden md:block text-xl">|</span>

            <Link
              href="https://www.linkedin.com/in/gustavothemyus/"
              target="_blank"
              aria-label="LinkedIn"
            >
              <Linkedin className="hover:text-blue-700 transition-colors" />
            </Link>

            <Link
              href="https://github.com/GustavoThemyus"
              target="_blank"
              aria-label="GitHub"
            >
              <Github className="hover:text-purple-700 transition-colors" />
            </Link>

            <Link
              href="https://wa.me/5583998069429"
              target="_blank"
              aria-label="WhatsApp"
            >
              <SiWhatsapp
                size={22}
                className="hover:text-green-500 transition-colors"
              />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
