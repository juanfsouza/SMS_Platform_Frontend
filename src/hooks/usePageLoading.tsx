"use client";

import { useState, useEffect, useCallback } from 'react';

interface UsePageLoadingOptions {
  minLoadingTime?: number;
  fadeOutDuration?: number;
  preloadImages?: string[];
}

export const usePageLoading = ({
  minLoadingTime = 3000,
  fadeOutDuration = 800,
  preloadImages = []
}: UsePageLoadingOptions = {}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Simula progresso de carregamento
  useEffect(() => {
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    return () => clearInterval(progressInterval);
  }, []);

  // Pre-carrega imagens
  const preloadResources = useCallback(async () => {
    const imagePromises = preloadImages.map(src => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = resolve;
        img.onerror = resolve;
        img.src = src;
      });
    });

    await Promise.all(imagePromises);
  }, [preloadImages]);

  // Gerencia o ciclo de loading
  useEffect(() => {
    const loadResources = async () => {
      const startTime = Date.now();
      
      // Pre-carrega recursos
      await preloadResources();
      
      // Garante tempo mínimo de loading
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minLoadingTime - elapsedTime);
      
      setTimeout(() => {
        setLoadingProgress(100);
        setFadeOut(true);
        
        // Após fade out, esconde o loader
        setTimeout(() => {
          setIsLoading(false);
          setShowContent(true);
        }, fadeOutDuration);
      }, remainingTime);
    };

    loadResources();
  }, [minLoadingTime, fadeOutDuration, preloadResources]);

  const handleLoadComplete = useCallback(() => {
    setFadeOut(true);
    setTimeout(() => {
      setIsLoading(false);
      setShowContent(true);
    }, fadeOutDuration);
  }, [fadeOutDuration]);

  return {
    isLoading,
    showContent,
    fadeOut,
    loadingProgress,
    handleLoadComplete
  };
};