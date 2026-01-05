"use client";
import { createContext, useEffect, useState } from "react";

export const CartContext = createContext();

export function CartProvider({ children }) {
  // Estado de hidratação - controla quando o componente terminou de hidratar no cliente
  const [isHydrated, setIsHydrated] = useState(false);

  // Carrinho sempre começa vazio no servidor pra evitar erro de hydration
  const [cart, setCart] = useState([]);

  // Carrega o carrinho do localStorage DEPOIS que o componente hidratou no cliente
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("cart");
        if (saved) {
          setCart(JSON.parse(saved));
        }
      } catch (error) {
        console.error("Erro ao carregar carrinho:", error);
      }
      // Marca como hidratado
      setIsHydrated(true);
    }
  }, []);

  // Se estiver no navegador E já tiver hidratado, toda vez que o carrinho mudar, isso vai guardar o conteúdo no localStorage
  useEffect(() => {
    if (isHydrated && typeof window !== "undefined") {
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  }, [cart, isHydrated]);

  // Função que adiciona um item no carrinho ou acrescenta quantidade a um item existente (ao adicionar item no carrinho, apenas)
  function addToCart(product) {
    setCart((prev) => {
      const exists = prev.find((item) => item.id === product.id);

      if (exists) {
        // Aumenta quantity
        return prev.map((item) => {
          if (item.id === product.id) {
            return { ...item, quantity: item.quantity + 1 };
          }
          return item;
        });
      } else {
        // Adiciona novo com quantity: 1
        return [...prev, { ...product, quantity: 1 }];
      }
    });
  }

  // Função que remove o item do carrinho
  function removeFromCart(productId) {
    setCart((prev) => {
      return prev.filter((item) => item.id !== productId);
    });
  }

  // Função pra aumentar a quantidade de um item no carrinho
  function increaseQuantity(productId) {
    setCart((prev) => {
      return prev.map((item) => {
        if (item.id === productId) {
          return { ...item, quantity: item.quantity + 1 };
        }
        return item;
      });
    });
  }

  // Função pra diminuir a quantidade de um item no carrinho
  function decreaseQuantity(productId) {
    setCart((prev) => {
      return prev.map((item) => {
        if (item.id === productId) {
          return {
            ...item,
            quantity: item.quantity > 1 ? item.quantity - 1 : 1,
          };
        }
        return item;
      });
    });
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        isHydrated, // Exporta isHydrated pros componentes usarem
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
