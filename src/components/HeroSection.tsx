import React, { useState, useEffect, useCallback, memo } from 'react';
import { Shield, Users, Globe, MessageCircle, Phone, Zap, ChevronDown, CheckCircle, ArrowRight, LucideIcon } from 'lucide-react';

// Interface para props do AnimatedNumber
interface AnimatedNumberProps {
  value: number;
  suffix?: string;
}

// Interface para props do FeatureBadge
interface FeatureBadgeProps {
  icon: LucideIcon;
  text: string;
}

// Interface para props do SecurityFeature
interface SecurityFeatureProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

// Interface para props do FAQItem
interface FAQItemProps {
  question: string;
  answer: string;
}

// Componente AnimatedNumber memoizado para evitar re-renders
const AnimatedNumber = memo<AnimatedNumberProps>(({ value, suffix = '' }) => {
  const [current, setCurrent] = useState(0);
  
  useEffect(() => {
    if (value === 0) return;
    
    let animationFrame: number;
    const startTime = Date.now();
    const duration = 1500; // Reduzido de 1500ms para 1000ms
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function para animação mais suave
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.floor(value * easeOut));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    
    animationFrame = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [value]);
  
  return (
    <span className="font-bold text-2xl">
      {current}{suffix}
    </span>
  );
});

AnimatedNumber.displayName = 'AnimatedNumber';

// Componente FeatureBadge memoizado
const FeatureBadge = memo<FeatureBadgeProps>(({ icon: Icon, text }) => (
  <div className="flex items-center gap-2 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-full px-4 py-2">
    <Icon className="w-4 h-4 text-green-400" />
    <span className="text-sm font-medium text-gray-300">{text}</span>
  </div>
));

FeatureBadge.displayName = 'FeatureBadge';

// Componente SecurityFeature memoizado
const SecurityFeature = memo<SecurityFeatureProps>(({ icon: Icon, title, description }) => (
  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 hover:border-purple-500/50 transition-colors group">
    <Icon className="w-10 h-10 text-purple-500 mb-4 group-hover:text-purple-400 transition-colors" />
    <h3 className="text-xl font-semibold mb-3">{title}</h3>
    <p className="text-gray-400 leading-relaxed">{description}</p>
  </div>
));

SecurityFeature.displayName = 'SecurityFeature';

// Componente FAQItem memoizado
const FAQItem = memo<FAQItemProps>(({ question, answer }) => (
  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 hover:border-purple-500/50 transition-colors group">
    <div className="flex items-start justify-between mb-3">
      <h3 className="text-lg font-semibold">{question}</h3>
      <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-purple-400 transition-colors" />
    </div>
    <p className="text-gray-400 leading-relaxed">{answer}</p>
  </div>
));

FAQItem.displayName = 'FAQItem';

const HeroSection = () => {
  const [stats, setStats] = useState({
    deliveryRate: 0,
    numbers: 0,
    clients: 0,
    countries: 0
  });

  // Função de navegação otimizada
  const navigateToLogin = useCallback(() => {
    // Para um SPA com React Router, você usaria: navigate('/login')
    // Para navegação simples:
    window.location.href = '/login';
  }, []);

  // Animação dos números otimizada - inicia mais cedo
  useEffect(() => {
    const timer = setTimeout(() => {
      setStats({
        deliveryRate: 100,
        numbers: 100,
        clients: 3,
        countries: 60
      });
    }, 200); // Reduzido de 500ms para 200ms
    
    return () => clearTimeout(timer);
  }, []);

  // Dados estáticos para evitar re-criação em cada render
  const features = React.useMemo(() => [
    { icon: Shield, text: 'Sem KYC' },
    { icon: Users, text: 'Anônimo' },
    { icon: CheckCircle, text: 'Seguro' },
    { icon: Zap, text: 'Barato' }
  ], []);

  const securityFeatures = React.useMemo(() => [
    {
      title: 'Anonimato',
      description: 'Sem KYC. Coletamos apenas o essencial para autenticação. Sem rastreamento de perfis.',
      icon: Shield
    },
    {
      title: 'Proteção',
      description: 'TLS, segregação por região e rotação de números. Monitoramento ativo de fraude.',
      icon: Globe
    },
    {
      title: 'Controle',
      description: 'Autogestão no painel, histórico local e expurgo automático de dados sensíveis.',
      icon: Users
    }
  ], []);

  const faqItems = React.useMemo(() => [
    { question: 'É anônimo?', answer: 'Sim, não requeremos KYC e mantemos apenas dados essenciais.' },
    { question: 'Quais serviços?', answer: 'Oferecemos números virtuais para SMS de verificação de todas as principais plataformas.' },
    { question: 'É barato?', answer: 'Sim, oferecemos preços competitivos com ótimo custo-benefício.' },
    { question: 'Como pago?', answer: 'Aceitamos diversas formas de pagamento incluindo criptomoedas.' }
  ], []);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20">
        {/* Background gradients - usando transform3d para melhor performance */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl transform-gpu"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl transform-gpu"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              {/* Feature badges */}
              <div className="flex flex-wrap gap-3">
                {features.map((feature, index) => (
                  <FeatureBadge key={index} icon={feature.icon} text={feature.text} />
                ))}
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                Números de{' '}
                <span className="bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
                  SMS
                </span>{' '}
                para verificação em{' '}
                <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                  dezenas de países
                </span>
              </h1>

              <p className="text-xl text-gray-400 leading-relaxed">
                Privacidade primeiro. Ative WhatsApp, Facebook, Instagram e mais com SMS sob demanda. 
                Cobertura global, latência baixa e preços acessíveis.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={navigateToLogin}
                  className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 flex items-center gap-2 group"
                >
                  Começar agora
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={navigateToLogin}
                  className="border border-gray-600 hover:border-gray-500 px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
                >
                  Já tenho conta
                </button>
              </div>

              {/* Trust indicators */}
              <div className="flex items-center gap-6 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Criptografia em trânsito</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Rotação de números</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Painel em tempo real</span>
                </div>
              </div>
            </div>

            {/* Right Content - Dashboard Preview */}
            <div className="relative">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700/50 p-6 shadow-2xl backdrop-blur-lg">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Shield className="w-8 h-8 text-purple-500" />
                    <div>
                      <h3 className="font-semibold text-lg">FDX SMS</h3>
                      <p className="text-sm text-gray-400">Painel em tempo real</p>
                    </div>
                  </div>
                  <button 
                    onClick={navigateToLogin}
                    className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-sm transition-colors"
                  >
                    Entrar
                  </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/30">
                    <p className="text-sm text-gray-400 mb-1">Taxa de entrega</p>
                    <p className="text-2xl font-bold text-green-400">
                      <AnimatedNumber value={stats.deliveryRate} suffix="%" />
                    </p>
                  </div>
                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/30">
                    <p className="text-sm text-gray-400 mb-1">Números disponíveis</p>
                    <p className="text-2xl font-bold text-purple-400">
                      +<AnimatedNumber value={stats.numbers} suffix="M" />
                    </p>
                  </div>
                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/30">
                    <p className="text-sm text-gray-400 mb-1">Clientes</p>
                    <p className="text-2xl font-bold text-blue-400">
                      +<AnimatedNumber value={stats.clients} suffix=" mil" />
                    </p>
                  </div>
                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/30">
                    <p className="text-sm text-gray-400 mb-1">Países</p>
                    <p className="text-2xl font-bold text-orange-400">
                      +<AnimatedNumber value={stats.countries} />
                    </p>
                  </div>
                </div>

                {/* Preview Dashboard */}
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-4 border border-gray-700/30">
                  <h4 className="text-center text-gray-400 mb-4">Prévia do dashboard</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between bg-gray-800/30 rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <MessageCircle className="w-5 h-5 text-green-400" />
                        <span className="text-sm">WhatsApp +1-555-0123</span>
                      </div>
                      <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">Ativo</span>
                    </div>
                    <div className="flex items-center justify-between bg-gray-800/30 rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-blue-400" />
                        <span className="text-sm">SMS +44-20-7946</span>
                      </div>
                      <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">Pendente</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-20 bg-gray-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Shield className="w-6 h-6 text-purple-500" />
              <h2 className="text-3xl lg:text-4xl font-bold">Segurança e privacidade</h2>
            </div>
            <p className="text-xl text-gray-400">Modelo privacy-first com proteção de ponta a ponta.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {securityFeatures.map((feature, index) => (
              <SecurityFeature 
                key={index} 
                icon={feature.icon} 
                title={feature.title} 
                description={feature.description} 
              />
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-2 mb-4">
              <MessageCircle className="w-6 h-6 text-purple-500" />
              <h2 className="text-3xl lg:text-4xl font-bold">FAQ</h2>
            </div>
            <p className="text-xl text-gray-400">Perguntas frequentes</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {faqItems.map((item, index) => (
              <FAQItem key={index} question={item.question} answer={item.answer} />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900/50 border-t border-gray-700/50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Shield className="w-6 h-6 text-purple-500" />
              <span className="font-semibold">FDX SMS © 2025</span>
            </div>
            
            <div className="flex items-center gap-6">
              <button onClick={navigateToLogin} className="text-gray-400 hover:text-white transition-colors">
                Entrar
              </button>
              <button onClick={navigateToLogin} className="text-gray-400 hover:text-white transition-colors">
                Registrar
              </button>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Segurança</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HeroSection;