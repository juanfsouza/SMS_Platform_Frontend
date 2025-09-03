'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Suspense } from 'react';

export default function ConfirmEmailPage() {
  return (
    <Suspense>
      <ConfirmEmailContent />
    </Suspense>
  );
}

function ConfirmEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();

  useEffect(() => {
    const confirmEmail = async () => {
      if (!token) {
        toast.error('Token inválido.', {
          style: {
            background: 'oklch(0.6368 0.2078 25.3313)',
            color: 'oklch(1.0000 0 0)',
            border: 'none',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          },
          duration: 3000,
          position: 'top-right',
        });
        router.push('/login');
        return;
      }
      try {
        await api.get(`/confirm-email?token=${token}`);
        toast.success('E-mail confirmado! Você pode fazer login agora.', {
          style: {
            background: 'oklch(0.6936 0.164 254.35)',
            color: 'oklch(1.0000 0 0)',
            border: 'none',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          },
          duration: 3000,
          position: 'top-right',
        });
        router.push('/login');
      } catch {
        toast.error('Erro ao confirmar e-mail. Tente novamente.', {
          style: {
            background: 'oklch(0.6368 0.2078 25.3313)',
            color: 'oklch(1.0000 0 0)',
            border: 'none',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          },
          duration: 3000,
          position: 'top-right',
        });
        router.push('/login');
      }
    };
    confirmEmail();
  }, [token, router]);

  return <div className="min-h-screen flex items-center justify-center">Confirmando e-mail...</div>;
}