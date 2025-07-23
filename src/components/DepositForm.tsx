"use client";

import React, { useState, FormEvent } from 'react';
import axios from 'axios';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Copy } from 'lucide-react';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'next/navigation';


type DepositFormProps = Record<string, never>;
interface CheckoutResponse {
  transactionId: string;
  qrCode: string;
  qrCodeBase64: string;
  amount: number;
  status: string;
  disclaimer: string;
}

interface ApiError extends Error {
  response?: {
    data?: {
      message?: string;
    };
  };
}

const DepositForm: React.FC<DepositFormProps> = () => {
  const { user } = useAuthStore();
  const router = useRouter();
  const [amount, setAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('PIX');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [qrCodeBase64, setQrCodeBase64] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [disclaimer, setDisclaimer] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!user || !user.token) {
      toast.error('Usuário não autenticado. Faça login novamente.');
      router.push('/auth/login');
      return;
    }

    setError(null);
    setQrCode(null);
    setQrCodeBase64(null);
    setTransactionId(null);
    setDisclaimer('');
    setIsLoading(true);

    try {
      const affiliateCode = new URLSearchParams(window.location.search).get('aff') || undefined;

      const response = await axios.post<CheckoutResponse>(
        `${API_BASE_URL}/payments/create-checkout`,
        { amount: parseFloat(amount), affiliateCode },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const { qrCode, qrCodeBase64, transactionId, disclaimer } = response.data;
      setQrCode(qrCode);
      setQrCodeBase64(qrCodeBase64);
      setTransactionId(transactionId);
      setDisclaimer(disclaimer);

      toast.success('Pagamento gerado com sucesso! Escaneie o QR Code.');
      pollPaymentStatus(transactionId);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && 'response' in error
          ? (error as ApiError).response?.data?.message || 'Falha ao gerar pagamento'
          : 'Falha ao gerar pagamento';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const pollPaymentStatus = async (transactionId: string) => {
    if (!user || !user.token) {
      setError('Usuário não autenticado');
      return;
    }

    const checkStatus = async () => {
      try {
        const response = await axios.get<{ status: string; localStatus?: string }>(
          `${API_BASE_URL}/payments/transactions/${transactionId}`,
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        );

        const { status, localStatus } = response.data;

        if (status === 'paid' || localStatus === 'COMPLETED') {
          toast.success('Pagamento confirmado! Redirecionando...');
          router.push('/confirmed');
        } else if (status === 'expired' || localStatus === 'EXPIRED') {
          setError('Transação expirada ou não encontrada');
          toast.error('Transação expirada ou não encontrada');
        } else {
          setTimeout(checkStatus, 10000); // Verifica a cada 10 segundos
        }
      } catch {
        setError('Falha ao verificar status do pagamento');
        toast.error('Falha ao verificar status do pagamento');
      }
    };

    setTimeout(checkStatus, 5000); // Inicia após 5 segundos
  };

  const copyToClipboard = () => {
    if (qrCode) {
      navigator.clipboard.writeText(qrCode);
      toast.success('Código PIX copiado para a área de transferência');
    }
  };

  if (!user) {
    return (
      <Card className="border-0 bg-gradient-to-r from-card to-card/80 shadow-lg">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Carregando...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 bg-gradient-to-r from-card to-card/80 shadow-lg">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Método de Pagamento
            </label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger className="w-full bg-secondary/50 border-border/50">
                <SelectValue placeholder="Selecione o método" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PIX">PIX</SelectItem>
                <SelectItem value="TRANSFERENCIA" disabled>
                  Transferência (Em breve)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Valor (BRL)
            </label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0.50"
              step="0.01"
              className="bg-secondary/50 border-border/50"
              placeholder="Mínimo R$ 0,50"
              required
              disabled={isLoading}
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading || !amount || parseFloat(amount) < 0.5}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50"
          >
            {isLoading ? 'Gerando...' : 'Gerar Pagamento'}
          </Button>
        </form>

        {disclaimer && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground">{disclaimer}</p>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-destructive/10 text-destructive rounded-lg">
            <p className="text-sm">{error}</p>
          </div>
        )}

        {qrCode && qrCodeBase64 && transactionId && (
          <div className="mt-6 space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Escaneie o QR Code ou copie o código PIX:
              </p>
              <div className="flex justify-center">
                <Image
                  src={qrCodeBase64}
                  alt="PIX QR Code"
                  width={200}
                  height={200}
                  className="rounded-lg border border-border/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-muted-foreground">
                Código PIX:
              </label>
              <Input
                value={qrCode}
                readOnly
                className="bg-secondary/50 border-border/50 font-mono text-sm"
              />
              <Button
                onClick={copyToClipboard}
                variant="outline"
                className="w-full"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copiar Código PIX
              </Button>
            </div>

            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                ID da Transação: {transactionId}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                ⏱️ Verificando pagamento automaticamente...
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DepositForm;