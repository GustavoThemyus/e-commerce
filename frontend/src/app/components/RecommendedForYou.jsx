"use client";
import { useContext, useEffect, useState } from "react";
import RecommendationList from "./RecommendationList";
import { AuthContext } from "@/context/AuthContext";
import { API_URL } from "@/lib/api";

// Só aparece para quem está logado: as recomendações vêm do histórico de compras da conta
export default function RecommendedForYou() {
  const { token } = useContext(AuthContext);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (!token) {
      setProducts([]);
      return;
    }

    let cancelled = false;

    fetch(`${API_URL}/api/recommendations`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => (response.ok ? response.json() : []))
      .then((data) => {
        if (!cancelled) setProducts(data);
      })
      .catch(() => {
        // Recomendação é um extra: se falhar, a loja continua funcionando sem ela
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  if (!token) return null;

  return (
    <div className="mb-12">
      <RecommendationList
        products={products}
        titles={{
          "also-bought": "Recommended for you",
          "top-rated": "Top rated",
        }}
      />
    </div>
  );
}
