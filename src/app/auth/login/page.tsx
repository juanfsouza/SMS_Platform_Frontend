'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/stores/auth';
import { toast, Toaster } from 'sonner';
import api from '@/lib/api';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Utility to decode JWT
const decodeToken = (token: string) => {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
};

const loginSchema = z.object({
  email: z.string().email('Endereço de email inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', data);
      const { user, token } = response.data;

      const decoded = decodeToken(token);
      const role = decoded?.role || 'USER';

      if (!user.emailVerified) {
        toast.error('Por favor, confirme seu e-mail primeiro.', {
          style: {
            background: 'oklch(0.6368 0.2078 25.3313)',
            color: 'oklch(1.0000 0 0)',
            border: 'none',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          },
          duration: 5000,
        });
        return;
      }

      setUser({
        id: user.id,
        name: user.name,
        email: user.email,
        balance: user.balance,
        affiliateBalance: user.affiliateBalance || 0,
        affiliateLink: null,
        token,
        role,
        emailVerified: user.emailVerified, // Sync with backend
      });

      toast.success('Logado com sucesso', {
        style: {
          background: 'oklch(0.6171 0.1375 39.0427)',
          color: 'oklch(1.0000 0 0)',
          border: 'none',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        },
        duration: 5000,
      });
      router.push('/dashboard');
    } catch (error) {
      toast.error('Falha no login: Credenciais inválidas', {
        style: {
          background: 'oklch(0.6368 0.2078 25.3313)',
          color: 'oklch(1.0000 0 0)',
          border: 'none',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        },
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center font-custom-bold justify-center bg-gradient-to-br from-secondary-100 to-secondary-foreground-100">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center text-gray-800">Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="email" className="text-gray-600">Email</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                className="mt-1"
                placeholder="seu@example.com"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <Label htmlFor="password" className="text-gray-600">Senha</Label>
              <Input
                id="password"
                type="password"
                {...register('password')}
                className="mt-1"
                placeholder="••••••"
              />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full transition-all duration-300"
            >
              {isLoading ? 'Entrando...' : 'Login'}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-600">
            Não tem uma conta? <Link href="/auth/register" className="text-primary hover:underline">Registrar</Link>
          </p>
          <Toaster />
        </CardContent>
      </Card>
    </div>
  );
}