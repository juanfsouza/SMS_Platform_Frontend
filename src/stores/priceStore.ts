import { create } from 'zustand';

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