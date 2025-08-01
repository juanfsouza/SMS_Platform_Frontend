"use client";

import AboutSection from '@/components/AboutSection';
import HeroSection from '@/components/HeroSection';
import ServiceSection from '@/components/ServiceSection';
import Navbar from '@/components/Navbar';
import ChannelsSection from '@/components/ChannelsSection';
import FooterSection from '@/components/FooterSection';
import { usePageLoading } from '@/hooks/usePageLoading';

export default function Home() {
  const { 
    showContent, 
  } = usePageLoading({
    minLoadingTime: 3000,
    fadeOutDuration: 800,
    preloadImages: ['/hero.png']
  });

  return (
    <>    
      <div 
        className={`transition-opacity duration-500 ${
          showContent ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ 
          visibility: showContent ? 'visible' : 'hidden',
          willChange: showContent ? 'auto' : 'opacity'
        }}
      >
        <Navbar />
        <HeroSection />
        <AboutSection />
        <ServiceSection />
        <ChannelsSection />
        <FooterSection />
      </div>
    </>
  );
}