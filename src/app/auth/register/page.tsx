'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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

const decodeToken = (token: string) => {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
};

const registerSchema = z.object({
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Endereço de email inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  affiliateCode: z.string().optional(),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      affiliateCode: searchParams.get('aff') || '',
    },
  });

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/register', data);
      toast.success('Usuário registrado com sucesso! Verifique seu e-mail para confirmar.', {
        style: {
          background: 'oklch(0.6171 0.1375 39.0427)',
          color: 'oklch(1.0000 0 0)',
          border: 'none',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        },
        duration: 5000,
      });
      setTimeout(() => {
        router.push('/auth/login');
      }, 5000);
    } catch (error) {
      toast.error('Falha no registro: Email já existe ou erro interno.', {
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
          <CardTitle className="text-3xl font-bold text-center text-gray-800">Registrar</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="name" className="text-gray-600">Nome</Label>
              <Input
                id="name"
                type="text"
                {...register('name')}
                className="mt-1"
                placeholder="John Doe"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
            </div>
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
            <div>
              <Label htmlFor="affiliateCode" className="text-gray-600">Código de afiliado (Opcional)</Label>
              <Input
                id="affiliateCode"
                type="text"
                {...register('affiliateCode')}
                className="mt-1"
                placeholder="Insira o código de afiliado"
              />
              {errors.affiliateCode && <p className="text-red-500 text-sm mt-1">{errors.affiliateCode.message}</p>}
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full transition-all duration-300"
            >
              {isLoading ? 'Registrando...' : 'Registrar'}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-600">
            Já tem uma conta? <Link href="/auth/login" className="text-primary hover:underline">Login</Link>
          </p>
          <Toaster /> {/* Add Toaster component */}
        </CardContent>
      </Card>
    </div>
  );
}