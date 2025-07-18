"use client";

import { useState } from 'react';
import { Icon } from '@iconify/react';

export default function AboutSection() {
  const [activeChannel, setActiveChannel] = useState('SMS');

  const channels = [
    { 
      id: 'Facebook', 
      name: 'Facebook', 
      icon: 'mdi:facebook', 
      color: 'bg-blue-500',
      description: 'Mensagens de texto tradicionais com alta taxa de entrega'
    },
    { 
      id: 'WhatsApp', 
      name: 'WhatsApp', 
      icon: 'mdi:whatsapp', 
      color: 'bg-green-500',
      description: 'Mensagens instantâneas e mídia rica para engajamento'
    },
    { 
      id: 'Twitter', 
      name: 'Twitter', 
      icon: 'simple-icons:twitter', 
      color: 'bg-blue-500',
      description: 'Comunicação global com recursos avançados'
    },
    { 
      id: 'Instagram', 
      name: 'Instagram', 
      icon: 'mdi:instagram', 
      color: 'bg-pink-500',
      description: 'Chamadas rápidas para verificação e autenticação'
    },
    { 
      id: 'Google', 
      name: 'Google', 
      icon: 'mdi:google', 
      color: 'bg-red-500',
      description: 'Sistema de cascata para máxima eficiência'
    }
  ];

  const features = [
    {
      icon: 'mdi:chart-line',
      title: 'Registre uma nova conta',
      description: 'Em redes sociais ou mensageiros instantâneos sem usar um cartão SIM adicional',
      color: 'text-blue-600'
    },
    {
      icon: 'mdi:currency-usd',
      title: 'Crie contas em massa',
      description: 'combine-as em uma rede, venda-as em uma bolsa ou use-as para fins pessoais',
      color: 'text-green-600'
    },
    {
      icon: 'mdi:chart-bar',
      title: 'Faça correspondências comerciais',
      description: 'Promova produtos ou serviços sem usar uma conta pessoal',
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="py-20 bg-gradient-to-br from-background via-muted/30 to-secondary/20 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
                <Icon icon="mdi:message-processing" className="text-lg" />
                Receba SMS online
              </div>
              
              <h2 className="text-4xl lg:text-5xl font-custom-bold font-bold text-foreground leading-tight">
                Experimente nosso serviço para{' '}
                <span className="text-primary">receber SMS online</span>
              </h2>
              
              <p className="text-lg font-bold text-muted-foreground leading-relaxed">
                Por que um número de telefone virtual para SMS é necessário?
              </p>
            </div>

            {/* Features List */}
            <div className="space-y-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-4 group">
                  <div className={`w-12 h-12 rounded-xl bg-card border flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <Icon icon={feature.icon} className={`text-xl ${feature.color}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground font-bold leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg">
                Começar Agora
              </button>
            </div>
          </div>

          {/* Right Content - Interactive Dashboard */}
          <div className="relative">
            {/* Main Dashboard Container */}
            <div className="bg-card rounded-2xl shadow-2xl border p-8 relative overflow-hidden">
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl"></div>
              
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-bold text-foreground">Ativar por SMS é fácil!</h3>
                  <p className="text-muted-foreground">Selecione o serviço e o país</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-muted-foreground">Online</span>
                </div>
              </div>

              {/* Progress Steps */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary-foreground">1</span>
                  </div>
                  <span className="text-sm font-medium text-foreground">Compre</span>
                </div>
                <div className="flex-1 h-px bg-border mx-4"></div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-muted-foreground">2</span>
                  </div>
                  <span className="text-sm text-muted-foreground">Insira-o</span>
                </div>
                <div className="flex-1 h-px bg-border mx-4"></div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-muted-foreground">3</span>
                  </div>
                  <span className="text-sm text-muted-foreground">O código SMS</span>
                </div>
              </div>

              {/* Channel Selection */}
              <div className="space-y-4 mb-8">
                <h4 className="text-lg font-semibold text-foreground">Serviços</h4>
                <div className="grid grid-cols-2 gap-3">
                  {channels.map((channel) => (
                    <button
                      key={channel.id}
                      onClick={() => setActiveChannel(channel.id)}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                        activeChannel === channel.id
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 ${channel.color} rounded-lg flex items-center justify-center`}>
                          <Icon icon={channel.icon} className="text-white text-lg" />
                        </div>
                        <div className="text-left">
                          <h5 className="font-semibold text-foreground">{channel.name}</h5>
                          <p className="text-xs text-muted-foreground">
                            {channel.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Message Configuration */}
              <div className="space-y-4 mb-6 font-medium">                
                <div className="bg-muted/30 rounded-lg p-4">
                  <div className="flex justify-between text-sm text-muted-foreground mb-2">
                    <span>Créditos na conta: 10</span>
                    <span>Ganhe por cada indicação: 10</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Receba SMS online para mais de 180 países</span>
                    <span>Descontos e preços de atacado</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">
                    Mensagem
                  </label>
                  <textarea
                    placeholder="Digite sua mensagem..."
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary bg-background h-24 resize-none"
                  />
                </div>
              </div>

              {/* Action Button */}
              <button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 shadow-md">
                Próximo Passo
              </button>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-primary/10 rounded-full blur-xl"></div>
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-secondary/20 rounded-full blur-lg"></div>
          </div>
        </div>
      </div>
    </div>
  );
}