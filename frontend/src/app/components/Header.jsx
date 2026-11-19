"use client";
import Link from "next/link";
import { Github, Linkedin } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { useContext } from "react";
import { usePathname } from "next/navigation";
import { CartContext } from "@/context/CartContext";
import { AuthContext } from "@/context/AuthContext";

// STORE também fica ativo nas páginas de produto, que fazem parte da loja
function isActive(pathname, href) {
  if (href === "/") return pathname === "/" || pathname.startsWith("/product");
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavItem({ href, children }) {
  const active = isActive(usePathname(), href);

  return (
    <li
      className={`hover:underline ${
        active ? "underline underline-offset-4 font-semibold" : ""
      }`}
    >
      <Link href={href} aria-current={active ? "page" : undefined}>
        {children}
      </Link>
    </li>
  );
}

export default function Header() {
  const { cart, isHydrated } = useContext(CartContext);
  const { user, isHydrated: authReady, logout } = useContext(AuthContext);

  return (
    <header className="text-black border-b">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between">
          {/* ESQUERDA */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-8">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 text-xl">
              <img
                src="/images/favicon.ico"
                width={25}
                height={25}
                className="object-contain"
                alt=""
              />
              <span className="relative top-px">E-COMMERCE</span>
            </Link>

            {/* Menu */}
            <nav>
              <ul className="flex gap-6 text-sm md:text-base">
                <NavItem href="/">STORE</NavItem>
                <NavItem href="/cart">
                  CART {isHydrated && cart.length > 0 && `(${cart.length})`}
                </NavItem>
                <NavItem href="/about">ABOUT</NavItem>
                {authReady &&
                  (user ? (
                    <li className="hover:underline">
                      <button
                        onClick={logout}
                        className="hover:cursor-pointer"
                        title={user.email}
                      >
                        LOGOUT
                      </button>
                    </li>
                  ) : (
                    <NavItem href="/login">LOGIN</NavItem>
                  ))}
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
