import { useState, useEffect } from "react";

const STORE_KEY = "selected_store_id";

export function useStore() {
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);

  // Carregar loja selecionada do localStorage ao montar
  useEffect(() => {
    const saved = localStorage.getItem(STORE_KEY);
    if (saved) {
      setSelectedStoreId(parseInt(saved, 10));
    }
  }, []);

  // Salvar loja selecionada no localStorage
  const selectStore = (storeId: number) => {
    setSelectedStoreId(storeId);
    localStorage.setItem(STORE_KEY, storeId.toString());
  };

  return {
    selectedStoreId,
    selectStore,
  };
}
