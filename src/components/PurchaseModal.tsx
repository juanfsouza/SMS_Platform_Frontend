'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { SERVICE_NAME_MAP } from '@/data/services';
import { useAuthStore } from '@/stores/auth';

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: string;
  countryId: string;
  priceBrl: number;
  userBalance: number;
  handlePurchase: (service: string, countryId: string) => Promise<{ activationId: string; phoneNumber: string; creditsSpent: number } | null>;
  countryMap: Record<string, string>;
  initialPurchaseResult?: { activationId: string; phoneNumber: string; creditsSpent: number };
  initialStatus?: string | null;
  initialCode?: string | null;
  initialStartTime?: number;
}

export function PurchaseModal({
  isOpen,
  onClose,
  service,
  countryId,
  priceBrl,
  userBalance,
  handlePurchase,
  countryMap,
  initialPurchaseResult,
  initialStatus,
  initialCode,
  initialStartTime,
}: PurchaseModalProps) {
  const { user, setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [purchaseResult, setPurchaseResult] = useState<{
    activationId: string;
    phoneNumber: string;
    creditsSpent: number;
  } | null>(initialPurchaseResult || null);
  const [status, setStatus] = useState<string | null>(initialStatus || null);
  const [code, setCode] = useState<string | null>(initialCode || null);
  const [isPolling, setIsPolling] = useState(!initialCode && initialStatus !== '6');
  const [isRefunded, setIsRefunded] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(initialStartTime || null);

  const countryName = countryMap[countryId] || `Unknown (${countryId})`;
  const serviceName = SERVICE_NAME_MAP[service] || service.toUpperCase();
  const MAX_POLLING_TIME = 20 * 60 * 1000; // 20 minutes in milliseconds

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado para a área de transferência`);
  };

  const initiatePurchase = async () => {
    if (userBalance < priceBrl) {
      toast.error('Saldo insuficiente para realizar a compra');
      return;
    }
    setIsLoading(true);
    try {
      const result = await handlePurchase(service, countryId);
      if (result) {
        setPurchaseResult(result);
        setIsPolling(true);
        setStartTime(Date.now());
        toast.success('Compra realizada com sucesso!');
      }
    } catch {
      toast.error('Falha ao realizar a compra');
    } finally {
      setIsLoading(false);
    }
  };

  const requestRefund = async (activationId: string, creditsSpent: number) => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }
    try {
      const response = await api.post(
        '/credits/refunded',
        { activationId, creditsSpent },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      const newBalance = response.data.balance;
      setUser({ ...user, balance: newBalance });
      setIsRefunded(true);
      toast.success('Reembolso realizado com sucesso. Saldo atualizado.');
    } catch {
      toast.error('Falha ao processar o reembolso');
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPolling && purchaseResult?.activationId && !isRefunded) {
      interval = setInterval(async () => {
        try {
          const response = await api.get(`/sms/status/${purchaseResult.activationId}`);
          const { array } = response.data;
          const activationData = array[0] || {};
          const { status: newStatus, code: newCode } = activationData;
          setStatus(newStatus);
          setCode(newCode);

          const elapsedTime = startTime ? Date.now() - startTime : 0;

          if (newStatus === '6' || newCode || elapsedTime >= MAX_POLLING_TIME) {
            setIsPolling(false);
            if (newCode) {
              toast.success('Código de ativação recebido!');
            } else if (newStatus === '6' || elapsedTime >= MAX_POLLING_TIME) {
              if (!isRefunded) {
                await requestRefund(purchaseResult.activationId, purchaseResult.creditsSpent);
              }
            }
          }
        } catch {
          toast.error('Falha ao verificar status do número');
          setIsPolling(false);
          if (!isRefunded) {
            await requestRefund(purchaseResult.activationId, purchaseResult.creditsSpent);
          }
        }
      }, 30000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPolling, purchaseResult, startTime, isRefunded, user, setUser]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{purchaseResult ? 'Detalhes da Compra' : 'Confirmar Compra'}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          {!purchaseResult ? (
            <>
              <p className="text-sm text-muted-foreground">
                Você está prestes a comprar um número para:
              </p>
              <p className="mt-2 text-foreground">
                <strong>Serviço:</strong> {serviceName}
              </p>
              <p className="text-foreground">
                <strong>País:</strong> {countryName}
              </p>
              <p className="text-foreground">
                <strong>Preço:</strong> {priceBrl.toFixed(2)} Créditos
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Seu saldo atual: {userBalance.toFixed(2)} Créditos
              </p>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">Compra realizada com sucesso!</p>
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">
                    <strong>ID da Ativação:</strong> {purchaseResult.activationId}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(purchaseResult.activationId, 'ID da Ativação')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">
                    <strong>Número:</strong> {purchaseResult.phoneNumber}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(purchaseResult.phoneNumber, 'Número')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">
                    <strong>Créditos gastos:</strong> {purchaseResult.creditsSpent.toFixed(2)}
                  </span>
                </div>
                {isRefunded ? (
                  <p className="text-sm text-emerald-600">
                    <strong>Reembolsado:</strong> Nenhum código recebido. Saldo restaurado.
                  </p>
                ) : isPolling ? (
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Aguardando código de ativação...
                  </p>
                ) : code ? (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">
                      <strong>Código:</strong> {code}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(code, 'Código')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Status: {status || 'Aguardando atualização'}
                  </p>
                )}
              </div>
            </>
          )}
        </div>
        <DialogFooter>
          {!purchaseResult ? (
            <>
              <Button variant="outline" onClick={onClose} disabled={isLoading}>
                Cancelar
              </Button>
              <Button onClick={initiatePurchase} disabled={isLoading || userBalance < priceBrl}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Confirmar Compra
              </Button>
            </>
          ) : (
            <Button onClick={onClose} disabled={isPolling}>
              Fechar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}