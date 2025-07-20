import { create } from 'zustand';

// Definição do tipo PriceData
interface PriceData {
  service: string;
  country: string;
  priceBrl: number;
  priceUsd: number;
}

interface PriceState {
  popularPrices: PriceData[];
  setPopularPrices: (prices: PriceData[]) => void;
  isLoadingPrices: boolean;
  setIsLoadingPrices: (loading: boolean) => void;
}

export const usePriceStore = create<PriceState>((set) => ({
  popularPrices: [],
  setPopularPrices: (prices) => set({ popularPrices: prices }),
  isLoadingPrices: false,
  setIsLoadingPrices: (loading) => set({ isLoadingPrices: loading }),
}));