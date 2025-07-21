'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import api from '@/lib/api';
import { toast, Toaster } from 'sonner';
import Navbar from '@/components/Navbar';

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

export default function AdminConfigPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [markup, setMarkup] = useState(0);
  const [prices, setPrices] = useState<Price[]>([]);
  const [loading, setLoading] = useState(true);
  const limit = 10;

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/');
      return;
    }

    const fetchData = async () => {
      try {
        const [usersResponse, markupResponse, pricesResponse] = await Promise.all([
          api.get('/users', { headers: { Authorization: `Bearer ${user.token}` } }),
          api.get('/credits/markup', { headers: { Authorization: `Bearer ${user.token}` } }),
          api.get('/credits/prices', { headers: { Authorization: `Bearer ${user.token}` }, params: { limit, offset: 0 } }), // Start from page 1
        ]);
        setUsers(usersResponse.data);
        setMarkup(markupResponse.data.percentage);
        setPrices(pricesResponse.data);
        setLoading(false);
      } catch {
        console.error('Error fetching data');
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

  const handleAddBalance = async (userId: number, amount: number) => {
    if (!user?.token) return;
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

  const handleUpdateBalance = async (userId: number, balance: number) => {
    if (!user?.token) return;
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

  if (loading) return <div className='font-custom-bold'>Carregando...</div>;

  return (
    <div className="container mx-auto py-8 min-h-screen flex flex-col ">
      <div className="container mx-auto mt-5 py-8">
      <Navbar />
      <h1 className="text-3xl font-bold mb-6">Configuração</h1>
      <Tabs defaultValue="users" className="w-full flex-grow">
        <TabsList>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="credits">Créditos</TabsTrigger>
        </TabsList>
        <TabsContent value="users">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Créditos</TableHead>
                <TableHead>Afiliado Valor</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead>Atualizado em</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user: User) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.balance}</TableCell>
                  <TableCell>{user.affiliateBalance}</TableCell>
                  <TableCell>{new Date(user.createdAt).toLocaleString()}</TableCell>
                  <TableCell>{new Date(user.updatedAt).toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Input
                        type="number"
                        placeholder="Adicionar Saldo"
                        onChange={(e) => handleAddBalance(user.id, parseFloat(e.target.value))}
                        className="w-24"
                      />
                      <Input
                        type="number"
                        placeholder="Atualizar Saldo"
                        onChange={(e) => handleUpdateBalance(user.id, parseFloat(e.target.value))}
                        className="w-24"
                      />
                      <Button onClick={() => handleResetBalance(user.id)} variant="default">
                        Resetar Saldo
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
        <TabsContent value="credits">
          <div className="space-y-6 flex-grow">
            <div className="flex items-center space-x-4">
              <Input
                type="number"
                value={markup}
                onChange={(e) => setMarkup(parseFloat(e.target.value))}
                placeholder="Markup (%)"
                className="w-32"
              />
              <Button onClick={handleUpdateMarkup} className="ml-2">Atualizar Markup</Button>
              <Button onClick={handleRefreshPrices} className="ml-2">Atualizar Preços</Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>País</TableHead>
                  <TableHead>Serviço</TableHead>
                  <TableHead>Preço (BRL)</TableHead>
                  <TableHead>Preço (USD)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prices.map((price: Price, index: number) => (
                  <TableRow key={index}>
                    <TableCell>{price.service}</TableCell>
                    <TableCell>{price.country}</TableCell>
                    <TableCell>{price.priceBrl}</TableCell>
                    <TableCell>{price.priceUsd}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {prices.length > 0 && (
              <div className="flex justify-center mt-4">
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
      <Toaster />
      </div>
    </div>
  );
}