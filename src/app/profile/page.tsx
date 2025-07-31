"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '@/stores/auth';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast, Toaster } from 'sonner';
import api from '@/lib/api';
import { 
  Copy, 
  User, 
  Mail, 
  TrendingUp, 
  Link2, 
  CheckCircle2,
  Sparkles,
  CreditCard,
  Wallet,
} from 'lucide-react';
import { motion, Variants } from 'framer-motion';

const withdrawalSchema = z.object({
  amount: z.number()
    .min(50, 'O valor mínimo para saque é R$ 50')
    .positive('O valor deve ser positivo'),
  pixKey: z.string()
    .min(1, 'A chave PIX é obrigatória')
    .max(140, 'A chave PIX não pode exceder 140 caracteres'),
});

type WithdrawalForm = z.infer<typeof withdrawalSchema>;

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<WithdrawalForm>({
    resolver: zodResolver(withdrawalSchema),
    defaultValues: {
      amount: 0,
      pixKey: '',
    },
  });

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    if (!user.affiliateLink) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const linkResponse = await api.get('/affiliate/link', {
            headers: { Authorization: `Bearer ${user.token}` },
          });
          const balanceResponse = await api.get('/users/me/balance', {
            headers: { Authorization: `Bearer ${user.token}` },
          });

          const newBalance = balanceResponse.data.balance;
          const newAffiliateBalance = balanceResponse.data.affiliateBalance;
          const newAffiliateLink = linkResponse.data.affiliateLink;

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
        } catch {
          toast.error('Falha ao carregar dados do perfil');
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
    }
  }, [user, router, setUser]);

  const copyToClipboard = async () => {
    if (user?.affiliateLink) {
      try {
        await navigator.clipboard.writeText(user.affiliateLink);
        setCopied(true);
        toast.success('Link copiado com sucesso!', {
          description: 'O link de afiliado foi copiado para sua área de transferência.',
        });
        
        setTimeout(() => setCopied(false), 2000);
      } catch {
        toast.error('Falha ao copiar o link');
      }
    }
  };

  const handleWithdrawalSubmit = async (data: WithdrawalForm) => {
    if (!user?.token) return;

    if (data.amount > (user.affiliateBalance || 0)) {
      toast.error('Saldo insuficiente para o saque', {
        style: {
          background: 'oklch(0.6368 0.2078 25.3313)',
          color: 'oklch(1.0000 0 0)',
          border: 'none',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        },
        duration: 3000,
      });
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/affiliate/withdrawal', data, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      toast.success('Solicitação de saque enviada com sucesso!', {
        description: 'Aguarde a aprovação do administrador.',
        style: {
          background: 'oklch(0.6171 0.1375 39.0427)',
          color: 'oklch(1.0000 0 0)',
          border: 'none',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        },
        duration: 3000,
      });
      const balanceResponse = await api.get('/users/me/balance', {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setUser({
        ...user,
        balance: balanceResponse.data.balance,
        affiliateBalance: balanceResponse.data.affiliateBalance,
      });
      reset();
    } catch (error) {
      const apiError = error as ApiError;
      const errorMessage = apiError.response?.data?.message || 'Tente novamente mais tarde.';
      toast.error('Falha ao enviar solicitação de saque', {
        description: errorMessage,
        style: {
          background: 'oklch(0.6368 0.2078 25.3313)',
          color: 'oklch(1.0000 0 0)',
          border: 'none',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        },
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 24,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <Navbar />
      
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="max-w-4xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header Section */}
          <motion.div 
            className="text-center mb-12"
            variants={itemVariants}
          >
            <div className="relative inline-block">
              <motion.div 
                className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-primary to-primary/70 rounded-2xl flex items-center justify-center shadow-2xl"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
              >
                <User className="w-12 h-12 text-primary-foreground" />
              </motion.div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-background shadow-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            </div>
            
            <h1 className="text-4xl font-custom-bold text-foreground mb-2">
              Meu Perfil
            </h1>
            <p className="text-muted-foreground text-lg">
              Gerencie suas informações pessoais e configurações
            </p>
          </motion.div>

          {/* Stats Cards */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
            variants={itemVariants}
          >
            {/* Balance Card */}
            <motion.div
              whileHover={{ y: -4, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Card className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-primary/10 via-primary/5 to-background backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent opacity-50" />
                <CardContent className="p-6 relative">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm font-medium mb-1">
                        Saldo Disponível
                      </p>
                      <p className="text-3xl font-custom-bold text-foreground">
                        {user.balance.toFixed(2)}
                      </p>
                      <p className="text-primary text-sm font-semibold">
                        Créditos
                      </p>
                    </div>
                    <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center">
                      <CreditCard className="w-7 h-7 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Affiliate Balance Card */}
            <motion.div
              whileHover={{ y: -4, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Card className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-green-500/10 via-green-500/5 to-background backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-transparent opacity-50" />
                <CardContent className="p-6 relative">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm font-medium mb-1">
                        Ganhos Afiliado
                      </p>
                      <p className="text-3xl font-custom-bold text-foreground">
                        R$ {user.affiliateBalance?.toFixed(2) || '0.00'}
                      </p>
                      <p className="text-green-600 text-sm font-semibold">
                        Reais
                      </p>
                    </div>
                    <div className="w-14 h-14 bg-green-500/20 rounded-2xl flex items-center justify-center">
                      <TrendingUp className="w-7 h-7 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Profile Information Card */}
          <motion.div variants={itemVariants}>
            <Card className="border-0 shadow-2xl bg-card/50 backdrop-blur-xl">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center text-2xl font-custom-bold">
                  <User className="mr-3 h-6 w-6 text-primary" />
                  Informações Pessoais
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-8">
                {/* Name Field */}
                <motion.div 
                  className="space-y-3"
                  whileHover={{ scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                >
                  <Label className="text-foreground font-semibold flex items-center">
                    <User className="mr-2 h-4 w-4 text-primary" />
                    Nome Completo
                  </Label>
                  <div className="relative">
                    <Input 
                      value={user.name} 
                      readOnly 
                      className="pl-4 pr-4 py-3 bg-muted/50 border-border/50 rounded-xl text-foreground font-medium focus:ring-2 focus:ring-primary/20 transition-all duration-300" 
                    />
                  </div>
                </motion.div>

                {/* Email Field */}
                <motion.div 
                  className="space-y-3"
                  whileHover={{ scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                >
                  <Label className="text-foreground font-semibold flex items-center">
                    <Mail className="mr-2 h-4 w-4 text-primary" />
                    Endereço de Email
                  </Label>
                  <div className="relative">
                    <Input 
                      value={user.email} 
                      readOnly 
                      className="pl-4 pr-4 py-3 bg-muted/50 border-border/50 rounded-xl text-foreground font-medium focus:ring-2 focus:ring-primary/20 transition-all duration-300" 
                    />
                  </div>
                </motion.div>

                {/* Affiliate Link Field */}
                <motion.div 
                  className="space-y-3"
                  whileHover={{ scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                >
                  <Label className="text-foreground font-semibold flex items-center">
                    <Link2 className="mr-2 h-4 w-4 text-primary" />
                    Link de Afiliado
                  </Label>
                  <div className="flex items-center space-x-3">
                    <div className="relative flex-1">
                      <Input 
                        value={user.affiliateLink || 'Carregando...'} 
                        readOnly 
                        className="pl-4 pr-4 py-3 bg-muted/50 border-border/50 rounded-xl text-foreground font-medium focus:ring-2 focus:ring-primary/20 transition-all duration-300" 
                      />
                      {isLoading && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full"
                          />
                        </div>
                      )}
                    </div>
                    
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button 
                        onClick={copyToClipboard} 
                        variant="outline"
                        size="lg"
                        className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                          copied 
                            ? 'bg-green-500 text-white border-green-500 hover:bg-green-600' 
                            : 'hover:bg-primary hover:text-primary-foreground hover:border-primary'
                        }`}
                        disabled={!user.affiliateLink || user.affiliateLink === 'Carregando...'}
                      >
                        {copied ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Copiado!
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4 mr-2" />
                            Copiar Link
                          </>
                        )}
                      </Button>
                    </motion.div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground ml-6">
                    Compartilhe este link para ganhar comissões em cada referência
                  </p>
                </motion.div>

                {/* Withdrawal Request Form */}
                <motion.div 
                  className="space-y-3"
                  whileHover={{ scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                >
                  <Label className="text-foreground font-semibold flex items-center">
                    <Wallet className="mr-2 h-4 w-4 text-primary" />
                    Solicitar Saque de Ganhos de Afiliado
                  </Label>
                  <form onSubmit={handleSubmit(handleWithdrawalSubmit)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount" className="text-foreground font-medium">
                        Valor (R$)
                      </Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        {...register('amount', { valueAsNumber: true })}
                        placeholder="Digite o valor a sacar (mín. R$ 50)"
                        className="pl-4 pr-4 py-3 bg-muted/50 border-border/50 rounded-xl text-foreground font-medium focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                      />
                      {errors.amount && (
                        <p className="text-destructive text-sm">{errors.amount.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pixKey" className="text-foreground font-medium">
                        Chave PIX
                      </Label>
                      <Input
                        id="pixKey"
                        {...register('pixKey')}
                        placeholder="Digite sua chave PIX"
                        className="pl-4 pr-4 py-3 bg-muted/50 border-border/50 rounded-xl text-foreground font-medium focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                      />
                      {errors.pixKey && (
                        <p className="text-destructive text-sm">{errors.pixKey.message}</p>
                      )}
                    </div>
                    <Button
                      type="submit"
                      disabled={isLoading || (user.affiliateBalance || 0) < 50}
                      className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                    >
                      {isLoading ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                          />
                          Enviando...
                        </>
                      ) : (
                        'Solicitar Saque'
                      )}
                    </Button>
                  </form>
                  <p className="text-sm text-muted-foreground ml-6">
                    O saque será processado após aprovação do administrador. Mínimo de R$ 50.
                  </p>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Additional Info Card */}
          <motion.div 
            className="mt-8"
            variants={itemVariants}
          >
            <Card className="border-0 shadow-xl bg-gradient-to-r from-primary/5 to-primary/10 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-custom-bold text-lg text-foreground mb-2">
                      Programa de Afiliados
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Ganhe dinheiro compartilhando nossos serviços! Cada pessoa que se cadastrar através do seu link de afiliado e fizer uma compra, você receberá uma comissão diretamente em sua conta.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>

      {/* Componente Toaster adicionado aqui */}
      <Toaster />
    </div>
  );
}