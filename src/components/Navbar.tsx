import React, { useState, useEffect } from 'react';
import { ShoppingBag, ShieldAlert, Menu, X, Car, Shirt, Sparkles, ChevronDown, ChevronLeft, ChevronRight, Home, Instagram, Phone, MessageCircle, Watch, Search, Truck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../utils/languageContext';

interface NavbarProps {
  activeCategory: 'all' | 'auto' | 'clothing' | 'home' | 'accessories' | 'tracking';
  activeSubcategory?: 'men' | 'women';
  onSelectCategory: (category: 'all' | 'auto' | 'clothing' | 'home' | 'accessories' | 'tracking', subcategory?: 'men' | 'women') => void;
  cartCount: number;
  onOpenCart: () => void;
  onOpenAdmin: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeCategory,
  activeSubcategory,
  onSelectCategory,
  cartCount,
  onOpenCart,
  onOpenAdmin,
  searchQuery,
  onSearchChange
}) => {
  const { t, lang, setLang } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [showClothesDropdown, setShowClothesDropdown] = useState(false);
  const [showAccessoriesDropdown, setShowAccessoriesDropdown] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleCategoryClick = (cat: 'all' | 'auto' | 'clothing' | 'home' | 'accessories' | 'tracking', sub?: 'men' | 'women') => {
    onSelectCategory(cat, sub);
    setIsOpen(false);
    setShowClothesDropdown(false);
    setShowAccessoriesDropdown(false);
  };

  const [currentSlide, setCurrentSlide] = useState(0);

  const promoSlides = [
    {
      id: 'instagram',
      element: (
        <a 
          href="https://instagram.com/level_upp.tm" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="flex items-center gap-2 hover:text-gold transition-all duration-300 group py-1 select-none"
        >
          <Instagram className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gold group-hover:scale-110 transition-transform" />
          <span className="text-[10px] sm:text-xs">Instagram: <span className="text-white group-hover:text-gold font-medium">@level_upp.tm</span></span>
        </a>
      )
    },
    {
      id: 'imo',
      element: (
        <div className="flex items-center gap-2 hover:text-gold transition-all duration-300 group cursor-default py-1 select-none">
          <div className="w-4 h-4 rounded bg-blue-500 text-white flex items-center justify-center text-[8px] font-extrabold tracking-tighter group-hover:scale-110 transition-transform shadow-sm">imo</div>
          <span className="text-[10px] sm:text-xs">IMO: <span className="text-white group-hover:text-gold font-semibold font-mono">+993 64 30-01-86</span></span>
        </div>
      )
    },
    {
      id: 'phone',
      element: (
        <a 
          href="tel:+99364300186" 
          className="flex items-center gap-2 hover:text-gold transition-all duration-300 group py-1 select-none"
        >
          <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gold group-hover:scale-110 transition-transform" />
          <span className="text-[10px] sm:text-xs">Позвонить: <span className="text-white group-hover:text-gold font-semibold font-mono">+993 64 30-01-86</span></span>
        </a>
      )
    },
    {
      id: 'shipping',
      element: (
        <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-white font-medium select-none py-1 text-center">
          <span>✈️ Быстрая авиа и авто доставка по всему Туркменистану! 🚛</span>
        </div>
      )
    },
    {
      id: 'office_info',
      element: (
        <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-white font-medium select-none py-1 text-center">
          <span>🏢 Офис: г. Ашхабад, Мир 7/5 (по Сурикова), д. 54 (09:00 - 21:00) 🕐</span>
        </div>
      )
    },
    {
      id: 'orders_24_7',
      element: (
        <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-gold font-semibold select-none py-1 text-center">
          <span>⚡ Прием заказов на сайте работает круглосуточно 24/7! 🌟</span>
        </div>
      )
    },
    {
      id: 'brand',
      element: (
        <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-white font-medium select-none py-1 text-center">
          <span>✨ LEVEL UP — Премиальные автоаксессуары и стильная одежда 💎</span>
        </div>
      )
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % promoSlides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [promoSlides.length]);

  const handlePrevSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentSlide((prev) => (prev - 1 + promoSlides.length) % promoSlides.length);
  };

  const handleNextSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentSlide((prev) => (prev + 1) % promoSlides.length);
  };

  return (
    <header id="site-header" className="sticky top-0 z-40 bg-dark-bg/85 backdrop-blur-md border-b border-dark-border/60">
      {/* Топ-бар с контактами и авто-прокруткой (рекламный слайдер) */}
      <div className="bg-dark-card border-b border-dark-border/40 text-gray-400 font-sans h-9 sm:h-10 flex items-center relative overflow-hidden">
        <div className="max-w-7xl w-full mx-auto px-10 flex items-center justify-between h-full relative">
          
          {/* Левая стрелка */}
          <button 
            onClick={handlePrevSlide}
            className="absolute left-2 sm:left-4 z-10 w-6 h-6 flex items-center justify-center rounded-full bg-dark-bg/40 border border-dark-border/40 hover:bg-dark-bg/80 hover:text-gold text-gray-400 transition-all cursor-pointer"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          {/* Слайды */}
          <div className="w-full flex justify-center items-center h-full relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center justify-center absolute w-full"
              >
                {promoSlides[currentSlide].element}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Правая стрелка */}
          <button 
            onClick={handleNextSlide}
            className="absolute right-2 sm:right-4 z-10 w-6 h-6 flex items-center justify-center rounded-full bg-dark-bg/40 border border-dark-border/40 hover:bg-dark-bg/80 hover:text-gold text-gray-400 transition-all cursor-pointer"
            aria-label="Next slide"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Мобильная кнопка меню */}
          <div className="flex md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-400 hover:text-gold transition-colors focus:outline-none p-2 cursor-pointer"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Логотип и значки доставки */}
          <div className="flex-1 flex justify-center md:justify-start items-center gap-2 sm:gap-4">
            {/* Логотип */}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleCategoryClick('all');
              }}
              className="text-base sm:text-2xl font-sans font-extrabold tracking-[0.1em] sm:tracking-[0.15em] text-white select-none hover:opacity-90 transition-opacity flex items-center gap-1.5 shrink-0"
            >
              {/* Небольшой SVG логотип-стрелочка LLU */}
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gold drop-shadow-[0_0_8px_rgba(197,168,92,0.4)]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4,16 L8,16 L8,12 L12,12 L12,8 L16,8 L16,4 L20,4 L20,0 L24,0 L24,12 L20,12 L20,16 L16,16 L16,20 L12,20 L12,24 L4,24 Z" />
              </svg>
              <span>LEVEL <span className="text-gold tracking-[0.05em] sm:tracking-[0.1em]">UP</span></span>
            </a>
          </div>

          {/* Поисковик по сайту */}
          <div className="hidden md:flex flex-col relative max-w-xs xl:max-w-sm w-full mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={lang === 'ru' ? 'Поиск по сайту...' : 'Sahypadan gözleg...'}
                className="w-full bg-dark-bg/60 border border-dark-border/80 rounded-full pl-10 pr-4 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-gold focus:bg-dark-bg transition-all font-sans"
              />
              {searchQuery && (
                <button 
                  onClick={() => onSearchChange('')}
                  className="absolute right-3.5 top-2 text-gray-400 hover:text-white text-[10px] uppercase tracking-widest font-bold cursor-pointer"
                >
                  {lang === 'ru' ? 'Сброс' : 'Arassala'}
                </button>
              )}
            </div>
          </div>

          {/* Десктопная навигация */}
          <nav className="hidden lg:flex items-center space-x-1 shrink-0">
            <button
              onClick={() => handleCategoryClick('all')}
              className={`px-3 py-2 text-xs tracking-wider uppercase transition-colors rounded-full duration-300 font-sans cursor-pointer ${
                activeCategory === 'all' && !searchQuery
                  ? 'text-gold font-semibold bg-gold/5'
                  : 'text-gray-300 hover:text-gold'
              }`}
            >
              {t('catalog', 'navbar')}
            </button>

            {/* Автотовары */}
            <button
              onClick={() => handleCategoryClick('auto')}
              className={`px-3 py-2 text-xs tracking-wider uppercase flex items-center gap-1.5 transition-colors rounded-full duration-300 font-sans cursor-pointer ${
                activeCategory === 'auto'
                  ? 'text-gold font-semibold bg-gold/5'
                  : 'text-gray-300 hover:text-gold'
              }`}
            >
              <Car className="w-3.5 h-3.5" />
              <span>{t('auto', 'navbar')}</span>
            </button>

            {/* Одежда */}
            <button
              onClick={() => handleCategoryClick('clothing')}
              className={`px-3 py-2 text-xs tracking-wider uppercase flex items-center gap-1.5 transition-colors rounded-full duration-300 font-sans font-bold cursor-pointer ${
                activeCategory === 'clothing'
                  ? 'text-gold bg-gold/5'
                  : 'text-gray-300 hover:text-gold'
              }`}
            >
              <Shirt className="w-3.5 h-3.5" />
              <span>{t('clothing', 'navbar')}</span>
            </button>

            {/* Часы и Аксессуары */}
            <button
              onClick={() => handleCategoryClick('accessories')}
              className={`px-3 py-2 text-xs tracking-wider uppercase flex items-center gap-1.5 transition-colors rounded-full duration-300 font-sans font-bold cursor-pointer ${
                activeCategory === 'accessories'
                  ? 'text-gold bg-gold/5'
                  : 'text-gray-300 hover:text-gold'
              }`}
            >
              <Watch className="w-3.5 h-3.5 text-gold animate-pulse" />
              <span>{lang === 'ru' ? 'Аксессуары' : 'Aksessuarlar'}</span>
            </button>

            {/* Дом и уют */}
            <button
              onClick={() => handleCategoryClick('home')}
              className={`px-3 py-2 text-xs tracking-wider uppercase flex items-center gap-1.5 transition-colors rounded-full duration-300 font-sans cursor-pointer ${
                activeCategory === 'home'
                  ? 'text-gold font-semibold bg-gold/5'
                  : 'text-gray-300 hover:text-gold'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>{t('home', 'navbar')}</span>
            </button>
            {/* Отслеживание */}
            <button
              onClick={() => handleCategoryClick('tracking')}
              className={`px-3 py-2 text-xs tracking-wider uppercase flex items-center gap-1.5 transition-colors rounded-full duration-300 font-sans cursor-pointer ${
                activeCategory === 'tracking'
                  ? 'text-gold font-semibold bg-gold/5'
                  : 'text-gray-300 hover:text-gold'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Truck className="w-3.5 h-3.5" />
                <motion.div 
                  animate={{ opacity: [1, 0.4, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute -top-0.5 -left-0.5 w-1.5 h-1.5 bg-red-500 rounded-full shadow-[0_0_5px_rgba(239,68,68,0.8)]"
                />
              </div>
              <span>{lang === 'ru' ? 'Отслеживание' : 'Gözegçilik'}</span>
            </button>
          </nav>

          {/* Правая часть панели */}
          <div className="flex-1 flex justify-end items-center space-x-3">
            {/* Переключатель Языка */}
            <div className="flex items-center bg-dark-bg border border-dark-border/60 rounded-full p-0.5 shadow-md">
              <button
                onClick={() => setLang('ru')}
                className={`px-2 py-0.5 text-[10px] sm:text-xs font-bold tracking-wider rounded-full transition-all duration-300 cursor-pointer ${
                  lang === 'ru'
                    ? 'bg-gold text-dark-bg shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                RU
              </button>
              <button
                onClick={() => setLang('tm')}
                className={`px-2 py-0.5 text-[10px] sm:text-xs font-bold tracking-wider rounded-full transition-all duration-300 cursor-pointer ${
                  lang === 'tm'
                    ? 'bg-gold text-dark-bg shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                TM
              </button>
            </div>

            {/* Кнопка Админ панели */}
            <button
              onClick={onOpenAdmin}
              className="p-2.5 text-gray-400 hover:text-gold transition-all duration-300 rounded-full hover:bg-dark-card-lighter relative group cursor-pointer"
              title={t('admin', 'navbar')}
            >
              <ShieldAlert className="w-5.5 h-5.5" />
              <span className="absolute right-0 top-12 scale-0 group-hover:scale-100 transition-all origin-top duration-200 bg-dark-card text-gold border border-dark-border px-2 py-1 text-[10px] uppercase tracking-wider rounded-md whitespace-nowrap z-50">
                {t('admin', 'navbar')}
              </span>
            </button>

            {/* Корзина */}
            <button
              onClick={onOpenCart}
              className="p-2.5 text-gray-300 hover:text-gold transition-all duration-300 rounded-full hover:bg-dark-card-lighter flex items-center relative cursor-pointer"
              title={t('cart', 'navbar')}
            >
              <ShoppingBag className="w-5.5 h-5.5" />
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute top-1 right-1 bg-gold text-dark-bg font-sans font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-lg shadow-gold/25"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>

        {/* Мобильный поиск (видимый всегда на маленьких экранах) */}
        <div className="md:hidden pb-2 px-1 relative">
          <Search className="absolute left-4 top-2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={lang === 'ru' ? 'Поиск по сайту...' : 'Sahypadan gözleg...'}
            className="w-full bg-dark-bg/60 border border-dark-border/80 rounded-full pl-10 pr-10 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-gold focus:bg-dark-bg transition-all font-sans"
          />
          {searchQuery && (
            <button 
              onClick={() => onSearchChange('')}
              className="absolute right-4 top-2 text-gray-400 hover:text-white text-[10px] uppercase tracking-widest font-bold cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Мобильное меню навигации */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden bg-dark-card border-b border-dark-border"
          >
            <div className="px-4 pt-3 pb-6 space-y-2">
              
              <button
                onClick={() => handleCategoryClick('all')}
                className={`w-full text-left px-4 py-3 rounded-xl font-sans tracking-wide uppercase text-xs font-bold ${
                  activeCategory === 'all' && !searchQuery
                    ? 'bg-gold/15 text-gold font-semibold'
                    : 'text-gray-300 hover:bg-dark-card-lighter'
                }`}
              >
                {t('catalog', 'navbar')}
              </button>
              
              <button
                onClick={() => handleCategoryClick('auto')}
                className={`w-full text-left px-4 py-3 rounded-xl font-sans tracking-wide uppercase text-xs font-bold flex items-center gap-2.5 ${
                  activeCategory === 'auto'
                    ? 'bg-gold/15 text-gold font-semibold'
                    : 'text-gray-300 hover:bg-dark-card-lighter'
                }`}
              >
                <Car className={`w-4 h-4 ${activeCategory === 'auto' ? 'text-gold' : 'text-gray-400'}`} />
                <span>{t('auto', 'navbar')}</span>
              </button>

              <button
                onClick={() => handleCategoryClick('home')}
                className={`w-full text-left px-4 py-3 rounded-xl font-sans tracking-wide uppercase text-xs font-bold flex items-center gap-2.5 ${
                  activeCategory === 'home'
                    ? 'bg-gold/15 text-gold font-semibold'
                    : 'text-gray-300 hover:bg-dark-card-lighter'
                }`}
              >
                <Home className={`w-4 h-4 ${activeCategory === 'home' ? 'text-gold' : 'text-gray-400'}`} />
                <span>{t('home', 'navbar')}</span>
              </button>

              <button
                onClick={() => handleCategoryClick('accessories')}
                className={`w-full text-left px-4 py-3 rounded-xl font-sans tracking-wide uppercase text-xs font-bold flex items-center gap-2.5 ${
                  activeCategory === 'accessories'
                    ? 'bg-gold/15 text-gold font-bold'
                    : 'text-gray-300 hover:bg-dark-card-lighter font-bold'
                }`}
              >
                <Watch className={`w-4 h-4 ${activeCategory === 'accessories' ? 'text-gold' : 'text-gray-400'}`} />
                <span>{lang === 'ru' ? 'Аксессуары' : 'Aksessuarlar'}</span>
              </button>

              <button
                onClick={() => handleCategoryClick('clothing')}
                className={`w-full text-left px-4 py-3 rounded-xl font-sans tracking-wide uppercase text-xs font-bold flex items-center gap-2.5 ${
                  activeCategory === 'clothing'
                    ? 'bg-gold/15 text-gold font-bold'
                    : 'text-gray-300 hover:bg-dark-card-lighter font-bold'
                }`}
              >
                <Shirt className={`w-4 h-4 ${activeCategory === 'clothing' ? 'text-gold' : 'text-gray-400'}`} />
                <span>{t('clothing', 'navbar')}</span>
              </button>

              <button
                onClick={() => handleCategoryClick('tracking')}
                className={`w-full mt-2 text-left px-4 py-4 rounded-2xl font-sans tracking-wide uppercase text-xs font-bold flex items-center gap-3 transition-all duration-300 border ${
                  activeCategory === 'tracking'
                    ? 'bg-gold/15 text-gold border-gold/30 shadow-lg shadow-gold/5'
                    : 'text-gray-300 bg-dark-card/40 border-dark-border/40 hover:bg-dark-card-lighter'
                }`}
              >
                <div className="relative">
                  <Truck className={`w-5 h-5 ${activeCategory === 'tracking' ? 'text-gold' : 'text-gray-400'}`} />
                  <motion.div 
                    animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-red-600 rounded-full border-2 border-dark-card shadow-[0_0_8px_rgba(220,38,38,0.7)]"
                  />
                </div>
                <div className="flex flex-col">
                  <span>{lang === 'ru' ? 'Где мой товар?' : 'Harydym nirede?'}</span>
                  <span className="text-[8px] opacity-50 tracking-widest mt-0.5">{lang === 'ru' ? 'ОТСЛЕЖИВАНИЕ ЗАКАЗА' : 'SARGYDY GÖZEGÇILIK'}</span>
                </div>
              </button>

              {/* Быстрые контакты в мобильном меню */}
              <div className="border-t border-dark-border/40 mt-4 pt-4 px-4 space-y-3 font-sans">
                <span className="block text-[9px] text-gray-500 uppercase tracking-widest font-semibold">Контакты / Habarlaşmak</span>
                <div className="grid grid-cols-1 gap-2.5">
                  <a 
                    href="https://instagram.com/level_upp.tm" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-dark-bg/50 border border-dark-border/40 hover:border-gold/40 text-xs text-gray-300 hover:text-gold transition-all"
                  >
                    <Instagram className="w-4 h-4 text-gold shrink-0" />
                    <span>Instagram: <strong className="text-white">@level_upp.tm</strong></span>
                  </a>
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-dark-bg/50 border border-dark-border/40 text-xs text-gray-300 cursor-default">
                    <div className="w-4 h-4 rounded bg-blue-500 text-white flex items-center justify-center text-[8px] font-extrabold tracking-tighter shadow-sm select-none shrink-0">imo</div>
                    <span>IMO: <strong className="text-white font-mono">+993 64 30-01-86</strong></span>
                  </div>
                  <a 
                    href="tel:+99364300186" 
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-dark-bg/50 border border-dark-border/40 hover:border-gold/40 text-xs text-gray-300 hover:text-gold transition-all"
                  >
                    <Phone className="w-4 h-4 text-gold shrink-0" />
                    <span>Позвонить: <strong className="text-white font-mono">+993 64 30-01-86</strong></span>
                  </a>
                </div>
              </div>

              {/* Нижняя панелька в меню: стрелка вверх */}
              <div className="border-t border-dark-border/40 mt-6 pt-4 pb-2 px-2 flex items-center justify-center">
                <button 
                  onClick={() => {
                    setIsOpen(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-12 h-12 flex items-center justify-center text-white bg-dark-card-lighter rounded-full hover:bg-gold/20 transition-colors"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                    <path d="M4 14h4v8h8v-8h4L12 2 4 14z" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
