"use client";

import { useState } from 'react';
import { Icon } from '@iconify/react';

export default function ServiceSection() {
  const [activeService, setActiveService] = useState('sms');

  const services = [
    {
      id: 'sms',
      name: 'SMS Mensagens',
      subtitle: 'Soluções de SMS em massa promocionais, transacionais e de serviço',
      description: 'A SMS Platform fornece agregação de SMS, roteamento e processamento de tráfego, possibilitando aos nossos Parceiros todo o espectro de canais e recursos de mensagens:',
      icon: 'mdi:message-text',
      color: 'bg-pink-500',
      features: [
        'Alcance global',
        'Conexões diretas de operadoras e roteamento alternativo',
        'Terminação de SMS por atacado e varejo',
        'Alta qualidade e estabilidade',
        'Tarifas competitivas'
      ],
      mockup: {
        title: 'SMS',
        content: 'Seu pedido N4575366245 de 17/10/2022, foi processado. Verifique o status do seu pedido em https://rom.com/TmkzP'
      }
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp Business',
      subtitle: 'Mensagens de mídia avançada e engajamento do cliente',
      description: 'Conecte-se com clientes por meio da API do WhatsApp Business com suporte a mídia avançada, modelos e mensagens interativas:',
      icon: 'mdi:whatsapp',
      color: 'bg-green-500',
      features: [
        'Suporte de mídia avançada (imagens, vídeos, documentos)',
        'Mensagens de modelo',
        'Botões e listas interativos',
        'Perfis de negócios verificados'
      ],
      mockup: {
        title: 'SMS WatsApp',
        content: 'Bem-vindo ao nosso serviço! Seu código e 123456.'
      }
    },
  ];

  const activeServiceData = services.find(service => service.id === activeService);

  return (
    <div className="py-20 font-sans font-bold bg-gradient-to-br from-background via-muted/30 to-secondary/20 relative overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Icon icon="mdi:cog" className="text-lg" />
            Nossos Serviços
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold font-custom-bold text-foreground mb-6">
            Soluções Completas de{' '}
            <span className="text-primary font-custom-bold">Comunicação</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Oferecemos uma gama completa de serviços de mensagens para empresas de todos os tamanhos, 
            com foco em qualidade, confiabilidade e resultados mensuráveis.
          </p>
        </div>

        {/* Service Navigation */}
        <div className="flex justify-center mb-12">
          <div className="flex bg-card rounded-2xl p-2 shadow-lg border">
            {services.map((service) => (
              <button
                key={service.id}
                onClick={() => setActiveService(service.id)}
                className={`flex items-center gap-3 px-6 py-3 rounded-xl transition-all duration-300 ${
                  activeService === service.id
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <div className={`w-8 h-8 ${service.color} rounded-lg flex items-center justify-center`}>
                  <Icon icon={service.icon} className="text-white text-lg" />
                </div>
                <span className="font-medium">{service.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Service Content */}
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h3 className="text-3xl lg:text-4xl font-bold text-foreground font-custom-bold">
                {activeServiceData?.name}
              </h3>
              <p className="text-xl text-primary font-custom-bold">
                {activeServiceData?.subtitle}
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {activeServiceData?.description}
              </p>
            </div>

            {/* Features List */}
            <div className="space-y-4">
              {activeServiceData?.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3 group">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Icon icon="mdi:check" className="text-primary text-sm" />
                  </div>
                  <span className="text-foreground">{feature}</span>
                </div>
              ))}
            </div>

            {/* Bottom Text */}
            <div className="bg-muted/30 rounded-xl p-6 border-l-4 border-primary">
              <p className="text-muted-foreground leading-relaxed">
                Processamos mensagens de texto para todas as operadoras para serem entregues ao usuário final em nome da marca e nos comunicamos efetivamente com seus clientes por meio de mensagens de texto.
              </p>
            </div>

            <div className="flex gap-4">
              <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg font-bold transition-all duration-300 hover:scale-105 shadow-md">
                Saiba Mais
              </button>
              <button className="border border-primary text-primary hover:bg-primary/10 px-6 py-3 rounded-lg font-bold transition-all duration-300 hover:scale-105">
                Contato
              </button>
            </div>
          </div>

          {/* Right Content - Phone Mockup */}
          <div className="relative flex justify-center">
            {/* Decorative Elements */}
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-pink-300/20 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-green-300/10 rounded-full blur-xl"></div>
            <div className="absolute top-26 left-8 w-4 h-4 bg-green-500/30 rounded-full"></div>
            <div className="absolute bottom-24 right-12 w-6 h-6 bg-pink-500/30 rounded-full"></div>
            <div className="absolute top-32 right-4 w-3 h-3 bg-primary/50 rounded-full"></div>

            {/* Large Pink Circle Background */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-br from-primary/50 to-secondary-20 rounded-full blur-3xl"></div>
            
            {/* Phone Container */}
            <div className="relative z-10 w-80 h-[600px] bg-white rounded-3xl shadow-2xl overflow-hidden border-8 border-gray-200">
              {/* Phone Header */}
              <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <Icon icon="mdi:arrow-left" className="text-gray-600" />
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 ${activeServiceData?.color} rounded-lg flex items-center justify-center`}>
                      <Icon icon={activeServiceData?.icon} className="text-white text-sm" />
                    </div>
                    <span className="font-semibold text-gray-800">{activeServiceData?.mockup.title}</span>
                  </div>
                </div>
                <Icon icon="mdi:dots-vertical" className="text-gray-600" />
              </div>

              {/* Phone Content */}
              <div className="p-6 h-full bg-gradient-to-br from-gray-50 to-white">
                {/* Message Bubble */}
                <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <span className="text-xs text-gray-500">Hoje 14:30</span>
                  </div>
                  <p className="text-gray-800 leading-relaxed">
                    {activeServiceData?.mockup.content}
                  </p>
                </div>

                {/* Input Field */}
                <div className="absolute bottom-8 left-4 right-4">
                  <div className="bg-white rounded-full px-0 py-3 shadow-lg border border-gray-200 flex items-center">
                    <input
                      type="text"
                      placeholder="Type a message..."
                      className="flex-1 outline-none ml-3 text-gray-600 placeholder-gray-400"
                      readOnly
                    />
                    <button className="w-8 h-8 p-2 bg-primary absolute right-2 rounded-full flex items-center justify-center">
                      <Icon icon="mdi:send" className="text-white text-sm" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}