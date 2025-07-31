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
import { Eye, EyeOff, Mail, Lock, LogIn, Loader2 } from 'lucide-react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';

const decodeToken = (token: string) => {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
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
  const [showPassword, setShowPassword] = useState(false);

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
        emailVerified: user.emailVerified,
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
    } catch {
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary/30 via-background to-primary/10 relative overflow-hidden">
      {/* Background decoration */}
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
              <Icon icon="material-symbols:login" className="w-8 h-8 text-primary-foreground" />
            </motion.div>
            <CardTitle className="text-3xl font-bold font-custom-bold text-foreground">
              Bem-vindo de volta
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              Entre na sua conta para continuar
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
                <Label htmlFor="email" className="text-foreground font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary" />
                  Email
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    className="pl-10 h-12 border-border/50 bg-background/50 backdrop-blur-sm focus:border-primary transition-all duration-200"
                    placeholder="seu@exemplo.com"
                  />
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
                {errors.email && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="text-destructive text-sm flex items-center gap-1"
                  >
                    <Icon icon="material-symbols:error" className="w-4 h-4" />
                    {errors.email.message}
                  </motion.p>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-2"
              >
                <Label htmlFor="password" className="text-foreground font-medium flex items-center gap-2">
                  <Lock className="w-4 h-4 text-primary" />
                  Senha
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    className="pl-10 pr-12 h-12 border-border/50 bg-background/50 backdrop-blur-sm focus:border-primary transition-all duration-200"
                    placeholder="••••••••"
                  />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="text-destructive text-sm flex items-center gap-1"
                  >
                    <Icon icon="material-symbols:error" className="w-4 h-4" />
                    {errors.password.message}
                  </motion.p>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4 mr-2" />
                      Entrar
                    </>
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
                Não tem uma conta?{' '}
                <Link 
                  href="/auth/register" 
                  className="text-primary hover:text-primary/80 font-semibold transition-colors duration-200 hover:underline"
                >
                  Criar conta
                </Link>
              </p>
              
              <div className="mt-6 pt-6 border-t border-border/50">
                <Link 
                  href="/auth/forgot-password" 
                  className="text-muted-foreground hover:text-primary text-sm transition-colors duration-200 flex items-center justify-center gap-1"
                >
                  <Icon icon="material-symbols:help" className="w-4 h-4" />
                  Esqueceu sua senha?
                </Link>
              </div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      <Toaster />
    </div>
  );
}