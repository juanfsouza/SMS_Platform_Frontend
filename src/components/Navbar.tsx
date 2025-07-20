'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from '@/components/ui/navigation-menu';
import Link from 'next/link';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { LogOut, User, Settings, ChevronDown, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const { user, setUser } = useAuthStore();
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Hide/show navbar based on scroll direction
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      // Add background blur when scrolled
      setIsScrolled(currentScrollY > 20);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    console.log('User in Navbar:', user);
  }, [user]);

  const handleLogout = () => {
    setUser(null);
    router.push('/auth/login');
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
              : 'bg-gradient-to-r from-primary/95 to-primary/90 shadow-sm'
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

              {/* User Section */}
              <div className="flex items-center">
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <motion.button
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
                            {user.role === 'ADMIN' ? 'Administrador' : 'Usuário'}
                          </p>
                        </div>
                        
                        <div className="relative">
                          <Avatar className="w-9 h-9 ring-2 ring-offset-2 ring-white/20 transition-all duration-300 hover:ring-offset-4">
                            <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-custom-bold text-sm">
                              {user.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white shadow-sm" />
                        </div>
                        
                        <ChevronDown className={`w-4 h-4 transition-all duration-300 ${
                          isScrolled ? 'text-muted-foreground' : 'text-white/70'
                        }`} />
                      </motion.button>
                    </DropdownMenuTrigger>
                    
                    <DropdownMenuContent 
                      align="end" 
                      className="w-56 p-2 mt-2 bg-card/95 backdrop-blur-xl border border-border/50 shadow-2xl"
                      sideOffset={8}
                    >
                      <div className="px-3 py-2 border-b border-border/50 mb-2">
                        <p className="text-sm font-medium text-foreground">{user.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {user.role === 'ADMIN' ? 'Administrador' : 'Usuário'}
                        </p>
                      </div>
                      
                      <DropdownMenuItem asChild className="rounded-lg">
                        <Link href="/profile" className="flex items-center px-3 py-2 cursor-pointer">
                          <User className="mr-3 h-4 w-4 text-muted-foreground" />
                          <span>Meu Perfil</span>
                        </Link>
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem asChild className="rounded-lg">
                        <Link href="/dashboard" className="flex items-center px-3 py-2 cursor-pointer">
                          <LayoutDashboard className="mr-3 h-4 w-4 text-muted-foreground" />
                          <span>Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                      
                      {user?.role === 'ADMIN' && (
                        <DropdownMenuItem asChild className="rounded-lg">
                          <Link href="/admin/config" className="flex items-center px-3 py-2 cursor-pointer">
                            <Settings className="mr-3 h-4 w-4 text-muted-foreground" />
                            <span>Configurações</span>
                          </Link>
                        </DropdownMenuItem>
                      )}
                      
                      <div className="border-t border-border/50 mt-2 pt-2">
                        <DropdownMenuItem 
                          onClick={handleLogout} 
                          className="flex items-center px-3 py-2 rounded-lg text-destructive focus:text-destructive cursor-pointer"
                        >
                          <LogOut className="mr-3 h-4 w-4" />
                          <span>Sair da Conta</span>
                        </DropdownMenuItem>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link 
                      href="/auth/login" 
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
              </div>
            </div>
          </div>
          
          {/* Decorative gradient line */}
          <div className={`absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/50 to-transparent transition-opacity duration-300 ${
            isScrolled ? 'opacity-100' : 'opacity-0'
          }`} />
        </motion.header>
      )}
    </AnimatePresence>
  );
}