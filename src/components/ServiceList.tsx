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
import { motion, AnimatePresence } from 'framer-motion';
import { FixedSizeList as List } from 'react-window';
import { PurchaseModal } from './PurchaseModal';
import Image from 'next/image';
import { COUNTRY_ID_TO_ISO } from '@/data/countryMapping';
import { Search, MapPin, ShoppingCart, Zap, ChevronDown } from 'lucide-react';

export interface ServiceListProps {
  services: string[];
  prices: Array<{ service: string; country: string; priceBrl: number; priceUsd: number }>;
  userBalance: number;
  handlePurchase: (service: string, countryId: string) => Promise<{ activationId: string; phoneNumber: string; creditsSpent: number } | null>;
  countryMap: Record<string, string>;
}

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const scaleOnHover = {
  whileHover: { 
    scale: 1.02, 
    y: -2,
    transition: { duration: 0.2 } 
  },
  whileTap: { scale: 0.98 }
};

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
      <motion.div
        style={style}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2, delay: index * 0.02 }}
      >
        <DropdownMenuItem
          key={`${item.service}-${item.country}-${index}`}
          className="flex justify-between items-center p-3 my-1 rounded-lg bg-slate-700/20 hover:bg-slate-600/30 border border-slate-600/20 hover:border-slate-500/40 transition-all duration-200"
        >
          <span className="flex items-center space-x-3">
            <div className="relative">
              {countryIso2 !== 'UN' ? (
                <Image
                  src={`https://flagcdn.com/24x18/${countryIso2.toLowerCase()}.png`}
                  alt={countryName}
                  width={24}
                  height={18}
                  className="rounded-sm shadow-sm"
                />
              ) : (
                <div className="w-6 h-4 bg-gradient-to-br from-slate-600 to-slate-700 rounded-sm" />
              )}
            </div>
            <div>
              <span className="text-white font-medium text-sm">{countryName}</span>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                  R$ {item.priceBrl.toFixed(2)}
                </span>
              </div>
            </div>
          </span>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              size="sm"
              onClick={() => openPurchaseModal(item.service, item.country, item.priceBrl)}
              disabled={userBalance < item.priceBrl}
              className={`rounded-lg text-xs px-3 py-1.5 ${
                userBalance < item.priceBrl 
                  ? 'bg-slate-600/50 text-slate-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-sm'
              }`}
            >
              <ShoppingCart className="w-3 h-3 mr-1" />
              {userBalance < item.priceBrl ? 'Sem saldo' : 'Comprar'}
            </Button>
          </motion.div>
        </DropdownMenuItem>
      </motion.div>
    );
  };

  return (
    <>
      {/* Search Bar */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Pesquisar serviço..."
            value={serviceSearchTerm}
            onChange={(e) => setServiceSearchTerm(e.target.value)}
            className="pl-10 h-11 bg-slate-700/30 border-slate-600/50 text-white placeholder:text-slate-400 rounded-xl focus:bg-slate-700/50 focus:border-blue-500/50 transition-all duration-200"
          />
        </div>
      </motion.div>

      {/* Services Grid */}
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        <AnimatePresence>
          {filteredServices.map((service) => {
            const servicePrices = servicePricesMap[service] || [];
            const minPrice = servicePrices.length > 0 
              ? Math.min(...servicePrices.map(p => p.priceBrl))
              : 0;
            const availableCountries = servicePrices.length;

            return (
              <motion.div
                key={service}
                variants={fadeInUp}
                {...scaleOnHover}
                layout
              >
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full h-auto p-0 border-0 bg-gradient-to-br from-slate-800/50 to-slate-700/50 hover:from-slate-700/60 hover:to-slate-600/60 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden group"
                    >
                      <div className="w-full p-6 text-left">
                        <div className="flex items-center gap-4 mb-4">
                          <motion.div 
                            whileHover={{ rotate: 5, scale: 1.1 }}
                            className="relative p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 shadow-sm"
                          >
                            <Icon 
                              icon={SIMPLE_ICONS_MAP[service] || 'simple-icons:web'} 
                              className="w-8 h-8 text-blue-400" 
                            />
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-xl blur-sm" />
                          </motion.div>
                          <motion.div 
                            whileHover={{ x: 2 }}
                            className="p-1.5 rounded-lg bg-slate-600/30 border border-slate-500/30"
                          >
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                          </motion.div>
                        </div>

                        <div className="space-y-3">
                          <h3 className="text-white font-semibold text-lg leading-tight">
                            {SERVICE_NAME_MAP[service] || service.toUpperCase()}
                          </h3>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-slate-400">
                              <MapPin className="w-4 h-4" />
                              <span>{availableCountries} países</span>
                            </div>
                            {minPrice > 0 && (
                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-slate-400">a partir de</span>
                                <span className="text-green-400 font-semibold">
                                  R$ {minPrice.toFixed(2)}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1 bg-slate-700/50 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min((availableCountries / 50) * 100, 100)}%` }}
                                transition={{ duration: 1, delay: 0.2 }}
                                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                              />
                            </div>
                            <Zap className="w-3 h-3 text-yellow-400" />
                          </div>
                        </div>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent 
                    className="w-96 max-h-[500px] overflow-hidden bg-slate-800/95 backdrop-blur-xl border-slate-700/50 shadow-2xl rounded-2xl"
                    side="bottom"
                    align="start"
                  >
                    <div className="p-4 border-b border-slate-700/50">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30">
                          <Icon 
                            icon={SIMPLE_ICONS_MAP[service] || 'simple-icons:web'} 
                            className="w-5 h-5 text-blue-400" 
                          />
                        </div>
                        <div>
                          <h4 className="text-white font-semibold">
                            {SERVICE_NAME_MAP[service] || service.toUpperCase()}
                          </h4>
                          <p className="text-xs text-slate-400">
                            {availableCountries} países disponíveis
                          </p>
                        </div>
                      </div>
                      
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          type="text"
                          placeholder="Pesquisar país..."
                          value={countrySearchTerm}
                          onChange={(e) => setCountrySearchTerm(e.target.value)}
                          className="pl-10 h-9 bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-400 text-sm rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="p-2">
                      {servicePrices.length > 0 ? (
                        <List
                          height={400}
                          itemCount={servicePrices.length}
                          itemSize={60}
                          width="100%"
                          itemData={{ service, prices: servicePrices }}
                        >
                          {Row}
                        </List>
                      ) : (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-center py-8"
                        >
                          <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-slate-600/50 to-slate-700/50 flex items-center justify-center">
                            <MapPin className="w-6 h-6 text-slate-400" />
                          </div>
                          <p className="text-slate-300 text-sm font-medium mb-1">
                            Nenhum país disponível
                          </p>
                          <p className="text-slate-500 text-xs">
                            para {SERVICE_NAME_MAP[service] || service.toUpperCase()}
                          </p>
                        </motion.div>
                      )}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* Purchase Modal */}
      <AnimatePresence>
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
      </AnimatePresence>
    </>
  );
}