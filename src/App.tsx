import { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { Catalog } from './components/Catalog';
import { Cart } from './components/Cart';
import { AdminPanel } from './components/AdminPanel';
import { ProductDetailsModal } from './components/ProductDetailsModal';
import { OrderTracking } from './components/OrderTracking';
import { dbService } from './utils/db';
import { sendOrderTelegramNotification } from './utils/telegram';
import { Product, CartItem, Order, ProductOption } from './types';
import { Sparkles, ShieldCheck, CreditCard, Award, ArrowRight, Car, Shirt, Home, Plane, Truck, Instagram, Phone, MapPin, Clock, Sun, Snowflake } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from './utils/languageContext';

const CART_KEY = 'levelup_cart';

export default function App() {
  const [activeCategory, setActiveCategory] = useState<'all' | 'auto' | 'clothing' | 'home' | 'accessories' | 'tracking'>('all');
  const [activeSubcategory, setActiveSubcategory] = useState<'men' | 'women' | undefined>(undefined);
  const [weatherCondition, setWeatherCondition] = useState<"sunny" | "snowy" | "cloudy">("sunny");
  const [searchQuery, setSearchQuery] = useState('');
  const allScrollPosRef = useRef<number>(0);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  const [cartOpen, setCartOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const { t, lang } = useLanguage();

  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('levelup_favorites');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Синхронизация избранного с localStorage
  useEffect(() => {
    localStorage.setItem('levelup_favorites', JSON.stringify(favoriteIds));
  }, [favoriteIds]);

  const handleToggleFavorite = (productId: string) => {
    setFavoriteIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  // Инициализация данных
  useEffect(() => {
    // Загрузить продукты из БД (localstorage)
    setProducts(dbService.getProducts());

    // Загрузить корзину из локального хранилища
    const storedCart = localStorage.getItem(CART_KEY);
    if (storedCart) {
      try {
        setCartItems(JSON.parse(storedCart));
      } catch (e) {
        setCartItems([]);
      }
    }
  }, []);

  // Синхронизация корзины с localStorage
  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  // Обновление каталога (например, после действий админа)
  const handleRefreshCatalog = () => {
    setProducts(dbService.getProducts());
  };

  // Выбор категории в навбаре
  const handleSelectCategory = (category: 'all' | 'auto' | 'clothing' | 'home' | 'accessories' | 'tracking', subcategory?: 'men' | 'women') => {
    if (activeCategory === 'all' && category !== 'all') {
      allScrollPosRef.current = window.scrollY;
    }

    setActiveCategory(category);
    setActiveSubcategory(subcategory);

    if (category === 'all') {
      setTimeout(() => {
        window.scrollTo({
          top: allScrollPosRef.current,
          behavior: 'smooth'
        });
      }, 100);
    } else {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  // Добавление в корзину с учетом способа доставки из Китая
  const handleAddToCart = (
    product: Product,
    size?: string,
    option?: ProductOption,
    shipping: 'air' | 'truck' = 'air',
    shippingCost: number = 0
  ) => {
    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (item) => 
          item.product.id === product.id && 
          item.selectedSize === size &&
          ((!item.selectedOption && !option) || (item.selectedOption?.name === option?.name)) &&
          item.selectedShipping === shipping
      );

      if (existingIndex !== -1) {
        const updated = [...prevItems];
        updated[existingIndex].quantity += 1;
        return updated;
      } else {
        return [...prevItems, { 
          product, 
          selectedSize: size, 
          selectedOption: option, 
          selectedShipping: shipping,
          shippingCost: shippingCost,
          quantity: 1 
        }];
      }
    });

    // Открыть корзину для визуальной обратной связи
    setCartOpen(true);
  };

  // Изменение количества товара в корзине
  const handleUpdateQuantity = (productId: string, quantity: number, size?: string, option?: ProductOption) => {
    if (quantity <= 0) {
      handleRemoveItem(productId, size, option);
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.product.id === productId && 
        item.selectedSize === size &&
        ((!item.selectedOption && !option) || (item.selectedOption?.name === option?.name))
          ? { ...item, quantity }
          : item
      )
    );
  };

  // Удаление товара из корзины
  const handleRemoveItem = (productId: string, size?: string, option?: ProductOption) => {
    setCartItems((prevItems) =>
      prevItems.filter(
        (item) => !(
          item.product.id === productId && 
          item.selectedSize === size &&
          ((!item.selectedOption && !option) || (item.selectedOption?.name === option?.name))
        )
      )
    );
  };

  // Оформление заказа (очистка корзины и создание записи в БД)
  const handleCheckout = (orderData: Omit<Order, 'id' | 'createdAt' | 'status'>): Order => {
    const newOrder = dbService.createOrder(orderData);
    setCartItems([]); // Очистить корзину после заказа
    
    // Асинхронно отправляем уведомление в Telegram (не дожидаясь ответа, чтобы не блокировать UI)
    sendOrderTelegramNotification(newOrder).catch(err => {
      console.error('Ошибка отправки уведомления в Telegram:', err);
    });

    return newOrder;
  };

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Динамическое изменение цвета фона body для плавной и глубокой смены тем
  useEffect(() => {
    let color = '#141412'; // Глубокий антрацит по умолчанию
    if (activeCategory === 'auto') {
      color = '#121b2c'; // Насыщенный стальной синий под авто
    } else if (activeCategory === 'clothing') {
      if (activeSubcategory === 'men') {
        color = '#111b33'; // Благородный кобальт-индиго для мужчин
      } else if (activeSubcategory === 'women') {
        color = '#2a141a'; // Премиальный винно-бордовый для женщин
      } else {
        color = '#201815'; // Тёплый кашемирово-кофейный
      }
    } else if (activeCategory === 'accessories') {
      if (activeSubcategory === 'men') {
        color = '#141416'; // Черный обсидиан для стильных мужских аксессуаров
      } else if (activeSubcategory === 'women') {
        color = '#24181a'; // Благородная роза/розовое золото
      } else {
        color = '#161a1d'; // Глубокий оружейный металл/титан
      }
    } else if (activeCategory === 'home') {
      color = '#112218'; // Изумрудно-хвойный под дом и декор
    }

    // Применяем плавный переход к body
    document.body.style.transition = 'background-color 1000ms cubic-bezier(0.4, 0, 0.2, 1)';
    document.body.style.backgroundColor = color;
  }, [activeCategory, activeSubcategory]);

  // Определение фонового оттенка в зависимости от активного раздела (плавная смена)
  const getAmbientBgClass = () => {
    if (activeCategory === 'auto') return 'bg-[#121b2c]';
    if (activeCategory === 'clothing') {
      if (activeSubcategory === 'men') return 'bg-[#111b33]';
      if (activeSubcategory === 'women') return 'bg-[#2a141a]';
      return 'bg-[#201815]';
    }
    if (activeCategory === 'accessories') {
      if (activeSubcategory === 'men') return 'bg-[#141416]';
      if (activeSubcategory === 'women') return 'bg-[#24181a]';
      return 'bg-[#161a1d]';
    }
    if (activeCategory === 'home') return 'bg-[#112218]';
    return 'bg-[#141412]';
  };

  return (
    <div className={`min-h-screen ${getAmbientBgClass()} text-gray-200 flex flex-col transition-colors duration-1000 overflow-x-hidden selection:bg-gold selection:text-dark-bg`}>
      
      {/* Навигационная панель */}
      <Navbar
        activeCategory={activeCategory}
        activeSubcategory={activeSubcategory}
        onSelectCategory={handleSelectCategory}
        cartCount={totalCartCount}
        onOpenCart={() => setCartOpen(true)}
        onOpenAdmin={() => setAdminOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Hero-секция с Логотипом и лозунгом */}
      {activeCategory === 'all' && (
        <section className="relative overflow-hidden py-3 sm:py-5 md:py-6 border-b border-dark-border/40 bg-radial-gradient-hero">
          <div className="absolute inset-0 bg-radial-gradient from-gold/10 via-transparent to-transparent opacity-80 pointer-events-none" />
          
          {/* Виджет погоды */}
          {/* Улучшенный виджет погоды */}
          <div 
            onClick={() => {
              const conditions: ("sunny" | "snowy" | "cloudy")[] = ["sunny", "snowy", "cloudy"];
              const currentIndex = conditions.indexOf(weatherCondition);
              setWeatherCondition(conditions[(currentIndex + 1) % conditions.length]);
            }}
            className="absolute top-3 right-3 sm:top-5 sm:right-6 z-20 flex items-center gap-2 px-3 py-2 rounded-2xl border border-dark-border/60 bg-dark-bg/60 backdrop-blur-md hover:border-gold/50 hover:bg-dark-card/80 transition-all duration-500 cursor-pointer select-none group shadow-xl"
          >
            <div className="relative w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center">
              {weatherCondition === 'sunny' && (
                <motion.div initial={{ rotate: 0 }} animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }}>
                  <Sun className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]" />
                </motion.div>
              )}
              {weatherCondition === 'snowy' && (
                <motion.div initial={{ y: -2, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
                  <Snowflake className="w-5 h-5 sm:w-6 sm:h-6 text-blue-200 drop-shadow-[0_0_8px_rgba(191,219,254,0.6)]" />
                </motion.div>
              )}
              {weatherCondition === 'cloudy' && (
                <motion.div initial={{ x: -2, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
                  <span className="text-lg sm:text-xl">☁️</span>
                </motion.div>
              )}
            </div>
            <div className="flex flex-col items-start leading-tight">
              <span className="text-[10px] sm:text-xs text-white font-bold tracking-tight">
                {weatherCondition === 'sunny' ? '+38°C' : weatherCondition === 'snowy' ? '-1°C' : '+24°C'}
              </span>
              <span className="text-[7px] sm:text-[8px] text-gray-400 font-sans tracking-widest uppercase font-bold group-hover:text-gold transition-colors">
                {lang === 'ru' ? 'АШХАБАД' : 'AŞGABAT'}
              </span>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center text-center">
            
            {/* Роскошный Логотип "LEVEL UP" со стрелкой и плавающими значками по бокам (ИЗ КАРТИНКИ) */}
            <div className="relative w-full max-w-xl mx-auto">
              {/* Левый плавающий значок */}
              <motion.div 
                animate={{ y: [0, -10, 0], x: [0, 5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute left-0 top-1/2 -translate-y-1/2 hidden md:flex flex-col items-center gap-1 opacity-60"
              >
                <div className="w-10 h-10 rounded-full border border-gold/20 bg-gold/5 flex items-center justify-center text-gold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <span className="text-[8px] text-gray-500 uppercase tracking-widest font-bold">Safe</span>
              </motion.div>

              {/* Правый плавающий значок */}
              <motion.div 
                animate={{ y: [0, 10, 0], x: [0, -5, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute right-0 top-1/2 -translate-y-1/2 hidden md:flex flex-col items-center gap-1 opacity-60"
              >
                <div className="w-10 h-10 rounded-full border border-gold/20 bg-gold/5 flex items-center justify-center text-gold">
                  <Award className="w-5 h-5" />
                </div>
                <span className="text-[8px] text-gray-500 uppercase tracking-widest font-bold">Best</span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="mb-2 flex flex-col items-center"
              >
              {/* Трёхступенчатая стрелочка LLU как на логотипе */}
              <svg 
                className="w-12 h-12 text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.25)] hover:scale-105 transition-transform duration-500 mb-1" 
                viewBox="0 0 100 100" 
                fill="currentColor"
              >
                {/* Первая L */}
                <path d="M10,80 L25,80 L25,65 L10,65 Z" />
                {/* Вторая L */}
                <path d="M30,80 L45,80 L45,50 L30,50 Z" />
                {/* Третья U со стрелкой вверх */}
                <path d="M50,80 L65,80 L65,35 L50,35 Z" />
                {/* Наконечник стрелки вверх */}
                <path d="M65,35 L80,35 L57.5,10 L35,35 L50,35 Z" />
              </svg>
              
              {/* Текст Логотипа */}
              <h1 className="text-xl sm:text-3xl md:text-4xl font-extrabold tracking-[0.2em] text-white">
                LEVEL <span className="text-gold font-black drop-shadow-[0_0_12px_rgba(197,168,92,0.4)]">UP</span>
              </h1>

              {/* Изысканный лозунг (ИЗ КАРТИНКИ) */}
              <p className="text-[10px] sm:text-xs md:text-sm font-sans text-gray-300 font-medium tracking-[0.05em] mt-1 max-w-xl italic">
                {t('motto', 'hero')}
              </p>
            </motion.div>
          </div>

            <div className="max-w-2xl space-y-2.5 mt-0.5">
              {/* Тэглайн */}
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gold/10 border border-gold/25 text-gold text-[8px] tracking-widest uppercase font-sans font-bold"
              >
                <Sparkles className="w-2.5 h-2.5" />
                <span>
                  {activeCategory === 'all' && t('tagline_all', 'hero')}
                  {activeCategory === 'auto' && t('tagline_auto', 'hero')}
                  {activeCategory === 'clothing' && t('tagline_clothing', 'hero')}
                  {activeCategory === 'home' && t('tagline_home', 'hero')}
                </span>
              </motion.div>

              {/* Краткое описание раздела */}
              <AnimatePresence mode="wait">
                <motion.p
                  key={activeCategory}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="text-gray-400 font-sans font-light text-[10px] sm:text-xs leading-relaxed max-w-xl mx-auto"
                >
                  {activeCategory === 'all' && t('desc_all', 'hero')}
                  {activeCategory === 'auto' && t('desc_auto', 'hero')}
                  {activeCategory === 'clothing' && t('desc_clothing', 'hero')}
                  {activeCategory === 'accessories' && (lang === 'ru' ? 'Стильные часы и элитные аксессуары с быстрой доставкой из Китая. Подчеркните свой образ.' : 'Hytaýdan çalt eltip bermek bilen stiliňizi we ajaýyp aksesuarlaryňyzy nygtaň. Özüňizi bezeň.')}
                  {activeCategory === 'home' && t('desc_home', 'hero')}
                </motion.p>
              </AnimatePresence>

              {/* Фотопрезентация Доставки из Китая */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 w-full max-w-2xl mx-auto text-left">
                
                {/* Карта: Авиадоставка */}
                <div className="group relative h-28 rounded-2xl overflow-hidden border border-dark-border/60 bg-dark-card shadow-lg flex flex-col justify-end p-3.5">
                  {/* Фоновое фото самолета */}
                  <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105" 
                    style={{ backgroundImage: "url('/src/assets/images/turkmenistan_plane_1784008872167.jpg')" }} 
                  />
                  {/* Тонкий затемняющий градиент */}
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-dark-bg/40 to-transparent" />
                  
                  {/* Метка Авиадоставка */}
                  <div className="absolute top-2.5 right-2.5 bg-emerald-600/90 border border-emerald-400/30 text-white font-sans text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded">
                    {lang === 'ru' ? 'АВИАДОСТАВКА' : 'AWIA ELTIP BERMEK'}
                  </div>

                  <div className="relative z-10 space-y-0.5">
                    <h4 className="text-[11px] font-serif text-white uppercase tracking-wider font-bold">{t('air_shipping', 'hero')}</h4>
                    <p className="text-[9px] text-gray-300 font-sans font-light leading-snug">{t('air_desc', 'hero')}</p>
                  </div>
                </div>

                {/* Карта: Сухопутная автодоставка */}
                <div className="group relative h-28 rounded-2xl overflow-hidden border border-dark-border/60 bg-dark-card shadow-lg flex flex-col justify-end p-3.5">
                  {/* Фоновое фото современных грузовиков */}
                  <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105" 
                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=800&q=80')" }} 
                  />
                  {/* Тонкий затемняющий градиент */}
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-dark-bg/40 to-transparent" />
                  
                  {/* Метка Fast Truck Cargo */}
                  <div className="absolute top-2.5 right-2.5 bg-gold/90 border border-yellow-400/30 text-dark-bg font-sans text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded">
                    {lang === 'ru' ? 'АВТОДОСТАВКА' : 'ULAG ELTIP BERMEK'}
                  </div>

                  <div className="relative z-10 space-y-0.5">
                    <h4 className="text-[11px] font-serif text-white uppercase tracking-wider font-bold">{t('road_shipping', 'hero')}</h4>
                    <p className="text-[9px] text-gray-300 font-sans font-light leading-snug">{t('road_desc', 'hero')}</p>
                  </div>
                </div>

              </div>

              {/* Компактная подсказка листать вниз */}
              <div className="pt-4 flex flex-col items-center gap-1">
                <button
                  onClick={() => {
                    const el = document.getElementById('site-main-content');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-gray-400 hover:text-gold transition-colors duration-300 text-[9px] uppercase tracking-widest flex items-center gap-1 font-sans font-bold cursor-pointer bg-dark-card/40 border border-dark-border/40 px-3.5 py-1 rounded-full shadow-md"
                >
                  <span>{t('go_to_sections', 'hero')}</span>
                  <ArrowRight className="w-2.5 h-2.5" />
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Основной контент магазина */}
      <main id="site-main-content" className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6">
        
        {/* Заголовок текущей подкатегории */}
        {activeCategory !== 'tracking' && (
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-dark-border/40 pb-4">
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-wide">
                {activeCategory === 'all' && t('all_catalog', 'catalog')}
                {activeCategory === 'auto' && t('section_auto', 'catalog')}
                {activeCategory === 'home' && t('section_home', 'catalog')}
                {activeCategory === 'accessories' && (
                  activeSubcategory === 'men' ? (lang === 'ru' ? 'Мужские часы & аксессуары' : 'Erkek sagatlar we aksessuarlar') :
                  activeSubcategory === 'women' ? (lang === 'ru' ? 'Женские часы & аксессуары' : 'Aýal sagatlar we aksessuarlar') :
                  t('section_accessories', 'catalog')
                )}
                {activeCategory === 'clothing' && (
                  activeSubcategory === 'men' ? t('clothing_men', 'catalog') :
                  activeSubcategory === 'women' ? t('clothing_women', 'catalog') : t('clothing_all', 'catalog')
                )}
              </h2>
              <p className="text-[10px] text-gold/80 font-sans tracking-widest uppercase font-bold">
                {t('premium_selection', 'catalog')}
              </p>
            </div>
            
            {/* Быстрая навигация между подразделами внутри одежды */}
            {activeCategory === 'clothing' && (
              <div className="flex items-center gap-2 mt-4 sm:mt-0 bg-dark-card border border-dark-border rounded-full p-1 h-10 font-sans text-xs font-semibold">
                <button
                  onClick={() => handleSelectCategory('clothing')}
                  className={`px-4 h-full rounded-full transition-colors cursor-pointer ${
                    !activeSubcategory ? 'bg-gold text-dark-bg' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {lang === 'ru' ? 'Все' : 'Ählisi'}
                </button>
                <button
                  onClick={() => handleSelectCategory('clothing', 'men')}
                  className={`px-4 h-full rounded-full transition-colors cursor-pointer ${
                    activeSubcategory === 'men' ? 'bg-gold text-dark-bg' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {t('men', 'navbar')}
                </button>
                <button
                  onClick={() => handleSelectCategory('clothing', 'women')}
                  className={`px-4 h-full rounded-full transition-colors cursor-pointer ${
                    activeSubcategory === 'women' ? 'bg-gold text-dark-bg' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {t('women', 'navbar')}
                </button>
              </div>
            )}

            {/* Быстрая навигация между подразделами внутри часов и аксессуаров (ТРЕБОВАНИЕ ПОЛЬЗОВАТЕЛЯ) */}
            {activeCategory === 'accessories' && (
              <div className="flex items-center gap-2 mt-4 sm:mt-0 bg-dark-card border border-dark-border rounded-full p-1 h-10 font-sans text-xs font-semibold">
                <button
                  onClick={() => handleSelectCategory('accessories')}
                  className={`px-4 h-full rounded-full transition-colors cursor-pointer ${
                    !activeSubcategory ? 'bg-gold text-dark-bg' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {lang === 'ru' ? 'Все' : 'Ählisi'}
                </button>
                <button
                  onClick={() => handleSelectCategory('accessories', 'men')}
                  className={`px-4 h-full rounded-full transition-colors cursor-pointer ${
                    activeSubcategory === 'men' ? 'bg-gold text-dark-bg' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {t('men', 'navbar')}
                </button>
                <button
                  onClick={() => handleSelectCategory('accessories', 'women')}
                  className={`px-4 h-full rounded-full transition-colors cursor-pointer ${
                    activeSubcategory === 'women' ? 'bg-gold text-dark-bg' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {t('women', 'navbar')}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Контент с красивой плавной анимацией перехода страниц */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory + (activeSubcategory || '')}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {activeCategory === 'tracking' ? (
              <OrderTracking />
            ) : (
              <Catalog
                products={products}
                activeCategory={activeCategory as any}
                activeSubcategory={activeSubcategory}
                onProductClick={(product) => setSelectedProduct(product)}
                onSelectCategory={handleSelectCategory}
                favoriteIds={favoriteIds}
                onToggleFavorite={handleToggleFavorite}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Премиальные особенности бренда */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 border-t border-dark-border/40 font-sans">
          <div className="flex items-start gap-4 p-5 bg-dark-card/40 border border-dark-border/30 rounded-2xl">
            <div className="p-3 bg-gold/10 border border-gold/20 rounded-xl text-gold flex-shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">{t('feature1_title', 'features')}</h4>
              <p className="text-[11px] text-gray-400 leading-relaxed">{t('feature1_desc', 'features')}</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-5 bg-dark-card/40 border border-dark-border/30 rounded-2xl">
            <div className="p-3 bg-gold/10 border border-gold/20 rounded-xl text-gold flex-shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">{t('feature2_title', 'features')}</h4>
              <p className="text-[11px] text-gray-400 leading-relaxed">{t('feature2_desc', 'features')}</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-5 bg-dark-card/40 border border-dark-border/30 rounded-2xl">
            <div className="p-3 bg-gold/10 border border-gold/20 rounded-xl text-gold flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">{t('feature3_title', 'features')}</h4>
              <p className="text-[11px] text-gray-400 leading-relaxed">{t('feature3_desc', 'features')}</p>
            </div>
          </div>
        </section>

      </main>

      {/* Элегантный Футер */}
      <footer className="bg-dark-card border-t border-dark-border/80 mt-16 font-sans text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* Бренд */}
            <div className="space-y-3">
              <span className="text-lg font-bold tracking-[0.15em] text-white flex items-center gap-1.5">
                <svg className="w-5 h-5 text-gold" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M4,16 L8,16 L8,12 L12,12 L12,8 L16,8 L16,4 L20,4 L20,0 L24,0 L24,12 L20,12 L20,16 L16,16 L16,20 L12,20 L12,24 L4,24 Z" />
                </svg>
                <span>LEVEL <span className="text-gold font-extrabold tracking-[0.1em]">UP</span></span>
              </span>
              <p className="text-gray-400 leading-relaxed">
                {t('desc', 'footer')}
              </p>
            </div>

            {/* Разделы */}
            <div className="space-y-2">
              <h4 className="text-white uppercase tracking-wider font-bold text-xs">{t('sections', 'footer')}</h4>
              <ul className="space-y-1.5 text-gray-400">
                <li><button onClick={() => handleSelectCategory('all')} className="hover:text-gold transition-colors text-left cursor-pointer">{t('all_catalog', 'catalog')}</button></li>
                <li><button onClick={() => handleSelectCategory('auto')} className="hover:text-gold transition-colors text-left cursor-pointer">{t('section_auto', 'catalog')}</button></li>
                <li><button onClick={() => handleSelectCategory('clothing')} className="hover:text-gold transition-colors text-left cursor-pointer">{t('clothing_all', 'catalog')}</button></li>
                <li><button onClick={() => handleSelectCategory('home')} className="hover:text-gold transition-colors text-left cursor-pointer">{t('section_home', 'catalog')}</button></li>
              </ul>
            </div>

            {/* Контакты */}
            <div className="space-y-3">
              <h4 className="text-white uppercase tracking-wider font-bold text-xs">{lang === 'ru' ? 'Связаться с нами' : 'Habarlaşmak'}</h4>
              <ul className="space-y-3 text-gray-400">
                {/* Телефон */}
                <li>
                  <a href="tel:+99364300186" className="flex items-start gap-2.5 hover:text-gold transition-colors group">
                    <Phone className="w-4 h-4 text-gold shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-gray-500 font-bold">{lang === 'ru' ? 'Позвонить' : 'Jaň etmek'}</p>
                      <p className="text-white font-mono font-bold text-xs group-hover:text-gold transition-colors">+993 64 30-01-86</p>
                    </div>
                  </a>
                </li>
                
                {/* IMO */}
                <li className="flex items-start gap-2.5">
                  <div className="w-4 h-4 rounded bg-blue-500 text-white flex items-center justify-center text-[8px] font-extrabold tracking-tighter shrink-0 mt-0.5 shadow-sm select-none">imo</div>
                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-gray-500 font-bold">IMO</p>
                    <p className="text-white font-mono font-bold text-xs">+993 64 30-01-86</p>
                  </div>
                </li>

                {/* Instagram */}
                <li>
                  <a href="https://instagram.com/level_upp.tm" target="_blank" rel="noopener noreferrer" className="flex items-start gap-2.5 hover:text-gold transition-colors group">
                    <Instagram className="w-4 h-4 text-gold shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-gray-500 font-bold">Instagram</p>
                      <p className="text-white font-bold text-xs group-hover:text-gold transition-colors">@level_upp.tm</p>
                    </div>
                  </a>
                </li>

                {/* Адрес офиса */}
                <li className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-gray-500 font-bold">{lang === 'ru' ? 'Адрес офиса' : 'Ofis salgysy'}</p>
                    <p className="text-gray-300 leading-normal text-[11px]">
                      {lang === 'ru' ? 'г. Ашхабад, Мир 7/5 (по Сурикова), д. 54' : 'Aşgabat ş., Mir 7/5 (Surikowa köç.), jaý 54'}
                    </p>
                  </div>
                </li>

                {/* Режим работы */}
                <li className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-gray-500 font-bold">{lang === 'ru' ? 'Режим работы' : 'Iş wagty'}</p>
                    <p className="text-gray-300 text-[11px] leading-tight">
                      {lang === 'ru' ? 'Заказы: 7/24' : 'Sargytlar: 7/24'}<br />
                      {lang === 'ru' ? 'Офис: 09:00 - 21:00' : 'Ofis: 09:00 - 21:00'}
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Доставка и Оплата */}
            <div className="space-y-2">
              <h4 className="text-white uppercase tracking-wider font-bold text-xs">{t('payment_info', 'footer')}</h4>
              <p className="text-gray-400 leading-relaxed">
                {t('payment_desc', 'footer')}
              </p>
            </div>

          </div>

          <div className="border-t border-dark-border/40 mt-10 pt-5 flex flex-col sm:flex-row justify-between items-center text-gray-500 gap-4">
            <p>© {new Date().getFullYear()} LEVEL UP. {t('rights', 'footer')}</p>
            <div className="flex gap-4 text-[10px]">
              <a href="#" className="hover:text-gold transition-colors">{t('privacy', 'footer')}</a>
              <a href="#" className="hover:text-gold transition-colors">{t('terms', 'footer')}</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Компонент Корзины (выдвижной ящик) */}
      <Cart
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={handleCheckout}
        favoriteIds={favoriteIds}
        onToggleFavorite={handleToggleFavorite}
        products={products}
        onProductClick={(product) => {
          setCartOpen(false);
          setSelectedProduct(product);
        }}
      />

      {/* Модальное окно деталей товара (карусель, вес, калькулятор доставки) */}
      <ProductDetailsModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
      />

      {/* Админ-панель */}
      <AdminPanel
        isOpen={adminOpen}
        onClose={() => setAdminOpen(false)}
        onRefreshCatalog={handleRefreshCatalog}
      />

    </div>
  );
}
