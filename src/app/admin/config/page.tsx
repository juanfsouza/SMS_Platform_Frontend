"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import api from '@/lib/api';
import { toast, Toaster } from 'sonner';
import Navbar from '@/components/Navbar';
import { 
  RefreshCw, 
  Users, 
  CreditCard, 
  UserPlus, 
  Settings, 
  Percent,
  DollarSign,
  Banknote,
  TrendingUp,
  Wallet,
  RotateCcw,
  Check,
  X,
  AlertCircle,
  Info
} from 'lucide-react';
import { motion } from 'framer-motion';
import { debounce } from 'lodash';

// Definição do tipo Price
interface Price {
  service: string;
  country: string;
  priceBrl: number;
  priceUsd: number;
}

// Definição do tipo User
interface User {
  id: number;
  email: string;
  name: string;
  balance: number;
  affiliateBalance: number;
  createdAt: string;
  updatedAt: string;
}

// Definição do tipo WithdrawalRequest
interface WithdrawalRequest {
  id: number;
  userId: number;
  amount: number;
  pixKey: string;
  status: 'PENDING' | 'APPROVED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    email: string;
    name: string;
    pixKey: string;
  };
}

// Estado centralizado de loading
interface LoadingState {
  initial: boolean;
  users: boolean;
  markup: boolean;
  prices: boolean;
  withdrawals: boolean;
  commission: boolean;
}

// Componente UserRow otimizado
const UserRow = ({ userData, onBalanceUpdate }: { userData: User, onBalanceUpdate: (userId: number) => void }) => {
  const { user } = useAuthStore();
  const [localInputs, setLocalInputs] = useState({ add: '', update: '' });
  const [isUpdating, setIsUpdating] = useState(false);

  const debouncedInputChange = useCallback(
    debounce((type: 'add' | 'update', value: string) => {
      setLocalInputs(prev => ({ ...prev, [type]: value }));
    }, 200),
    []
  );

  const handleAddBalance = useCallback(async () => {
    const amount = parseFloat(localInputs.add || '0');
    if (!user?.token || !amount || amount <= 0 || isUpdating) return;

    setIsUpdating(true);
    try {
      await api.post('/users/balance', { userId: userData.id, amount }, { 
        headers: { Authorization: `Bearer ${user.token}` } 
      });
      toast.success('Saldo adicionado com sucesso');
      setLocalInputs(prev => ({ ...prev, add: '' }));
      onBalanceUpdate(userData.id);
    } catch {
      toast.error('Falha ao adicionar saldo');
    } finally {
      setIsUpdating(false);
    }
  }, [localInputs.add, user?.token, userData.id, isUpdating, onBalanceUpdate]);

  const handleUpdateBalance = useCallback(async () => {
    const balance = parseFloat(localInputs.update || '0');
    if (!user?.token || balance < 0 || isUpdating) return;

    setIsUpdating(true);
    try {
      await api.patch('/users/balance', { userId: userData.id, balance }, { 
        headers: { Authorization: `Bearer ${user.token}` } 
      });
      toast.success('Saldo atualizado com sucesso');
      setLocalInputs(prev => ({ ...prev, update: '' }));
      onBalanceUpdate(userData.id);
    } catch {
      toast.error('Falha ao atualizar saldo');
    } finally {
      setIsUpdating(false);
    }
  }, [localInputs.update, user?.token, userData.id, isUpdating, onBalanceUpdate]);

  const handleResetBalance = useCallback(async () => {
    if (!user?.token || isUpdating) return;
    
    setIsUpdating(true);
    try {
      await api.delete('/users/balance', { 
        data: { userId: userData.id }, 
        headers: { Authorization: `Bearer ${user.token}` } 
      });
      toast.success('Saldo resetado com sucesso');
      onBalanceUpdate(userData.id);
    } catch {
      toast.error('Falha ao resetar saldo');
    } finally {
      setIsUpdating(false);
    }
  }, [user?.token, userData.id, isUpdating, onBalanceUpdate]);

  return (
    <TableRow className="border-border/50 hover:bg-muted/50">
      <TableCell className="font-mono text-sm">{userData.id}</TableCell>
      <TableCell className="text-sm">{userData.email}</TableCell>
      <TableCell className="font-medium">{userData.name}</TableCell>
      <TableCell>
        <Badge variant="secondary" className="font-mono">
          {userData.balance} créditos
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="font-mono">
          R$ {userData.affiliateBalance.toFixed(2)}
        </Badge>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {new Date(userData.createdAt).toLocaleDateString('pt-BR')}
      </TableCell>
      <TableCell>
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Adicionar"
              value={localInputs.add}
              onChange={(e) => debouncedInputChange('add', e.target.value)}
              className="w-20 h-8 text-xs"
              disabled={isUpdating}
            />
            <Button 
              onClick={handleAddBalance} 
              size="sm"
              className="bg-primary hover:bg-primary/90 h-8 px-2"
              disabled={isUpdating}
            >
              <DollarSign className="w-3 h-3" />
            </Button>
          </div>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Definir"
              value={localInputs.update}
              onChange={(e) => debouncedInputChange('update', e.target.value)}
              className="w-20 h-8 text-xs"
              disabled={isUpdating}
            />
            <Button 
              onClick={handleUpdateBalance} 
              size="sm" 
              variant="outline"
              className="h-8 px-2"
              disabled={isUpdating}
            >
              <TrendingUp className="w-3 h-3" />
            </Button>
          </div>
          <Button 
            onClick={handleResetBalance} 
            size="sm" 
            variant="destructive"
            className="h-8"
            disabled={isUpdating}
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            Reset
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

// Componente PriceRow otimizado
const PriceRow = ({ price, onPriceUpdate }: { price: Price, onPriceUpdate: () => void }) => {
  const { user } = useAuthStore();
  const [localInputs, setLocalInputs] = useState({ priceBrl: '', priceUsd: '' });
  const [isUpdating, setIsUpdating] = useState(false);

  const debouncedInputChange = useCallback(
    debounce((type: 'priceBrl' | 'priceUsd', value: string) => {
      setLocalInputs(prev => ({ ...prev, [type]: value }));
    }, 200),
    []
  );

  const handleUpdateSinglePrice = useCallback(async () => {
    const priceBrl = parseFloat(localInputs.priceBrl || '0');
    const priceUsd = parseFloat(localInputs.priceUsd || '0');
    
    if (!user?.token || priceBrl <= 0 || priceUsd <= 0 || isUpdating) return;

    setIsUpdating(true);
    try {
      await api.post('/credits/update-single-price', {
        service: price.service,
        country: price.country,
        priceBrl,
        priceUsd
      }, { headers: { Authorization: `Bearer ${user.token}` } });
      
      toast.success('Preço atualizado com sucesso');
      setLocalInputs({ priceBrl: '', priceUsd: '' });
      onPriceUpdate();
    } catch {
      toast.error('Falha ao atualizar preço');
    } finally {
      setIsUpdating(false);
    }
  }, [localInputs, user?.token, price, isUpdating, onPriceUpdate]);

  return (
    <TableRow className="border-border/50 hover:bg-muted/50">
      <TableCell className="font-medium">{price.service}</TableCell>
      <TableCell>{price.country}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="font-mono">
            R$ {price.priceBrl.toFixed(2)}
          </Badge>
          <Input
            type="number"
            placeholder="Novo valor BRL"
            value={localInputs.priceBrl}
            onChange={(e) => debouncedInputChange('priceBrl', e.target.value)}
            className="w-24 h-6 text-xs"
            step="0.01"
            disabled={isUpdating}
          />
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono">
            $ {price.priceUsd.toFixed(2)}
          </Badge>
          <div className="flex items-center gap-1">
            <Input
              type="number"
              placeholder="Novo valor USD"
              value={localInputs.priceUsd}
              onChange={(e) => debouncedInputChange('priceUsd', e.target.value)}
              className="w-24 h-6 text-xs"
              step="0.01"
              disabled={isUpdating}
            />
            <Button 
              onClick={handleUpdateSinglePrice}
              size="sm"
              className="h-6 px-2 bg-blue-600 hover:bg-blue-700"
              disabled={isUpdating}
            >
              <TrendingUp className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default function AdminConfigPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [markup, setMarkup] = useState(0);
  const [prices, setPrices] = useState<Price[]>([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [affiliateCommission, setAffiliateCommission] = useState(0);
  const [loading, setLoading] = useState<LoadingState>({
    initial: true,
    users: false,
    markup: false,
    prices: false,
    withdrawals: false,
    commission: false
  });

  // Carregamento inicial otimizado
  const fetchInitialData = useCallback(async () => {
    if (!user?.token) return;

    setLoading(prev => ({ ...prev, initial: true }));
    
    try {
      // Carrega apenas dados essenciais primeiro
      const [markupResponse, commissionResponse] = await Promise.all([
        api.get('/credits/markup', { headers: { Authorization: `Bearer ${user.token}` } }),
        api.get('/affiliate/commission', { headers: { Authorization: `Bearer ${user.token}` } })
      ]);

      setMarkup(markupResponse.data.percentage);
      setAffiliateCommission(commissionResponse.data.percentage);
    } catch {
      toast.error('Falha ao carregar configurações iniciais');
    } finally {
      setLoading(prev => ({ ...prev, initial: false }));
    }
  }, [user?.token]);

  // Carregamento lazy por aba
  const loadUsersData = useCallback(async () => {
    if (!user?.token || loading.users) return;

    setLoading(prev => ({ ...prev, users: true }));
    try {
      const usersResponse = await api.get('/users', { 
        headers: { Authorization: `Bearer ${user.token}` } 
      });
      setUsers(usersResponse.data);
    } catch {
      toast.error('Falha ao carregar usuários');
    } finally {
      setLoading(prev => ({ ...prev, users: false }));
    }
  }, [user?.token, loading.users]);

  const loadPricesData = useCallback(async () => {
    if (!user?.token || loading.prices) return;

    setLoading(prev => ({ ...prev, prices: true }));
    try {
      const pricesResponse = await api.get('/credits/prices', { 
        headers: { Authorization: `Bearer ${user.token}` }, 
        params: { limit: 20, offset: 0 } 
      });
      setPrices(pricesResponse.data);
    } catch {
      toast.error('Falha ao carregar preços');
    } finally {
      setLoading(prev => ({ ...prev, prices: false }));
    }
  }, [user?.token, loading.prices]);

  const loadWithdrawalsData = useCallback(async () => {
    if (!user?.token || loading.withdrawals) return;

    setLoading(prev => ({ ...prev, withdrawals: true }));
    try {
      const withdrawalsResponse = await api.get('/affiliate/withdrawals', { 
        headers: { Authorization: `Bearer ${user.token}` } 
      });
      setWithdrawalRequests(withdrawalsResponse.data);
    } catch {
      toast.error('Falha ao carregar solicitações de saque');
    } finally {
      setLoading(prev => ({ ...prev, withdrawals: false }));
    }
  }, [user?.token, loading.withdrawals]);

  // Handlers otimizados com debounce
  const debouncedMarkupUpdate = useCallback(
    debounce(async (newMarkup: number) => {
      if (!user?.token) return;
      
      setLoading(prev => ({ ...prev, markup: true }));
      try {
        await api.post('/credits/update-markup', { percentage: newMarkup }, { 
          headers: { Authorization: `Bearer ${user.token}` } 
        });
        toast.success('Markup atualizado com sucesso');
      } catch {
        toast.error('Falha ao atualizar markup');
      } finally {
        setLoading(prev => ({ ...prev, markup: false }));
      }
    }, 1000),
    [user?.token]
  );

  const debouncedCommissionUpdate = useCallback(
    debounce(async (newCommission: number) => {
      if (!user?.token) return;
      
      setLoading(prev => ({ ...prev, commission: true }));
      try {
        await api.post('/affiliate/commission', { percentage: newCommission }, { 
          headers: { Authorization: `Bearer ${user.token}` } 
        });
        toast.success('Comissão de afiliado atualizada com sucesso');
      } catch {
        toast.error('Falha ao atualizar comissão de afiliado');
      } finally {
        setLoading(prev => ({ ...prev, commission: false }));
      }
    }, 1000),
    [user?.token]
  );

  const handleRefreshPrices = useCallback(async () => {
    if (!user?.token || loading.prices) return;
    
    setLoading(prev => ({ ...prev, prices: true }));
    try {
      await api.post('/credits/refresh-prices', {}, { 
        headers: { Authorization: `Bearer ${user.token}` } 
      });
      await loadPricesData();
      toast.success('Preços atualizados com sucesso');
    } catch {
      toast.error('Falha ao atualizar preços');
    } finally {
      setLoading(prev => ({ ...prev, prices: false }));
    }
  }, [user?.token, loading.prices, loadPricesData]);

  const handleUpdateWithdrawalStatus = useCallback(async (withdrawalId: number, status: 'APPROVED' | 'CANCELLED') => {
    if (!user?.token) return;
    
    try {
      await api.patch(`/affiliate/withdrawals/${withdrawalId}`, { status }, { 
        headers: { Authorization: `Bearer ${user.token}` } 
      });
      
      const statusText = status === 'APPROVED' ? 'aprovada' : 'cancelada';
      toast.success(`Solicitação de saque ${statusText} com sucesso`);
      
      // Atualiza apenas o item específico
      setWithdrawalRequests(prev => 
        prev.map(request => 
          request.id === withdrawalId ? { ...request, status } : request
        )
      );
    } catch {
      toast.error('Falha ao atualizar status da solicitação');
    }
  }, [user?.token]);

  // Callbacks para atualizar dados específicos
  const handleUserBalanceUpdate = useCallback(() => {
    loadUsersData();
  }, [loadUsersData]);

  const handlePriceUpdate = useCallback(() => {
    loadPricesData();
  }, [loadPricesData]);

  // Utilitários memoizados
  const getStatusBadgeVariant = useMemo(() => (status: string) => {
    switch (status) {
      case 'PENDING': return 'outline';
      case 'APPROVED': return 'default';
      case 'CANCELLED': return 'destructive';
      default: return 'outline';
    }
  }, []);

  const getStatusText = useMemo(() => (status: string) => {
    switch (status) {
      case 'PENDING': return 'Pendente';
      case 'APPROVED': return 'Aprovado';
      case 'CANCELLED': return 'Cancelado';
      default: return status;
    }
  }, []);

  // Effects
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/');
      return;
    }
    
    fetchInitialData();
  }, [user, router, fetchInitialData]);

  // Componente de Loading otimizado
  if (loading.initial) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary/30 via-background to-primary/10">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
        />
        <span className="ml-3 font-custom-bold text-lg">Carregando configurações...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary/30 via-background to-primary/10 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto py-8">
        <Navbar />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-8"
        >
          {/* Header */}
          <div className="flex items-center gap-4 mb-8 mt-20">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg">
              <Settings className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-custom-bold text-foreground">Painel Administrativo</h1>
              <p className="text-muted-foreground">Gerencie usuários, preços e configurações do sistema</p>
            </div>
          </div>

          <Tabs 
            defaultValue="users" 
            className="w-full"
            onValueChange={(value) => {
              if (value === 'users' && users.length === 0) loadUsersData();
              if (value === 'credits' && prices.length === 0) loadPricesData();
              if (value === 'affiliate' && withdrawalRequests.length === 0) loadWithdrawalsData();
            }}
          >
            <TabsList className="grid w-full grid-cols-3 mb-8 bg-card/80 backdrop-blur-lg border-0 shadow-lg">
              <TabsTrigger value="users" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium">
                <Users className="w-4 h-4 mr-2" />
                Usuários
              </TabsTrigger>
              <TabsTrigger value="credits" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium">
                <CreditCard className="w-4 h-4 mr-2" />
                Créditos
              </TabsTrigger>
              <TabsTrigger value="affiliate" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium">
                <UserPlus className="w-4 h-4 mr-2" />
                Afiliados
              </TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="space-y-6">
              <Card className="shadow-xl border-0 bg-card/80 backdrop-blur-lg">
                <CardHeader className="pb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary" />
                        Gerenciamento de Usuários
                      </CardTitle>
                      <CardDescription>
                        Visualize e gerencie os saldos dos usuários cadastrados no sistema
                      </CardDescription>
                    </div>
                    <Button 
                      onClick={loadUsersData} 
                      variant="outline" 
                      size="sm"
                      disabled={loading.users}
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 ${loading.users ? 'animate-spin' : ''}`} />
                      Atualizar
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading.users ? (
                    <div className="flex items-center justify-center py-12">
                      <RefreshCw className="w-6 h-6 animate-spin text-primary mr-2" />
                      <span>Carregando usuários...</span>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-border/50">
                            <TableHead>ID</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Nome</TableHead>
                            <TableHead>Créditos</TableHead>
                            <TableHead>Saldo Afiliado</TableHead>
                            <TableHead>Criado em</TableHead>
                            <TableHead>Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {users.map((userData) => (
                            <UserRow 
                              key={userData.id} 
                              userData={userData} 
                              onBalanceUpdate={handleUserBalanceUpdate}
                            />
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                  {!loading.users && users.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground flex flex-col items-center gap-2">
                      <AlertCircle className="w-8 h-8 text-muted-foreground/50" />
                      <p>Nenhum usuário encontrado</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="credits" className="space-y-6">
              {/* Configuração de Markup */}
              <Card className="shadow-xl border-0 bg-card/80 backdrop-blur-lg">
                <CardHeader className="pb-6">
                  <CardTitle className="flex items-center gap-2">
                    <Percent className="w-5 h-5 text-primary" />
                    Configuração de Markup
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-blue-500" />
                    Define a margem de lucro aplicada sobre os preços base em porcentagem (%)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 max-w-xs">
                      <Label htmlFor="markup" className="text-sm font-medium mb-2 block">
                        Markup (%)
                      </Label>
                      <div className="relative">
                        <Input
                          id="markup"
                          type="number"
                          value={markup}
                          onChange={(e) => {
                            const newValue = parseFloat(e.target.value);
                            setMarkup(newValue);
                            debouncedMarkupUpdate(newValue);
                          }}
                          placeholder="Ex: 15"
                          className="pl-8 h-12 bg-background/50 border-border/50 focus:border-primary"
                          step="0.1"
                          min="0"
                          disabled={loading.markup}
                        />
                        <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                    <Button 
                      onClick={handleRefreshPrices} 
                      variant="outline" 
                      className="h-12 px-6 mt-6 border-border/50 hover:bg-primary hover:text-primary-foreground"
                      disabled={loading.prices}
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 ${loading.prices ? 'animate-spin' : ''}`} />
                      Atualizar Preços
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Tabela de Preços */}
              <Card className="shadow-xl border-0 bg-card/80 backdrop-blur-lg">
                <CardHeader className="pb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Banknote className="w-5 h-5 text-primary" />
                        Tabela de Preços
                      </CardTitle>
                      <CardDescription>
                        Preços atuais dos serviços por país com markup aplicado
                      </CardDescription>
                    </div>
                    <Button 
                      onClick={loadPricesData} 
                      variant="outline" 
                      size="sm"
                      disabled={loading.prices}
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 ${loading.prices ? 'animate-spin' : ''}`} />
                      Recarregar
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading.prices ? (
                    <div className="flex items-center justify-center py-12">
                      <RefreshCw className="w-6 h-6 animate-spin text-primary mr-2" />
                      <span>Carregando preços...</span>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-border/50">
                            <TableHead>Serviço</TableHead>
                            <TableHead>País</TableHead>
                            <TableHead>Preço (BRL)</TableHead>
                            <TableHead>Preço (USD)</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {prices.map((price, index) => (
                            <PriceRow 
                              key={`${price.service}-${price.country}-${index}`} 
                              price={price} 
                              onPriceUpdate={handlePriceUpdate}
                            />
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                  {!loading.prices && prices.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground flex flex-col items-center gap-2">
                      <AlertCircle className="w-8 h-8 text-muted-foreground/50" />
                      <p>Nenhum preço encontrado. Tente atualizar os preços.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="affiliate" className="space-y-6">
              {/* Configuração de Comissão de Afiliados */}
              <Card className="shadow-xl border-0 bg-card/80 backdrop-blur-lg">
                <CardHeader className="pb-6">
                  <CardTitle className="flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-primary" />
                    Configuração de Comissão de Afiliados
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-blue-500" />
                    Define a porcentagem de comissão para o programa de afiliados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 max-w-xs">
                      <Label htmlFor="affiliateCommission" className="text-sm font-medium mb-2 block">
                        Comissão (%)
                      </Label>
                      <div className="relative">
                        <Input
                          id="affiliateCommission"
                          type="number"
                          value={affiliateCommission}
                          onChange={(e) => {
                            const newValue = parseFloat(e.target.value);
                            setAffiliateCommission(newValue);
                            debouncedCommissionUpdate(newValue);
                          }}
                          placeholder="Ex: 10"
                          className="pl-8 h-12 bg-background/50 border-border/50 focus:border-primary"
                          step="0.1"
                          min="0"
                          disabled={loading.commission}
                        />
                        <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                    <Button 
                      onClick={loadWithdrawalsData} 
                      variant="outline" 
                      className="h-12 px-6 border-border/50 mt-6 hover:bg-primary hover:text-primary-foreground"
                      disabled={loading.withdrawals}
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 ${loading.withdrawals ? 'animate-spin' : ''}`} />
                      Atualizar Solicitações
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Tabela de Solicitações de Saque */}
              <Card className="shadow-xl border-0 bg-card/80 backdrop-blur-lg">
                <CardHeader className="pb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Wallet className="w-5 h-5 text-primary" />
                        Solicitações de Saque
                      </CardTitle>
                      <CardDescription>
                        Gerencie as solicitações de saque do programa de afiliados
                      </CardDescription>
                    </div>
                    <Button 
                      onClick={loadWithdrawalsData} 
                      variant="outline" 
                      size="sm"
                      disabled={loading.withdrawals}
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 ${loading.withdrawals ? 'animate-spin' : ''}`} />
                      Recarregar
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading.withdrawals ? (
                    <div className="flex items-center justify-center py-12">
                      <RefreshCw className="w-6 h-6 animate-spin text-primary mr-2" />
                      <span>Carregando solicitações...</span>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-border/50">
                            <TableHead>ID</TableHead>
                            <TableHead>Usuário</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Valor (R$)</TableHead>
                            <TableHead>Chave PIX</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Data</TableHead>
                            <TableHead>Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {withdrawalRequests.map((request) => (
                            <TableRow key={request.id} className="border-border/50 hover:bg-muted/50">
                              <TableCell className="font-mono text-sm">{request.id}</TableCell>
                              <TableCell className="font-medium">{request.user.name}</TableCell>
                              <TableCell className="text-sm">{request.user.email}</TableCell>
                              <TableCell>
                                <Badge variant="secondary" className="font-mono">
                                  R$ {request.amount.toFixed(2)}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm">{request.pixKey}</TableCell>
                              <TableCell>
                                <Badge variant={getStatusBadgeVariant(request.status)}>
                                  {getStatusText(request.status)}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {new Date(request.createdAt).toLocaleDateString('pt-BR')}
                              </TableCell>
                              <TableCell>
                                {request.status === 'PENDING' ? (
                                  <div className="flex gap-2">
                                    <Button 
                                      onClick={() => handleUpdateWithdrawalStatus(request.id, 'APPROVED')}
                                      size="sm"
                                      className="bg-green-600 hover:bg-green-700 h-8 px-3"
                                    >
                                      <Check className="w-3 h-3 mr-1" />
                                      Aprovar
                                    </Button>
                                    <Button 
                                      onClick={() => handleUpdateWithdrawalStatus(request.id, 'CANCELLED')}
                                      size="sm"
                                      variant="destructive"
                                      className="h-8 px-3"
                                    >
                                      <X className="w-3 h-3 mr-1" />
                                      Cancelar
                                    </Button>
                                  </div>
                                ) : (
                                  <Badge variant="outline" className="text-muted-foreground">
                                    {request.status === 'APPROVED' ? (
                                      <>
                                        <Check className="w-3 h-3 mr-1" />
                                        Processado
                                      </>
                                    ) : (
                                      <>
                                        <X className="w-3 h-3 mr-1" />
                                        Cancelado
                                      </>
                                    )}
                                  </Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                  {!loading.withdrawals && withdrawalRequests.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground flex flex-col items-center gap-2">
                      <AlertCircle className="w-8 h-8 text-muted-foreground/50" />
                      <p>Nenhuma solicitação de saque encontrada</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
      <Toaster />
    </div>
  );
}