interface PriceData {
  service: string;
  country: string; 
  priceBrl: number;
  priceUsd: number;
}

interface Price {
  service: string;
  country: string;
  priceBrl: number;
  priceUsd: number;
}

interface ServiceListProps {
  services: string[];
  prices: PriceData[];
  userBalance: number;
  handlePurchase: (service: string, countryId: string) => void;
}
