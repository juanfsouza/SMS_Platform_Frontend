"use client";

import { useState, useEffect, useCallback, useMemo, memo, useRef } from 'react';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import api from '@/lib/api';
import { toast, Toaster } from 'sonner';
import Navbar from '@/components/Navbar';
import { SERVICE_NAME_MAP } from '@/data/services';
import {
  RefreshCw,
  Users,
  CreditCard,
  UserPlus,
  Settings,
  Percent,
  DollarSign,
  Banknote,
  TrendingUp,
  Wallet,
  RotateCcw,
  Check,
  X,
  AlertCircle,
  Info,
  ShoppingCart,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  Loader2,
  MoreHorizontal,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { debounce, throttle } from 'lodash';
import countriesData from '@/data/countries.json';

// Definição do tipo Price
interface Price {
  service: string;
  serviceName?: string;
  country: string;
  priceBrl: number;
  priceUsd: number;
}

// Sistema de virtualização para grandes volumes de dados
class VirtualizationManager {
  private windowSize = 10; // Apenas 10 itens por vez
  private cache = new Map<string, { data: any; timestamp: number }>();
  private pendingRequests = new Map<string, Promise<any>>();

  private generateKey(offset: number, service?: string, country?: string): string {
    return `window_${offset}_${service || 'all'}_${country || 'all'}`;
  }

  private isExpired(entry: any): boolean {
    return Date.now() - entry.timestamp > 5 * 60 * 1000; // 5 min TTL
  }

  async getWindow(offset: number, service?: string, country?: string): Promise<any> {
    const key = this.generateKey(offset, service, country);
    const entry = this.cache.get(key);
    
    if (entry && !this.isExpired(entry)) {
      return entry.data;
    }
    
    return null;
  }

  async setWindow(offset: number, data: any, service?: string, country?: string): Promise<void> {
    const key = this.generateKey(offset, service, country);
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  async getOrFetchWindow<T>(
    offset: number, 
    service: string | undefined, 
    country: string | undefined,
    fetchFn: () => Promise<T>
  ): Promise<T> {
    const key = this.generateKey(offset, service, country);
    
    // Verificar requisição pendente
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key)!;
    }

    // Verificar cache
    const cached = await this.getWindow(offset, service, country);
    if (cached) {
      return cached;
    }

    // Fazer requisição
    const promise = fetchFn().then(async (data) => {
      await this.setWindow(offset, data, service, country);
      this.pendingRequests.delete(key);
      return data;
    }).catch((error) => {
      this.pendingRequests.delete(key);
      throw error;
    });

    this.pendingRequests.set(key, promise);
    return promise;
  }

  clear(): void {
    this.cache.clear();
    this.pendingRequests.clear();
  }

  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Função para converter código de país em nome
const getCountryName = (countryCode: string): string => {
  const code = countryCode.toString();
  return countriesData[code as keyof typeof countriesData] || countryCode;
};

// Hook para paginação avançada
const useAdvancedPagination = (totalItems: number, itemsPerPage: number = 20) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  // Prefetch das próximas páginas
  const prefetchNext = useCallback((page: number) => {
    if (page <= totalPages) {
      // Lógica de prefetch será implementada no componente pai
    }
  }, [totalPages]);

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page);
      prefetchNext(page + 1);
    }
  }, [currentPage, totalPages, prefetchNext]);

  const nextPage = useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  const prevPage = useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  // Gerar array de páginas para exibição
  const getVisiblePages = useMemo(() => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots.filter((page, index, array) => array.indexOf(page) === index);
  }, [currentPage, totalPages]);

  return {
    currentPage,
    totalPages,
    loading,
    setLoading,
    goToPage,
    nextPage,
    prevPage,
    getVisiblePages,
    canGoNext: currentPage < totalPages,
    canGoPrev: currentPage > 1
  };
};

// Definição do tipo User
interface User {
  id: number;
  email: string;
  name: string;
  balance: number;
  affiliateBalance: number;
  createdAt: string;
  updatedAt: string;
}

// Definição do tipo WithdrawalRequest
interface WithdrawalRequest {
  id: number;
  userId: number;
  amount: number;
  pixKey: string;
  status: 'PENDING' | 'APPROVED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    email: string;
    name: string;
    pixKey: string;
  };
}

// Definição do tipo PurchaseLog
interface PurchaseLog {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  service: string;
  country: string;
  phoneNumber: string;
  creditsSpent: number;
  userBalance: number;
  activationId: string | null;
  status: string;
  code: string | null;
  purchaseDate: Date;
  canRefund: boolean;
  transactionId?: number;
}

// Estado centralizado de loading
interface LoadingState {
  initial: boolean;
  users: boolean;
  markup: boolean;
  prices: boolean;
  withdrawals: boolean;
  commission: boolean;
  purchases: boolean;
}

// Componente UserRow otimizado
const UserRow = ({ userData, onBalanceUpdate }: { userData: User, onBalanceUpdate: (userId: number) => void }) => {
  const { user } = useAuthStore();
  const [localInputs, setLocalInputs] = useState({ add: '', update: '' });
  const [isUpdating, setIsUpdating] = useState(false);

  const debouncedInputChange = useCallback(
    debounce((type: 'add' | 'update', value: string) => {
      setLocalInputs(prev => ({ ...prev, [type]: value }));
    }, 200),
    []
  );

  const handleAddBalance = useCallback(async () => {
    const amount = parseFloat(localInputs.add || '0');
    if (!user?.token || !amount || amount <= 0 || isUpdating) return;

    setIsUpdating(true);
    try {
      await api.post('/users/balance', { userId: userData.id, amount }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      toast.success('Saldo adicionado com sucesso');
      setLocalInputs(prev => ({ ...prev, add: '' }));
      onBalanceUpdate(userData.id);
    } catch {
      toast.error('Falha ao adicionar saldo');
    } finally {
      setIsUpdating(false);
    }
  }, [localInputs.add, user?.token, userData.id, isUpdating, onBalanceUpdate]);

  const handleUpdateBalance = useCallback(async () => {
    const balance = parseFloat(localInputs.update || '0');
    if (!user?.token || balance < 0 || isUpdating) return;

    setIsUpdating(true);
    try {
      await api.patch('/users/balance', { userId: userData.id, balance }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      toast.success('Saldo atualizado com sucesso');
      setLocalInputs(prev => ({ ...prev, update: '' }));
      onBalanceUpdate(userData.id);
    } catch {
      toast.error('Falha ao atualizar saldo');
    } finally {
      setIsUpdating(false);
    }
  }, [localInputs.update, user?.token, userData.id, isUpdating, onBalanceUpdate]);

  const handleResetBalance = useCallback(async () => {
    if (!user?.token || isUpdating) return;

    setIsUpdating(true);
    try {
      await api.delete('/users/balance', {
        data: { userId: userData.id },
        headers: { Authorization: `Bearer ${user.token}` }
      });
      toast.success('Saldo resetado com sucesso');
      onBalanceUpdate(userData.id);
    } catch {
      toast.error('Falha ao resetar saldo');
    } finally {
      setIsUpdating(false);
    }
  }, [user?.token, userData.id, isUpdating, onBalanceUpdate]);

  return (
    <TableRow className="border-border/50 hover:bg-muted/50">
      <TableCell className="font-mono text-sm">{userData.id}</TableCell>
      <TableCell className="text-sm">{userData.email}</TableCell>
      <TableCell className="font-medium">{userData.name}</TableCell>
      <TableCell>
        <Badge variant="secondary" className="font-mono">
          {userData.balance} créditos
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="font-mono">
          R$ {userData.affiliateBalance.toFixed(2)}
        </Badge>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {new Date(userData.createdAt).toLocaleDateString('pt-BR')}
      </TableCell>
      <TableCell>
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Adicionar"
              value={localInputs.add}
              onChange={(e) => debouncedInputChange('add', e.target.value)}
              className="w-20 h-8 text-xs"
              disabled={isUpdating}
            />
            <Button
              onClick={handleAddBalance}
              size="sm"
              className="bg-primary hover:bg-primary/90 h-8 px-2"
              disabled={isUpdating}
            >
              <DollarSign className="w-3 h-3" />
            </Button>
          </div>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Definir"
              value={localInputs.update}
              onChange={(e) => debouncedInputChange('update', e.target.value)}
              className="w-20 h-8 text-xs"
              disabled={isUpdating}
            />
            <Button
              onClick={handleUpdateBalance}
              size="sm"
              variant="outline"
              className="h-8 px-2"
              disabled={isUpdating}
            >
              <TrendingUp className="w-3 h-3" />
            </Button>
          </div>
          <Button
            onClick={handleResetBalance}
            size="sm"
            variant="destructive"
            className="h-8"
            disabled={isUpdating}
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            Reset
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

// Componente PriceRow otimizado com memo
const PriceRow = memo(({ price, onPriceUpdate }: { price: Price, onPriceUpdate: () => void }) => {
  const { user } = useAuthStore();
  const [localInputs, setLocalInputs] = useState({ priceBrl: '', priceUsd: '' });
  const [isUpdating, setIsUpdating] = useState(false);

  const debouncedInputChange = useCallback(
    debounce((type: 'priceBrl' | 'priceUsd', value: string) => {
      setLocalInputs(prev => ({ ...prev, [type]: value }));
    }, 200),
    []
  );

  const handleUpdateSinglePrice = useCallback(async () => {
    const priceBrl = parseFloat(localInputs.priceBrl || '0');
    const priceUsd = parseFloat(localInputs.priceUsd || '0');

    if (!user?.token || priceBrl <= 0 || priceUsd <= 0 || isUpdating) return;

    setIsUpdating(true);
    try {
      await api.post('/credits/update-single-price', {
        service: price.service,
        country: price.country,
        priceBrl,
        priceUsd
      }, { headers: { Authorization: `Bearer ${user.token}` } });

      toast.success('Preço atualizado com sucesso');
      setLocalInputs({ priceBrl: '', priceUsd: '' });
      onPriceUpdate();
    } catch {
      toast.error('Falha ao atualizar preço');
    } finally {
      setIsUpdating(false);
    }
  }, [localInputs, user?.token, price, isUpdating, onPriceUpdate]);

  return (
    <TableRow className="border-border/50 hover:bg-muted/50">
      <TableCell className="font-medium">
        <div className="flex flex-col">
          <span className="font-medium">{price.serviceName || SERVICE_NAME_MAP[price.service] || price.service}</span>
          <span className="text-xs text-muted-foreground">{price.service}</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex flex-col">
          <span className="font-medium">{getCountryName(price.country)}</span>
          <span className="text-xs text-muted-foreground">({price.country})</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="font-mono text-white">
            R$ {price.priceBrl.toFixed(2)}
          </Badge>
          <Input
            type="number"
            placeholder="Novo valor BRL"
            value={localInputs.priceBrl}
            onChange={(e) => debouncedInputChange('priceBrl', e.target.value)}
            className="w-24 h-6 text-xs"
            step="0.01"
            disabled={isUpdating}
          />
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono">
            $ {price.priceUsd.toFixed(2)}
          </Badge>
          <div className="flex items-center gap-1">
            <Input
              type="number"
              placeholder="Novo valor USD"
              value={localInputs.priceUsd}
              onChange={(e) => debouncedInputChange('priceUsd', e.target.value)}
              className="w-24 h-6 text-xs"
              step="0.01"
              disabled={isUpdating}
            />
            <Button
              onClick={handleUpdateSinglePrice}
              size="sm"
              className="h-6 px-2 bg-blue-600 hover:bg-blue-700"
              disabled={isUpdating}
            >
              <TrendingUp className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
});

// Componente Skeleton para loading
const PriceTableSkeleton = () => (
  <div className="space-y-3">
    {Array.from({ length: 10 }).map((_, index) => (
      <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
        <div className="h-4 bg-muted rounded w-24 animate-pulse" />
        <div className="h-4 bg-muted rounded w-32 animate-pulse" />
        <div className="h-6 bg-muted rounded w-20 animate-pulse" />
        <div className="h-6 bg-muted rounded w-20 animate-pulse" />
      </div>
    ))}
  </div>
);

// Componente de paginação avançada
const AdvancedPagination = memo(({ 
  pagination, 
  onPageChange, 
  loading 
}: { 
  pagination: any; 
  onPageChange: (page: number) => void; 
  loading: boolean; 
}) => (
  <div className="flex items-center justify-between mt-6 pt-4 border-t">
    <div className="text-sm text-muted-foreground flex items-center gap-4">
      <span>
        Página {pagination.currentPage} de {pagination.totalPages}
      </span>
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-green-500 rounded-full" title="Cache ativo" />
        <span className="text-xs">Performance otimizada</span>
      </div>
    </div>
    
    <div className="flex items-center gap-1">
      <Button
        onClick={() => onPageChange(pagination.currentPage - 1)}
        disabled={!pagination.canGoPrev || loading}
        variant="outline"
        size="sm"
        className="h-8 w-8 p-0"
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>
      
      {pagination.getVisiblePages.map((page: any, index: number) => (
        <div key={index}>
          {page === '...' ? (
            <div className="px-2 py-1">
              <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
            </div>
          ) : (
            <Button
              onClick={() => onPageChange(page as number)}
              disabled={loading}
              variant={pagination.currentPage === page ? "default" : "outline"}
              size="sm"
              className="h-8 w-8 p-0"
            >
              {page}
            </Button>
          )}
        </div>
      ))}
      
      <Button
        onClick={() => onPageChange(pagination.currentPage + 1)}
        disabled={!pagination.canGoNext || loading}
        variant="outline"
        size="sm"
        className="h-8 w-8 p-0"
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  </div>
));

// Componente PurchaseLogRow
const PurchaseLogRow = ({
  log,
  onRefund,
  getStatusBadgeVariant,
  getStatusText,
}: {
  log: PurchaseLog;
  onRefund: (activationId: string) => void;
  getStatusBadgeVariant: (status: string) => 'outline' | 'default' | 'destructive' | 'secondary';
  getStatusText: (status: string) => string;
}) => {
  const [isRefunding, setIsRefunding] = useState(false);

  const handleRefundClick = useCallback(async () => {
    if (!log.activationId || isRefunding) return;
    if (!confirm('Tem certeza que deseja estornar esta compra?')) return;

    setIsRefunding(true);
    try {
      await onRefund(log.activationId);
    } finally {
      setIsRefunding(false);
    }
  }, [log.activationId, isRefunding, onRefund]);

  return (
    <TableRow className="border-border/50 hover:bg-muted/50">
      <TableCell className="font-mono text-sm">{log.id}</TableCell>
      <TableCell className="font-medium">{log.userName}</TableCell>
      <TableCell className="text-sm">{log.userEmail}</TableCell>
      <TableCell>{log.service}</TableCell>
      <TableCell>{log.country}</TableCell>
      <TableCell className="font-mono">{log.phoneNumber}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="font-mono">
            {log.creditsSpent} créditos
          </Badge>
          <Badge variant="outline" className="font-mono">
            Saldo: {log.userBalance} créditos
          </Badge>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant={getStatusBadgeVariant(log.status)}>
          {getStatusText(log.status)}
        </Badge>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {new Date(log.purchaseDate).toLocaleString('pt-BR')}
      </TableCell>
      <TableCell>
        {log.canRefund ? (
          <Button
            onClick={handleRefundClick}
            size="sm"
            variant="outline"
            className="h-8 px-3"
            disabled={isRefunding}
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            Estornar
          </Button>
        ) : (
          <Badge variant="outline" className="text-muted-foreground">
            {log.status === 'CANCELLED' ? 'Estornado' : 'Não elegível'}
          </Badge>
        )}
      </TableCell>
    </TableRow>
  );
};

export default function AdminConfigPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [markup, setMarkup] = useState(0);
  const [prices, setPrices] = useState<Price[]>([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [affiliateCommission, setAffiliateCommission] = useState(0);
  const [purchaseLogs, setPurchaseLogs] = useState<PurchaseLog[]>([]);
  const [logsTotal, setLogsTotal] = useState(0);
  const [logsPage, setLogsPage] = useState(1);
  const [userEmailFilter, setUserEmailFilter] = useState<string>(''); // Changed to userEmailFilter
  const logsLimit = 20;
  
  // Estados para virtualização de grandes volumes
  const [pricesTotal, setPricesTotal] = useState(0);
  const [serviceFilter, setServiceFilter] = useState<string>('');
  const [countryFilter, setCountryFilter] = useState<string>('');
  const [currentOffset, setCurrentOffset] = useState(0);
  const [windowSize] = useState(10); // Apenas 10 itens por vez
  
  // Sistema de virtualização
  const virtualizationManager = useMemo(() => new VirtualizationManager(), []);
  const [cacheStats, setCacheStats] = useState<{ size: number; keys: string[] }>({ size: 0, keys: [] });
  
  // Estados de loading otimizados para virtualização
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isCreditsTabLoading, setIsCreditsTabLoading] = useState(false);
  const [creditsTabInitialized, setCreditsTabInitialized] = useState(false);
  const [isLoadingWindow, setIsLoadingWindow] = useState(false);
  const [loading, setLoading] = useState<LoadingState>({
    initial: true,
    users: false,
    markup: false,
    prices: false,
    withdrawals: false,
    commission: false,
    purchases: false
  });

  // Carregamento inicial otimizado
  const fetchInitialData = useCallback(async () => {
    if (!user?.token) return;

    setLoading(prev => ({ ...prev, initial: true }));

    try {
      // Carrega apenas dados essenciais primeiro
      const [markupResponse, commissionResponse] = await Promise.all([
        api.get('/credits/markup', { headers: { Authorization: `Bearer ${user.token}` } }),
        api.get('/affiliate/commission', { headers: { Authorization: `Bearer ${user.token}` } })
      ]);

      setMarkup(markupResponse.data.percentage);
      setAffiliateCommission(commissionResponse.data.percentage);
    } catch {
      toast.error('Falha ao carregar configurações iniciais');
    } finally {
      setLoading(prev => ({ ...prev, initial: false }));
    }
  }, [user?.token]);

  // Carregamento lazy por aba
  const loadUsersData = useCallback(async () => {
    if (!user?.token || loading.users) return;

    setLoading(prev => ({ ...prev, users: true }));
    try {
      const usersResponse = await api.get('/users', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setUsers(usersResponse.data);
    } catch {
      toast.error('Falha ao carregar usuários');
    } finally {
      setLoading(prev => ({ ...prev, users: false }));
    }
  }, [user?.token, loading.users]);

  // Função de carregamento com virtualização - apenas uma janela de 10 itens
  const loadPricesWindow = useCallback(async (offset: number = currentOffset, service?: string, country?: string) => {
    if (!user?.token || isLoadingWindow) return;

    setIsLoadingWindow(true);
    setLoading(prev => ({ ...prev, prices: true }));

    try {
      const fetchData = async () => {
        // Usar endpoint otimizado do backend
        let endpoint = '/credits/prices';
        const params: any = {
          limit: windowSize, // Apenas 10 itens por vez
          offset: offset,
          includeTotal: 'true' // Solicitar total do backend
        };
        
        // Se temos um filtro de serviço, usar o novo endpoint de filtro por nome
        if (service) {
          endpoint = '/credits/prices/filter-by-name';
          params.serviceName = service;
        } else if (country) {
          endpoint = '/credits/prices/filter-by-country-name';
          params.countryName = country;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

        try {
          const response = await api.get(endpoint, {
            headers: { Authorization: `Bearer ${user.token}` },
            params,
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          return response.data;
        } catch (error: any) {
          clearTimeout(timeoutId);
          if (error.name === 'AbortError') {
            throw new Error('Timeout: Servidor muito lento');
          }
          throw error;
        }
      };

      const data = await virtualizationManager.getOrFetchWindow(
        offset, 
        service, 
        country, 
        fetchData
      );

      // Backend agora retorna { prices: [], total: number } quando includeTotal=true
      if (data && typeof data === 'object' && 'prices' in data) {
        setPrices(data.prices || []);
        setPricesTotal(data.total || 0);
      } else {
        // Fallback para formato antigo
        setPrices(Array.isArray(data) ? data : []);
        setPricesTotal(Array.isArray(data) ? data.length : 0);
      }
      setCacheStats(virtualizationManager.getStats());

    } catch (error) {
      console.error('Error loading prices window:', error);
      toast.error('Falha ao carregar dados');
    } finally {
      setIsLoadingWindow(false);
      setLoading(prev => ({ ...prev, prices: false }));
      setIsInitialLoad(false);
    }
  }, [user?.token, isLoadingWindow, currentOffset, windowSize, virtualizationManager]);

  // Função específica para carregar dados da aba créditos com virtualização
  const loadCreditsTabData = useCallback(async () => {
    if (!user?.token || creditsTabInitialized || isCreditsTabLoading) return;

    setIsCreditsTabLoading(true);
    
    try {
      // Carregar apenas a primeira janela (10 itens)
      setCurrentOffset(0);
      await loadPricesWindow(0, serviceFilter || undefined, countryFilter || undefined);
      setCreditsTabInitialized(true);
    } catch (error) {
      console.error('Failed to load credits tab data:', error);
      toast.error('Falha ao carregar dados da aba créditos');
    } finally {
      setIsCreditsTabLoading(false);
    }
  }, [user?.token, creditsTabInitialized, isCreditsTabLoading, serviceFilter, countryFilter, loadPricesWindow]);

  // Funções de navegação para virtualização
  const goToNextWindow = useCallback(() => {
    if (currentOffset + windowSize < pricesTotal && !isLoadingWindow) {
      const newOffset = currentOffset + windowSize;
      setCurrentOffset(newOffset);
      loadPricesWindow(newOffset, serviceFilter || undefined, countryFilter || undefined);
    }
  }, [currentOffset, windowSize, pricesTotal, isLoadingWindow, serviceFilter, countryFilter, loadPricesWindow]);

  const goToPrevWindow = useCallback(() => {
    if (currentOffset > 0 && !isLoadingWindow) {
      const newOffset = Math.max(0, currentOffset - windowSize);
      setCurrentOffset(newOffset);
      loadPricesWindow(newOffset, serviceFilter || undefined, countryFilter || undefined);
    }
  }, [currentOffset, windowSize, isLoadingWindow, serviceFilter, countryFilter, loadPricesWindow]);

  const goToFirstWindow = useCallback(() => {
    if (!isLoadingWindow) {
      setCurrentOffset(0);
      loadPricesWindow(0, serviceFilter || undefined, countryFilter || undefined);
    }
  }, [isLoadingWindow, serviceFilter, countryFilter, loadPricesWindow]);

  const goToLastWindow = useCallback(() => {
    if (!isLoadingWindow && pricesTotal > 0) {
      const lastOffset = Math.max(0, pricesTotal - windowSize);
      setCurrentOffset(lastOffset);
      loadPricesWindow(lastOffset, serviceFilter || undefined, countryFilter || undefined);
    }
  }, [isLoadingWindow, pricesTotal, windowSize, serviceFilter, countryFilter, loadPricesWindow]);

  const loadWithdrawalsData = useCallback(async () => {
    if (!user?.token || loading.withdrawals) return;

    setLoading(prev => ({ ...prev, withdrawals: true }));
    try {
      const withdrawalsResponse = await api.get('/affiliate/withdrawals', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setWithdrawalRequests(withdrawalsResponse.data);
    } catch {
      toast.error('Falha ao carregar solicitações de saque');
    } finally {
      setLoading(prev => ({ ...prev, withdrawals: false }));
    }
  }, [user?.token, loading.withdrawals]);

  const loadPurchaseLogs = useCallback(async () => {
    if (!user?.token || loading.purchases) return;

    setLoading(prev => ({ ...prev, purchases: true }));
    try {
      const res = await api.get('/admin/purchase-logs', {
        headers: { Authorization: `Bearer ${user.token}` },
        params: { page: logsPage, limit: logsLimit, userEmail: userEmailFilter || undefined }
      });
      setPurchaseLogs(res.data.logs);
      setLogsTotal(res.data.total);
    } catch {
      toast.error('Falha ao carregar logs de compras');
    } finally {
      setLoading(prev => ({ ...prev, purchases: false }));
    }
  }, [user?.token, loading.purchases, logsPage, userEmailFilter]);

  // Handlers otimizados com debounce
  const debouncedMarkupUpdate = useCallback(
    debounce(async (newMarkup: number) => {
      if (!user?.token) return;

      setLoading(prev => ({ ...prev, markup: true }));
      try {
        await api.post('/credits/update-markup', { percentage: newMarkup }, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        toast.success('Markup atualizado com sucesso');
      } catch {
        toast.error('Falha ao atualizar markup');
      } finally {
        setLoading(prev => ({ ...prev, markup: false }));
      }
    }, 1000),
    [user?.token]
  );

  const debouncedCommissionUpdate = useCallback(
    debounce(async (newCommission: number) => {
      if (!user?.token) return;

      setLoading(prev => ({ ...prev, commission: true }));
      try {
        await api.post('/affiliate/commission', { percentage: newCommission }, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        toast.success('Comissão de afiliado atualizada com sucesso');
      } catch {
        toast.error('Falha ao atualizar comissão de afiliado');
      } finally {
        setLoading(prev => ({ ...prev, commission: false }));
      }
    }, 1000),
    [user?.token]
  );

  const handleRefreshPrices = useCallback(async () => {
    if (!user?.token || loading.prices) return;

    setLoading(prev => ({ ...prev, prices: true }));
    try {
      await api.post('/credits/refresh-prices', {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      await loadPricesWindow(currentOffset, serviceFilter || undefined, countryFilter || undefined);
      toast.success('Preços atualizados com sucesso');
    } catch {
      toast.error('Falha ao atualizar preços');
    } finally {
      setLoading(prev => ({ ...prev, prices: false }));
    }
  }, [user?.token, loading.prices, loadPricesWindow, currentOffset, serviceFilter, countryFilter]);

  const handleUpdateWithdrawalStatus = useCallback(async (withdrawalId: number, status: 'APPROVED' | 'CANCELLED') => {
    if (!user?.token) return;

    try {
      await api.patch(`/affiliate/withdrawals/${withdrawalId}`, { status }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      const statusText = status === 'APPROVED' ? 'aprovada' : 'cancelada';
      toast.success(`Solicitação de saque ${statusText} com sucesso`);

      setWithdrawalRequests(prev =>
        prev.map(request =>
          request.id === withdrawalId ? { ...request, status } : request
        )
      );
    } catch {
      toast.error('Falha ao atualizar status da solicitação');
    }
  }, [user?.token]);

  const handleProcessAutomaticRefunds = useCallback(async () => {
    if (!user?.token || loading.purchases) return;

    setLoading(prev => ({ ...prev, purchases: true }));
    try {
      const res = await api.post('/admin/process-automatic-refunds', {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      toast.success(`Estornos automáticos processados: ${res.data.processedCount} compras estornadas`);
      await loadPurchaseLogs();
    } catch {
      toast.error('Falha ao processar estornos automáticos');
    } finally {
      setLoading(prev => ({ ...prev, purchases: false }));
    }
  }, [user?.token, loading.purchases, loadPurchaseLogs]);

  const handleRefund = useCallback(async (activationId: string) => {
    if (!user?.token) return;

    try {
      await api.post('/admin/refund', { activationId }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      toast.success('Compra estornada com sucesso');
      await loadPurchaseLogs();
      await loadUsersData(); // Atualiza saldos de usuários
    } catch {
      toast.error('Falha ao estornar compra');
    }
  }, [user?.token, loadPurchaseLogs, loadUsersData]);

  const handleRefundUser = useCallback(async (userEmail: string) => {
    if (!user?.token || loading.purchases) return;

    if (!confirm(`Tem certeza que deseja estornar todas as compras elegíveis do usuário com email ${userEmail}?`)) return;

    setLoading(prev => ({ ...prev, purchases: true }));
    try {
      const res = await api.post('/admin/refund-user', { userEmail }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      toast.success(`Estornos processados para usuário ${userEmail}: ${res.data.processedCount} compras estornadas`);
      await loadPurchaseLogs();
      await loadUsersData(); // Atualiza saldos de usuários
    } catch {
      toast.error('Falha ao processar estornos do usuário');
    } finally {
      setLoading(prev => ({ ...prev, purchases: false }));
    }
  }, [user?.token, loading.purchases, loadPurchaseLogs, loadUsersData]);

  // Callbacks para atualizar dados específicos
  const handleUserBalanceUpdate = useCallback(() => {
    loadUsersData();
  }, [loadUsersData]);

  const handlePriceUpdate = useCallback(() => {
    // Limpar cache quando preços são atualizados
    virtualizationManager.clear();
    setCacheStats(virtualizationManager.getStats());
    loadPricesWindow(currentOffset, serviceFilter || undefined, countryFilter || undefined);
  }, [loadPricesWindow, currentOffset, serviceFilter, countryFilter, virtualizationManager]);

  // Funções de busca com botões
  const handleServiceSearch = useCallback(() => {
    setCurrentOffset(0);
    virtualizationManager.clear();
    loadPricesWindow(0, serviceFilter || undefined, countryFilter || undefined);
  }, [serviceFilter, countryFilter, loadPricesWindow, virtualizationManager]);

  const handleCountrySearch = useCallback(() => {
    setCurrentOffset(0);
    virtualizationManager.clear();
    loadPricesWindow(0, serviceFilter || undefined, countryFilter || undefined);
  }, [serviceFilter, countryFilter, loadPricesWindow, virtualizationManager]);

  const clearFilters = useCallback(() => {
    setServiceFilter('');
    setCountryFilter('');
    setCurrentOffset(0);
    virtualizationManager.clear();
    setCacheStats(virtualizationManager.getStats());
    loadPricesWindow(0);
  }, [loadPricesWindow, virtualizationManager]);

  // Utilitários memoizados
  const getStatusBadgeVariant = useMemo(() => (status: string) => {
    switch (status) {
      case 'PENDING':
      case 'WAITING':
        return 'outline';
      case 'COMPLETED':
        return 'default';
      case 'CANCELLED':
        return 'destructive';
      default:
        return 'outline';
    }
  }, []);

  const getStatusText = useMemo(() => (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Pendente';
      case 'WAITING':
        return 'Aguardando';
      case 'COMPLETED':
        return 'Completo';
      case 'CANCELLED':
        return 'Cancelado';
      default:
        return status;
    }
  }, []);

  // Effects
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/');
      return;
    }

    fetchInitialData();
  }, [user, router, fetchInitialData]);

  // Lazy loading otimizado para aba créditos (120k+ dados)
  useEffect(() => {
    // Não carrega automaticamente - apenas quando a aba for clicada
  }, []);

  // Não precisa de useEffect para paginação com virtualização

  useEffect(() => {
    if (logsPage > 1 && purchaseLogs.length === 0) {
      setLogsPage(1);
    }
  }, [purchaseLogs.length, logsPage]);

  // Componente de Loading otimizado
  if (loading.initial) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary/30 via-background to-primary/10">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
        />
        <span className="ml-3 font-custom-bold text-lg">Carregando configurações...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary/30 via-background to-primary/10 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto py-8">
        <Navbar />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-8"
        >
          {/* Header */}
          <div className="flex items-center gap-4 mb-8 mt-20">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg">
              <Settings className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-custom-bold text-foreground">Painel Administrativo</h1>
              <p className="text-muted-foreground">Gerencie usuários, preços e configurações do sistema</p>
            </div>
          </div>

          <Tabs
            defaultValue="users"
            className="w-full"
            onValueChange={(value) => {
              if (value === 'users' && users.length === 0) loadUsersData();
              if (value === 'credits' && !creditsTabInitialized && !isCreditsTabLoading) {
                loadCreditsTabData();
              }
              if (value === 'affiliate' && withdrawalRequests.length === 0) loadWithdrawalsData();
              if (value === 'purchases' && purchaseLogs.length === 0) loadPurchaseLogs();
            }}
          >
            <TabsList className="grid w-full grid-cols-4 mb-8 bg-card/80 backdrop-blur-lg border-0 shadow-lg">
              <TabsTrigger value="users" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium">
                <Users className="w-4 h-4 mr-2" />
                Usuários
              </TabsTrigger>
              <TabsTrigger value="credits" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium">
                <CreditCard className={`w-4 h-4 mr-2 ${isCreditsTabLoading ? 'animate-pulse' : ''}`} />
                Créditos
                {isCreditsTabLoading && (
                  <Loader2 className="w-3 h-3 ml-1 animate-spin" />
                )}
              </TabsTrigger>
              <TabsTrigger value="affiliate" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium">
                <UserPlus className="w-4 h-4 mr-2" />
                Afiliados
              </TabsTrigger>
              <TabsTrigger value="purchases" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Compras
              </TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="space-y-6">
              <Card className="shadow-xl border-0 bg-card/80 backdrop-blur-lg">
                <CardHeader className="pb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary" />
                        Gerenciamento de Usuários
                      </CardTitle>
                      <CardDescription>
                        Visualize e gerencie os saldos dos usuários cadastrados no sistema
                      </CardDescription>
                    </div>
                    <Button
                      onClick={loadUsersData}
                      variant="outline"
                      size="sm"
                      disabled={loading.users}
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 ${loading.users ? 'animate-spin' : ''}`} />
                      Atualizar
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading.users ? (
                    <div className="flex items-center justify-center py-12">
                      <RefreshCw className="w-6 h-6 animate-spin text-primary mr-2" />
                      <span>Carregando usuários...</span>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-border/50">
                            <TableHead>ID</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Nome</TableHead>
                            <TableHead>Créditos</TableHead>
                            <TableHead>Saldo Afiliado</TableHead>
                            <TableHead>Criado em</TableHead>
                            <TableHead>Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {users.map((userData) => (
                            <UserRow
                              key={userData.id}
                              userData={userData}
                              onBalanceUpdate={handleUserBalanceUpdate}
                            />
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                  {!loading.users && users.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground flex flex-col items-center gap-2">
                      <AlertCircle className="w-8 h-8 text-muted-foreground/50" />
                      <p>Nenhum usuário encontrado</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="credits" className="space-y-6">
              <Card className="shadow-xl border-0 bg-card/80 backdrop-blur-lg">
                <CardHeader className="pb-6">
                  <CardTitle className="flex items-center gap-2">
                    <Percent className="w-5 h-5 text-primary" />
                    Configuração de Markup
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-blue-500" />
                    Define a margem de lucro aplicada sobre os preços base em porcentagem (%)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 max-w-xs">
                      <Label htmlFor="markup" className="text-sm font-medium mb-2 block">
                        Markup (%)
                      </Label>
                      <div className="relative">
                        <Input
                          id="markup"
                          type="number"
                          value={markup}
                          onChange={(e) => {
                            const newValue = parseFloat(e.target.value);
                            setMarkup(newValue);
                            debouncedMarkupUpdate(newValue);
                          }}
                          placeholder="Ex: 15"
                          className="pl-8 h-12 bg-background/50 border-border/50 focus:border-primary"
                          step="0.1"
                          min="0"
                          disabled={loading.markup}
                        />
                        <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                    <Button
                      onClick={handleRefreshPrices}
                      variant="outline"
                      className="h-12 px-6 mt-6 border-border/50 hover:bg-primary hover:text-primary-foreground"
                      disabled={loading.prices}
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 ${loading.prices ? 'animate-spin' : ''}`} />
                      Atualizar Preços
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-xl border-0 bg-card/80 backdrop-blur-lg">
                <CardHeader className="pb-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Banknote className="w-5 h-5 text-primary" />
                        Tabela de Preços
                      </CardTitle>
                      <CardDescription>
                        Preços atuais dos serviços por país com markup aplicado
                      </CardDescription>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        onClick={clearFilters}
                        variant="outline"
                        size="sm"
                        className="h-9"
                      >
                        <Filter className="w-4 h-4 mr-2" />
                        Limpar Filtros
                      </Button>
                      <Button
                        onClick={() => {
                          virtualizationManager.clear();
                          loadPricesWindow(currentOffset, serviceFilter || undefined, countryFilter || undefined);
                        }}
                        variant="outline"
                        size="sm"
                        disabled={isLoadingWindow}
                        className="h-9"
                      >
                        <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingWindow ? 'animate-spin' : ''}`} />
                        Recarregar
                      </Button>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        <span>Cache: {cacheStats.size} páginas</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Filtros de busca otimizados para grandes volumes */}
                  <div className="mt-4">
                    <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="flex-1">
                        <Label htmlFor="serviceFilter" className="text-sm font-medium mb-2 block">
                          Filtrar por Serviço
                        </Label>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              id="serviceFilter"
                              placeholder="Ex: WhatsApp, Telegram..."
                              value={serviceFilter}
                              onChange={(e) => setServiceFilter(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && handleServiceSearch()}
                              className="pl-10 h-9 text-sm"
                            />
                          </div>
                          <Button
                            onClick={handleServiceSearch}
                            disabled={isLoadingWindow}
                            size="sm"
                            className="h-9 px-4"
                          >
                            <Search className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex-1">
                        <Label htmlFor="countryFilter" className="text-sm font-medium mb-2 block">
                          Filtrar por País
                        </Label>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              id="countryFilter"
                              placeholder="Ex: Brasil, Argentina..."
                              value={countryFilter}
                              onChange={(e) => setCountryFilter(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && handleCountrySearch()}
                              className="pl-10 h-9 text-sm"
                            />
                          </div>
                          <Button
                            onClick={handleCountrySearch}
                            disabled={isLoadingWindow}
                            size="sm"
                            className="h-9 px-4"
                          >
                            <Search className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {isCreditsTabLoading ? (
                    <div className="flex flex-col items-center justify-center py-16 space-y-4">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      <div className="text-center">
                        <h3 className="font-medium">Carregando dados de créditos...</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Sistema otimizado - carregando apenas 10 registros por vez
                        </p>
                        <div className="mt-3 text-xs text-muted-foreground">
                          ⚡ Backend otimizado com paginação real
                        </div>
                      </div>
                    </div>
                  ) : isLoadingWindow ? (
                    <PriceTableSkeleton />
                  ) : (
                    <>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="border-border/50">
                              <TableHead>Serviço</TableHead>
                              <TableHead>País</TableHead>
                              <TableHead>Preço (BRL)</TableHead>
                              <TableHead>Preço (USD)</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {prices.map((price, index) => (
                              <PriceRow
                                key={`${price.service}-${price.country}-${index}`}
                                price={price}
                                onPriceUpdate={handlePriceUpdate}
                              />
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                      
                      {/* Aviso sobre virtualização */}
                      {pricesTotal > 1000 && (
                        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center gap-2 text-green-800">
                            <Info className="w-4 h-4" />
                            <span className="font-medium">Sistema Otimizado Ativo</span>
                          </div>
                          <p className="text-sm text-green-700 mt-1">
                            {pricesTotal.toLocaleString()} registros disponíveis. Backend otimizado com paginação real - carregando apenas {windowSize} itens por vez.
                          </p>
                        </div>
                      )}

                      {/* Indicadores de performance com virtualização */}
                      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-4">
                          <span>📊 {prices.length} de {pricesTotal.toLocaleString()} preços</span>
                          <span>⚡ Cache: {cacheStats.size} janelas</span>
                          <span>🚀 Virtualização ativa</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                          <span>Carregamento</span>
                        </div>
                      </div>
                      
                      {/* Controles de virtualização */}
                      <div className="mt-6 flex items-center justify-between pt-4 border-t">
                        <div className="text-sm text-muted-foreground">
                          Mostrando {currentOffset + 1} a {Math.min(currentOffset + windowSize, pricesTotal)} de {pricesTotal.toLocaleString()} registros
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={goToFirstWindow}
                            disabled={currentOffset === 0 || isLoadingWindow}
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <ChevronsLeft className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={goToPrevWindow}
                            disabled={currentOffset === 0 || isLoadingWindow}
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </Button>
                          
                          <div className="px-3 py-1 bg-muted rounded text-sm font-medium">
                            {Math.floor(currentOffset / windowSize) + 1} / {Math.ceil(pricesTotal / windowSize)}
                          </div>
                          
                          <Button
                            onClick={goToNextWindow}
                            disabled={currentOffset + windowSize >= pricesTotal || isLoadingWindow}
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={goToLastWindow}
                            disabled={currentOffset + windowSize >= pricesTotal || isLoadingWindow}
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <ChevronsRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                  {!loading.prices && prices.length === 0 && !isInitialLoad && (
                    <div className="text-center py-12 text-muted-foreground flex flex-col items-center gap-2">
                      <AlertCircle className="w-8 h-8 text-muted-foreground/50" />
                      <p>Nenhum preço encontrado.</p>
                      {(serviceFilter || countryFilter) && (
                        <Button onClick={clearFilters} variant="outline" size="sm" className="mt-2">
                          Limpar filtros
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="affiliate" className="space-y-6">
              <Card className="shadow-xl border-0 bg-card/80 backdrop-blur-lg">
                <CardHeader className="pb-6">
                  <CardTitle className="flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-primary" />
                    Configuração de Comissão de Afiliados
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-blue-500" />
                    Define a porcentagem de comissão para o programa de afiliados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 max-w-xs">
                      <Label htmlFor="affiliateCommission" className="text-sm font-medium mb-2 block">
                        Comissão (%)
                      </Label>
                      <div className="relative">
                        <Input
                          id="affiliateCommission"
                          type="number"
                          value={affiliateCommission}
                          onChange={(e) => {
                            const newValue = parseFloat(e.target.value);
                            setAffiliateCommission(newValue);
                            debouncedCommissionUpdate(newValue);
                          }}
                          placeholder="Ex: 10"
                          className="pl-8 h-12 bg-background/50 border-border/50 focus:border-primary"
                          step="0.1"
                          min="0"
                          disabled={loading.commission}
                        />
                        <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                    <Button
                      onClick={loadWithdrawalsData}
                      variant="outline"
                      className="h-12 px-6 border-border/50 mt-6 hover:bg-primary hover:text-primary-foreground"
                      disabled={loading.withdrawals}
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 ${loading.withdrawals ? 'animate-spin' : ''}`} />
                      Atualizar Solicitações
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-xl border-0 bg-card/80 backdrop-blur-lg">
                <CardHeader className="pb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Wallet className="w-5 h-5 text-primary" />
                        Solicitações de Saque
                      </CardTitle>
                      <CardDescription>
                        Gerencie as solicitações de saque do programa de afiliados
                      </CardDescription>
                    </div>
                    <Button
                      onClick={loadWithdrawalsData}
                      variant="outline"
                      size="sm"
                      disabled={loading.withdrawals}
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 ${loading.withdrawals ? 'animate-spin' : ''}`} />
                      Recarregar
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading.withdrawals ? (
                    <div className="flex items-center justify-center py-12">
                      <RefreshCw className="w-6 h-6 animate-spin text-primary mr-2" />
                      <span>Carregando solicitações...</span>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-border/50">
                            <TableHead>ID</TableHead>
                            <TableHead>Usuário</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Valor (R$)</TableHead>
                            <TableHead>Chave PIX</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Data</TableHead>
                            <TableHead>Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {withdrawalRequests.map((request) => (
                            <TableRow key={request.id} className="border-border/50 hover:bg-muted/50">
                              <TableCell className="font-mono text-sm">{request.id}</TableCell>
                              <TableCell className="font-medium">{request.user.name}</TableCell>
                              <TableCell className="text-sm">{request.user.email}</TableCell>
                              <TableCell>
                                <Badge variant="secondary" className="font-mono">
                                  R$ {request.amount.toFixed(2)}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm">{request.pixKey}</TableCell>
                              <TableCell>
                                <Badge variant={getStatusBadgeVariant(request.status)}>
                                  {getStatusText(request.status)}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {new Date(request.createdAt).toLocaleDateString('pt-BR')}
                              </TableCell>
                              <TableCell>
                                {request.status === 'PENDING' ? (
                                  <div className="flex gap-2">
                                    <Button
                                      onClick={() => handleUpdateWithdrawalStatus(request.id, 'APPROVED')}
                                      size="sm"
                                      className="bg-green-600 hover:bg-green-700 h-8 px-3"
                                    >
                                      <Check className="w-3 h-3 mr-1" />
                                      Aprovar
                                    </Button>
                                    <Button
                                      onClick={() => handleUpdateWithdrawalStatus(request.id, 'CANCELLED')}
                                      size="sm"
                                      variant="destructive"
                                      className="h-8 px-3"
                                    >
                                      <X className="w-3 h-3 mr-1" />
                                      Cancelar
                                    </Button>
                                  </div>
                                ) : (
                                  <Badge variant="outline" className="text-muted-foreground">
                                    {request.status === 'APPROVED' ? (
                                      <>
                                        <Check className="w-3 h-3 mr-1" />
                                        Processado
                                      </>
                                    ) : (
                                      <>
                                        <X className="w-3 h-3 mr-1" />
                                        Cancelado
                                      </>
                                    )}
                                  </Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                  {!loading.withdrawals && withdrawalRequests.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground flex flex-col items-center gap-2">
                      <AlertCircle className="w-8 h-8 text-muted-foreground/50" />
                      <p>Nenhuma solicitação de saque encontrada</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="purchases" className="space-y-6">
              <Card className="shadow-xl border-0 bg-card/80 backdrop-blur-lg">
                <CardHeader className="pb-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5 text-primary" />
                        Logs de Compras
                      </CardTitle>
                      <CardDescription>
                        Visualize e gerencie as compras de serviços SMS
                      </CardDescription>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-2 sm:items-center">
                      <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                        <Label htmlFor="userEmailFilter" className="text-sm font-medium sm:whitespace-nowrap">
                          Filtrar por Email do Usuário
                        </Label>
                        <Input
                          id="userEmailFilter"
                          type="email"
                          placeholder="Email do usuário"
                          value={userEmailFilter}
                          onChange={(e) => setUserEmailFilter(e.target.value)}
                          className="w-full sm:w-48 h-9 text-sm"
                        />
                        <Button
                          onClick={loadPurchaseLogs}
                          variant="outline"
                          size="sm"
                          className="h-9"
                          disabled={loading.purchases}
                        >
                          Filtrar
                        </Button>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                          onClick={() => userEmailFilter && handleRefundUser(userEmailFilter)}
                          variant="outline"
                          size="sm"
                          className="h-9"
                          disabled={loading.purchases || !userEmailFilter}
                        >
                          <RotateCcw className={`w-4 h-4 mr-2 ${loading.purchases ? 'animate-spin' : ''}`} />
                          Estornar Compras do Usuário
                        </Button>
                        <Button
                          onClick={handleProcessAutomaticRefunds}
                          variant="outline"
                          size="sm"
                          className="h-9"
                          disabled={loading.purchases}
                        >
                          <RotateCcw className={`w-4 h-4 mr-2 ${loading.purchases ? 'animate-spin' : ''}`} />
                          Processar Estornos Automáticos
                        </Button>
                        <Button
                          onClick={loadPurchaseLogs}
                          variant="outline"
                          size="sm"
                          className="h-9"
                          disabled={loading.purchases}
                        >
                          <RefreshCw className={`w-4 h-4 mr-2 ${loading.purchases ? 'animate-spin' : ''}`} />
                          Atualizar
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading.purchases ? (
                    <div className="flex items-center justify-center py-12">
                      <RefreshCw className="w-6 h-6 animate-spin text-primary mr-2" />
                      <span>Carregando logs de compras...</span>
                    </div>
                  ) : (
                    <>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="border-border/50">
                              <TableHead>ID</TableHead>
                              <TableHead>Usuário</TableHead>
                              <TableHead>Email</TableHead>
                              <TableHead>Serviço</TableHead>
                              <TableHead>País</TableHead>
                              <TableHead>Telefone</TableHead>
                              <TableHead>Créditos</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Data</TableHead>
                              <TableHead>Ações</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {purchaseLogs.map((log) => (
                              <PurchaseLogRow
                                key={log.id}
                                log={log}
                                onRefund={handleRefund}
                                getStatusBadgeVariant={getStatusBadgeVariant}
                                getStatusText={getStatusText}
                              />
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                      <div className="flex justify-between mt-4">
                        <Button
                          onClick={() => setLogsPage(prev => Math.max(1, prev - 1))}
                          disabled={logsPage === 1 || loading.purchases}
                          variant="outline"
                        >
                          Anterior
                        </Button>
                        <span className="self-center text-muted-foreground">
                          Página {logsPage} de {Math.ceil(logsTotal / logsLimit)}
                        </span>
                        <Button
                          onClick={() => setLogsPage(prev => prev + 1)}
                          disabled={(logsPage * logsLimit) >= logsTotal || loading.purchases}
                          variant="outline"
                        >
                          Próxima
                        </Button>
                      </div>
                    </>
                  )}
                  {!loading.purchases && purchaseLogs.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground flex flex-col items-center gap-2">
                      <AlertCircle className="w-8 h-8 text-muted-foreground/50" />
                      <p>Nenhum log de compra encontrado</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
      <Toaster />
    </div>
  );
}