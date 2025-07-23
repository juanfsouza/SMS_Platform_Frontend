"use client";

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Copy, Wallet, TrendingUp, Star, Globe, Sparkles, CreditCard, Loader2, MessageSquare } from 'lucide-react';
import { ServiceList } from '@/components/ServiceList';
import { COUNTRY_ID_TO_ISO } from '@/data/countryMapping';
import { POPULAR_SERVICES, SERVICE_NAME_MAP } from '@/data/services';
import { debounce } from 'lodash';
import { getName } from 'country-list';
import { PurchaseModal } from '@/components/PurchaseModal';
import DepositForm from '@/components/DepositForm';

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

  const handleUnauthorized = useCallback(() => {
    setUser(null);
    router.push('/auth/login');
  }, [setUser, router]);

  const fetchAllServices = useCallback(async () => {
    try {
      const response = await api.get<PriceData[]>('/credits/prices/filter', { params: { limit: 1000 } });
      const services = Array.from(
        new Set(
          response.data
            .map((item) => item.service)
            .filter((service) => service && !POPULAR_SERVICES.includes(service))
        )
      ).sort() as string[];
      setAllServices(services);
    } catch (error: unknown) {
      console.error('Error fetching all services:', error);
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
        console.error('Error fetching all prices:', error);
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
      console.error('Error fetching popular prices:', error);
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
          } catch (fallbackError: unknown) {
            console.error('Error fetching fallback prices:', fallbackError);
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
      console.error('Error fetching recent activations:', error);
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
        console.error('Purchase error:', error);
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
      router.push('/auth/login');
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
        console.error('Error fetching user data:', error);
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
        console.error('Error updating recent activations:', error);
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
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-primary/5">
      <Navbar />
      <div className="pt-24 pb-8">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Dashboard Premium</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-custom-bold text-foreground mb-4">
              Bem-vindo de volta!
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Gerencie seus créditos e explore nossos serviços premium com facilidade
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-primary/10 to-primary/5">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardHeader className="relative z-10 pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Saldo da Conta</CardTitle>
                  <div className="p-2 rounded-lg bg-primary/20">
                    <Wallet className="w-4 h-4 text-primary" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-custom-bold text-foreground">
                    {user.balance.toFixed(2)}
                  </span>
                  <span className="text-sm text-muted-foreground font-medium">Créditos</span>
                </div>
                <div className="mt-2 flex items-center gap-1 text-emerald-600">
                  <TrendingUp className="w-3 h-3" />
                  <span className="text-xs font-medium">Disponível</span>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-emerald-50 to-emerald-50/50">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-100/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardHeader className="relative z-10 pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Saldo de Afiliado</CardTitle>
                  <div className="p-2 rounded-lg bg-emerald-100">
                    <CreditCard className="w-4 h-4 text-emerald-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-custom-bold text-foreground">
                    {user.affiliateBalance?.toFixed(2) ?? '0.00'}
                  </span>
                  <span className="text-sm text-muted-foreground font-medium">BRL</span>
                </div>
                <div className="mt-2 flex items-center gap-1 text-emerald-600">
                  <TrendingUp className="w-3 h-3" />
                  <span className="text-xs font-medium">Comissões</span>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-blue-50 to-blue-50/50">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-100/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardHeader className="relative z-10 pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Serviços</CardTitle>
                  <div className="p-2 rounded-lg bg-blue-100">
                    <Globe className="w-4 h-4 text-blue-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-custom-bold text-foreground">
                    {allServices.length + POPULAR_SERVICES.length}
                  </span>
                  <span className="text-sm text-muted-foreground font-medium">Disponíveis</span>
                </div>
                <div className="mt-2 flex items-center gap-1 text-blue-600">
                  <Star className="w-3 h-3" />
                  <span className="text-xs font-medium">Globais</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-12 border-0 bg-gradient-to-r from-card to-card/80 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Copy className="w-5 h-5 text-primary" />
                </div>
                Seu Link de Afiliado
                <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                  Premium
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingLink ? (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 animate-pulse" />
                  <div className="h-4 bg-primary/10 rounded animate-pulse flex-1" />
                </div>
              ) : user.affiliateLink ? (
                <div className="flex items-center gap-4">
                  <Input
                    value={user.affiliateLink}
                    readOnly
                    className="flex-1 bg-secondary/50 border-border/50 font-mono text-sm"
                  />
                  <Button
                    onClick={copyToClipboard}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar
                  </Button>
                </div>
              ) : (
                <p className="text-muted-foreground">Nenhum link de afiliado disponível</p>
              )}
            </CardContent>
          </Card>

          <Card className="mb-12 border-0 bg-gradient-to-r from-card to-card/80 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 rounded-lg bg-green-100">
                  <CreditCard className="w-5 h-5 text-green-600" />
                </div>
                Faça sua Recarga
                <div className="px-3 py-1 rounded-full bg-green-100 text-green-600 text-xs font-semibold">
                  Adicionar Créditos
                </div>
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                Adicione créditos à sua conta via PIX
              </p>
            </CardHeader>
            <CardContent>
              <DepositForm />
            </CardContent>
          </Card>

          <Card className="mb-12 border-0 bg-gradient-to-r from-card to-card/80 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 rounded-lg bg-blue-100">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                </div>
                Ativações Recentes
                <div className="px-3 py-1 rounded-full bg-blue-100 text-blue-600 text-xs font-semibold">
                  Últimas Compras
                </div>
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                Suas ativações de SMS ativas (expiram após 20 minutos)
              </p>
            </CardHeader>
            <CardContent>
              {activations.length > 0 ? (
                <div className="space-y-4">
                  {activations.map((activation) => (
                    <div
                      key={activation.activationId}
                      className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {SERVICE_NAME_MAP[activation.service] || activation.service.toUpperCase()} -{' '}
                          {countryMap[activation.countryId] || `Unknown (${activation.countryId})`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Número: {activation.phoneNumber} | Status:{' '}
                          {activation.code
                            ? 'Código Recebido'
                            : activation.status === '6'
                            ? 'Finalizado'
                            : 'Aguardando'}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => openActivationModal(activation)}
                        disabled={activation.status === '6' || (activation.createdAt + MAX_ACTIVATION_AGE < Date.now())}
                      >
                        Ver Detalhes
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">Nenhuma ativação recente</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="mb-8 border-0 shadow-lg bg-gradient-to-br from-card via-card to-accent/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 rounded-lg bg-amber-100">
                  <Star className="w-5 h-5 text-amber-600" />
                </div>
                Serviços Populares
                <div className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 text-xs font-semibold shadow-sm">
                  Mais Usados
                </div>
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                Os serviços mais procurados pelos nossos usuários
              </p>
            </CardHeader>
            <CardContent>
              {isLoadingPopularPrices ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-12 bg-secondary/50 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : popularPrices.length > 0 ? (
                <ServiceList
                  services={POPULAR_SERVICES}
                  prices={popularPrices}
                  userBalance={user.balance}
                  handlePurchase={handlePurchase}
                  countryMap={countryMap}
                />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Star className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">Nenhum serviço popular disponível no momento</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-card via-card to-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Globe className="w-5 h-5 text-primary" />
                </div>
                Todos os Serviços
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                Explore nossa coleção completa de serviços globais
              </p>
            </CardHeader>
            <CardContent>
              {isLoadingAllPrices ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {[...Array(9)].map((_, i) => (
                    <div key={i} className="h-12 bg-secondary/50 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : allServices.length > 0 ? (
                <>
                  <ServiceList
                    services={allServices}
                    prices={allPrices}
                    userBalance={user.balance}
                    handlePurchase={handlePurchase}
                    countryMap={countryMap}
                  />
                  {hasMore && (
                    <Button
                      onClick={loadMore}
                      disabled={isLoadingAllPrices}
                      className="mt-4 w-full bg-primary hover:bg-primary/90"
                    >
                      {isLoadingAllPrices ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      Carregar Mais
                    </Button>
                  )}
                </>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Globe className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="font-medium text-lg mb-2">Nenhum serviço disponível</p>
                  <p className="text-sm">Tente atualizar os preços ou volte mais tarde</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
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
    </div>
  );
}