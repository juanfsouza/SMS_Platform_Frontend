"use client";

import { useState } from 'react';
import { Icon } from '@iconify/react';

export default function ChannelsSection() {
  const [activeView, setActiveView] = useState('cascade');

  const channels = [
    {
      id: 'sms',
      name: 'SMS',
      icon: 'mdi:message-text',
      color: 'bg-pink-500',
      description: 'Mensagens de texto tradicionais'
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: 'mdi:whatsapp',
      color: 'bg-green-500',
      description: 'Mensagens instantâneas'
    },
    {
      id: 'viber',
      name: 'Viber',
      icon: 'simple-icons:viber',
      color: 'bg-purple-500',
      description: 'Comunicação global'
    },
    {
      id: 'instagram',
      name: 'Instagram',
      icon: 'mdi:instagram',
      color: 'bg-pink-500',
      description: 'Sms para Instagram'
    },
    {
      id: 'email',
      name: 'Email',
      icon: 'mdi:email',
      color: 'bg-blue-500',
      description: 'Comunicação por email'
    }
  ];

  const cascadeBenefits = [
    'Registre uma nova conta em redes sociais ou mensageiros instantâneos sem usar um cartão SIM adicional',
    'Crie contas em massa, combine-as em uma rede'
  ];

  return (
    <div className="py-20 bg-gradient-to-br from-background via-muted/30 to-secondary/20 relative overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Toggle Buttons */}
        <div className="flex justify-center mb-16">
          <div className="flex bg-card rounded-2xl p-2 shadow-lg border">
            <button
              onClick={() => setActiveView('cascade')}
              className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${
                activeView === 'cascade'
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Mensagens em cascata
            </button>
            <button
              onClick={() => setActiveView('channels')}
              className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${
                activeView === 'channels'
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Canais de Comunicação
            </button>
          </div>
        </div>

        {/* Cascade Messaging View */}
        {activeView === 'cascade' && (
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content - Cascade Diagram */}
            <div className="relative">
              {/* Decorative Elements */}
              <div className="absolute -top-4 -left-4 w-20 h-20 bg-blue-500/20 rounded-full blur-xl"></div>
              <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-primary/10 rounded-full blur-lg"></div>
              <div className="absolute top-8 right-8 w-4 h-4 bg-blue-400 rounded-full"></div>
              <div className="absolute bottom-16 left-12 w-6 h-6 bg-blue-500 rounded-full"></div>

              {/* Large Blue Circle Background */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-blue-400/30 to-blue-500/20 rounded-full blur-3xl"></div>

              {/* Main Content Container */}
              <div className="relative z-10 bg-card rounded-2xl p-8 shadow-xl border">
                {/* SMS Logo */}
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                      <Icon icon="mdi:link-variant" className="text-white text-xl" />
                    </div>
                    <span className="text-2xl font-bold text-foreground">Plataforma SMS</span>
                  </div>
                  <div className="w-24 h-0.5 bg-border mx-auto"></div>
                </div>

                {/* Channel Icons Flow */}
                <div className="space-y-6">
                  {/* First Row */}
                  <div className="flex justify-center">
                    <div className="w-16 h-16 bg-yellow-500 rounded-2xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300">
                      <Icon icon="mdi:flash" className="text-white text-2xl" />
                    </div>
                  </div>

                  {/* Dotted Lines */}
                  <div className="flex justify-center">
                    <div className="w-px h-8 border-l-2 border-dotted border-border"></div>
                  </div>

                  {/* Second Row */}
                  <div className="flex justify-center gap-8">
                    <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300">
                      <Icon icon="mdi:whatsapp" className="text-white text-2xl" />
                    </div>
                    <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300">
                      <Icon icon="simple-icons:viber" className="text-white text-2xl" />
                    </div>
                  </div>

                  {/* Dotted Lines */}
                  <div className="flex justify-center">
                    <div className="w-px h-8 border-l-2 border-dotted border-border"></div>
                  </div>

                  {/* Third Row */}
                  <div className="flex justify-center">
                    <div className="w-16 h-16 bg-pink-500 rounded-2xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300">
                      <Icon icon="mdi:message-text" className="text-white text-2xl" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content */}
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
                  <Icon icon="mdi:layers" className="text-lg" />
                  Perguntas frequentes
                </div>
                
                <h2 className="text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                  O serviço SMS
                </h2>
                
                <p className="text-md text-muted-foreground leading-relaxed">
                    O serviço é um recurso essencial para usuários que precisam de um número de telefone virtual para receber SMS online, oferecendo uma variedade de opções, incluindo números de telefone temporários e números de telefone descartáveis, projetados especificamente para verificação de SMS.
                </p>
              </div>

              {/* Benefits Section */}
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold text-foreground">
                  Por que você pode precisar registrar um número temporário? 
                </h3>
                
                <div className="space-y-4">
                  {cascadeBenefits.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mt-1">
                        <Icon icon="mdi:check" className="text-primary text-sm" />
                      </div>
                      <span className="text-foreground">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="bg-muted/30 rounded-xl p-6 border-l-4 border-primary">
                <p className="text-muted-foreground leading-relaxed">
                    O sistema analisa a base de contatos e envia mensagens pelo canal
                    mais rentável. API única para atingir seus objetivos.
                </p>
              </div>

              <div className="flex gap-4">
                <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 shadow-md">
                  Começar Agora
                </button>
                <button className="border border-primary text-primary hover:bg-primary/10 px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105">
                  Saiba Mais
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Communication Channels View */}
        {activeView === 'channels' && (
          <div className="space-y-16">
            {/* Header */}
            <div className="text-center space-y-6">
              <h2 className="text-4xl lg:text-5xl font-bold text-foreground">
                Como funciona o nosso serviço?
              </h2>
              <p className="text-lg text-muted-foreground max-w-4xl mx-auto">
                O serviço de Mnesagens permite receber SMS online ou passar na verificação
                 ligando para um número que não está de forma alguma conectado a você, 
                 sua localização ou dados do passaporte. Não é necessário comprar um cartão SIM, use um número de telefone virtual para enviar SMS e obtenha um código de confirmação no site do Plataforma de SMS.
              </p>
            </div>

            {/* Channels Grid */}
            <div className="flex justify-center">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
                {channels.map((channel, index) => (
                  <div key={channel.id} className="group">
                    <div className="text-center space-y-4">
                      <div className={`w-20 h-20 ${channel.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300 mx-auto`}>
                        <Icon icon={channel.icon} className="text-white text-3xl" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-semibold text-foreground text-lg">
                          {channel.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {channel.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom CTA */}
            <div className="text-center">
              <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-lg font-semibold transition-all duration-300 hover:scale-105 shadow-md">
                Explorar todos os seviços
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}