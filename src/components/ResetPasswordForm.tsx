"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

interface ApiError extends Error {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const tokenFromParams = searchParams.get('token');
    setToken(tokenFromParams);
  }, [searchParams]);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token: '' },
  });

  useEffect(() => {
    if (token) {
      reset({ token, password: '' });
    } else if (searchParams.get('token') === null) {
      toast.error('Nenhum token de redefinição fornecido.');
      router.push('/login');
    }
  }, [token, searchParams, reset, router]);

  const onSubmit = async (data: ResetPasswordForm) => {
    setIsLoading(true);
    try {
      await api.post('/auth/reset-password', data);
      toast.success('Senha redefinida com sucesso! Redirecionando para login...', {
        style: {
          background: 'oklch(0.6171 0.1375 39.0427)',
          color: 'oklch(1.0000 0 0)',
          border: 'none',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        },
        duration: 5000,
      });
      setTimeout(() => router.push('/login'), 2000);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && 'response' in error
          ? (error as ApiError).response?.data?.message || 'Falha ao redefinir a senha. Token inválido ou expirado.'
          : 'Falha ao redefinir a senha. Token inválido ou expirado.';
      toast.error(errorMessage, {
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary/30 via-background to-primary/10 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/20 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <Card className="shadow-2xl border-0 bg-card/80 backdrop-blur-lg">
          <CardHeader className="text-center pb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg"
            >
              <Lock className="w-8 h-8 text-primary-foreground" />
            </motion.div>
            <CardTitle className="text-3xl font-bold font-custom-bold text-foreground">
              Redefinir Senha
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              Crie uma nova senha para sua conta.
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-2"
              >
                <Label htmlFor="password" className="text-foreground font-medium flex items-center gap-2">
                  <Lock className="w-4 h-4 text-primary" />
                  Nova Senha
                </Label>
                <Input
                  id="password"
                  type="password"
                  {...register('password')}
                  className="pl-10 h-12 border-border/50 bg-background/50 backdrop-blur-sm focus:border-primary transition-all duration-200"
                  placeholder="••••••••"
                />
                {errors.password && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="text-destructive text-sm flex items-center gap-1"
                  >
                    <Lock className="w-4 h-4" />
                    {errors.password.message}
                  </motion.p>
                )}
              </motion.div>

              <input type="hidden" {...register('token')} />

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Button
                  type="submit"
                  disabled={isLoading || !token}
                  className="w-full h-12 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Redefinindo...
                    </>
                  ) : (
                    <>Redefinir Senha</>
                  )}
                </Button>
              </motion.div>
            </form>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-center"
            >
              <p className="text-muted-foreground text-sm">
                Lembrou da senha?{' '}
                <Link
                  href="/login"
                  className="text-primary hover:text-primary/80 font-semibold transition-colors duration-200 hover:underline"
                >
                  Fazer Login
                </Link>
              </p>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}