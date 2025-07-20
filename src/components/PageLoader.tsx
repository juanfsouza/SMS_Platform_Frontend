"use client";

import { useState, useEffect } from 'react';

interface PageLoaderProps {
  onLoadComplete?: () => void;
  fadeOut?: boolean;
  showProgress?: boolean;
  progress?: number;
  brandName?: string;
}

export default function PageLoader({ 
  onLoadComplete,
  fadeOut = false,
  showProgress = false,
  progress = 0,
  brandName = "FDX SMS"
}: PageLoaderProps) {
  const [internalProgress, setInternalProgress] = useState(0);
  
  // Animação de progresso interno se não fornecido externamente
  useEffect(() => {
    if (!showProgress) return;
    
    const interval = setInterval(() => {
      setInternalProgress(prev => {
        const newProgress = prev + Math.random() * 10;
        return newProgress > 100 ? 100 : newProgress;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [showProgress]);

  const displayProgress = showProgress ? (progress > 0 ? progress : internalProgress) : 0;

  return (
    <div 
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-black transition-opacity duration-800 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Brand Name */}
      <div className="mb-8 text-white text-2xl font-bold tracking-wider">
        {brandName}
      </div>

      {/* Loader Animation */}
      <div className="loader mb-8">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="loader-square"
            style={{
              animationDelay: `${-index * 1.4285714286}s`
            }}
          />
        ))}
      </div>

      {/* Progress Bar */}
      {showProgress && (
        <div className="w-64 mb-4">
          <div className="flex justify-between text-white text-sm mb-2">
            <span>Carregando...</span>
            <span>{Math.round(displayProgress)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-1">
            <div 
              className="bg-white h-1 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${displayProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Loading Text */}
      <div className="text-white text-sm opacity-70 animate-pulse">
        Preparando, Carregando...
      </div>

      <style jsx>{`
        @keyframes square-animation {
          0% { left: 0; top: 0; }
          10.5% { left: 0; top: 0; }
          12.5% { left: 32px; top: 0; }
          23% { left: 32px; top: 0; }
          25% { left: 64px; top: 0; }
          35.5% { left: 64px; top: 0; }
          37.5% { left: 64px; top: 32px; }
          48% { left: 64px; top: 32px; }
          50% { left: 32px; top: 32px; }
          60.5% { left: 32px; top: 32px; }
          62.5% { left: 32px; top: 64px; }
          73% { left: 32px; top: 64px; }
          75% { left: 0; top: 64px; }
          85.5% { left: 0; top: 64px; }
          87.5% { left: 0; top: 32px; }
          98% { left: 0; top: 32px; }
          100% { left: 0; top: 0; }
        }

        .loader {
          position: relative;
          width: 96px;
          height: 96px;
          transform: rotate(45deg);
        }

        .loader-square {
          position: absolute;
          top: 0;
          left: 0;
          width: 28px;
          height: 28px;
          margin: 2px;
          border-radius: 0px;
          background: white;
          background-size: cover;
          background-position: center;
          animation: square-animation 10s ease-in-out infinite both;
          will-change: transform;
          transform: translateZ(0);
        }

        /* Otimizações para performance */
        .loader {
          transform: rotate(45deg) translateZ(0);
          will-change: transform;
        }

        /* Responsivo */
        @media (max-width: 640px) {
          .loader {
            width: 72px;
            height: 72px;
          }
          .loader-square {
            width: 20px;
            height: 20px;
          }
        }

        /* Reduce motion para dispositivos fracos */
        @media (prefers-reduced-motion: reduce) {
          .loader-square {
            animation-duration: 1s !important;
          }
        }
      `}</style>
    </div>
  );
}