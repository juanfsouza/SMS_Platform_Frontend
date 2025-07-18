"use client";

import { Icon } from '@iconify/react';
import Image from 'next/image';

export default function FooterSection() {
  const socialLinks = [
    { icon: 'mdi:instagram', href: '#', color: 'hover:text-pink-500' },
    { icon: 'mdi:whatsapp', href: '#', color: 'hover:text-green-500' },
    { icon: 'mdi:telegram', href: '#', color: 'hover:text-cyan-500' },
    { icon: 'mdi:twitter', href: '#', color: 'hover:text-blue-500' },
    { icon: 'mdi:linkedin', href: '#', color: 'hover:text-blue-600' }
  ];

  const footerLinks = {
    "Plataforma": [
      { name: "SMS", href: "#" },
      { name: "WhatsApp", href: "#" },
      { name: "Telegram", href: "#" },
      { name: "Discord", href: "#" },
      { name: "Instagram", href: "#" }
    ],
    "Recursos": [
      { name: "API", href: "#" },
      { name: "Webhooks", href: "#" },
      { name: "Integrações", href: "#" },
      { name: "Documentação", href: "#" },
      { name: "Status", href: "#" }
    ],
    "Suporte": [
      { name: "Central de Ajuda", href: "#" },
      { name: "Contato", href: "#" },
      { name: "Suporte 24/7", href: "#" },
      { name: "Guias", href: "#" },
      { name: "FAQ", href: "#" }
    ],
    "Empresa": [
      { name: "Sobre", href: "#" },
      { name: "Blog", href: "#" },
      { name: "Carreira", href: "#" },
      { name: "Parceiros", href: "#" },
      { name: "Imprensa", href: "#" }
    ]
  };

  const features = [
    { icon: 'mdi:check-circle', text: 'Entrega 100% Garantida' },
    { icon: 'mdi:lightning-bolt', text: 'Envio Instantâneo' },
    { icon: 'mdi:shield-check', text: 'Suporte 24/7' },
    { icon: 'mdi:lock', text: 'Segurança Avançada' }
  ];

  return (
    <footer className="bg-gradient-to-t from-background via-muted/20 to-secondary/10 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-48 h-48 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-64 h-64 bg-secondary/10 rounded-full blur-2xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Main Footer Content */}
        <div className="py-16 grid lg:grid-cols-6 gap-8">
          {/* Logo & Description */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                <Icon icon="mdi:message-text" className="text-primary-foreground text-xl" />
              </div>
              <div>
                <h3 className="font-custom-bold text-2xl text-foreground">SMS Plataforma</h3>
                <p className="text-sm text-muted-foreground">SMS Platform</p>
              </div>
            </div>
            
            <p className="text-muted-foreground font-medium max-w-md">
              Plataforma completa de mensagens para conectar você com seus clientes 
              através de múltiplos canais de comunicação.
            </p>

            {/* Features List */}
            <div className="space-y-3">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Icon icon={feature.icon} className="text-primary text-lg" />
                  <span className="text-sm text-muted-foreground">{feature.text}</span>
                </div>
              ))}
            </div>

            {/* Social Links */}
            <div className="flex gap-4 pt-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className={`w-10 h-10 bg-card border rounded-lg flex items-center justify-center text-muted-foreground transition-all duration-300 hover:scale-110 hover:bg-primary/10 ${social.color}`}
                >
                  <Icon icon={social.icon} className="text-lg" />
                </a>
              ))}
            </div>
          </div>

          {/* Footer Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title} className="space-y-4">
              <h4 className="font-custom-bold text-lg text-foreground">{title}</h4>
              <ul className="space-y-3">
                {links.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className="text-muted-foreground hover:text-primary transition-colors duration-200 font-medium"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter Section */}
        <div className="py-12 border-t border-border">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <h3 className="font-custom-bold text-2xl text-foreground">
                Fique atualizado
              </h3>
              <p className="text-muted-foreground">
                Receba as últimas novidades e atualizações da nossa plataforma
              </p>
            </div>
            
            <div className="flex gap-3">
              <input
                type="email"
                placeholder="Seu melhor email"
                className="flex-1 px-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
              />
              <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105">
                <Icon icon="mdi:send" className="text-lg" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="py-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span>© 2025 By: Creative Makes Agents. Todos os direitos reservados.</span>
              <a href="#" className="hover:text-primary transition-colors duration-200">
                Política de Privacidade
              </a>
              <a href="#" className="hover:text-primary transition-colors duration-200">
                Termos de Uso
              </a>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon icon="mdi:earth" className="text-primary" />
                <span>Brasil</span>
              </div>
              <div className="flex items-center gap-2 bg-card rounded-full px-3 py-1 border">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium">Status: Operacional</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-pulse {
          animation: pulse 2s ease-in-out infinite;
        }
      `}</style>
    </footer>
  );
}