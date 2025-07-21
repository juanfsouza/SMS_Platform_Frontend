"use client";

import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { CheckCircle } from 'lucide-react';
import { useAuthStore } from '@/stores/auth';
import api from '@/lib/api';
import { toast } from 'sonner';

const Confirmed: React.FC = () => {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const hasExecuted = useRef(false);

  useEffect(() => {
    if (hasExecuted.current) return;
    hasExecuted.current = true;

    if (!user) {
      router.push('/auth/login');
      return;
    }

    const fetchBalance = async () => {
      try {
        const balanceResponse = await api.get('/users/me/balance', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setUser({
          ...user,
          balance: balanceResponse.data.balance,
          affiliateBalance: balanceResponse.data.affiliateBalance,
        });
      } catch (error: any) {
        console.error('Error fetching balance:', error);
        toast.error('Falha ao atualizar saldo');
      }
    };

    fetchBalance();

    const redirectTimer = setTimeout(() => {
      router.push('/dashboard');
    }, 7000);

    return () => clearTimeout(redirectTimer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-primary/5 flex items-center justify-center py-12">
      <Card className="max-w-md w-full border-0 bg-gradient-to-r from-card to-card/80 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl">
            <CheckCircle className="w-6 h-6 text-green-600" />
            Pagamento Confirmado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">
            Seu saldo foi confirmado com sucesso. Você será redirecionado ao dashboard em <strong>7 segundos</strong> ou clique no botão abaixo.
          </p>
          <Button
            onClick={() => router.push('/dashboard')}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all duration-200"
          >
            Ir para o Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Confirmed;