'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast, Toaster } from 'sonner';
import api from '@/lib/api';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Suspense } from 'react';
import { Eye, EyeOff, Mail, Lock, User, Users, UserPlus, Loader2, CheckCircle } from 'lucide-react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import React from 'react';

const registerSchema = z.object({
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Endereço de email inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  affiliateCode: z.string().optional(),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary/30 via-background to-primary/10">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="text-muted-foreground">Carregando...</span>
        </div>
      </div>
    }>
      <RegisterContent />
    </Suspense>
  );
}

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const { register, handleSubmit, formState: { errors }, watch } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      affiliateCode: searchParams.get('aff') || '',
    },
  });

  const password = watch('password');

  const calculatePasswordStrength = (pass: string) => {
    if (!pass) return 0;
    let strength = 0;
    if (pass.length >= 6) strength += 1;
    if (pass.length >= 8) strength += 1;
    if (/[A-Z]/.test(pass)) strength += 1;
    if (/[a-z]/.test(pass)) strength += 1;
    if (/[0-9]/.test(pass)) strength += 1;
    if (/[^A-Za-z0-9]/.test(pass)) strength += 1;
    return strength;
  };

  React.useEffect(() => {
    setPasswordStrength(calculatePasswordStrength(password));
  }, [password]);

  const getPasswordStrengthColor = (strength: number) => {
    if (strength <= 2) return 'bg-destructive';
    if (strength <= 4) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = (strength: number) => {
    if (strength <= 2) return 'Fraca';
    if (strength <= 4) return 'Média';
    return 'Forte';
  };

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    try {
      await api.post('/auth/register', data);
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
    } catch {
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary/30 via-background to-primary/10 relative overflow-hidden py-8">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-primary/3 rounded-full blur-3xl" />
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
              <Icon icon="material-symbols:person-add" className="w-8 h-8 text-primary-foreground" />
            </motion.div>
            <CardTitle className="text-3xl font-bold font-custom-bold text-foreground">
              Criar conta
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              Junte-se a nós e comece sua jornada
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
                <Label htmlFor="name" className="text-foreground font-medium flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  Nome completo
                </Label>
                <div className="relative">
                  <Input
                    id="name"
                    type="text"
                    {...register('name')}
                    className="pl-10 h-12 border-border/50 bg-background/50 backdrop-blur-sm focus:border-primary transition-all duration-200"
                    placeholder="João Silva"
                  />
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
                {errors.name && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="text-destructive text-sm flex items-center gap-1"
                  >
                    <Icon icon="material-symbols:error" className="w-4 h-4" />
                    {errors.name.message}
                  </motion.p>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
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
                    placeholder="joao@exemplo.com"
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
                transition={{ delay: 0.5 }}
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
                
                {/* Password strength indicator */}
                {password && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 ${getPasswordStrengthColor(passwordStrength)}`}
                          style={{ width: `${(passwordStrength / 6) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {getPasswordStrengthText(passwordStrength)}
                      </span>
                    </div>
                  </div>
                )}
                
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
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="space-y-2"
              >
                <Label htmlFor="affiliateCode" className="text-foreground font-medium flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  Código de afiliado
                  <span className="text-muted-foreground text-xs">(Opcional)</span>
                </Label>
                <div className="relative">
                  <Input
                    id="affiliateCode"
                    type="text"
                    {...register('affiliateCode')}
                    className="pl-10 h-12 border-border/50 bg-background/50 backdrop-blur-sm focus:border-primary transition-all duration-200"
                    placeholder="Código do seu amigo"
                  />
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
                {searchParams.get('aff') && (
                  <div className="flex items-center gap-1 text-sm text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    Código de afiliado aplicado
                  </div>
                )}
                {errors.affiliateCode && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="text-destructive text-sm flex items-center gap-1"
                  >
                    <Icon icon="material-symbols:error" className="w-4 h-4" />
                    {errors.affiliateCode.message}
                  </motion.p>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Criando conta...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Criar conta
                    </>
                  )}
                </Button>
              </motion.div>
            </form>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-center"
            >
              <p className="text-muted-foreground text-sm">
                Já tem uma conta?{' '}
                <Link 
                  href="/auth/login" 
                  className="text-primary hover:text-primary/80 font-semibold transition-colors duration-200 hover:underline"
                >
                  Fazer login
                </Link>
              </p>
              
              <div className="mt-6 pt-6 border-t border-border/50">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Ao criar uma conta, você concorda com nossos{' '}
                  <Link href="/terms" className="text-primary hover:underline">
                    Termos de Serviço
                  </Link>
                  {' '}e{' '}
                  <Link href="/privacy" className="text-primary hover:underline">
                    Política de Privacidade
                  </Link>
                </p>
              </div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      <Toaster />
    </div>
  );
}