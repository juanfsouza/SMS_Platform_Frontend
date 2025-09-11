'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from '@/components/ui/navigation-menu';
import Link from 'next/link';
import { LogOut, User, Settings, LayoutDashboard, Menu, X, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const { user, setUser } = useAuthStore();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      setIsScrolled(currentScrollY > 20);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const handleLogout = () => {
    setUser(null);
    setIsUserMenuOpen(false);
    router.push('/login');
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.header
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 30,
            duration: 0.3 
          }}
          className={`fixed top-0 left-0 right-0 z-50 h-16 transition-all duration-500 ease-in-out ${
            isScrolled 
              ? 'bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-lg' 
              : 'bg-gradient-to-r from-blue/90 to-primary/10 shadow-sm'
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
            <div className="flex justify-between items-center h-full">
              
              {/* Logo Section */}
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <Link href="/" className="group flex items-center space-x-3">
                      <motion.div 
                        className="relative"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                          isScrolled 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-white/20 backdrop-blur-sm text-white'
                        }`}>
                          <span className="font-custom-bold text-sm">F</span>
                        </div>
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-primary/10 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </motion.div>
                      
                      <motion.span 
                        className={`text-xl font-custom-bold tracking-tight transition-colors duration-300 ${
                          isScrolled ? 'text-foreground' : 'text-white'
                        }`}
                        whileHover={{ scale: 1.02 }}
                      >
                        FDX SMS
                      </motion.span>
                    </Link>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center space-x-8">
                <Link href="#faq" className={`transition-colors duration-200 relative group ${
                  isScrolled ? 'text-muted-foreground hover:text-foreground' : 'text-white/80 hover:text-white'
                }`}>
                  FAQ
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                </Link>
                <Link href="#security" className={`transition-colors duration-200 relative group ${
                  isScrolled ? 'text-muted-foreground hover:text-foreground' : 'text-white/80 hover:text-white'
                }`}>
                  Segurança
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                </Link>
              </nav>

              {/* User Section */}
              <div className="flex items-center">
                {user ? (
                  <div className="relative">
                    <motion.button
                      onClick={toggleUserMenu}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                        isScrolled
                          ? 'text-foreground hover:bg-accent focus:ring-ring'
                          : 'text-white hover:bg-white/10 focus:ring-white/20'
                      }`}
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className="text-right hidden sm:block">
                        <p className={`text-sm font-semibold leading-none ${
                          isScrolled ? 'text-foreground' : 'text-white'
                        }`}>
                          {user.name}
                        </p>
                        <p className={`text-xs mt-1 ${
                          isScrolled ? 'text-muted-foreground' : 'text-white/70'
                        }`}>
                          {user.role === 'admin' ? 'Administrador' : 'Usuário'}
                        </p>
                      </div>
                      
                      <div className="relative">
                        <Avatar className="w-9 h-9 ring-2 ring-offset-2 ring-white/20 transition-all duration-300 hover:ring-offset-4">
                          <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-custom-bold text-sm">

                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white shadow-sm" />
                      </div>
                      
                      <ChevronUp className={`w-4 h-4 transition-all duration-300 ${
                        isUserMenuOpen ? 'rotate-180' : ''
                      } ${isScrolled ? 'text-muted-foreground' : 'text-white/70'}`} />
                    </motion.button>

                    {/* User Dropdown Menu */}
                    {isUserMenuOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-card/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-2xl py-2 z-50">
                        <div className="px-4 py-3 border-b border-border/50">
                          <p className="text-sm font-medium text-foreground">{user.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {user.role === 'admin' ? 'Administrador' : 'Usuário'}
                          </p>
                        </div>
                        
                        <div className="py-1">
                          <Link href="/profile" className="flex items-center px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors rounded-lg mx-2">
                            <User className="mr-3 h-4 w-4" />
                            Meu Perfil
                          </Link>
                          
                          <Link href="/dashboard" className="flex items-center px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors rounded-lg mx-2">
                            <LayoutDashboard className="mr-3 h-4 w-4" />
                            Dashboard
                          </Link>
                          
                          {user?.role === 'admin' && (
                            <Link href="/mod/config" className="flex items-center px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors rounded-lg mx-2">
                              <Settings className="mr-3 h-4 w-4" />
                              Configurações
                            </Link>
                          )}
                        </div>
                        
                        <div className="border-t border-border/50 py-1">
                          <button 
                            onClick={handleLogout} 
                            className="flex items-center w-full px-4 py-2 text-sm text-destructive hover:text-destructive/90 hover:bg-destructive/10 transition-colors rounded-lg mx-2"
                          >
                            <LogOut className="mr-3 h-4 w-4" />
                            Sair da Conta
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link 
                      href="/login" 
                      className={`inline-flex items-center px-6 py-2.5 rounded-xl font-custom-bold text-sm transition-all duration-300 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                        isScrolled
                          ? 'bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-ring'
                          : 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 focus:ring-white/20'
                      }`}
                    >
                      Entrar
                    </Link>
                  </motion.div>
                )}

                {/* Mobile menu button */}
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className={`md:hidden ml-4 transition-colors p-2 rounded-lg ${
                    isScrolled 
                      ? 'text-muted-foreground hover:text-foreground hover:bg-accent/50' 
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            </div>

            {/* Mobile Navigation */}
            {isMenuOpen && (
              <div className="md:hidden bg-card/95 backdrop-blur-xl border-t border-border/50 py-4 mt-1 rounded-b-xl">
                <div className="flex flex-col space-y-4 px-4">
                  <Link href="#faq" className="text-muted-foreground hover:text-foreground transition-colors py-2">
                    FAQ
                  </Link>
                  <Link href="#security" className="text-muted-foreground hover:text-foreground transition-colors py-2">
                    Segurança
                  </Link>
                  
                  {!user && (
                    <>
                      <hr className="border-border" />
                      <Link 
                        href="/login"
                        className="bg-primary text-primary-foreground px-6 py-3 rounded-lg w-full text-center font-medium transition-colors hover:bg-primary/90"
                      >
                        Entrar
                      </Link>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Click outside to close user menu */}
          {isUserMenuOpen && (
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsUserMenuOpen(false)}
            />
          )}

          {/* Decorative gradient line */}
          <div className={`absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/50 to-transparent transition-opacity duration-300 ${
            isScrolled ? 'opacity-100' : 'opacity-0'
          }`} />
        </motion.header>
      )}
    </AnimatePresence>
  );
}