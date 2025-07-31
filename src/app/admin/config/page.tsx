"use client";

import { useState, useEffect } from 'react';
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

export default function AdminConfigPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [markup, setMarkup] = useState(0);
  const [prices, setPrices] = useState<Price[]>([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [affiliateCommission, setAffiliateCommission] = useState(0);
  const [balanceInputs, setBalanceInputs] = useState<{[key: number]: {add: string, update: string}}>({});
  const limit = 10;

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/');
      return;
    }

    const fetchData = async () => {
      try {
        const [usersResponse, markupResponse, pricesResponse, withdrawalsResponse, commissionResponse] = await Promise.all([
          api.get('/users', { headers: { Authorization: `Bearer ${user.token}` } }),
          api.get('/credits/markup', { headers: { Authorization: `Bearer ${user.token}` } }),
          api.get('/credits/prices', { headers: { Authorization: `Bearer ${user.token}` }, params: { limit, offset: 0 } }),
          api.get('/affiliate/withdrawals', { headers: { Authorization: `Bearer ${user.token}` } }),
          api.get('/affiliate/commission', { headers: { Authorization: `Bearer ${user.token}` } }),
        ]);
        setUsers(usersResponse.data);
        setMarkup(markupResponse.data.percentage);
        setPrices(pricesResponse.data);
        setWithdrawalRequests(withdrawalsResponse.data);
        setAffiliateCommission(commissionResponse.data.percentage);
        setLoading(false);
      } catch {
        toast.error('Falha ao carregar dados de configuração', {
          style: {
            background: 'oklch(0.6368 0.2078 25.3313)',
            color: 'oklch(1.0000 0 0)',
            border: 'none',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          },
          duration: 3000,
          position: 'top-right',
        });
      }
    };

    fetchData();
  }, [user, router]);

  const handleUpdateMarkup = async () => {
    if (!user?.token) return;
    try {
      await api.post('/credits/update-markup', { percentage: markup }, { headers: { Authorization: `Bearer ${user.token}` } });
      toast.success('Markup atualizado com sucesso', {
        style: {
          background: 'oklch(0.6171 0.1375 39.0427)',
          color: 'oklch(1.0000 0 0)',
          border: 'none',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        },
        duration: 3000,
        position: 'top-right',
      });
    } catch {
      toast.error('Falha ao atualizar markup', {
        style: {
          background: 'oklch(0.6368 0.2078 25.3313)',
          color: 'oklch(1.0000 0 0)',
          border: 'none',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        },
        duration: 3000,
        position: 'top-right',
      });
    }
  };

  const handleUpdateAffiliateCommission = async () => {
    if (!user?.token) return;
    try {
      await api.post('/affiliate/commission', { percentage: affiliateCommission }, { headers: { Authorization: `Bearer ${user.token}` } });
      toast.success('Comissão de afiliado atualizada com sucesso', {
        style: {
          background: 'oklch(0.6171 0.1375 39.0427)',
          color: 'oklch(1.0000 0 0)',
          border: 'none',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        },
        duration: 3000,
        position: 'top-right',
      });
    } catch {
      toast.error('Falha ao atualizar comissão de afiliado', {
        style: {
          background: 'oklch(0.6368 0.2078 25.3313)',
          color: 'oklch(1.0000 0 0)',
          border: 'none',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        },
        duration: 3000,
        position: 'top-right',
      });
    }
  };

  const handleRefreshPrices = async () => {
    if (!user?.token) return;
    try {
      await api.post('/credits/refresh-prices', {}, { headers: { Authorization: `Bearer ${user.token}` } });
      const pricesResponse = await api.get('/credits/prices', { headers: { Authorization: `Bearer ${user.token}` }, params: { limit, offset: 0 } });
      setPrices(pricesResponse.data);
      toast.success('Preços atualizados com sucesso', {
        style: {
          background: 'oklch(0.6171 0.1375 39.0427)',
          color: 'oklch(1.0000 0 0)',
          border: 'none',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        },
        duration: 3000,
        position: 'top-right',
      });
    } catch {
      toast.error('Falha ao atualizar preços', {
        style: {
          background: 'oklch(0.6368 0.2078 25.3313)',
          color: 'oklch(1.0000 0 0)',
          border: 'none',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        },
        duration: 3000,
        position: 'top-right',
      });
    }
  };

  const handleAddBalance = async (userId: number) => {
    const amount = parseFloat(balanceInputs[userId]?.add || '0');
    if (!user?.token || !amount || amount <= 0) {
      toast.error('Por favor, insira um valor válido para adicionar', {
        style: {
          background: 'oklch(0.6368 0.2078 25.3313)',
          color: 'oklch(1.0000 0 0)',
          border: 'none',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        },
        duration: 3000,
        position: 'top-right',
      });
      return;
    }
    
    try {
      await api.post('/users/balance', { userId, amount }, { headers: { Authorization: `Bearer ${user.token}` } });
      toast.success('Saldo adicionado com sucesso', {
        style: {
          background: 'oklch(0.6171 0.1375 39.0427)',
          color: 'oklch(1.0000 0 0)',
          border: 'none',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        },
        duration: 3000,
        position: 'top-right',
      });
      const updatedUsers = await api.get('/users', { headers: { Authorization: `Bearer ${user.token}` } });
      setUsers(updatedUsers.data);
      setBalanceInputs(prev => ({
        ...prev,
        [userId]: { ...prev[userId], add: '' }
      }));
    } catch {
      toast.error('Falha ao adicionar saldo', {
        style: {
          background: 'oklch(0.6368 0.2078 25.3313)',
          color: 'oklch(1.0000 0 0)',
          border: 'none',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        },
        duration: 3000,
        position: 'top-right',
      });
    }
  };

  const handleUpdateBalance = async (userId: number) => {
    const balance = parseFloat(balanceInputs[userId]?.update || '0');
    if (!user?.token || balance < 0) {
      toast.error('Por favor, insira um valor válido para atualizar', {
        style: {
          background: 'oklch(0.6368 0.2078 25.3313)',
          color: 'oklch(1.0000 0 0)',
          border: 'none',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        },
        duration: 3000,
        position: 'top-right',
      });
      return;
    }
    
    try {
      await api.patch('/users/balance', { userId, balance }, { headers: { Authorization: `Bearer ${user.token}` } });
      toast.success('Saldo atualizado com sucesso', {
        style: {
          background: 'oklch(0.6171 0.1375 39.0427)',
          color: 'oklch(1.0000 0 0)',
          border: 'none',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        },
        duration: 3000,
        position: 'top-right',
      });
      const updatedUsers = await api.get('/users', { headers: { Authorization: `Bearer ${user.token}` } });
      setUsers(updatedUsers.data);
      setBalanceInputs(prev => ({
        ...prev,
        [userId]: { ...prev[userId], update: '' }
      }));
    } catch {
      toast.error('Falha ao atualizar saldo', {
        style: {
          background: 'oklch(0.6368 0.2078 25.3313)',
          color: 'oklch(1.0000 0 0)',
          border: 'none',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        },
        duration: 3000,
        position: 'top-right',
      });
    }
  };

  const handleResetBalance = async (userId: number) => {
    if (!user?.token) return;
    try {
      await api.delete('/users/balance', { data: { userId }, headers: { Authorization: `Bearer ${user.token}` } });
      toast.success('Saldo resetado com sucesso', {
        style: {
          background: 'oklch(0.6171 0.1375 39.0427)',
          color: 'oklch(1.0000 0 0)',
          border: 'none',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        },
        duration: 3000,
        position: 'top-right',
      });
      const updatedUsers = await api.get('/users', { headers: { Authorization: `Bearer ${user.token}` } });
      setUsers(updatedUsers.data);
    } catch {
      toast.error('Falha ao resetar saldo', {
        style: {
          background: 'oklch(0.6368 0.2078 25.3313)',
          color: 'oklch(1.0000 0 0)',
          border: 'none',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        },
        duration: 3000,
        position: 'top-right',
      });
    }
  };

  const handleRefreshWithdrawals = async () => {
    if (!user?.token) return;
    try {
      const withdrawalsResponse = await api.get('/affiliate/withdrawals', { headers: { Authorization: `Bearer ${user.token}` } });
      setWithdrawalRequests(withdrawalsResponse.data);
      toast.success('Solicitações de saque atualizadas com sucesso', {
        style: {
          background: 'oklch(0.6171 0.1375 39.0427)',
          color: 'oklch(1.0000 0 0)',
          border: 'none',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        },
        duration: 3000,
        position: 'top-right',
      });
    } catch {
      toast.error('Falha ao atualizar solicitações de saque', {
        style: {
          background: 'oklch(0.6368 0.2078 25.3313)',
          color: 'oklch(1.0000 0 0)',
          border: 'none',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        },
        duration: 3000,
        position: 'top-right',
      });
    }
  };

  const handleUpdateWithdrawalStatus = async (withdrawalId: number, status: 'APPROVED' | 'CANCELLED') => {
    if (!user?.token) return;
    try {
      await api.patch(`/affiliate/withdrawals/${withdrawalId}`, { status }, { headers: { Authorization: `Bearer ${user.token}` } });
      
      const statusText = status === 'APPROVED' ? 'aprovada' : 'cancelada';
      toast.success(`Solicitação de saque ${statusText} com sucesso`, {
        style: {
          background: 'oklch(0.6171 0.1375 39.0427)',
          color: 'oklch(1.0000 0 0)',
          border: 'none',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        },
        duration: 3000,
        position: 'top-right',
      });

      const withdrawalsResponse = await api.get('/affiliate/withdrawals', { headers: { Authorization: `Bearer ${user.token}` } });
      setWithdrawalRequests(withdrawalsResponse.data);
    } catch {
      toast.error('Falha ao atualizar status da solicitação', {
        style: {
          background: 'oklch(0.6368 0.2078 25.3313)',
          color: 'oklch(1.0000 0 0)',
          border: 'none',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        },
        duration: 3000,
        position: 'top-right',
      });
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'outline';
      case 'APPROVED':
        return 'default';
      case 'CANCELLED':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Pendente';
      case 'APPROVED':
        return 'Aprovado';
      case 'CANCELLED':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const updateBalanceInput = (userId: number, type: 'add' | 'update', value: string) => {
    setBalanceInputs(prev => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        [type]: value
      }
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary/30 via-background to-primary/10">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
        />
        <span className="ml-3 font-custom-bold text-lg">Carregando...</span>
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

          <Tabs defaultValue="users" className="w-full">
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
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Gerenciamento de Usuários
                  </CardTitle>
                  <CardDescription>
                    Visualize e gerencie os saldos dos usuários cadastrados no sistema
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-border/50">
                          <TableHead className="text-muted-foreground font-medium">ID</TableHead>
                          <TableHead className="text-muted-foreground font-medium">Email</TableHead>
                          <TableHead className="text-muted-foreground font-medium">Nome</TableHead>
                          <TableHead className="text-muted-foreground font-medium">Créditos</TableHead>
                          <TableHead className="text-muted-foreground font-medium">Saldo Afiliado</TableHead>
                          <TableHead className="text-muted-foreground font-medium">Criado em</TableHead>
                          <TableHead className="text-muted-foreground font-medium">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((userData: User) => (
                          <TableRow key={userData.id} className="border-border/50 hover:bg-muted/50">
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
                                    value={balanceInputs[userData.id]?.add || ''}
                                    onChange={(e) => updateBalanceInput(userData.id, 'add', e.target.value)}
                                    className="w-20 h-8 text-xs"
                                  />
                                  <Button 
                                    onClick={() => handleAddBalance(userData.id)} 
                                    size="sm"
                                    className="bg-primary hover:bg-primary/90 h-8 px-2"
                                  >
                                    <DollarSign className="w-3 h-3" />
                                  </Button>
                                </div>
                                <div className="flex gap-2">
                                  <Input
                                    type="number"
                                    placeholder="Definir"
                                    value={balanceInputs[userData.id]?.update || ''}
                                    onChange={(e) => updateBalanceInput(userData.id, 'update', e.target.value)}
                                    className="w-20 h-8 text-xs"
                                  />
                                  <Button 
                                    onClick={() => handleUpdateBalance(userData.id)} 
                                    size="sm" 
                                    variant="outline"
                                    className="h-8 px-2"
                                  >
                                    <TrendingUp className="w-3 h-3" />
                                  </Button>
                                </div>
                                <Button 
                                  onClick={() => handleResetBalance(userData.id)} 
                                  size="sm" 
                                  variant="destructive"
                                  className="h-8"
                                >
                                  <RotateCcw className="w-3 h-3 mr-1" />
                                  Reset
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {users.length === 0 && (
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
                          onChange={(e) => setMarkup(parseFloat(e.target.value))}
                          placeholder="Ex: 15"
                          className="pl-8 h-12 bg-background/50 border-border/50 focus:border-primary"
                          step="0.1"
                          min="0"
                        />
                        <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                    <Button 
                      onClick={handleUpdateMarkup} 
                      className="bg-gradient-to-r mt-6 from-primary to-primary/90 hover:from-primary/90 hover:to-primary h-12 px-6 font-semibold shadow-lg"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Atualizar Markup
                    </Button>
                    <Button 
                      onClick={handleRefreshPrices} 
                      variant="outline" 
                      className="h-12 px-6 mt-6 border-border/50 hover:bg-primary hover:text-primary-foreground"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Atualizar Preços
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Tabela de Preços */}
              <Card className="shadow-xl border-0 bg-card/80 backdrop-blur-lg">
                <CardHeader className="pb-6">
                  <CardTitle className="flex items-center gap-2">
                    <Banknote className="w-5 h-5 text-primary" />
                    Tabela de Preços
                  </CardTitle>
                  <CardDescription>
                    Preços atuais dos serviços por país com markup aplicado
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-border/50">
                          <TableHead className="text-muted-foreground font-medium">Serviço</TableHead>
                          <TableHead className="text-muted-foreground font-medium">País</TableHead>
                          <TableHead className="text-muted-foreground font-medium">Preço (BRL)</TableHead>
                          <TableHead className="text-muted-foreground font-medium">Preço (USD)</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {prices.map((price: Price, index: number) => (
                          <TableRow key={index} className="border-border/50 hover:bg-muted/50">
                            <TableCell className="font-medium">{price.service}</TableCell>
                            <TableCell>{price.country}</TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="font-mono">
                                R$ {price.priceBrl.toFixed(2)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="font-mono">
                                $ {price.priceUsd.toFixed(2)}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {prices.length === 0 && (
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
                          onChange={(e) => setAffiliateCommission(parseFloat(e.target.value))}
                          placeholder="Ex: 10"
                          className="pl-8 h-12 bg-background/50 border-border/50 focus:border-primary"
                          step="0.1"
                          min="0"
                        />
                        <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                    <Button 
                      onClick={handleUpdateAffiliateCommission} 
                      className="bg-gradient-to-r from-primary mt-6 to-primary/90 hover:from-primary/90 hover:to-primary h-12 px-6 font-semibold shadow-lg"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Atualizar Comissão
                    </Button>
                    <Button 
                      onClick={handleRefreshWithdrawals} 
                      variant="outline" 
                      className="h-12 px-6 border-border/50 mt-6 hover:bg-primary hover:text-primary-foreground"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Atualizar Solicitações
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Tabela de Solicitações de Saque */}
              <Card className="shadow-xl border-0 bg-card/80 backdrop-blur-lg">
                <CardHeader className="pb-6">
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-primary" />
                    Solicitações de Saque
                  </CardTitle>
                  <CardDescription>
                    Gerencie as solicitações de saque do programa de afiliados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-border/50">
                          <TableHead className="text-muted-foreground font-medium">ID</TableHead>
                          <TableHead className="text-muted-foreground font-medium">Usuário</TableHead>
                          <TableHead className="text-muted-foreground font-medium">Email</TableHead>
                          <TableHead className="text-muted-foreground font-medium">Valor (R$)</TableHead>
                          <TableHead className="text-muted-foreground font-medium">Chave PIX</TableHead>
                          <TableHead className="text-muted-foreground font-medium">Status</TableHead>
                          <TableHead className="text-muted-foreground font-medium">Data</TableHead>
                          <TableHead className="text-muted-foreground font-medium">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {withdrawalRequests.map((request: WithdrawalRequest) => (
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
                  {withdrawalRequests.length === 0 && (
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