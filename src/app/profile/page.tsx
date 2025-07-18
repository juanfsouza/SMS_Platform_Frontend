'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Copy } from 'lucide-react';

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    if (!user.affiliateLink) {
      const fetchData = async () => {
        try {
          console.log('Fetching profile data...');
          const linkResponse = await api.get('/affiliate/link', {
            headers: { Authorization: `Bearer ${user.token}` },
          });
          const balanceResponse = await api.get('/users/me/balance', {
            headers: { Authorization: `Bearer ${user.token}` },
          });

          const newBalance = balanceResponse.data.balance;
          const newAffiliateBalance = balanceResponse.data.affiliateBalance;
          const newAffiliateLink = linkResponse.data.affiliateLink;

          // Only update state if data has changed
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
          console.log('Profile data fetched successfully');
        } catch (error) {
          console.error('Error fetching profile data:', error);
          toast.error('Falha ao carregar dados do perfil', {
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

      fetchData();
    }
  }, [user, router, setUser]);

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

  if (!user) return null;

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-br from-secondary-100 to-secondary-foreground-100">
      <Navbar />
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Perfil</h1>
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Informações do Usuário</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-gray-600">Nome</Label>
              <Input value={user.name} readOnly className="mt-1" />
            </div>
            <div>
              <Label className="text-gray-600">Email</Label>
              <Input value={user.email} readOnly className="mt-1" />
            </div>
            <div>
              <Label className="text-gray-600">Saldo da Conta</Label>
              <Input value={`${user.balance.toFixed(2)} Créditos`} readOnly className="mt-1" />
            </div>
            <div>
              <Label className="text-gray-600">Saldo de Afiliado</Label>
              <Input value={`${user.affiliateBalance?.toFixed(2) || '0.00'} BRL`} readOnly className="mt-1" />
            </div>
            <div>
              <Label className="text-gray-600">Link de Afiliado</Label>
              <div className="flex items-center space-x-4 mt-1">
                <Input value={user.affiliateLink || 'Carregando...'} readOnly className="flex-1" />
                <Button onClick={copyToClipboard} variant="outline">
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}