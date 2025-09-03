"use client";

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Copy, Wallet, TrendingUp, Star, Globe, Sparkles, CreditCard, Loader2, MessageSquare, Info, Filter, ArrowRight } from 'lucide-react';
import { ServiceList } from '@/components/ServiceList';
import { COUNTRY_ID_TO_ISO } from '@/data/countryMapping';
import { POPULAR_SERVICES, SERVICE_NAME_MAP, SIMPLE_ICONS_MAP } from '@/data/services';
import { debounce } from 'lodash';
import { getName } from 'country-list';
import { PurchaseModal } from '@/components/PurchaseModal';
import DepositForm from '@/components/DepositForm';
import FloatingButton from '@/components/FloatingButton';

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

interface ApiError extends Error {
  response?: {
    status: number;
    data?: {
      message?: string;
    };
  };
}

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const scaleOnHover = {
  whileHover: { scale: 1.02, transition: { duration: 0.2 } },
  whileTap: { scale: 0.98 }
};

export default function DashboardPage() {
  const { user, setUser } = useAuthStore();
  const router = useRouter();
  const [isLoadingLink, setIsLoadingLink] = useState(false);
  const [popularPrices, setPopularPrices] = useState<PriceData[]>([]);
  const [allPrices, setAllPrices] = useState<PriceData[]>([]);
  const [allServices, setAllServices] = useState<string[]>([]);
  const [isLoadingPopularPrices, setIsLoadingPopularPrices] = useState(false);
  const [isLoadingAllPrices, setIsLoadingAllPrices] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [activations, setActivations] = useState<Activation[]>([]);
  const [selectedActivation, setSelectedActivation] = useState<Activation | null>(null);
  const [hasActivePolling, setHasActivePolling] = useState(false);
  const limit = 5000;
  const MAX_ACTIVATION_AGE = 20 * 60 * 1000;

  const countryMap = useMemo(() => {
    const map: { [key: string]: string } = {};
    Object.entries(COUNTRY_ID_TO_ISO).forEach(([id, iso]) => {
      map[id] = getName(iso) || `Unknown (${id})`;
    });
    return map;
  }, []);

  const totalServices = useMemo(() => allServices.length + POPULAR_SERVICES.length, [allServices]);
  const totalCountries = useMemo(() => new Set([...popularPrices, ...allPrices].map(p => p.country)).size, [popularPrices, allPrices]);

  const handleUnauthorized = useCallback(() => {
    setUser(null);
    router.push('/login');
  }, [setUser, router]);

  const fetchAllServices = useCallback(async () => {
    try {
      const response = await api.get<PriceData[]>('/credits/prices/filter', { params: { limit: 1000 } });
      const services = Array.from(
        new Set(
          response.data
            .map((item) => item.service)
            .filter((service) => service && !POPULAR_SERVICES.includes(service) && SIMPLE_ICONS_MAP[service])
        )
      ).sort() as string[];
      setAllServices(services);
    } catch (error: unknown) {
      if (error instanceof Error && 'response' in error) {
        const apiError = error as ApiError;
        if (apiError.response?.status === 401) {
          handleUnauthorized();
        } else {
          toast.error('Falha ao carregar lista de serviços');
        }
      } else {
        toast.error('Falha ao carregar lista de serviços');
      }
    }
  }, [handleUnauthorized]);

  const fetchAllPrices = useCallback(
    debounce(async () => {
      try {
        setIsLoadingAllPrices(true);
        const response = await api.get<PriceData[]>('/credits/prices/filter', {
          params: { limit, offset: (page - 1) * limit },
        });
        const newPrices = response.data;
        setAllPrices((prev) => [...prev, ...newPrices]);
        setHasMore(newPrices.length === limit);
      } catch (error: unknown) {
        if (error instanceof Error && 'response' in error) {
          const apiError = error as ApiError;
          if (apiError.response?.status === 401) {
            handleUnauthorized();
          } else {
            const message = apiError.response?.status === 429
              ? 'Muitas requisições. Tente novamente em alguns segundos.'
              : 'Falha ao carregar preços dos serviços';
            toast.error(message);
          }
        } else {
          toast.error('Falha ao carregar preços dos serviços');
        }
      } finally {
        setIsLoadingAllPrices(false);
      }
    }, 300),
    [page, limit, handleUnauthorized]
  );

  const fetchPopularPrices = useCallback(async () => {
    try {
      setIsLoadingPopularPrices(true);
      const response = await api.get<PriceData[]>('/credits/prices/filter', {
        params: { service: POPULAR_SERVICES.join(','), limit: 204 * POPULAR_SERVICES.length },
      });
      const filteredPrices = response.data.filter((item: PriceData) =>
        POPULAR_SERVICES.includes(item.service)
      );
      setPopularPrices(filteredPrices);
    } catch (error: unknown) {
      if (error instanceof Error && 'response' in error) {
        const apiError = error as ApiError;
        if (apiError.response?.status === 401) {
          handleUnauthorized();
        } else {
          toast.error('Falha ao carregar preços dos serviços populares');
          try {
            const fallbackResponse = await api.get<PriceData[]>('/credits/prices/filter', {
              params: { limit: 204 * POPULAR_SERVICES.length },
            });
            const fallbackPrices = fallbackResponse.data.filter((item: PriceData) =>
              POPULAR_SERVICES.includes(item.service)
            );
            setPopularPrices(fallbackPrices);
          } catch {
            toast.error('Falha ao carregar preços de fallback');
          }
        }
      } else {
        toast.error('Falha ao carregar preços dos serviços populares');
      }
    } finally {
      setIsLoadingPopularPrices(false);
    }
  }, [handleUnauthorized]);

  const fetchRecentActivations = useCallback(async () => {
    if (!user) return;
    try {
      const response = await api.get<Activation[]>('/sms/activations/recent', {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const fetchedActivations = response.data;
      setActivations(fetchedActivations);
      const hasActive = fetchedActivations.some(
        (activation: Activation) => activation.createdAt + MAX_ACTIVATION_AGE > Date.now()
      );
      setHasActivePolling(hasActive);
    } catch (error: unknown) {
      if (error instanceof Error && 'response' in error) {
        const apiError = error as ApiError;
        if (apiError.response?.status === 401) {
          handleUnauthorized();
        } else {
          toast.error('Falha ao carregar ativações recentes');
        }
      } else {
        toast.error('Falha ao carregar ativações recentes');
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
        setUser({ ...user, balance });
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
        return { activationId, phoneNumber, creditsSpent };
      } catch (error: unknown) {
        if (error instanceof Error && 'response' in error) {
          const apiError = error as ApiError;
          if (apiError.response?.status === 401) {
            handleUnauthorized();
          } else {
            toast.error('Falha ao realizar a compra');
          }
        } else {
          toast.error('Falha ao realizar a compra');
        }
        return null;
      }
    },
    [user, setUser, handleUnauthorized]
  );

  const openActivationModal = (activation: Activation) => {
    setSelectedActivation(activation);
  };

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchUserData = async () => {
      try {
        setIsLoadingLink(true);
        const linkResponse = await api.get('/affiliate/link', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const balanceResponse = await api.get('/users/me/balance', {
          headers: { Authorization: `Bearer ${user.token}` },
        });

        const newBalance = balanceResponse.data.balance;
        const newAffiliateBalance = balanceResponse.data.affiliateBalance;
        const newAffiliateLink = linkResponse.data.affiliateLink;

        if (
          newBalance !== user.balance ||
          newAffiliateBalance !== user.affiliateBalance ||
          newAffiliateLink !== user.affiliateLink
        ) {
          setUser({
            ...user,
            balance: newBalance,
            affiliateBalance: newAffiliateBalance,
            affiliateLink: newAffiliateLink,
          });
        }
      } catch (error: unknown) {
        if (error instanceof Error && 'response' in error) {
          const apiError = error as ApiError;
          if (apiError.response?.status === 401) {
            handleUnauthorized();
          } else {
            toast.error('Falha ao carregar dados do usuário');
          }
        } else {
          toast.error('Falha ao carregar dados do usuário');
        }
      } finally {
        setIsLoadingLink(false);
      }
    };

    fetchUserData();
    fetchPopularPrices();
    fetchAllServices();
    fetchAllPrices();
    fetchRecentActivations();
  }, [user, router, setUser, fetchAllPrices, fetchAllServices, fetchPopularPrices, fetchRecentActivations, handleUnauthorized]);

  useEffect(() => {
    if (!user || !hasActivePolling) return;

    const interval = setInterval(async () => {
      try {
        const response = await api.get<Activation[]>('/sms/activations/recent', {
          headers: { Authorization: `Bearer ${user.token}` },
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
        if (error instanceof Error && 'response' in error) {
          const apiError = error as ApiError;
          if (apiError.response?.status === 401) {
            handleUnauthorized();
          }
        }
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [user, hasActivePolling, handleUnauthorized, MAX_ACTIVATION_AGE]);

  const loadMore = () => {
    setPage((prev) => prev + 1);
  };

  const copyToClipboard = () => {
    if (user?.affiliateLink) {
      navigator.clipboard.writeText(user.affiliateLink);
      toast.success('Link de afiliado copiado para a área de transferência');
    } else {
      toast.error('Nenhum link de afiliado disponível');
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      <Navbar />
      <FloatingButton />
      
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="pt-24 pb-8"
      >
        <div className="container mx-auto px-6">
          {/* Hero Section */}
          <motion.div variants={fadeInUp} className="text-center mb-12">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 backdrop-blur-sm mb-6"
            >
              <Sparkles className="w-5 h-5 text-blue-400" />
              <span className="text-sm font-semibold text-blue-300">Dashboard Premium</span>
            </motion.div>
            
            <motion.h1 
              variants={fadeInUp}
              className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-blue-100 to-blue-200 bg-clip-text text-transparent mb-4"
            >
              Bem-vindo de volta!
            </motion.h1>
            
            <motion.p 
              variants={fadeInUp}
              className="text-xl text-slate-400 max-w-2xl mx-auto"
            >
              Gerencie seu saldo e explore nossos serviços premium com facilidade
            </motion.p>
          </motion.div>

          {/* Balance Card */}
          <motion.div variants={fadeInUp}>
            <Card className="mb-8 border-0 bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-lg shadow-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5" />
              <CardContent className="relative p-8">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <motion.div 
                      whileHover={{ rotate: 5 }}
                      className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30"
                    >
                      <Wallet className="w-8 h-8 text-blue-400" />
                    </motion.div>
                    <div>
                      <p className="text-sm text-slate-400 mb-1">Saldo Disponível</p>
                      <p className="text-4xl font-bold text-white">
                        R$ {user.balance.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  
                  <motion.div {...scaleOnHover}>
                  </motion.div>
                </div>

                <div className="grid grid-cols-3 gap-6 mt-8 pt-6 border-t border-slate-700/50">
                  <motion.div 
                    whileHover={{ y: -2 }}
                    className="text-center"
                  >
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-blue-400" />
                      <span className="text-2xl font-bold text-white">{totalServices}</span>
                    </div>
                    <p className="text-sm text-slate-400">Serviços</p>
                  </motion.div>
                  
                  <motion.div 
                    whileHover={{ y: -2 }}
                    className="text-center"
                  >
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-green-400" />
                      <span className="text-2xl font-bold text-white">{totalCountries}</span>
                    </div>
                    <p className="text-sm text-slate-400">Países</p>
                  </motion.div>
                  
                  <motion.div 
                    whileHover={{ y: -2 }}
                    className="text-center"
                  >
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-purple-400" />
                      <span className="text-2xl font-bold text-white">320.4M</span>
                    </div>
                    <p className="text-sm text-slate-400">Números</p>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Search Bar */}
          <motion.div variants={fadeInUp} className="mb-8">
            <div className="relative max-w-2xl mx-auto">            
              <Button 
                size="sm" 
                className="absolute right-2 top-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-xl"
              >
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>

          {/* Affiliate Link Card */}
          <motion.div variants={fadeInUp}>
            <Card className="mb-12 border-0 bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-lg shadow-xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5" />
              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-3 text-xl text-white">
                  <motion.div 
                    whileHover={{ rotate: 12 }}
                    className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border border-emerald-500/30"
                  >
                    <Copy className="w-6 h-6 text-emerald-400" />
                  </motion.div>
                  Seu Link de Afiliado
                  <div className="px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
                    Premium
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                {isLoadingLink ? (
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-700/50 animate-pulse" />
                    <div className="h-6 bg-slate-700/50 rounded-lg animate-pulse flex-1" />
                  </div>
                ) : user.affiliateLink ? (
                  <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
                    <Input
                      value={user.affiliateLink}
                      readOnly
                      className="flex-1 bg-slate-700/30 border-slate-600/50 text-slate-200 font-mono text-sm h-12 rounded-xl"
                    />
                    <motion.div {...scaleOnHover}>
                      <Button
                        onClick={copyToClipboard}
                        className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl px-6 h-12 rounded-xl"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copiar Link
                      </Button>
                    </motion.div>
                  </div>
                ) : (
                  <p className="text-slate-400">Nenhum link de afiliado disponível</p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Deposit Card */}
          <motion.div variants={fadeInUp}>
            <Card className="mb-12 border-0 bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-lg shadow-xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5" />
              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-3 text-xl text-white">
                  <motion.div 
                    whileHover={{ scale: 1.1 }}
                    className="p-3 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30"
                  >
                    <CreditCard className="w-6 h-6 text-green-400" />
                  </motion.div>
                  Faça sua Recarga
                  <div className="px-3 py-1 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 text-xs font-semibold border border-green-500/30">
                    PIX Instantâneo
                  </div>
                </CardTitle>
                <p className="text-slate-400 mt-2">
                  Adicione reais à sua conta via PIX de forma instantânea
                </p>
              </CardHeader>
              <CardContent className="relative">
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 p-4 mb-6 rounded-xl bg-blue-500/10 border border-blue-500/20"
                >
                  <Info className="w-5 h-5 text-blue-400" />
                  <p className="text-sm font-medium text-blue-300">
                    R$1.00 = 1.00 Real • Taxa: 0% • Processamento instantâneo
                  </p>
                </motion.div>
                <DepositForm />
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Activations */}
          <motion.div variants={fadeInUp}>
            <Card className="mb-12 border-0 bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-lg shadow-xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5" />
              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-3 text-xl text-white">
                  <motion.div 
                    whileHover={{ rotate: -5 }}
                    className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30"
                  >
                    <MessageSquare className="w-6 h-6 text-purple-400" />
                  </motion.div>
                  Ativações Recentes
                  <div className="px-3 py-1 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 text-xs font-semibold border border-purple-500/30">
                    Últimas 24h
                  </div>
                </CardTitle>
                <p className="text-slate-400 mt-2">
                  Suas ativações de SMS ativas (expiram após 20 minutos)
                </p>
              </CardHeader>
              <CardContent className="relative">
                {activations.length > 0 ? (
                  <motion.div 
                    initial="hidden"
                    animate="visible"
                    variants={staggerContainer}
                    className="space-y-4"
                  >
                    {activations.map((activation) => (
                      <motion.div
                        key={activation.activationId}
                        variants={fadeInUp}
                        whileHover={{ x: 4 }}
                        className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl border border-slate-600/30 hover:bg-slate-700/50 transition-all duration-200"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center">
                            <MessageSquare className="w-6 h-6 text-blue-400" />
                          </div>
                          <div>
                            <p className="text-white font-medium">
                              {SERVICE_NAME_MAP[activation.service] || activation.service.toUpperCase()} - {countryMap[activation.countryId] || `Unknown (${activation.countryId})`}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-slate-400">
                              <span>Número: {activation.phoneNumber}</span>
                              <span>•</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                activation.code 
                                  ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                                  : activation.status === '6'
                                  ? 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                                  : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                              }`}>
                                {activation.code
                                  ? 'Código Recebido'
                                  : activation.status === '6'
                                  ? 'Finalizado'
                                  : 'Aguardando'}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            size="sm"
                            onClick={() => openActivationModal(activation)}
                            disabled={activation.status === '6' || (activation.createdAt + MAX_ACTIVATION_AGE < Date.now())}
                            className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-lg"
                          >
                            <ArrowRight className="w-4 h-4 mr-1" />
                            Ver Detalhes
                          </Button>
                        </motion.div>
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                  >
                    <motion.div 
                      animate={{ y: [0, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center"
                    >
                      <MessageSquare className="w-8 h-8 text-purple-400" />
                    </motion.div>
                    <p className="font-medium text-slate-300 text-lg mb-2">Nenhuma ativação recente</p>
                    <p className="text-slate-500">Suas próximas compras aparecerão aqui</p>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Popular Services */}
          <motion.div variants={fadeInUp}>
            <Card className="mb-8 border-0 shadow-2xl bg-gradient-to-br from-slate-800/50 via-slate-700/50 to-slate-800/50 backdrop-blur-lg overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-orange-500/5" />
              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-3 text-xl text-white">
                  <motion.div 
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.8 }}
                    className="p-3 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/20 border border-amber-500/30"
                  >
                    <Star className="w-6 h-6 text-amber-400" />
                  </motion.div>
                  Serviços Populares
                  <div className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30 shadow-sm">
                    Mais Usados
                  </div>
                </CardTitle>
                <p className="text-slate-400 mt-2">
                  Os serviços mais procurados pelos nossos usuários premium
                </p>
              </CardHeader>
              <CardContent className="relative">
                <AnimatePresence mode="wait">
                  {isLoadingPopularPrices ? (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                      {[...Array(6)].map((_, i) => (
                        <motion.div 
                          key={i}
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.1 }}
                          className="h-20 bg-slate-700/30 rounded-xl"
                        />
                      ))}
                    </motion.div>
                  ) : popularPrices.length > 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <ServiceList
                        services={POPULAR_SERVICES}
                        prices={popularPrices}
                        userBalance={user.balance}
                        handlePurchase={handlePurchase}
                        countryMap={countryMap}
                      />
                    </motion.div>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-12"
                    >
                      <motion.div 
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 3 }}
                        className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center"
                      >
                        <Star className="w-8 h-8 text-amber-400" />
                      </motion.div>
                      <p className="font-medium text-slate-300 text-lg mb-2">Nenhum serviço popular disponível</p>
                      <p className="text-slate-500">Tente novamente em alguns minutos</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>

          {/* All Services */}
          <motion.div variants={fadeInUp}>
            <Card className="border-0 shadow-2xl bg-gradient-to-br from-slate-800/50 via-slate-700/50 to-slate-800/50 backdrop-blur-lg overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5" />
              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-3 text-xl text-white">
                  <motion.div 
                    whileHover={{ scale: 1.1 }}
                    className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30"
                  >
                    <Globe className="w-6 h-6 text-blue-400" />
                  </motion.div>
                  Todos os Serviços
                  <div className="px-3 py-1 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 text-xs font-semibold border border-blue-500/30">
                    {totalServices}+ Serviços
                  </div>
                </CardTitle>
                <p className="text-slate-400 mt-2">
                  Explore nossa coleção completa de serviços globais premium
                </p>
              </CardHeader>
              <CardContent className="relative">
                <AnimatePresence mode="wait">
                  {isLoadingAllPrices ? (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                      {[...Array(9)].map((_, i) => (
                        <motion.div 
                          key={i}
                          animate={{ opacity: [0.3, 0.8, 0.3] }}
                          transition={{ repeat: Infinity, duration: 2, delay: i * 0.1 }}
                          className="h-20 bg-slate-700/30 rounded-xl"
                        />
                      ))}
                    </motion.div>
                  ) : allServices.length > 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <ServiceList
                        services={allServices}
                        prices={allPrices}
                        userBalance={user.balance}
                        handlePurchase={handlePurchase}
                        countryMap={countryMap}
                      />
                      {hasMore && (
                        <motion.div 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-8 text-center"
                        >
                          <Button
                            onClick={loadMore}
                            disabled={isLoadingAllPrices}
                            size="lg"
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl px-8 py-3 rounded-xl"
                          >
                            {isLoadingAllPrices ? (
                              <Loader2 className="h-5 w-5 animate-spin mr-2" />
                            ) : (
                              <TrendingUp className="h-5 w-5 mr-2" />
                            )}
                            {isLoadingAllPrices ? 'Carregando...' : 'Carregar Mais Serviços'}
                          </Button>
                        </motion.div>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-16"
                    >
                      <motion.div 
                        animate={{ y: [0, -8, 0] }}
                        transition={{ repeat: Infinity, duration: 2.5 }}
                        className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center"
                      >
                        <Globe className="w-10 h-10 text-blue-400" />
                      </motion.div>
                      <p className="font-medium text-slate-300 text-xl mb-3">Nenhum serviço disponível</p>
                      <p className="text-slate-500 mb-6">Tente atualizar os preços ou volte mais tarde</p>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button 
                          onClick={() => window.location.reload()}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl px-6"
                        >
                          Tentar Novamente
                        </Button>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
      
      <AnimatePresence>
        {selectedActivation && (
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
      </AnimatePresence>
    </div>
  );
}