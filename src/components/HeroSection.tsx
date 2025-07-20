"use client";

import { useState, useMemo, memo } from 'react';
import { Icon } from '@iconify/react';
import Image from 'next/image';
import { WordRotate } from './ui/word-rotate';

export default function HeroSection() {

// Componente memorizado para os badges
const FeatureBadge = memo(({ icon, text }: { icon: string; text: string }) => (
  <div className="flex items-center gap-2 bg-card rounded-full px-4 py-2 border">
    <Icon icon={icon} className="text-primary text-lg" />
    <span className="text-sm font-medium">{text}</span>
  </div>
));

// Componente memorizado para o mini chart
const MiniChart = memo(({ data, weekDays }: { data: number[]; weekDays: string[] }) => (
  <div className="flex items-end gap-1 h-12">
    {data.map((value, index) => (
      <div key={index} className="flex-1 flex flex-col items-center">
        <div 
          className="w-full bg-primary/60 rounded-t-sm will-change-transform"
          style={{ 
            height: `${value}%`,
            transition: 'height 1s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        ></div>
        <span className="text-xs text-muted-foreground mt-1">{weekDays[index]}</span>
      </div>
    ))}
  </div>
));

// Componente memorizado para os ícones flutuantes
const FloatingIcon = memo(({ channel, index }: { 
  channel: { icon: string; color: string; name: string }; 
  index: number; 
}) => (
  <div
    className={`absolute w-14 h-14 ${channel.color} rounded-xl sm:flex hidden items-center justify-center shadow-lg will-change-transform`}
    style={{
      top: `${20 + (index * 12)}%`,
      left: index % 2 === 0 ? '-5%' : '100%',
      animation: `float 3s ease-in-out infinite ${index * 0.5}s`,
    }}
  >
    <Icon icon={channel.icon} className="text-white text-xl" />
  </div>
));

// Componente memorizado para preview de mensagem
const MessagePreview = memo(({ icon, platform, message, bgColor }: { 
  icon: string; 
  platform: string; 
  message: string; 
  bgColor: string; 
}) => (
  <div className={`${bgColor} rounded-lg p-3`}>
    <div className="flex items-center gap-2 mb-1">
      <Icon icon={icon} className="text-green-500" />
      <span className="text-xs font-medium">{platform}</span>
    </div>
    <p className="text-sm">{message}</p>
  </div>
));

FeatureBadge.displayName = 'FeatureBadge';
MiniChart.displayName = 'MiniChart';
FloatingIcon.displayName = 'FloatingIcon';
MessagePreview.displayName = 'MessagePreview';
  const [stats] = useState({
    engagement: 4200,
    growthRate: 14
  });

  // Memoizar dados estáticos
  const staticData = useMemo(() => ({
    channels: [
      { icon: 'mdi:instagram', color: 'bg-pink-500', name: 'SMS' },
      { icon: 'mdi:whatsapp', color: 'bg-green-500', name: 'WhatsApp' },
      { icon: 'simple-icons:viber', color: 'bg-purple-500', name: 'Viber' },
      { icon: 'mdi:flash', color: 'bg-yellow-500', name: 'FlashCall' },
      { icon: 'mdi:twitter', color: 'bg-blue-500', name: 'Cascade' },
      { icon: 'mdi:telegram', color: 'bg-cyan-500', name: 'Telegram' }
    ],
    weekDays: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
    chartData: [40, 65, 45, 80, 90, 75, 95],
    features: [
      { icon: 'mdi:check-circle', text: 'Entrega 100% Garantida' },
      { icon: 'mdi:lightning-bolt', text: 'Envio Instantâneo' },
      { icon: 'mdi:shield-check', text: 'Suporte 24/7' }
    ],
    messages: [
      { icon: 'mdi:whatsapp', platform: 'WhatsApp', message: 'Mensagem enviada com sucesso!', bgColor: 'bg-primary/10' },
      { icon: 'mdi:message-text', platform: 'SMS', message: 'Campanha finalizada', bgColor: 'bg-muted/50' }
    ]
  }), []);

  return (
    <div className="min-h-screen mt-10 bg-gradient-to-br from-background via-muted/30 to-secondary/20 relative overflow-hidden">
      {/* Background decorations otimizadas */}
      <div className="absolute inset-0 will-change-transform">
        <div className="absolute top-20 right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl transform-gpu"></div>
        <div className="absolute bottom-20 left-20 w-48 h-48 bg-secondary/20 rounded-full blur-2xl transform-gpu"></div>
      </div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-7xl text-foreground font-custom-bold">
                Plataforma de{' '}
                <WordRotate
                  className="text-primary"
                  words={["Mensagens", "WhatsApp", "Telegram", "Discord", "Instagram"]}
                />
                Para varios{' '}
                <span className="text-primary">Numeros</span>
              </h1>
              
              <p className="text-xl text-muted-foreground font-bold max-w-2xl">
                Com o FDX SMS, você tem acesso a uma ampla seleção de números virtuais para SMS, permitindo que você receba verificação por SMS sem a necessidade de um cartão SIM físico.
              </p>
              
              <div className="flex flex-wrap gap-4 pt-4">
                {staticData.features.map((feature, index) => (
                  <FeatureBadge key={index} icon={feature.icon} text={feature.text} />
                ))}
              </div>
            </div>

            <div className="pt-6">
              <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-xl text-lg font-semibold transition-colors duration-200 shadow-lg hover:shadow-xl will-change-transform">
                Solicitar Meu SMS
              </button>
            </div>
          </div>

          {/* Right Content - Interactive Demo */}
          <div className="relative">
            {/* Main Phone Mockup */}
            <div className="font-custom-bold relative mx-auto w-80 h-96 bg-card rounded-3xl shadow-2xl border p-6 will-change-transform transition-transform duration-500 hover:rotate-0" style={{ transform: 'rotate(3deg)' }}>
              {/* Phone Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                    <Icon icon="mdi:message-text" className="text-primary text-xl" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">FDX SMS</h3>
                    <p className="text-xs text-muted-foreground">Dashboard</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
              </div>

              {/* Stats Card */}
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-sm">Engajamento de Clientes</h4>
                  <span className="text-green-600 text-sm font-medium">+{stats.growthRate}%</span>
                </div>
                <div className="text-2xl font-bold text-primary mb-3">
                  +{stats.engagement.toLocaleString()}
                </div>
                
                <MiniChart data={staticData.chartData} weekDays={staticData.weekDays} />
              </div>

              {/* Message Preview */}
              <div className="space-y-3">
                {staticData.messages.map((msg, index) => (
                  <MessagePreview
                    key={index}
                    icon={msg.icon}
                    platform={msg.platform}
                    message={msg.message}
                    bgColor={msg.bgColor}
                  />
                ))}
              </div>
            </div>

            {/* Floating Channel Icons */}
            <div className="absolute inset-0 pointer-events-none">
              <Image
                src="/hero.png"
                alt="Phone Demo"
                width={550}
                height={550}
                className="h-auto w-[550px] lg:ml-35 md:ml-10 mt-2"
                priority
                loading="eager"
                quality={85}
              />
              {staticData.channels.map((channel, index) => (
                <FloatingIcon key={channel.name} channel={channel} index={index} />
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-24 text-center">
          <h2 className="text-2xl text-foreground mb-4 font-custom-bold">
            Mantenha-se conectado com seus clientes o tempo todo
          </h2>
          <p className="text-md text-muted-foreground font-bold max-w-4xl mx-auto">
            Nossa plataforma de mensagens é uma ferramenta confiável e eficaz para o engajamento de clientes. 
            A ImLink é uma plataforma omnichannel que permite estabelecer comunicação avançada de forma amigável. 
            Nossas vantagens competitivas incluem tarifas econômicas, garantia de entrega de 100% e abordagem personalizada para cada cliente.
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { 
            transform: translateY(0px) translateX(5px); 
          }
          50% { 
            transform: translateY(-20px) translateX(5px); 
          }
        }
        
        /* Otimização para GPU */
        .will-change-transform {
          will-change: transform;
        }
        
        /* Reduzir motion para dispositivos fracos */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
}