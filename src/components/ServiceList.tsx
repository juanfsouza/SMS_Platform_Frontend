'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Icon } from '@iconify/react';
import { SERVICE_NAME_MAP, SIMPLE_ICONS_MAP } from '@/data/services';
import { useState, useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
import { PurchaseModal } from './PurchaseModal';
import Image from 'next/image';
import { COUNTRY_ID_TO_ISO } from '@/data/countryMapping';

export interface ServiceListProps {
  services: string[];
  prices: Array<{ service: string; country: string; priceBrl: number; priceUsd: number }>;
  userBalance: number;
  handlePurchase: (service: string, countryId: string) => Promise<{ activationId: string; phoneNumber: string; creditsSpent: number } | null>;
  countryMap: Record<string, string>;
}

export function ServiceList({
  services,
  prices,
  userBalance,
  handlePurchase,
  countryMap,
}: ServiceListProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedCountryId, setSelectedCountryId] = useState<string | null>(null);
  const [selectedPriceBrl, setSelectedPriceBrl] = useState<number | null>(null);
  const [countrySearchTerm, setCountrySearchTerm] = useState<string>('');
  const [serviceSearchTerm, setServiceSearchTerm] = useState<string>('');

  // Filter services based on search term
  const filteredServices = useMemo(() => {
    return services.filter((service) =>
      (SERVICE_NAME_MAP[service] || service.toUpperCase())
        .toLowerCase()
        .includes(serviceSearchTerm.toLowerCase())
    );
  }, [services, serviceSearchTerm]);

  // Precompute service prices to avoid recalculating in render
  const servicePricesMap = useMemo(() => {
    const map: Record<string, Array<{ service: string; country: string; priceBrl: number; priceUsd: number }>> = {};
    services.forEach((service) => {
      const filtered = Array.from(
        new Map(
          prices
            .filter((item) => item.service === service)
            .filter((item) =>
              countryMap[item.country]?.toLowerCase().includes(countrySearchTerm.toLowerCase()) ||
              item.country.toLowerCase().includes(countrySearchTerm.toLowerCase())
            )
            .map((item) => [`${item.service}-${item.country}`, item])
        ).values()
      );
      map[service] = filtered;
    });
    return map;
  }, [services, prices, countrySearchTerm, countryMap]);

  const openPurchaseModal = (service: string, countryId: string, priceBrl: number) => {
    setSelectedService(service);
    setSelectedCountryId(countryId);
    setSelectedPriceBrl(priceBrl);
    setModalOpen(true);
  };

  const Row = ({
    index,
    style,
    data,
  }: {
    index: number;
    style: React.CSSProperties;
    data: { service: string; prices: Array<{ service: string; country: string; priceBrl: number; priceUsd: number }> };
  }) => {
    const { prices } = data;
    const item = prices[index];
    const countryName = countryMap[item.country] || `(${item.country})`;
    const countryIso2 = COUNTRY_ID_TO_ISO[item.country] || 'UN';

    return (
      <DropdownMenuItem
        key={`${item.service}-${item.country}-${index}`}
        style={style}
        className="flex justify-between items-center"
      >
        <span className="flex items-center space-x-2">
          {countryIso2 !== 'UN' ? (
            <Image
              src={`https://flagcdn.com/16x12/${countryIso2.toLowerCase()}.png`}
              alt={countryName}
              width={16}
              height={12}
              className="inline-block"
            />
          ) : (
            <span className="w-4 h-3 inline-block bg-gray-200 rounded-sm" />
          )}
          <span>
            {countryName} - {item.priceBrl.toFixed(2)} Créditos
          </span>
        </span>
        <Button
          size="sm"
          onClick={() => openPurchaseModal(item.service, item.country, item.priceBrl)}
          disabled={userBalance < item.priceBrl}
        >
          Comprar
        </Button>
      </DropdownMenuItem>
    );
  };

  return (
    <>
      <div className="mb-4">
        <Input
          type="text"
          placeholder="Pesquisar serviço..."
          value={serviceSearchTerm}
          onChange={(e) => setServiceSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filteredServices.map((service) => {
          const servicePrices = servicePricesMap[service] || [];

          return (
            <DropdownMenu key={service}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center space-x-2">
                  <Icon icon={SIMPLE_ICONS_MAP[service] || 'simple-icons:web'} className="h-5 w-5" />
                  <span>{SERVICE_NAME_MAP[service] || service.toUpperCase()}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-90 md:w-95 lg:w-100 xl:w-120 max-h-[400px] overflow-hidden">
                <div className="p-1 mr-3 font-sans">
                  <Input
                    type="text"
                    placeholder="Pesquisar país..."
                    value={countrySearchTerm}
                    onChange={(e) => setCountrySearchTerm(e.target.value)}
                    className="mb-2"
                  />
                </div>
                {servicePrices.length > 0 ? (
                  <List
                    height={350}
                    itemCount={servicePrices.length}
                    itemSize={40}
                    width="100%"
                    itemData={{ service, prices: servicePrices }}
                  >
                    {Row}
                  </List>
                ) : (
                  <DropdownMenuItem>
                    Nenhum país disponível para {SERVICE_NAME_MAP[service] || service.toUpperCase()}
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        })}
      </div>
      {selectedService && selectedCountryId && selectedPriceBrl !== null && (
        <PurchaseModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          service={selectedService}
          countryId={selectedCountryId}
          priceBrl={selectedPriceBrl}
          userBalance={userBalance}
          handlePurchase={handlePurchase}
          countryMap={countryMap}
        />
      )}
    </>
  );
}