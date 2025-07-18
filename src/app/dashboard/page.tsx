'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Copy } from 'lucide-react';
import { ServiceList } from '@/components/ServiceList';
import { POPULAR_SERVICES } from '@/data/services';

interface PriceData {
  service: string;
  country: string;
  priceBrl: number;
  priceUsd: number;
}

export default function DashboardPage() {
  const { user, setUser } = useAuthStore();
  const router = useRouter();
  const [isLoadingLink, setIsLoadingLink] = useState(false);
  const [popularPrices, setPopularPrices] = useState<PriceData[]>([]);
  const [allPrices, setAllPrices] = useState<PriceData[]>([]);
  const [countryMap, setCountryMap] = useState<Record<string, string>>({});
  const [isLoadingPrices, setIsLoadingPrices] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const limit = 10000; // Increased limit to fetch more records per page

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }    

    const fetchUserData = async () => {
      if (!user.affiliateLink) {
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
        } catch (error) {
          console.error('Error fetching user data:', error);
          toast.error('Falha ao carregar dados do usuário', {
            style: {
              background: 'oklch(0.6368 0.2078 25.3313)',
              color: 'oklch(1.0000 0 0)',
              border: 'none',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            },
          });
        } finally {
          setIsLoadingLink(false);
        }
      }
    };

  const fetchPopularPrices = async () => {
    try {
      setIsLoadingPrices(true);
      const response = await api.get('/credits/prices/filter', {
        params: { country: POPULAR_SERVICES.join(','), limit: 204 * POPULAR_SERVICES.length },
      });
      const filteredPrices = response.data.filter((item: PriceData) =>
        POPULAR_SERVICES.includes(item.country)
      );
      setPopularPrices(filteredPrices);
      console.log('Popular prices loaded:', filteredPrices.length, 'records for services:', POPULAR_SERVICES);
      console.log('Raw response data:', response.data.length, 'total records', 'Full response:', response.data);
    } catch (error) {
      console.error('Error fetching popular prices:', error);
      toast.error('Falha ao carregar preços dos serviços populares', {
        style: {
          background: 'oklch(0.6368 0.2078 25.3313)',
          color: 'oklch(1.0000 0 0)',
          border: 'none',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        },
      });
      const fallbackResponse = await api.get('/credits/prices/filter', {
        params: { limit: 204 * POPULAR_SERVICES.length },
      });
      const fallbackPrices = fallbackResponse.data.filter((item: PriceData) =>
        POPULAR_SERVICES.includes(item.country)
      );
      setPopularPrices(fallbackPrices);
      console.log('Fallback popular prices loaded:', fallbackPrices.length, 'records');
    } finally {
      setIsLoadingPrices(false);
    }
  };

    const fetchAllPrices = async () => {
      try {
        setIsLoadingPrices(true);
        const response = await api.get('/credits/prices/filter', {
          params: { limit, offset: (page - 1) * limit },
        });
        setAllPrices((prev) => {
          const newPrices = [...prev, ...response.data];
          const uniqueServices = new Set(newPrices.map((item) => item.country)); // Use country for services
          const uniqueCountries = new Set(newPrices.map((item) => item.service)); // Use service for country IDs
          console.log(`Page ${page} loaded: ${response.data.length} records, total: ${newPrices.length}, unique services: ${uniqueServices.size}, unique countries: ${uniqueCountries.size}`);
          return newPrices;
        });
        setHasMore(response.data.length === limit);
      } catch (error) {
        console.error('Error fetching all prices:', error);
        toast.error('Falha ao carregar preços dos serviços', {
          style: {
            background: 'oklch(0.6368 0.2078 25.3313)',
            color: 'oklch(1.0000 0 0)',
            border: 'none',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          },
        });
      } finally {
        setIsLoadingPrices(false);
      }
    };

    fetchUserData();
    fetchPopularPrices();
    fetchAllPrices();
  }, [user, router, setUser, page]);

  const loadMore = () => {
    setPage((prev) => prev + 1);
  };

  const copyToClipboard = () => {
    if (user?.affiliateLink) {
      navigator.clipboard.writeText(user.affiliateLink);
      toast.success('Link de afiliado copiado para a área de transferência', {
        style: {
          background: 'oklch(0.6171 0.1375 39.0427)',
          color: 'oklch(1.0000 0 0)',
          border: 'none',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        },
      });
    }
  };

  const handlePurchase = async (service: string, countryId: string) => {
    if (!user) return;
    try {
      const response = await api.post(
        '/sms/buy',
        { service, country: countryId },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      const { balance } = response.data;
      setUser({ ...user, balance });
      toast.success('Compra realizada com sucesso', {
        style: {
          background: 'oklch(0.6171 0.1375 39.0427)',
          color: 'oklch(1.0000 0 0)',
          border: 'none',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        },
      });
    } catch (error) {
      console.error('Purchase error:', error);
      toast.error('Falha ao realizar a compra', {
        style: {
          background: 'oklch(0.6368 0.2078 25.3313)',
          color: 'oklch(1.0000 0 0)',
          border: 'none',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        },
      });
    }
  };

  const allServices = Array.from(
    new Set(
      allPrices
        .map((item) => item.country) // Use country field for service codes
        .filter((service) => service && !POPULAR_SERVICES.includes(service))
    )
  ).sort();

  if (!user) return null;

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-br from-secondary-100 to-secondary-foreground-100">
      <Navbar />
      <div className="container mx-auto py-8 font-custom-bold">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Saldo da Conta</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-md text-foreground font-semibold">{user.balance.toFixed(2)} Créditos</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Saldo de Afiliado</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-md text-foreground font-semibold">{user.affiliateBalance?.toFixed(2) || '0.00'} BRL</p>
            </CardContent>
          </Card>
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Seu Link de Afiliado</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingLink ? (
                <p className='font-semibold text-xl'>Carregando...</p>
              ) : user.affiliateLink ? (
                <div className="flex items-center space-x-4 text-foreground">
                  <Input value={user.affiliateLink} readOnly className="flex-1" />
                  <Button onClick={copyToClipboard} variant="outline">
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar
                  </Button>
                </div>
              ) : (
                <p>Nenhum link de afiliado disponível</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              Serviços Populares
              <span className="ml-2 bg-primary text-white text-xs font-semibold px-2 py-1 rounded">Mais Usados</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingPrices ? (
              <p>Carregando serviços populares...</p>
            ) : popularPrices.length > 0 ? (
              <ServiceList
                services={POPULAR_SERVICES}
                prices={popularPrices}
                userBalance={user.balance}
                handlePurchase={handlePurchase}
                countryMap={countryMap}
              />
            ) : (
              <p className='font-semibold text-sm text-foreground '>Nenhum serviço popular disponível</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Todos os Serviços</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingPrices ? (
              <p>Carregando serviços...</p>
            ) : allServices.length > 0 ? (
              <>
                <ServiceList
                  services={allServices}
                  prices={allPrices}
                  userBalance={user.balance}
                  handlePurchase={handlePurchase}
                  countryMap={countryMap}
                />

              </>
            ) : (
              <p className='font-semibold text-sm text-foreground '>Nenhum serviço disponível. Tente atualizar os preços.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}