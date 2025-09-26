'use client';

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useAuthStore } from '@/stores/auth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Filter, ChevronDown, Plus, Settings, CreditCard, History, Signal, Wallet, Globe, MessageSquare, X } from 'lucide-react';
import { SERVICE_NAME_MAP } from '@/data/services';
import { COUNTRY_ID_TO_ISO } from '@/data/countryMapping';
import { getName } from 'country-list';
import { PurchaseModal } from '@/components/PurchaseModal';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import { toast } from 'sonner';
import Image from 'next/image';
import FloatingButton from '@/components/FloatingButton';
import ServiceImage from '@/components/ServiceImage';

const DepositForm = dynamic(() => import('@/components/DepositForm'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
  ),
}) as React.ComponentType<{ onSuccess?: () => void }>;

interface PriceData {
  service: string;
  country: string;
  priceBrl: number;
  priceUsd: number;
}

interface Activation {
  activationId: string;
  phoneNumber: string;
  creditsSpent: number;
  service: string;
  countryId: string;
  priceBrl: number;
  createdAt: number;
  status: string | null;
  code: string | null;
}

const ITEMS_PER_PAGE = 50;

export default function DashboardPage() {
  const { user, setUser } = useAuthStore();
  const router = useRouter();
  const [prices, setPrices] = useState<PriceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMorePrices, setLoadingMorePrices] = useState(false);
  const [hasMorePrices, setHasMorePrices] = useState(true);
  const [isLoadingMoreServices, setIsLoadingMoreServices] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedCountryId, setSelectedCountryId] = useState<string | null>(null);
  const [selectedPriceBrl, setSelectedPriceBrl] = useState<number | null>(null);
  const [countrySearchTerm, setCountrySearchTerm] = useState('');
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [activations, setActivations] = useState<Activation[]>([]);
  const [selectedActivation, setSelectedActivation] = useState<Activation | null>(null);
  const [hasActivePolling, setHasActivePolling] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [pricesLoaded, setPricesLoaded] = useState(false);
  const [servicesLimit, setServicesLimit] = useState(50);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [allAvailableServices, setAllAvailableServices] = useState<string[]>([]);
  const [serviceCountriesCount, setServiceCountriesCount] = useState<{ [service: string]: number }>({});
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const loadMoreTimeoutRef = useRef<Record<string, NodeJS.Timeout | null>>({});
  const MAX_ACTIVATION_AGE = 20 * 60 * 1000;

  const countryMap = useMemo(() => {
    const map: Record<string, string> = {};
    Object.entries(COUNTRY_ID_TO_ISO).forEach(([id, iso]) => {
      map[id] = getName(iso) || `Unknown (${id})`;
    });
    return map;
  }, []);

  const allServices = useMemo(() => {
    // Usar serviços do banco de dados se disponíveis, senão usar dos preços carregados
    if (allAvailableServices.length > 0) {
      return allAvailableServices.sort((a, b) => {
        const countriesA = new Set(prices.filter(p => p.service === a).map(p => p.country)).size;
        const countriesB = new Set(prices.filter(p => p.service === b).map(p => p.country)).size;
        return countriesB - countriesA; // Ordem decrescente (mais países primeiro)
      });
    }
    
    if (!prices.length) return [];
    const serviceSet = new Set(prices.map(p => p.service));
    const services = Array.from(serviceSet);
    
    // Ordenar serviços por quantidade de países disponíveis (mais países primeiro)
    return services.sort((a, b) => {
      const countriesA = new Set(prices.filter(p => p.service === a).map(p => p.country)).size;
      const countriesB = new Set(prices.filter(p => p.service === b).map(p => p.country)).size;
      return countriesB - countriesA; // Ordem decrescente (mais países primeiro)
    });
  }, [prices, allAvailableServices]);

  const services = useMemo(() => {
    // Retornar apenas os primeiros serviços para melhor performance
    return allServices.slice(0, servicesLimit);
  }, [allServices, servicesLimit]);

  // Debounce search term
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 1000);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm]);

  // Carregar preços para serviços encontrados na busca que não têm preços carregados
  useEffect(() => {
    if (!debouncedSearchTerm.trim() || !allAvailableServices.length) return;

    const loadMissingPrices = async () => {
      const filteredServices = allServices.filter((service) =>
        (SERVICE_NAME_MAP[service] || service.toUpperCase())
          .toLowerCase()
          .includes(debouncedSearchTerm.toLowerCase())
      );

      // Verificar quais serviços não têm preços carregados
      const servicesWithoutPrices = filteredServices.filter(service => {
        const servicePrices = prices.filter(p => p.service === service);
        return servicePrices.length === 0;
      });

      if (servicesWithoutPrices.length === 0) return;

      console.log(`🔍 Carregando preços para ${servicesWithoutPrices.length} serviços encontrados na busca:`, servicesWithoutPrices);

      // Carregar preços para cada serviço que não tem preços
      const pricePromises = servicesWithoutPrices.map(async (service) => {
        try {
          const response = await api.get(`/credits/service-prices/${service}`, {
            params: { limit: 1000 }
          });
          return response.data;
        } catch (error) {
          console.error(`❌ Erro ao carregar preços para ${service}:`, error);
          return [];
        }
      });

      const allNewPrices = await Promise.all(pricePromises);
      const flatPrices = allNewPrices.flat();

      if (flatPrices.length > 0) {
        // Adicionar novos preços aos existentes (evitando duplicatas)
        setPrices(prevPrices => {
          const existingKeys = new Set(prevPrices.map(p => `${p.service}-${p.country}`));
          const newPrices = flatPrices.filter(p => !existingKeys.has(`${p.service}-${p.country}`));
          console.log(`✅ Adicionados ${newPrices.length} novos preços para busca`);
          return [...prevPrices, ...newPrices];
        });
      }
    };

    loadMissingPrices();
  }, [debouncedSearchTerm, allServices, prices, allAvailableServices]);

  const filteredServices = useMemo(() => {
    // Sempre usar allServices para busca, mas limitar quando não há busca
    const servicesToFilter = debouncedSearchTerm ? allServices : services;
    return servicesToFilter.filter((service) =>
      (SERVICE_NAME_MAP[service] || service.toUpperCase())
        .toLowerCase()
        .includes(debouncedSearchTerm.toLowerCase())
    );
  }, [allServices, services, debouncedSearchTerm]);

  const servicePricesMap = useMemo(() => {
    const map: Record<string, Array<PriceData>> = {};
    // Sempre usar allServices para busca, mas limitar quando não há busca
    const servicesToMap = debouncedSearchTerm ? allServices : services;
    servicesToMap.forEach((service) => {
      map[service] = prices.filter((item) => item.service === service);
    });
    return map;
  }, [allServices, services, prices, debouncedSearchTerm]);

  const filteredServicePrices = useMemo(() => {
    return filteredServices.reduce((acc, service) => {
      const filtered = servicePricesMap[service]?.filter((item) =>
        countryMap[item.country]?.toLowerCase().includes(countrySearchTerm.toLowerCase()) ||
        item.country.toLowerCase().includes(countrySearchTerm.toLowerCase())
      ) || [];
      if (filtered.length > 0) acc[service] = filtered;
      return acc;
    }, {} as Record<string, PriceData[]>);
  }, [filteredServices, servicePricesMap, countrySearchTerm, countryMap]);


  const handleUnauthorized = useCallback(() => {
    setUser(null);
    router.push('/login');
  }, [setUser, router]);

  const fetchAllServices = useCallback(async () => {
    try {
      const response = await api.get<{ services: string[] }>('/credits/all-services');
      setAllAvailableServices(response.data.services);
    } catch (error: unknown) {
      console.error('Failed to load all services:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as { response?: { status?: number } };
        if (apiError.response?.status === 401) {
          handleUnauthorized();
        }
      }
    }
  }, [handleUnauthorized]);

  const fetchServiceCountriesCount = useCallback(async () => {
    try {
      const response = await api.get<{ [service: string]: number }>('/credits/service-countries-count');
      setServiceCountriesCount(response.data);
    } catch (error: unknown) {
      console.error('Failed to load service countries count:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as { response?: { status?: number } };
        if (apiError.response?.status === 401) {
          handleUnauthorized();
        }
      }
    }
  }, [handleUnauthorized]);

  const fetchPrices = useCallback(async () => {
    try {
      setIsLoading(true);
      // Carregar apenas os primeiros 1000 registros para melhor performance inicial
      const response = await api.get<PriceData[]>('/credits/prices/filter', { 
        params: { 
          limit: 5000,
          sort: 'priceBrl:asc'
        } 
      });
      setPrices(response.data);
      setPricesLoaded(true);
      setHasMorePrices(response.data.length === 5000);
    } catch (error: unknown) {
      toast.error('Falha ao carregar preços');
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as { response?: { status?: number } };
        if (apiError.response?.status === 401) {
          handleUnauthorized();
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [handleUnauthorized]);

  const loadMorePrices = useCallback(async () => {
    if (loadingMorePrices || !hasMorePrices) return;
    
    try {
      setLoadingMorePrices(true);
      const response = await api.get<PriceData[]>('/credits/prices/filter', { 
        params: { 
          limit: 2000,
          offset: prices.length,
          sort: 'priceBrl:asc'
        } 
      });
      
      if (response.data.length === 0) {
        setHasMorePrices(false);
      } else {
        setPrices(prev => [...prev, ...response.data]);
        setHasMorePrices(response.data.length === 2000);
      }
    } catch (error: unknown) {
      toast.error('Falha ao carregar mais preços');
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as { response?: { status?: number } };
        if (apiError.response?.status === 401) {
          handleUnauthorized();
        }
      }
    } finally {
      setLoadingMorePrices(false);
    }
  }, [loadingMorePrices, hasMorePrices, prices.length, handleUnauthorized]);

  const loadMoreServices = useCallback(async () => {
    if (isLoadingMoreServices || allServices.length <= servicesLimit) return;
    
    try {
      setIsLoadingMoreServices(true);
      // Simular um pequeno delay para melhor UX
      await new Promise(resolve => setTimeout(resolve, 500));
      setServicesLimit(prev => Math.min(prev + 6, allServices.length));
    } finally {
      setIsLoadingMoreServices(false);
    }
  }, [isLoadingMoreServices, allServices.length, servicesLimit]);



  const fetchRecentActivations = useCallback(async () => {
    if (!user) return;
    try {
      const response = await api.get<Activation[]>('/sms/activations/recent', {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      const fetchedActivations = response.data;
      setActivations(fetchedActivations);
      const hasActive = fetchedActivations.some(
        (activation: Activation) => activation.createdAt + MAX_ACTIVATION_AGE > Date.now()
      );
      setHasActivePolling(hasActive);
    } catch (error: unknown) {
      toast.error('Falha ao carregar ativações recentes');
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as { response?: { status?: number } };
        if (apiError.response?.status === 401) {
          handleUnauthorized();
        }
      }
    }
  }, [user, handleUnauthorized, MAX_ACTIVATION_AGE]);

  const handlePurchase = useCallback(
    async (service: string, countryId: string) => {
      if (!user) {
        toast.error('Usuário não autenticado');
        handleUnauthorized();
        return null;
      }
      try {
        const response = await api.post(
          '/sms/buy',
          { service, country: countryId },
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        const { activationId, phoneNumber, creditsSpent, balance } = response.data;
        setUser(user ? { ...user, balance } : null);
        const newActivation: Activation = {
          activationId,
          phoneNumber,
          creditsSpent,
          service,
          countryId,
          priceBrl: creditsSpent,
          createdAt: Date.now(),
          status: null,
          code: null,
        };
        setActivations((prev) => [...prev, newActivation]);
        setSelectedActivation(newActivation);
        setHasActivePolling(true);
        setModalOpen(false);
        return { activationId, phoneNumber, creditsSpent };
      } catch (error: unknown) {
        toast.error('Falha ao realizar a compra');
        if (error && typeof error === 'object' && 'response' in error) {
          const apiError = error as { response?: { status?: number } };
          if (apiError.response?.status === 401) {
            handleUnauthorized();
          }
        }
        return null;
      }
    },
    [user, setUser, handleUnauthorized]
  );

  const openPurchaseModal = (service: string, countryId: string, priceBrl: number) => {
    if (!user) return;
    setSelectedService(service);
    setSelectedCountryId(countryId);
    setSelectedPriceBrl(priceBrl);
    setModalOpen(true);
    setCountrySearchTerm('');
  };

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    // Carregar dados essenciais primeiro
    const loadEssentialData = async () => {
      try {
        // Carregar todos os serviços disponíveis primeiro
        fetchAllServices();
        // Carregar contagem de países por serviço
        fetchServiceCountriesCount();
        // Carregar preços em background para não bloquear a UI
        fetchPrices();
        // Carregar ativações em paralelo
        fetchRecentActivations();
      } catch (error) {
        console.error('Error loading essential data:', error);
      }
    };

    loadEssentialData();
  }, [user, router, fetchAllServices, fetchServiceCountriesCount, fetchPrices, fetchRecentActivations]);

  useEffect(() => {
    if (!user || !hasActivePolling) return;

    const interval = setInterval(async () => {
      try {
        const response = await api.get<Activation[]>('/sms/activations/recent', {
          headers: { Authorization: `Bearer ${user?.token}` },
        });
        const fetchedActivations = response.data;
        setActivations(fetchedActivations);
        const hasActive = fetchedActivations.some(
          (activation: Activation) => activation.createdAt + MAX_ACTIVATION_AGE > Date.now()
        );
        if (!hasActive) {
          setHasActivePolling(false);
        }
      } catch (error: unknown) {
        if (error && typeof error === 'object' && 'response' in error) {
          const apiError = error as { response?: { status?: number } };
          if (apiError.response?.status === 401) {
            handleUnauthorized();
          }
        }
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [user, hasActivePolling, handleUnauthorized, MAX_ACTIVATION_AGE]);

  // Hook para carregamento automático no scroll
  useEffect(() => {
    const handleScroll = () => {
      if (isLoading || !pricesLoaded) return;
      
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // Carregar mais dados quando estiver próximo do final (100px do final)
      if (scrollTop + windowHeight >= documentHeight - 100) {
        // Carregar mais preços se necessário
        if (hasMorePrices && !loadingMorePrices) {
          loadMorePrices();
        }
        
        // Carregar mais serviços se necessário
        if (allServices.length > servicesLimit && !isLoadingMoreServices) {
          loadMoreServices();
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLoading, pricesLoaded, hasMorePrices, loadingMorePrices, allServices.length, servicesLimit, isLoadingMoreServices, loadMorePrices, loadMoreServices]);

  // Cleanup dos timeouts quando o componente for desmontado
  useEffect(() => {
    return () => {
      // Limpar timeout de busca
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      
      // Limpar timeouts de carregamento
      const timeouts = loadMoreTimeoutRef.current;
      Object.values(timeouts).forEach(timeout => {
        if (timeout) clearTimeout(timeout);
      });
    };
  }, []);


  // Row component otimizado com memo mais específico
  const Row = React.memo(({
    index,
    style,
    data,
  }: {
    index: number;
    style: React.CSSProperties;
    data: { 
      service: string; 
      prices: PriceData[]; 
      onLoadMore: () => void;
      hasMore: boolean;
      isLoading: boolean;
    };
  }) => {
    const { prices, hasMore, isLoading } = data;
    
    // Se é o último item e há mais para carregar, mostrar indicador de carregamento
    if (index === prices.length && hasMore) {
      return (
        <div style={style}>
          <div className="flex justify-center items-center p-3">
            <div className="flex items-center space-x-2 text-blue-400 text-sm">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
              <span>{isLoading ? 'Carregando mais países...' : 'Carregar mais países...'}</span>
            </div>
          </div>
        </div>
      );
    }

    // Se o index é maior que o array, não renderizar
    if (index >= prices.length) {
      return <div style={style}></div>;
    }

    const item = prices[index];
    const countryName = countryMap[item.country] || `(${item.country})`;
    const countryIso2 = COUNTRY_ID_TO_ISO[item.country] || 'UN';

    return (
      <div style={style}>
        <DropdownMenuItem className="flex justify-between items-center p-3 my-1 rounded-lg bg-slate-700/20 hover:bg-slate-600/30 border border-slate-600/20 hover:border-slate-500/40 transition-all duration-200">
          <span className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="relative flex-shrink-0">
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
            <div className="min-w-0 flex-1">
              <span className="text-white font-medium text-sm truncate block">{countryName}</span>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                  R$ {item.priceBrl.toFixed(2)}
                </span>
              </div>
            </div>
          </span>
          <Button
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              openPurchaseModal(item.service, item.country, item.priceBrl);
            }}
            disabled={!user?.balance || user.balance < item.priceBrl}
            className={`rounded-lg text-xs px-3 py-1.5 ${
              !user?.balance || user.balance < item.priceBrl
                ? 'bg-slate-600/50 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-sm'
            }`}
          >
            {!user?.balance || user.balance < item.priceBrl ? 'Sem saldo' : 'Comprar'}
          </Button>
        </DropdownMenuItem>
      </div>
    );
  }, (prevProps, nextProps) => {
    // Comparação mais específica para evitar re-renders desnecessários
    return (
      prevProps.index === nextProps.index &&
      prevProps.data.service === nextProps.data.service &&
      prevProps.data.prices.length === nextProps.data.prices.length &&
      prevProps.data.hasMore === nextProps.data.hasMore &&
      prevProps.data.isLoading === nextProps.data.isLoading
    );
  });

  Row.displayName = 'Row';

  // Componente de serviço memoizado para melhor performance
  const ServiceCard = React.memo(({ 
    service, 
    servicePrices, 
    minPrice, 
    availableCountries 
  }: {
    service: string;
    servicePrices: PriceData[];
    minPrice: number;
    availableCountries: number;
  }) => {
    const [dropdownItemsToShow, setDropdownItemsToShow] = useState(ITEMS_PER_PAGE);
    const [loadingMore, setLoadingMore] = useState(false);
    const [countrySearchTerm, setCountrySearchTerm] = useState('');
    const [hasLoadedAllCountries, setHasLoadedAllCountries] = useState(false);
    const [localServicePrices, setLocalServicePrices] = useState<PriceData[]>(servicePrices);
    const [isSearching, setIsSearching] = useState(false);
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Sincronizar estado local com servicePrices quando mudar
    useEffect(() => {
      if (servicePrices.length > 0 && localServicePrices.length === 0) {
        setLocalServicePrices(servicePrices);
      }
    }, [servicePrices, localServicePrices.length]);

    // Remover duplicatas dos preços locais
    useEffect(() => {
      if (localServicePrices.length > 0) {
        const uniquePrices = localServicePrices.filter((price, index, self) => 
          index === self.findIndex(p => p.service === price.service && p.country === price.country)
        );
        if (uniquePrices.length !== localServicePrices.length) {
          setLocalServicePrices(uniquePrices);
        }
      }
    }, [localServicePrices]);

    // Debounce da busca
    useEffect(() => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      
      searchTimeoutRef.current = setTimeout(() => {
        setDebouncedSearchTerm(countrySearchTerm);
      }, 1000);
      
      return () => {
        if (searchTimeoutRef.current) {
          clearTimeout(searchTimeoutRef.current);
        }
      };
    }, [countrySearchTerm]);

    const resetDropdownItems = () => {
      setDropdownItemsToShow(ITEMS_PER_PAGE);
    };

    const loadMoreItems = async () => {
      if (loadingMore || hasLoadedAllCountries) return;
      
      setLoadingMore(true);
      
      try {
        // Carregar mais países do servidor
        const currentCount = localServicePrices.length;
        const response = await api.get<PriceData[]>('/credits/prices/filter', { 
          params: { 
            service,
            limit: 50,
            offset: currentCount,
            sort: 'priceBrl:asc'
          } 
        });
        
        if (response.data.length === 0) {
          setHasLoadedAllCountries(true);
        } else {
          // Atualizar apenas o estado local, não o cache global
          setLocalServicePrices(prev => {
            const combined = [...prev, ...response.data];
            // Remover duplicatas
            const uniquePrices = combined.filter((price, index, self) => 
              index === self.findIndex(p => p.service === price.service && p.country === price.country)
            );
            return uniquePrices;
          });
          setDropdownItemsToShow(prev => prev + ITEMS_PER_PAGE);
        }
      } catch (error) {
        console.error('Erro ao carregar mais países:', error);
      } finally {
        setLoadingMore(false);
      }
    };

    const loadAllCountries = useCallback(async () => {
      if (loadingMore || hasLoadedAllCountries) return;
      
      setLoadingMore(true);
      
      try {
        // Carregar todos os países de uma vez para busca
        const response = await api.get<PriceData[]>('/credits/prices/filter', { 
          params: { 
            service,
            limit: 1000, // Limite alto para pegar todos os países
            offset: 0,
            sort: 'priceBrl:asc'
          } 
        });
        
        if (response.data.length > 0) {
          // Remover duplicatas antes de definir
          const uniquePrices = response.data.filter((price, index, self) => 
            index === self.findIndex(p => p.service === price.service && p.country === price.country)
          );
          
          setLocalServicePrices(uniquePrices);
          setHasLoadedAllCountries(true);
          setDropdownItemsToShow(uniquePrices.length);
        }
      } catch (error) {
        console.error('Erro ao carregar todos os países:', error);
      } finally {
        setLoadingMore(false);
        setIsSearching(false);
        // Restaurar foco no input após carregamento
        if (inputRef.current) {
          setTimeout(() => {
            inputRef.current?.focus();
          }, 50);
        }
      }
    }, [loadingMore, hasLoadedAllCountries, service]);

    // Carregar todos os países quando usuário começar a pesquisar
    useEffect(() => {
      if (debouncedSearchTerm.trim() && !hasLoadedAllCountries && !isSearching) {
        // Usar setTimeout para evitar re-renderização imediata que causa perda de foco
        const timeoutId = setTimeout(() => {
          // Verificar se o input ainda está focado antes de carregar
          if (inputRef.current && document.activeElement === inputRef.current) {
            setIsSearching(true);
            loadAllCountries();
          }
        }, 200);
        
        return () => clearTimeout(timeoutId);
      }
    }, [debouncedSearchTerm, hasLoadedAllCountries, isSearching, loadAllCountries]);

    // Auto-load mais países quando o usuário rola no dropdown
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
      const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 50;
      
      if (isNearBottom && !loadingMore && !hasLoadedAllCountries) {
        loadMoreItems();
      }
    };

    const filteredPrices = useMemo(() => {
      return localServicePrices.filter((item) =>
        countryMap[item.country]?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        item.country.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      );
    }, [localServicePrices, debouncedSearchTerm]);

    return (
      <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 rounded-xl p-4 border border-gray-700/30 hover:bg-gray-800/70 transition-all duration-200 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-blue-500/20">
              <ServiceImage
                service={service}
                width={40}
                height={40}
                className="object-contain"
              />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-sm text-white mb-1 truncate">
                {SERVICE_NAME_MAP[service] || service.toUpperCase()}
              </h3>
              <div className="text-slate-400 text-xs flex items-center space-x-1">
                <Globe className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{availableCountries} países</span>
              </div>
            </div>
          </div>
          <div className="text-right ml-2 flex-shrink-0">
            <div className="text-sm font-bold text-blue-400">R$ {minPrice.toFixed(2)}</div>
            <div className="text-slate-500 text-xs">a partir de</div>
          </div>
        </div>
        <DropdownMenu onOpenChange={(open) => {
          if (open) {
            resetDropdownItems();
            setCountrySearchTerm('');
            // Se não temos dados locais, carregar do servidor
            if (localServicePrices.length === 0) {
              loadMoreItems();
            }
          }
        }}>
          <DropdownMenuTrigger asChild>
            <button className="w-full bg-gray-700/50 hover:bg-gray-600/50 text-white py-2 rounded-lg flex items-center justify-center space-x-2 text-xs font-medium transition-all duration-200">
              <span>Ver países disponíveis</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-96 max-h-[500px] overflow-hidden bg-gray-800/90 backdrop-blur-md border border-gray-700/50 shadow-xl rounded-2xl">
            <div className="p-4 border-b border-gray-700/50 relative">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  document.dispatchEvent(new KeyboardEvent('keydown', { 
                    key: 'Escape',
                    bubbles: true 
                  }));
                }}
                className="absolute right-3 top-3 text-slate-400 hover:text-white transition-colors duration-200"
                aria-label="Fechar dropdown"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30">
                  <ServiceImage
                    service={service}
                    width={20}
                    height={20}
                    className="object-contain"
                  />
                </div>
                <div>
                  <h4 className="text-white font-semibold">{SERVICE_NAME_MAP[service] || service.toUpperCase()}</h4>
                  <p className="text-sm text-slate-400">{availableCountries} países disponíveis</p>
                </div>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder={isSearching ? "Carregando todos os países..." : "Pesquisar país..."}
                  value={countrySearchTerm}
                  onChange={(e) => setCountrySearchTerm(e.target.value)}
                  className="pl-10 h-10 bg-gray-700/50 border border-gray-600/50 text-white placeholder:text-slate-400 text-sm rounded-lg"
                  disabled={isSearching}
                  onFocus={() => {
                    // Manter foco no input mesmo durante carregamento
                    if (inputRef.current) {
                      inputRef.current.focus();
                    }
                  }}
                />
              </div>
            </div>

            <div className="p-2">
              {(() => {
                const itemsToShow = dropdownItemsToShow;
                const displayedPrices = filteredPrices.slice(0, itemsToShow);

                return filteredPrices.length > 0 ? (
                  <div className="max-h-[300px] overflow-y-auto" onScroll={handleScroll}>
                    {displayedPrices.map((item, index) => {
                      const countryName = countryMap[item.country] || `(${item.country})`;
                      const countryIso2 = COUNTRY_ID_TO_ISO[item.country] || 'UN';

                      return (
                        <div key={`${item.country}-${index}`} className="flex justify-between items-center p-3 my-1 rounded-lg bg-slate-700/20 hover:bg-slate-600/30 border border-slate-600/20 hover:border-slate-500/40 transition-all duration-200">
                          <span className="flex items-center space-x-3 flex-1 min-w-0">
                            <div className="relative flex-shrink-0">
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
                            <div className="min-w-0 flex-1">
                              <span className="text-white font-medium text-sm truncate block">{countryName}</span>
                              <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                                <span className="flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                                  R$ {item.priceBrl.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </span>
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              openPurchaseModal(item.service, item.country, item.priceBrl);
                            }}
                            disabled={!user?.balance || user.balance < item.priceBrl}
                            className={`rounded-lg text-xs px-3 py-1.5 ${
                              !user?.balance || user.balance < item.priceBrl
                                ? 'bg-slate-600/50 text-slate-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-sm'
                            }`}
                          >
                            {!user?.balance || user.balance < item.priceBrl ? 'Sem saldo' : 'Comprar'}
                          </Button>
                        </div>
                      );
                    })}
                    {loadingMore && (
                      <div className="flex justify-center items-center p-3">
                        <div className="flex items-center space-x-2 text-blue-400 text-sm">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
                          <span>{isSearching ? "Carregando todos os países..." : "Carregando mais países..."}</span>
                        </div>
                      </div>
                    )}
                    
                    {hasLoadedAllCountries && !loadingMore && (
                      <div className="flex justify-center items-center p-3">
                        <div className="text-slate-400 text-sm">
                          Todos os países foram carregados
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-400">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-gray-600/50 to-gray-700/50 flex items-center justify-center">
                      <Globe className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-sm font-medium text-slate-300 mb-1">Nenhum país disponível</p>
                    <p className="text-xs text-slate-500">para {SERVICE_NAME_MAP[service] || service.toUpperCase()}</p>
                  </div>
                );
              })()}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }, (prevProps, nextProps) => {
    return (
      prevProps.service === nextProps.service &&
      prevProps.minPrice === nextProps.minPrice &&
      prevProps.availableCountries === nextProps.availableCountries
    );
  });

  ServiceCard.displayName = 'ServiceCard';

  if (isLoading && !pricesLoaded) {
    return (
      <div className="min-h-screen bg-[#0B1426] flex items-center justify-center text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Carregando serviços...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0B1426] text-white">
      <Navbar />

      <div className="pt-16 flex">
        {/* Sidebar - Hidden on mobile, shown on desktop */}
        <div className="hidden md:block w-64 bg-[#0B1426] p-6 border-r border-slate-700/30 min-h-screen">
          <div className="space-y-2">
            <button
              onClick={() => setShowHistory(false)}
              className={`flex items-center space-x-3 px-4 py-3 cursor-pointer rounded-lg w-full text-left transition-all duration-200 ${
                !showHistory
                  ? 'text-blue-400 bg-blue-500/10 border-l-4 border-blue-500'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
              }`}
            >
              <Settings className="w-5 h-5" />
              <span className="text-sm font-medium">Serviços</span>
            </button>
            <button
              onClick={() => setShowDepositModal(true)}
              className="flex items-center space-x-3 text-slate-400 hover:text-white px-4 py-3 cursor-pointer rounded-lg hover:bg-slate-800/30 w-full text-left transition-all duration-200"
            >
              <CreditCard className="w-5 h-5" />
              <span className="text-sm">Adicionar Saldo</span>
            </button>
            <button
              onClick={() => setShowHistory(true)}
              className={`flex items-center space-x-3 px-4 py-3 cursor-pointer rounded-lg w-full text-left transition-all duration-200 ${
                showHistory
                  ? 'text-blue-400 bg-blue-500/10 border-l-4 border-blue-500'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
              }`}
            >
              <History className="w-5 h-5" />
              <span className="text-sm">Histórico</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 md:p-6">
          {/* Header Cards Row */}
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-6">
              {/* Saldo Card */}
              <div className="lg:col-span-6 bg-gradient-to-br from-gray-900/50 to-gray-800/50 rounded-xl p-4 border border-gray-700/30 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <Wallet className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <div className="text-slate-300 text-xs font-medium">Saldo Disponível</div>
                      <div className="text-2xl font-bold text-white">R$ {user.balance?.toFixed(2) || '0.00'}</div>
                    </div>
                  </div>
                  <Button
                    onClick={() => setShowDepositModal(true)}
                    className="bg-gradient-to-r from-blue-900 to-blue-900 hover:from-blue-900 hover:to-blue-800 text-white px-4 py-2 rounded-lg font-medium shadow-md transition-all duration-200 text-sm"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Adicionar
                  </Button>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="lg:col-span-6 grid grid-cols-3 gap-3">
                <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 rounded-xl p-3 border border-gray-700/30 shadow-md">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <Settings className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <div className="text-lg font-bold text-white">+500</div>
                      <div className="text-slate-400 text-xs">Serviços</div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 rounded-xl p-3 border border-gray-700/30 shadow-md">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <Globe className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <div className="text-lg font-bold text-white">194</div>
                      <div className="text-slate-400 text-xs">Países</div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 rounded-xl p-3 border border-gray-700/30 shadow-md">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <Signal className="w-4 h-4 text-green-400" />
                    </div>
                    <div>
                      <div className="text-lg font-bold text-white">10k</div>
                      <div className="text-slate-400 text-xs">Números</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Conditional Content: Services or History */}
          {showHistory ? (
            <Card className="mb-6 bg-gradient-to-br from-gray-900/50 to-gray-800/50 border border-gray-700/30 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                      <MessageSquare className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <div className="text-xl font-bold text-white">Ativações Recentes</div>
                      <div className="text-slate-400 text-sm">Suas ativações de SMS ativas (expiram após 20 minutos)</div>
                    </div>
                  </div>
                  <Button
                    onClick={() => setShowHistory(false)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl"
                  >
                    Voltar
                  </Button>
                </div>
                {activations.length > 0 ? (
                  <div className="space-y-4">
                    {activations.map((activation) => (
                      <div
                        key={activation.activationId}
                        className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl border border-gray-700/30 hover:bg-gray-700/40 transition-all duration-200"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center">
                            <ServiceImage
                              service={activation.service}
                              width={48}
                              height={48}
                              className="object-contain"
                            />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">
                              {SERVICE_NAME_MAP[activation.service] || activation.service.toUpperCase()} -{' '}
                              {countryMap[activation.countryId] || `Unknown (${activation.countryId})`}
                            </p>
                            <p className="text-xs text-slate-400">
                              Número: {activation.phoneNumber} | Status:{' '}
                              {activation.code
                                ? 'Código Recebido'
                                : activation.status === '6'
                                ? 'Finalizado'
                                : 'Aguardando'}
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => setSelectedActivation(activation)}
                          disabled={activation.status === '6' || (activation.createdAt + MAX_ACTIVATION_AGE < Date.now())}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-xl"
                        >
                          Ver Detalhes
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-400">
                    <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="font-medium">Nenhuma ativação recente</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Search Bar */}
              <div className="max-w-5xl mx-auto">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="Buscar serviço ou país..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-slate-400 focus:border-blue-500/50 text-sm shadow-md"
                  />
                </div>
                <div className="flex gap-4">
                  <div className="relative flex-1 sm:flex-none">
                    <select className="bg-gray-800/50 border border-gray-700/50 rounded-xl px-4 py-3 text-white text-sm appearance-none pr-10 focus:border-blue-500/50 w-full sm:w-auto shadow-md">
                      <option>Todos os países</option>
                    </select>
                    <ChevronDown className="w-5 h-5 text-slate-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                  </div>
                  <button className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-3 hover:bg-gray-700/50 flex-shrink-0 shadow-md">
                    <Filter className="w-5 h-5 text-slate-400" />
                  </button>
                </div>
                </div>
              </div>

              {/* Services Grid */}
              <div className="max-w-6xl mx-auto">
                <FloatingButton />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 gap-4">
                  {filteredServices.map((service) => {
                    const servicePrices = filteredServicePrices[service] || [];
                    const minPrice = servicePrices.length > 0 ? Math.min(...servicePrices.map((p) => p.priceBrl)) : 0;
                    const availableCountries = serviceCountriesCount[service] || servicePrices.length;

                    return (
                      <ServiceCard
                        key={service}
                        service={service}
                        servicePrices={servicePrices}
                        minPrice={minPrice}
                        availableCountries={availableCountries}
                      />
                    );
                  })}
                  
                  {/* Loading indicator for more services */}
                  {isLoadingMoreServices && (
                    <div className="col-span-full flex justify-center items-center py-8">
                      <div className="flex items-center space-x-2 text-blue-400">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
                        <span>Carregando mais serviços...</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Loading Indicators */}
              <div className="max-w-6xl mx-auto flex flex-col items-center gap-4 mt-6">

                
                {!hasMorePrices && !isLoadingMoreServices && allServices.length <= servicesLimit && (
                  <div className="text-slate-400 text-sm">
                    Todos os dados foram carregados
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-900/50 backdrop-blur-md border-t border-gray-700/30 p-4 z-50">
        <div className="flex justify-around">
          <button
            onClick={() => setShowHistory(false)}
            className={`flex flex-col items-center space-y-1 py-2 transition-all duration-200 ${
              !showHistory 
                ? 'text-blue-400' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Settings className="w-6 h-6" />
            <span className="text-xs font-medium">Serviços</span>
            {!showHistory && (
              <div className="w-8 h-0.5 bg-blue-400 rounded-full mt-1"></div>
            )}
          </button>
          <button
            onClick={() => setShowDepositModal(true)}
            className="flex flex-col items-center space-y-1 py-2 text-slate-400 hover:text-white transition-all duration-200"
          >
            <CreditCard className="w-6 h-6" />
            <span className="text-xs font-medium">Adicionar Saldo</span>
          </button>
          <button
            onClick={() => setShowHistory(true)}
            className={`flex flex-col items-center space-y-1 py-2 transition-all duration-200 ${
              showHistory 
                ? 'text-blue-400' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <History className="w-6 h-6" />
            <span className="text-xs font-medium">Histórico</span>
            {showHistory && (
              <div className="w-8 h-0.5 bg-blue-400 rounded-full mt-1"></div>
            )}
          </button>
        </div>
      </div>

      {/* Add bottom padding to prevent content being hidden behind mobile nav */}
      <div className="md:hidden h-20"></div>

      {/* Purchase Modal */}
      {modalOpen && selectedService && selectedCountryId && selectedPriceBrl !== null && user && (
        <PurchaseModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          service={selectedService}
          countryId={selectedCountryId}
          priceBrl={selectedPriceBrl}
          userBalance={user.balance}
          handlePurchase={handlePurchase}
          countryMap={countryMap}
        />
      )}

      {/* Activation Modal */}
      {selectedActivation && user && (
        <PurchaseModal
          isOpen={!!selectedActivation}
          onClose={() => setSelectedActivation(null)}
          service={selectedActivation.service}
          countryId={selectedActivation.countryId}
          priceBrl={selectedActivation.priceBrl}
          userBalance={user.balance}
          handlePurchase={handlePurchase}
          countryMap={countryMap}
          initialPurchaseResult={{
            activationId: selectedActivation.activationId,
            phoneNumber: selectedActivation.phoneNumber,
            creditsSpent: selectedActivation.creditsSpent,
          }}
          initialStatus={selectedActivation.status}
          initialCode={selectedActivation.code}
          initialStartTime={selectedActivation.createdAt}
        />
      )}

      {/* Deposit Modal */}
      {showDepositModal && user && (
        <div suppressHydrationWarning className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900/50 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-auto border border-gray-700/30 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">Adicionar Saldo</h2>
              <button
                onClick={() => setShowDepositModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <DepositForm onSuccess={() => setShowDepositModal(false)} />
          </div>
        </div>
      )}
    </div>
  );
}