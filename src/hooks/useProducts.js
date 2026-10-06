import { useEffect, useState } from "react";
import { fetchProducts, getCachedProducts, isPublic, subscribeProducts } from "../services/products";

/**
 * Lista de imóveis compartilhada por todas as telas.
 * `onlyPublic` (padrão) devolve só Ativo/Reservado.
 */
export function useProducts({ onlyPublic = true } = {}) {
  const [all, setAll] = useState(getCachedProducts);
  const [loading, setLoading] = useState(!getCachedProducts());
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    const unsubscribe = subscribeProducts((list) => alive && setAll(list));
    fetchProducts()
      .then((list) => alive && setAll(list))
      .catch((e) => {
        console.error("Erro ao carregar imóveis:", e);
        if (alive) setError(e);
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
      unsubscribe();
    };
  }, []);

  const list = all || [];
  return {
    products: onlyPublic ? list.filter(isPublic) : list,
    loading,
    error,
    reload: () => fetchProducts({ force: true }),
  };
}
