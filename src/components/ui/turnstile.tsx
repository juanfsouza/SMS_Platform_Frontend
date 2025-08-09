'use client';

import { useEffect, useRef, forwardRef, useImperativeHandle, useState } from 'react';

export interface TurnstileRef {
  reset: () => void;
  getResponse: () => string | null;
  render: () => void;
}

interface TurnstileProps {
  siteKey: string;
  onSuccess?: (token: string) => void;
  onError?: (error: string) => void;
  onExpire?: () => void;
  theme?: 'light' | 'dark' | 'auto';
  size?: 'normal' | 'compact';
  className?: string;
  retryOnFailure?: boolean;
  maxRetries?: number;
}

interface TurnstileRenderOptions {
  sitekey: string;
  theme?: 'light' | 'dark' | 'auto';
  size?: 'normal' | 'compact';
  callback?: (token: string) => void;
  'error-callback'?: (error: string) => void;
  'expired-callback'?: () => void;
  'timeout-callback'?: () => void;
}

declare global {
  interface Window {
    turnstile?: {
      render: (element: string | HTMLElement, options: TurnstileRenderOptions) => string;
      reset: (widgetId: string) => void;
      getResponse: (widgetId: string) => string;
      remove: (widgetId: string) => void;
      ready: (callback: () => void) => void;
    };
    onloadTurnstileCallback?: () => void;
  }
}

export const Turnstile = forwardRef<TurnstileRef, TurnstileProps>(
  ({ 
    siteKey, 
    onSuccess, 
    onError, 
    onExpire, 
    theme = 'auto', 
    size = 'normal', 
    className,
    retryOnFailure = true,
    maxRetries = 3
  }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);
    const scriptLoadedRef = useRef(false);
    const retryCountRef = useRef(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useImperativeHandle(ref, () => ({
      reset: () => {
        if (widgetIdRef.current && window.turnstile) {
          try {
            window.turnstile.reset(widgetIdRef.current);
            setError(null);
            retryCountRef.current = 0;
            console.log('Turnstile widget reset successfully');
          } catch (err) {
            console.error('Failed to reset turnstile widget:', err);
            setError('Failed to reset verification');
          }
        }
      },
      getResponse: () => {
        if (widgetIdRef.current && window.turnstile) {
          try {
            return window.turnstile.getResponse(widgetIdRef.current);
          } catch (err) {
            console.error('Failed to get turnstile response:', err);
            return null;
          }
        }
        return null;
      },
      render: () => {
        renderTurnstile();
      }
    }));

    const loadTurnstileScript = (): Promise<void> => {
      return new Promise((resolve, reject) => {
        // Se já está carregado, resolve imediatamente
        if (window.turnstile && scriptLoadedRef.current) {
          resolve();
          return;
        }

        // Se o script já existe, apenas aguarda
        const existingScript = document.querySelector('script[src*="turnstile"]');
        if (existingScript && window.turnstile) {
          scriptLoadedRef.current = true;
          resolve();
          return;
        }

        // Define callback global
        window.onloadTurnstileCallback = () => {
          console.log('Turnstile script loaded successfully');
          scriptLoadedRef.current = true;
          resolve();
        };

        // Cria e adiciona o script
        const script = document.createElement('script');
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback';
        script.async = true;
        script.defer = true;
        
        script.onerror = () => {
          console.error('Failed to load Turnstile script');
          setError('Failed to load security verification');
          reject(new Error('Failed to load Turnstile script'));
        };

        script.onload = () => {
          console.log('Turnstile script tag loaded');
          // O callback será chamado pelo próprio script
        };

        document.head.appendChild(script);

        // Timeout de segurança
        setTimeout(() => {
          if (!scriptLoadedRef.current) {
            console.error('Turnstile script load timeout');
            setError('Security verification timeout');
            reject(new Error('Turnstile script load timeout'));
          }
        }, 10000);
      });
    };

    const renderTurnstile = async () => {
      if (!containerRef.current) {
        console.error('Turnstile container not available');
        return;
      }

      if (!siteKey) {
        console.error('Turnstile site key not provided');
        setError('Configuration error');
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        await loadTurnstileScript();

        if (!window.turnstile) {
          throw new Error('Turnstile API not available');
        }

        // Remove widget anterior se existir
        if (widgetIdRef.current) {
          try {
            window.turnstile.remove(widgetIdRef.current);
          } catch (err) {
            console.warn('Failed to remove existing turnstile widget:', err);
          }
          widgetIdRef.current = null;
        }

        // Limpa container
        containerRef.current.innerHTML = '';

        // Render novo widget
        console.log('Rendering Turnstile widget with options:', { siteKey, theme, size });
        
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme,
          size,
          callback: (token: string) => {
            console.log('Turnstile success callback triggered');
            setError(null);
            retryCountRef.current = 0;
            onSuccess?.(token);
          },
          'error-callback': (error: string) => {
            console.error('Turnstile error callback:', error);
            const errorMessage = `Security verification failed: ${error}`;
            setError(errorMessage);
            
            // Retry logic
            if (retryOnFailure && retryCountRef.current < maxRetries) {
              retryCountRef.current++;
              console.log(`Retrying Turnstile render (${retryCountRef.current}/${maxRetries})`);
              setTimeout(() => {
                renderTurnstile();
              }, 2000);
            } else {
              onError?.(errorMessage);
            }
          },
          'expired-callback': () => {
            console.warn('Turnstile expired callback');
            setError('Security verification expired');
            onExpire?.();
          },
          'timeout-callback': () => {
            console.warn('Turnstile timeout callback');
            setError('Security verification timeout');
            onError?.('Verification timeout');
          }
        });

        console.log('Turnstile widget rendered with ID:', widgetIdRef.current);
        setIsLoading(false);

      } catch (err) {
        console.error('Failed to render Turnstile:', err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(`Failed to load security verification: ${errorMessage}`);
        setIsLoading(false);
        onError?.(errorMessage);
      }
    };

    useEffect(() => {
      console.log('Turnstile component mounted, initializing...');
      renderTurnstile();

      return () => {
        console.log('Turnstile component unmounting, cleaning up...');
        if (widgetIdRef.current && window.turnstile) {
          try {
            window.turnstile.remove(widgetIdRef.current);
          } catch (err) {
            console.warn('Failed to cleanup turnstile widget:', err);
          }
        }
      };
    }, [siteKey, theme, size]);

    return (
      <div className={`turnstile-container ${className || ''}`}>
        <div ref={containerRef} />
        {isLoading && (
          <div className="flex items-center justify-center p-4 text-sm text-muted-foreground">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
            Carregando verificação de segurança...
          </div>
        )}
        {error && (
          <div className="text-sm text-destructive mt-2 p-2 bg-destructive/10 rounded">
            {error}
            {retryOnFailure && retryCountRef.current < maxRetries && (
              <button 
                onClick={() => renderTurnstile()} 
                className="ml-2 text-xs underline hover:no-underline"
              >
                Tentar novamente
              </button>
            )}
          </div>
        )}
      </div>
    );
  }
);

Turnstile.displayName = 'Turnstile';