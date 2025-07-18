"use client";

import { useState } from 'react';
import { Icon } from '@iconify/react';
import Image from 'next/image';
import { WordRotate } from './ui/word-rotate';

export default function HeroSection() {
  const [stats] = useState({
    engagement: 4200,
    growthRate: 14
  });

  const channels = [
    { icon: 'mdi:instagram', color: 'bg-pink-500', name: 'SMS' },
    { icon: 'mdi:whatsapp', color: 'bg-green-500', name: 'WhatsApp' },
    { icon: 'simple-icons:viber', color: 'bg-purple-500', name: 'Viber' },
    { icon: 'mdi:flash', color: 'bg-yellow-500', name: 'FlashCall' },
    { icon: 'mdi:twitter', color: 'bg-blue-500', name: 'Cascade' },
    { icon: 'mdi:telegram', color: 'bg-cyan-500', name: 'Telegram' }
  ];

  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const chartData = [40, 65, 45, 80, 90, 75, 95];

  return (
    <div className="min-h-screen mt-10 bg-gradient-to-br from-background via-muted/30 to-secondary/20 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-20 right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-48 h-48 bg-secondary/20 rounded-full blur-2xl"></div>
      </div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-7xl text-foreground font-custom-light">
              Plataforma de{' '}
              <WordRotate
                className="text-primary"
                words={["Mensagens", "WhatsApp", "Telegram", "Discord", "Instagram"]}
              />
                Para varios{' '}
                <span className="text-primary">Numeros</span>
              </h1>
              
              <p className="text-xl text-muted-foreground font-bold max-w-2xl">
                Com o SMS, você tem acesso a uma ampla seleção de números virtuais para SMS, permitindo que você receba verificação por SMS sem a necessidade de um cartão SIM físico.
              </p>
              
              <div className="flex flex-wrap gap-4 pt-4">
                <div className="flex items-center gap-2 bg-card rounded-full px-4 py-2 border">
                  <Icon icon="mdi:check-circle" className="text-primary text-lg" />
                  <span className="text-sm font-medium">Entrega 100% Garantida</span>
                </div>
                <div className="flex items-center gap-2 bg-card rounded-full px-4 py-2 border">
                  <Icon icon="mdi:lightning-bolt" className="text-primary text-lg" />
                  <span className="text-sm font-medium">Envio Instantâneo</span>
                </div>
                <div className="flex items-center gap-2 bg-card rounded-full px-4 py-2 border">
                  <Icon icon="mdi:shield-check" className="text-primary text-lg" />
                  <span className="text-sm font-medium">Suporte 24/7</span>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                Solicitar Meu SMS
              </button>
            </div>
          </div>

          {/* Right Content - Interactive Demo */}
          <div className="relative">
            {/* Main Phone Mockup */}
            <div className="font-custom-bold relative mx-auto w-80 h-96 bg-card rounded-3xl shadow-2xl border p-6 transform rotate-3 hover:rotate-0 transition-all duration-500">
              {/* Phone Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                    <Icon icon="mdi:message-text" className="text-primary text-xl" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">SMS Platform</h3>
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
                
                {/* Mini Chart */}
                <div className="flex items-end gap-1 h-12">
                  {chartData.map((value, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full bg-primary/60 rounded-t-sm transition-all duration-1000 ease-out"
                        style={{ height: `${value}%` }}
                      ></div>
                      <span className="text-xs text-muted-foreground mt-1">{weekDays[index]}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Message Preview */}
              <div className="space-y-3">
                <div className="bg-primary/10 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon icon="mdi:whatsapp" className="text-green-500" />
                    <span className="text-xs font-medium">WhatsApp</span>
                  </div>
                  <p className="text-sm">Mensagem enviada com sucesso!</p>
                </div>
                
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon icon="mdi:message-text" className="text-pink-500" />
                    <span className="text-xs font-medium">SMS</span>
                  </div>
                  <p className="text-sm">Campanha finalizada</p>
                </div>
              </div>
            </div>

            {/* Floating Channel Icons */}
            <div className="absolute inset-0 pointer-events-none">
              <Image
                src="/hero.png"
                alt="Phone Demo"
                width={2000}
                height={2000}
                className="h-auto w-[550px] ml-40"
              />
              {channels.map((channel, index) => (
                <div
                  key={channel.name}
                  className={`absolute w-14 h-14 ${channel.color} rounded-xl flex items-center justify-center shadow-lg animate-float`}
                  style={{
                    top: `${20 + (index * 12)}%`,
                    left: index % 2 === 0 ? '-5%' : '110%',
                    animationDelay: `${index * 0.5}s`,
                    animationDuration: '3s'
                  }}
                >
                  <Icon icon={channel.icon} className="text-white text-xl" />
                </div>
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
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          0%, 100% { transform: translateX(5px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}