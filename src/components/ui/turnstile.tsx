'use client';

import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';

export interface TurnstileRef {
  reset: () => void;
  getResponse: () => string | null;
}

interface TurnstileProps {
  siteKey: string;
  onSuccess?: (token: string) => void;
  onError?: (error: string) => void;
  onExpire?: () => void;
  theme?: 'light' | 'dark' | 'auto';
  size?: 'normal' | 'compact';
  className?: string;
}

interface TurnstileRenderOptions {
  sitekey: string;
  theme?: 'light' | 'dark' | 'auto';
  size?: 'normal' | 'compact';
  callback?: (token: string) => void;
  'error-callback'?: (error: string) => void;
  'expired-callback'?: () => void;
}

declare global {
  interface Window {
    turnstile: {
      render: (element: string | HTMLElement, options: TurnstileRenderOptions) => string;
      reset: (widgetId: string) => void;
      getResponse: (widgetId: string) => string;
      remove: (widgetId: string) => void;
    };
    onloadTurnstileCallback: () => void;
  }
}

export const Turnstile = forwardRef<TurnstileRef, TurnstileProps>(
  ({ siteKey, onSuccess, onError, onExpire, theme = 'auto', size = 'normal', className }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);
    const scriptLoadedRef = useRef(false);

    useImperativeHandle(ref, () => ({
      reset: () => {
        if (widgetIdRef.current && window.turnstile) {
          window.turnstile.reset(widgetIdRef.current);
        }
      },
      getResponse: () => {
        if (widgetIdRef.current && window.turnstile) {
          return window.turnstile.getResponse(widgetIdRef.current);
        }
        return null;
      },
    }));

    const loadTurnstileScript = () => {
      return new Promise<void>((resolve) => {
        if (window.turnstile || scriptLoadedRef.current) {
          resolve();
          return;
        }

        window.onloadTurnstileCallback = () => {
          scriptLoadedRef.current = true;
          resolve();
        };

        const script = document.createElement('script');
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback';
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      });
    };

    const renderTurnstile = async () => {
      if (!containerRef.current) return;

      await loadTurnstileScript();

      if (window.turnstile && containerRef.current) {
        if (widgetIdRef.current) {
          try {
            window.turnstile.remove(widgetIdRef.current);
          } catch (error: unknown) {
            console.warn('Failed to remove existing turnstile widget:', error);
          }
        }

        containerRef.current.innerHTML = '';

        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme,
          size,
          callback: (token: string) => {
            onSuccess?.(token);
          },
          'error-callback': (error: string) => {
            onError?.(error);
          },
          'expired-callback': () => {
            onExpire?.();
          },
        });
      }
    };

    useEffect(() => {
      renderTurnstile();

      return () => {
        if (widgetIdRef.current && window.turnstile) {
          try {
            window.turnstile.remove(widgetIdRef.current);
          } catch (error: unknown) {
            console.warn('Failed to cleanup turnstile widget:', error);
          }
        }
      };
    }, [siteKey, theme, size]);

    return <div ref={containerRef} className={className} />;
  }
);

Turnstile.displayName = 'Turnstile';