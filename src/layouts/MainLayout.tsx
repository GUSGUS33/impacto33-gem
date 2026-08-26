"use client";
import { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { siteConfig } from "@/config/siteConfig";
import { Phone, Mail, Menu, Search, ShoppingBag, X, Heart, Home, FileText } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { MegaMenu } from "@/components/MegaMenu";
import type { MegaMenuSection, MenuItem } from "@/components/MegaMenu";
import { useMainMenu } from "@/hooks/useMainMenu";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useExternalScripts } from "@/hooks/useExternalScripts";
import { useAuth } from "@/context/AuthContext";
import { signOut } from "@/services/authService";
import { User, LogOut, MapPin, Palette } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const { menuSections } = useMainMenu();
  const location = usePathname();
  const router = useRouter();
  const [mobileSearchQuery, setMobileSearchQuery] = useState("");
  const scriptsLoaded = useExternalScripts();
  const { user, profile } = useAuth();
  const { itemCount } = useCart();
  const [isBannerVisible, setIsBannerVisible] = useState(true);

  const handleLogout = async () => {
    await signOut();
    window.location.href = '/';
  };

  const toggleSubmenu = (key: string) => {
    setExpandedMenu(expandedMenu === key ? null : key);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans text-slate-900">
      {/* Announcement Banner */}
      {isBannerVisible && (
        <div className="bg-[#e49b9b] text-white text-sm py-2.5 px-4 relative flex items-center justify-center z-50">
          <div className="container mx-auto flex items-center justify-center text-center pr-8 max-md:flex-col max-md:gap-1">
            <span>
              <span className="font-bold mr-2">Aviso de mantenimiento:</span>
              Las funciones de compra no están disponibles temporalmente.
            </span>
            <span>
              Por favor, 
              <a href={`https://wa.me/${siteConfig.whatsappNumber.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="underline font-bold ml-1 hover:text-white/80 transition-colors">
                escríbenos por WhatsApp
              </a> para pedidos o dudas.
            </span>
          </div>
          <button 
            onClick={() => setIsBannerVisible(false)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-white/80 transition-colors p-1"
            aria-label="Cerrar aviso"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Top Bar */}
      <div className="bg-white border-b border-slate-100 text-slate-600 text-[11px] py-2 font-medium tracking-wide hidden lg:block">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="text-blue-400 font-bold uppercase">¡Te ayudamos!</span>
            <span>{siteConfig.businessHours}</span>
            <a href={`tel:${siteConfig.whatsappNumber}`} className="flex items-center gap-1 hover:text-blue-500 transition-colors">
              <Phone size={13} /> {siteConfig.whatsappNumber}
            </a>
            <a href={`mailto:${siteConfig.contactEmail}`} className="flex items-center gap-1 hover:text-blue-500 transition-colors">
              <Mail size={13} /> {siteConfig.contactEmail}
            </a>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/contacto" className="hover:text-blue-500 transition-colors uppercase">Contacto</Link>
            <Link href="/presupuesto-rapido" className="hover:text-blue-500 transition-colors font-bold uppercase text-slate-800">Presupuesto Rápido</Link>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 bg-white z-50 shadow-sm relative">
        <div className="container mx-auto px-4 py-2.5 sm:py-3 md:py-5">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link href={user ? "/inicio" : "/"} className="flex items-center gap-2 shrink-0">
              <img src="/logo.svg" alt="IMPACTO33" width={180} height={40} className="h-7 sm:h-8 md:h-9 2xl:h-10 w-auto" />
            </Link>

            {/* Desktop Nav */}
            <div className="flex-1 flex justify-center px-2 min-w-0 overflow-visible">
              <MegaMenu />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 sm:gap-1.5 2xl:gap-2 shrink-0">
              {/* Favoritos - Desktop */}
              <Link href="/mis-favoritos">
                <button className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-slate-50 transition-colors text-slate-700 font-medium text-xs 2xl:text-sm relative">
                  <Heart size={18} />
                  <span>Favoritos</span>
                </button>
              </Link>

              {/* Carrito - Desktop */}
              <Link href="/carrito">
                <button className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-slate-50 transition-colors text-slate-700 relative">
                  <ShoppingBag size={18} />
                  {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {itemCount}
                    </span>
                  )}
                </button>
              </Link>

              {/* Auth Buttons - Desktop */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors text-slate-700 font-medium text-xs 2xl:text-sm">
                      <User size={18} />
                      <span className="max-w-[120px] 2xl:max-w-[150px] truncate">{user.email?.split('@')[0]}</span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem asChild>
                      <Link href="/inicio" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        <span>Mi Panel</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/mi-cuenta" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        <span>Mi Cuenta</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/mis-favoritos" className="cursor-pointer">
                        <Heart className="mr-2 h-4 w-4" />
                        <span>Mis Favoritos</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/mis-pedidos" className="cursor-pointer">
                        <ShoppingBag className="mr-2 h-4 w-4" />
                        <span>Mis Pedidos</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/mi-perfil" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        <span>Mi Perfil</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Cerrar Sesión</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="relative group hidden xl:block">
                  <Link href="/auth/login">
                    <Button variant="outline" size="sm" className="flex items-center gap-1.5 text-xs 2xl:text-sm px-2.5 py-1.5 h-auto">
                      <User size={16} />
                      Acceder
                    </Button>
                  </Link>
                  <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="w-64 bg-white rounded-lg shadow-lg border border-slate-200 py-3 flex flex-col">
                      <div className="px-4 pb-3 border-b border-slate-100 mb-2">
                        <p className="text-sm font-semibold text-slate-900 mb-2">Bienvenido a {siteConfig.brandName}</p>
                        <Link href="/auth/login">
                          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" size="sm">
                            Iniciar Sesión
                          </Button>
                        </Link>
                        <p className="text-xs text-slate-500 mt-2 text-center">
                          ¿Nuevo usuario? <Link href="/auth/register" className="text-blue-600 hover:underline">Regístrate aquí</Link>
                        </p>
                      </div>
                      <div className="px-3">
                        <Link href="/auth/login" className="flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-md transition-colors">
                          <User size={16} /> <span>Mi Panel</span>
                        </Link>
                        <Link href="/auth/login" className="flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-md transition-colors">
                          <ShoppingBag size={16} /> <span>Mis Pedidos</span>
                        </Link>
                        <Link href="/auth/login" className="flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-md transition-colors">
                          <Heart size={16} /> <span>Mis Favoritos</span>
                        </Link>
                        <Link href="/auth/login" className="flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-md transition-colors">
                          <MapPin size={16} /> <span>Mis Direcciones</span>
                        </Link>
                        <Link href="/auth/login" className="flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-md transition-colors">
                          <Palette size={16} /> <span>Mis Diseños</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Mobile Buttons with Touch-Friendly 44px minimum target */}
              <Link href="/mis-favoritos" aria-label="Favoritos" className="xl:hidden w-11 h-11 flex items-center justify-center hover:bg-slate-100 rounded-full text-slate-700 active:scale-95 transition-all">
                <Heart size={21} />
              </Link>
              <Link href="/carrito" aria-label="Carrito" className="xl:hidden w-11 h-11 flex items-center justify-center hover:bg-slate-100 rounded-full text-slate-700 active:scale-95 transition-all relative">
                <ShoppingBag size={21} />
                {itemCount > 0 && (
                  <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Link>
              <button 
                className="xl:hidden w-11 h-11 flex items-center justify-center hover:bg-slate-100 rounded-full text-slate-700 active:scale-95 transition-all"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                aria-label="Buscar"
              >
                <Search size={22} />
              </button>
              <button 
                className="xl:hidden w-11 h-11 flex items-center justify-center hover:bg-slate-100 rounded-full text-slate-700 active:scale-95 transition-all"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Menú"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {isSearchOpen && (
          <div className="xl:hidden bg-white border-t border-slate-100 p-4 absolute w-full left-0 shadow-md z-40 animate-in slide-in-from-top-2">
            <form
              className="relative flex items-center w-full"
              onSubmit={(e) => {
                e.preventDefault();
                if (mobileSearchQuery.trim()) {
                  router.push(`/busqueda?q=${encodeURIComponent(mobileSearchQuery.trim())}`);
                  setIsSearchOpen(false);
                }
              }}
            >
              <input 
                type="text" 
                name="search" 
                value={mobileSearchQuery}
                onChange={(e) => setMobileSearchQuery(e.target.value)}
                placeholder="Buscar productos (ej. camisetas, mochilas, tazas)..." 
                autoFocus
                className="w-full h-12 pl-4 pr-12 rounded-lg border border-slate-200 bg-slate-50 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
              <button 
                type="submit" 
                aria-label="Buscar"
                className="absolute right-2 top-2 bottom-2 w-8 h-8 bg-blue-600 text-white rounded-md flex items-center justify-center hover:bg-blue-700 transition-colors"
              >
                <Search size={16} />
              </button>
            </form>
          </div>
        )}

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-100 bg-white absolute w-full left-0 shadow-lg h-[calc(100vh-80px)] overflow-y-auto z-50">
            <nav className="flex flex-col p-4 gap-2 font-medium text-sm uppercase">
              {menuSections && Object.entries(menuSections).map(([key, section]: [string, MegaMenuSection]) => (
                <div key={key} className="border-b border-slate-50 last:border-0">
                  <div className="flex items-center justify-between py-2">
                    <span onClick={() => setIsMobileMenuOpen(false)} className="flex-grow cursor-pointer">
                      {section.title}
                    </span>
                    <button 
                      onClick={() => toggleSubmenu(key)}
                      className="p-2 text-slate-400 hover:text-blue-500"
                    >
                      {expandedMenu === key ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                  
                  {/* Submenu Accordion */}
                  {expandedMenu === key && (
                    <div className="pl-4 pb-2 bg-slate-50/50 rounded-md mb-2 animate-in slide-in-from-top-1">
                      {section.columns.map((col: MenuItem, idx: number) => (
                        <div key={idx} className="mb-3 last:mb-0">
                          <Link 
                            href={col.href} 
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="block text-xs font-bold text-slate-700 mb-1 mt-2 hover:text-blue-500"
                          >
                            {col.title}
                          </Link>
                          {col.items && (
                            <ul className="pl-2 border-l-2 border-slate-200 space-y-1">
                              {col.items.map((item: { label: string; href: string; image?: { src: string; altText: string } | null }, i: number) => (
                                <li key={i}>
                                  <Link 
                                    href={item.href} 
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center gap-2 text-[11px] text-slate-500 capitalize hover:text-blue-500 py-1"
                                  >
                                    {item.image ? (
                                      <div className="relative w-5 h-5 flex-shrink-0 overflow-hidden rounded-full bg-slate-100">
                                        <OptimizedImage
                                          src={item.image.src}
                                          alt={item.image.altText || item.label}
                                          fill
                                          containerClassName="w-full h-full"
                                          className="object-cover"
                                          sizes="20px"
                                          loading="eager"
                                          unoptimized={true}
                                        />
                                      </div>
                                    ) : null}
                                    <span>{item.label}</span>
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              
              <hr className="border-slate-100 my-2" />
              
              {/* Mobile Auth */}
              {user ? (
                <div className="flex flex-col gap-2">
                  <div className="text-xs font-bold text-slate-700 py-2">
                    {user.email}
                  </div>
                  <Link href="/inicio" onClick={() => setIsMobileMenuOpen(false)} className="text-xs text-slate-600 hover:text-blue-500 py-1">
                    Mi Panel
                  </Link>
                  <Link href="/mi-cuenta" onClick={() => setIsMobileMenuOpen(false)} className="text-xs text-slate-600 hover:text-blue-500 py-1">
                    Mi Cuenta
                  </Link>
                  <Link href="/mis-favoritos" onClick={() => setIsMobileMenuOpen(false)} className="text-xs text-slate-600 hover:text-blue-500 py-1">
                    Mis Favoritos
                  </Link>
                  <Link href="/mis-pedidos" onClick={() => setIsMobileMenuOpen(false)} className="text-xs text-slate-600 hover:text-blue-500 py-1">
                    Mis Pedidos
                  </Link>
                  <button onClick={handleLogout} className="text-xs text-red-600 hover:text-red-700 py-1 text-left">
                    Cerrar Sesion
                  </button>
                </div>
              ) : (
                <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)} className="text-xs font-bold text-blue-600 hover:text-blue-700 py-2">
                  Iniciar Sesion
                </Link>
              )}
              
              <hr className="border-slate-100 my-2" />
              
              {/* Mobile Contact Info */}
              <div className="flex flex-col gap-3 text-xs text-slate-500 normal-case">
                <div className="font-bold text-blue-500 uppercase">¡Te ayudamos!</div>
                <div>{siteConfig.businessHours}</div>
                <a href={`tel:${siteConfig.whatsappNumber}`} className="flex items-center gap-2 hover:text-blue-500">
                  <Phone size={14} /> {siteConfig.whatsappNumber}
                </a>
                <a href={`mailto:${siteConfig.contactEmail}`} className="flex items-center gap-2 hover:text-blue-500">
                  <Mail size={14} /> {siteConfig.contactEmail}
                </a>
              </div>

              <hr className="border-slate-100 my-2" />
              
              <Link href="/contacto" onClick={() => setIsMobileMenuOpen(false)}>Contacto</Link>
              <Link href="/presupuesto-rapido" className="bg-blue-500 text-white text-center py-3 rounded-lg font-bold shadow-md" onClick={() => setIsMobileMenuOpen(false)}>
                PEDIR PRESUPUESTO
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow pb-16 xl:pb-0">
        {children}
      </main>

      {/* Sticky Mobile Bottom Navigation Bar */}
      <nav aria-label="Navegación Móvil Rápida" className="xl:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-1.5 flex justify-around items-center text-[10px] font-semibold text-slate-600 shadow-lg">
        <Link 
          href={user ? "/inicio" : "/"} 
          className={`flex flex-col items-center gap-0.5 p-1 rounded-lg transition-colors ${location === '/' || location === '/inicio' ? 'text-blue-600 font-bold' : 'hover:text-slate-900'}`}
        >
          <Home size={20} />
          <span>Inicio</span>
        </Link>

        <button 
          onClick={() => { setIsSearchOpen(!isSearchOpen); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          className={`flex flex-col items-center gap-0.5 p-1 rounded-lg transition-colors ${isSearchOpen ? 'text-blue-600 font-bold' : 'hover:text-slate-900'}`}
        >
          <Search size={20} />
          <span>Buscar</span>
        </button>

        <Link 
          href="/presupuesto-rapido" 
          className={`flex flex-col items-center gap-0.5 p-1 rounded-lg transition-colors ${location === '/presupuesto-rapido' ? 'text-blue-600 font-bold' : 'hover:text-slate-900'}`}
        >
          <FileText size={20} />
          <span>Presupuesto</span>
        </Link>

        <Link 
          href="/carrito" 
          className={`flex flex-col items-center gap-0.5 p-1 rounded-lg transition-colors relative ${location === '/carrito' ? 'text-blue-600 font-bold' : 'hover:text-slate-900'}`}
        >
          <ShoppingBag size={20} />
          <span>Carrito</span>
          {itemCount > 0 && (
            <span className="absolute top-0 right-1 bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
              {itemCount}
            </span>
          )}
        </Link>

        <a 
          href={`https://wa.me/${siteConfig.whatsappNumber.replace(/\D/g, '')}`} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="flex flex-col items-center gap-0.5 p-1 rounded-lg text-emerald-600 hover:text-emerald-700 font-bold"
        >
          <Phone size={20} />
          <span>WhatsApp</span>
        </a>
      </nav>

      {/* WhatsApp Floating Button */}
      {scriptsLoaded && (
        <a 
          href={`https://wa.me/${siteConfig.whatsappNumber.replace(/\D/g, '')}`}
          target="_blank" 
          rel="noopener noreferrer"
          className="fixed bottom-20 xl:bottom-6 right-4 xl:right-6 z-50 bg-[#25D366] text-white p-3 rounded-full shadow-lg hover:bg-[#128C7E] transition-all duration-300 hover:scale-110 flex items-center justify-center group animate-in fade-in zoom-in duration-500"
          aria-label="Contactar por WhatsApp"
        >
          <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor" className="w-7 h-7">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
          <span className="absolute right-full mr-3 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            ¡Escríbenos!
          </span>
        </a>
      )}

      {/* Footer */}
      <footer className="bg-[#f8f9fa] pt-16 pb-8 text-slate-500 text-sm border-t border-slate-100">
        <div className="container mx-auto px-4 flex flex-col items-center mb-12">
             <div className="mb-8">
                <img src="/images/footer/logo-footer.png" alt="IMPACTO33" width={220} height={45} loading="lazy" className="w-auto h-9 max-w-full" />
             </div>
        </div>

        <nav aria-label="Footer Navigation" className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 text-center md:text-left">
          <div>
            <h4 className="text-slate-900 font-bold mb-6 uppercase tracking-wider text-xs">Personalización</h4>
            <ul className="space-y-3">
               <li><Link href="/servicios/serigrafia" className="hover:text-blue-500 transition-colors">Servicio de Serigrafía</Link></li>
               <li><Link href="/servicios/sublimacion" className="hover:text-blue-500 transition-colors">Servicio de Sublimación</Link></li>
               <li><Link href="/servicios/impresion-digital" className="hover:text-blue-500 transition-colors">Impresión Digital Textil</Link></li>
               <li><Link href="/servicios/vinilo" className="hover:text-blue-500 transition-colors">Servicio de Vinilo Textil</Link></li>
               <li><Link href="/servicios/bordado" className="hover:text-blue-500 transition-colors">Servicio de Bordado</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-slate-900 font-bold mb-6 uppercase tracking-wider text-xs">Ayuda</h4>
            <ul className="space-y-3">
              <li><Link href="/preguntas-frecuentes" className="hover:text-blue-500 transition-colors">Preguntas Frecuentes</Link></li>
              <li><Link href="/plazos-de-entrega" className="hover:text-blue-500 transition-colors">Plazos de Entrega</Link></li>
              <li><Link href="/enviar-archivos" className="hover:text-blue-500 transition-colors">Enviar Archivos</Link></li>
              <li><Link href="/formas-de-pago" className="hover:text-blue-500 transition-colors">Formas de Pago</Link></li>
              <li><Link href="/presupuesto-rapido" className="hover:text-blue-500 transition-colors font-bold">PRESUPUESTO RÁPIDO</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-slate-900 font-bold mb-6 uppercase tracking-wider text-xs">Nosotros</h4>
            <ul className="space-y-3">
              <li><Link href="/quienes-somos" className="hover:text-blue-500 transition-colors">¿Quiénes Somos?</Link></li>
              <li><Link href="/contacto" className="hover:text-blue-500 transition-colors">Contacto</Link></li>
              <li><Link href="/trabajos-realizados" className="hover:text-blue-500 transition-colors">Trabajos Realizados</Link></li>
              <li><Link href="/marcas" className="hover:text-blue-500 transition-colors">Marcas</Link></li>
              <li><Link href="/blog" className="hover:text-blue-500 transition-colors">Blog</Link></li>
            </ul>
          </div>

          <div>
             <h4 className="text-slate-900 font-bold mb-6 uppercase tracking-wider text-xs">Contáctanos</h4>
             <p className="mb-4">Abiertos Lunes-Viernes<br/>9-14 hs y 15-18 hs</p>
             <p className="mb-2 text-slate-900 font-bold">{siteConfig.whatsappNumber}</p>
             <p className="mb-4 text-blue-500">{siteConfig.contactEmail}</p>
             <div className="flex gap-4 justify-center md:justify-start">
                <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center hover:bg-blue-500 hover:text-white transition-colors cursor-pointer">f</div>
                <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center hover:bg-blue-500 hover:text-white transition-colors cursor-pointer">tw</div>
                <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center hover:bg-blue-500 hover:text-white transition-colors cursor-pointer">in</div>
             </div>
          </div>
        </nav>
        
        <div className="container mx-auto px-4 mt-16 pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400">
          <div className="flex flex-col md:flex-row items-center gap-4">
             <span>© 2009 - 2026 Todos los derechos reservados impacto33.com</span>
             <div className="hidden md:block w-1 h-1 bg-slate-300 rounded-full"></div>
             <Link href="/aviso-legal" className="hover:text-slate-600">Aviso Legal</Link>
             <Link href="/politica-privacidad" className="hover:text-slate-600">Política de Privacidad</Link>
             <Link href="/cookies" className="hover:text-slate-600">Cookies</Link>
          </div>
          <div className="flex items-center gap-4">
             <span className="uppercase font-bold text-[10px] tracking-wider text-slate-300">Compra 100% Segura</span>
             <div className="flex gap-2">
                <img src="/images/footer/visa.png" alt="Visa" width={38} height={24} loading="lazy" className="h-6 w-auto" />
                <img src="/images/footer/mastercard.png" alt="Mastercard" width={38} height={24} loading="lazy" className="h-6 w-auto" />
                <img src="/images/footer/paypal.png" alt="PayPal" width={38} height={24} loading="lazy" className="h-6 w-auto" />
                <img src="/images/footer/maestro.png" alt="Maestro" width={38} height={24} loading="lazy" className="h-6 w-auto" />
                <img src="/images/footer/visa-electron.png" alt="Visa Electron" width={38} height={24} loading="lazy" className="h-6 w-auto" />
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
