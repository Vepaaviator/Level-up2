import React, { useState, useMemo, useEffect } from 'react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';
import { Search, Check, Info, ArrowRight, ArrowLeft, Car, Shirt, Home, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../utils/languageContext';

interface CatalogProps {
  products: Product[];
  activeCategory: 'all' | 'auto' | 'clothing' | 'home' | 'accessories' | 'tracking';
  activeSubcategory?: 'men' | 'women';
  onProductClick: (product: Product) => void;
  onSelectCategory?: (category: 'all' | 'auto' | 'clothing' | 'home' | 'accessories' | 'tracking', subcategory?: 'men' | 'women') => void;
  favoriteIds?: string[];
  onToggleFavorite?: (productId: string) => void;
  isLightTheme?: boolean;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export const Catalog: React.FC<CatalogProps> = ({
  products,
  activeCategory,
  activeSubcategory,
  onProductClick,
  onSelectCategory,
  favoriteIds = [],
  onToggleFavorite,
  isLightTheme = false,
  searchQuery = '',
  onSearchChange
}) => {
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc'>('newest');
  const { t, lang } = useLanguage();
  const [autoSubcategory, setAutoSubcategory] = useState<string>('all');
  const [clothingSubcategory, setClothingSubcategory] = useState<string>('all');

  // Сброс подкатегории авто при смене категории
  useEffect(() => {
    setAutoSubcategory('all');
    setClothingSubcategory('all');
  }, [activeCategory, activeSubcategory]);

  // Фильтруем все продукты для текущего поиска / фильтра
  const allFilteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        // Фильтр по категории
        if (activeCategory !== 'all' && product.category !== activeCategory) {
          return false;
        }
        // Фильтр по полу (для одежды и аксессуаров) или подкатегории (если кликнули в левом меню)
        if ((activeCategory === 'clothing' || activeCategory === 'accessories') && activeSubcategory) {
          const isGenderFilter = ['women', 'men', 'unisex'].includes(activeSubcategory);
          if (isGenderFilter && product.gender !== activeSubcategory) {
            return false;
          }
          if (!isGenderFilter && product.subcategory !== activeSubcategory) {
            return false;
          }
        }
        // Фильтр по подкатегории (для автотоваров)
        if (activeCategory === 'auto' && autoSubcategory !== 'all' && product.subcategory !== autoSubcategory) {
          return false;
        }
        // Фильтр по подкатегории (для одежды и аксессуаров)
        if ((activeCategory === 'clothing' || activeCategory === 'accessories') && clothingSubcategory !== 'all' && product.subcategory !== clothingSubcategory) {
          return false;
        }
        // Фильтр только в наличии
        if (onlyInStock && !product.inStock) {
          return false;
        }
        // Фильтр по поисковому запросу
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          const translatedTitle = t(product.title, 'products').toLowerCase();
          const translatedDesc = t(product.description, 'products').toLowerCase();
          return (
            product.title.toLowerCase().includes(query) ||
            product.description.toLowerCase().includes(query) ||
            translatedTitle.includes(query) ||
            translatedDesc.includes(query) ||
            (product.subcategory && product.subcategory.toLowerCase().includes(query)) ||
            (product.subcategory && t(product.subcategory.toLowerCase(), 'subcategories').toLowerCase().includes(query))
          );
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        return b.createdAt - a.createdAt;
      });
  }, [products, activeCategory, activeSubcategory, autoSubcategory, clothingSubcategory, onlyInStock, searchQuery, sortBy, lang]);

  // Группировка продуктов по подкатегориям для раздельного отображения в виде отдельных страниц
  const groupedProducts = useMemo<Record<string, Product[]>>(() => {
    const groups: Record<string, Product[]> = {};
    
    allFilteredProducts.forEach((prod) => {
      const sub = prod.subcategory || 'другое';
      if (!groups[sub]) {
        groups[sub] = [];
      }
      groups[sub].push(prod);
    });

    return groups;
  }, [allFilteredProducts]);

  // Новинки для домашней страницы
  const homepageFeatured = useMemo(() => {
    return products
      .filter(p => p.inStock)
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 4);
  }, [products]);

  const handleResetFilters = () => {
    setOnlyInStock(false);
  };

  return (
    <motion.div 
      key={`${activeCategory}-${activeSubcategory || 'all'}-${searchQuery || ''}`}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      id="catalog-section" 
      className="space-y-10 py-2"
    >
      
      {/* 1. ЕСЛИ ЭТО ГЛАВНАЯ СТРАНИЦА ("all") - показываем изысканные входы в разделы */}
      {activeCategory === 'all' && !searchQuery && (
        <div className="space-y-12">
          
          {/* Блок изысканных разделов (ТРЕБОВАНИЕ ПОЛЬЗОВАТЕЛЯ: "каждая раздел откроется как отдельная страница") */}
          <div className="space-y-6">
            <div className="text-center space-y-1">
              <h3 className="text-lg sm:text-xl font-serif text-white tracking-widest uppercase">{t('select_section', 'catalog')}</h3>
              <p className="text-[10px] text-gold uppercase tracking-widest font-sans font-semibold">{t('personal_showcase', 'catalog')}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-6">
              {/* Карта раздела: Автомобильные товары */}
              <motion.div
                whileHover={{ y: -8 }}
                className="relative h-48 rounded-3xl overflow-hidden border border-dark-border/80 group flex flex-col justify-end p-6 bg-dark-card shadow-xl cursor-pointer"
                onClick={() => onSelectCategory?.('auto')}
              >
                <div className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=600&q=80')` }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-90" />
                <div className="relative z-10 space-y-3">
                  <div className="w-10 h-10 rounded-2xl bg-gold/15 border border-gold/30 flex items-center justify-center text-gold shadow-lg">
                    <Car className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xl font-serif text-white tracking-wide">{t('section_auto', 'catalog')}</h4>
                    <p className="text-[11px] text-gray-300 font-sans font-light mt-1">{t('section_auto_desc', 'catalog')}</p>
                  </div>
                  <button className="flex items-center gap-1 text-[10px] text-gold font-sans font-bold uppercase tracking-widest group-hover:text-white transition-colors cursor-pointer">
                    <span>{t('open_section', 'catalog')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>

              {/* Карта раздела: Женская одежда и обувь */}
              <motion.div
                whileHover={{ y: -8 }}
                className="relative h-48 rounded-3xl overflow-hidden border border-dark-border/80 group flex flex-col justify-end p-6 bg-dark-card shadow-xl cursor-pointer"
                onClick={() => onSelectCategory?.('clothing', 'women')}
              >
                <div className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?auto=format&fit=crop&w=600&q=80')` }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-90" />
                <div className="relative z-10 space-y-3">
                  <div className="w-10 h-10 rounded-2xl bg-gold/15 border border-gold/30 flex items-center justify-center text-gold shadow-lg">
                    <Shirt className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xl font-serif text-white tracking-wide">{t('section_clothing_women', 'catalog')}</h4>
                    <p className="text-[11px] text-gray-300 font-sans font-light mt-1">{t('section_clothing_women_desc', 'catalog')}</p>
                  </div>
                  <button className="flex items-center gap-1 text-[10px] text-gold font-sans font-bold uppercase tracking-widest group-hover:text-white transition-colors cursor-pointer">
                    <span>{t('open_section', 'catalog')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>

              {/* Карта раздела: Мужская одежда и обувь */}
              <motion.div
                whileHover={{ y: -8 }}
                className="relative h-48 rounded-3xl overflow-hidden border border-dark-border/80 group flex flex-col justify-end p-6 bg-dark-card shadow-xl cursor-pointer"
                onClick={() => onSelectCategory?.('clothing', 'men')}
              >
                <div className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=600&q=80')` }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-90" />
                <div className="relative z-10 space-y-3">
                  <div className="w-10 h-10 rounded-2xl bg-gold/15 border border-gold/30 flex items-center justify-center text-gold shadow-lg">
                    <Shirt className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xl font-serif text-white tracking-wide">{t('section_clothing_men', 'catalog')}</h4>
                    <p className="text-[11px] text-gray-300 font-sans font-light mt-1">{t('section_clothing_men_desc', 'catalog')}</p>
                  </div>
                  <button className="flex items-center gap-1 text-[10px] text-gold font-sans font-bold uppercase tracking-widest group-hover:text-white transition-colors cursor-pointer">
                    <span>{t('open_section', 'catalog')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>

              {/* Карта раздела: Часы и Аксессуары */}
              <motion.div
                whileHover={{ y: -8 }}
                className="relative h-48 rounded-3xl overflow-hidden border border-dark-border/80 group flex flex-col justify-end p-6 bg-dark-card shadow-xl cursor-pointer"
                onClick={() => onSelectCategory?.('accessories')}
              >
                <div className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=600&q=80')` }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-90" />
                <div className="relative z-10 space-y-3">
                  <div className="w-10 h-10 rounded-2xl bg-gold/15 border border-gold/30 flex items-center justify-center text-gold shadow-lg">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xl font-serif text-white tracking-wide">{lang === 'ru' ? 'Часы & Аксессуары' : 'Sagatlar & Aksesuarlar'}</h4>
                    <p className="text-[11px] text-gray-300 font-sans font-light mt-1">{lang === 'ru' ? 'Элитные модели часов и украшений.' : 'Elita sagat modelleri we bezegler.'}</p>
                  </div>
                  <button className="flex items-center gap-1 text-[10px] text-gold font-sans font-bold uppercase tracking-widest group-hover:text-white transition-colors cursor-pointer">
                    <span>{t('open_section', 'catalog')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>

              {/* Карта раздела: Дом и уют */}
              <motion.div
                whileHover={{ y: -8 }}
                className="relative h-48 rounded-3xl overflow-hidden border border-dark-border/80 group flex flex-col justify-end p-6 bg-dark-card shadow-xl cursor-pointer"
                onClick={() => onSelectCategory?.('home')}
              >
                <div className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80')` }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-90" />
                <div className="relative z-10 space-y-3">
                  <div className="w-10 h-10 rounded-2xl bg-gold/15 border border-gold/30 flex items-center justify-center text-gold shadow-lg">
                    <Home className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xl font-serif text-white tracking-wide">{t('section_home', 'catalog')}</h4>
                    <p className="text-[11px] text-gray-300 font-sans font-light mt-1">{t('section_home_desc', 'catalog')}</p>
                  </div>
                  <button className="flex items-center gap-1 text-[10px] text-gold font-sans font-bold uppercase tracking-widest group-hover:text-white transition-colors cursor-pointer">
                    <span>{t('open_section', 'catalog')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Витрина новинок на главной */}
          <div className="space-y-6 pt-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-dark-border/40 pb-3">
              <div className="space-y-1">
                <h3 className="text-xl font-serif text-white tracking-wide flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-gold" />
                  <span>{t('featured_new', 'catalog')}</span>
                </h3>
                <p className="text-[10px] text-gray-400 font-sans tracking-widest uppercase">{t('featured_desc', 'catalog')}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {homepageFeatured.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onClick={() => onProductClick(product)} 
                  isFavorite={favoriteIds.includes(product.id)}
                  onToggleFavorite={() => onToggleFavorite?.(product.id)}
                  isLightTheme={isLightTheme}
                />
              ))}
            </div>
          </div>

        </div>
      )}

      {/* 2. ЕСЛИ ВЫБРАН КОНКРЕТНЫЙ РАЗДЕЛ, ИЛИ ПОЛЬЗОВАТЕЛЬ ИЩЕТ ЧТО-ТО */}
      {((activeCategory !== 'all') || searchQuery) && (
        <div className="space-y-6">
          
          {/* Премиальная Кнопка Назад для удобной навигации клиента */}
          <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b ${
            isLightTheme ? 'border-slate-200' : 'border-dark-border/40'
          }`}>
            <button
              onClick={() => {
                onSelectCategory?.('all');
              }}
              className={`group inline-flex items-center gap-2 px-5 py-2.5 rounded-full border-2 text-xs font-sans font-bold uppercase tracking-wider transition-all duration-300 shadow-lg cursor-pointer active:scale-95 w-fit ${
                isLightTheme
                  ? 'bg-gold/10 hover:bg-gold/20 text-gold-dark border-gold/70 shadow-gold/5'
                  : 'bg-gold/15 hover:bg-gold/25 text-gold border-gold shadow-gold/10'
              }`}
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>{t('back_to_catalog', 'catalog')}</span>
            </button>
            
            <div className="flex flex-col text-left sm:text-right">
              <span className={`text-[9px] uppercase tracking-widest font-semibold block ${
                isLightTheme ? 'text-slate-400' : 'text-gray-500'
              }`}>{t('viewing_section', 'catalog')}</span>
              <span className={`text-sm font-serif tracking-wide uppercase font-bold ${
                isLightTheme ? 'text-slate-800' : 'text-white'
              }`}>
                {activeCategory === 'auto' && `🚘 ${t('section_auto', 'catalog')}`}
                {activeCategory === 'clothing' && `🧥 ${t('clothing_all', 'catalog')} ${activeSubcategory === 'men' ? `• ${t('men', 'navbar')}` : activeSubcategory === 'women' ? `• ${t('women', 'navbar')}` : ''}`}
                {activeCategory === 'home' && `🏺 ${t('section_home', 'catalog')}`}
                {searchQuery && `🔍 ${searchQuery}`}
              </span>
            </div>
          </div>

          {/* Быстрая навигация для Автотоваров по требованию пользователя */}
          {activeCategory === 'auto' && (
            <div className="space-y-2">
              <span className={`text-[10px] font-sans font-bold uppercase tracking-wider block ${
                isLightTheme ? 'text-slate-500' : 'text-gold'
              }`}>
                {lang === 'ru' ? 'Выберите категорию автотоваров:' : 'Awtoulag haryt toparyny saýlaň:'}
              </span>
              
              <div className="flex flex-wrap gap-1.5 rounded-xl font-sans text-[10px] font-semibold">
                <button
                  onClick={() => setAutoSubcategory('all')}
                  className={`px-3.5 py-2.5 rounded-xl transition-all duration-300 flex items-center gap-2 cursor-pointer border ${
                    autoSubcategory === 'all'
                      ? 'bg-gold text-dark-bg border-gold shadow-lg shadow-gold/20 font-bold scale-[1.02]'
                      : isLightTheme
                        ? 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                        : 'bg-dark-card/50 border-dark-border/60 text-gray-400 hover:text-white hover:bg-dark-card'
                  }`}
                >
                  <Car className="w-4 h-4 shrink-0" />
                  <span>{lang === 'ru' ? 'Все автотовары' : 'Ähli awtoharytlar'}</span>
                </button>
                <button
                  onClick={() => setAutoSubcategory('mats')}
                  className={`px-3.5 py-2.5 rounded-xl transition-all duration-300 flex items-center gap-2 cursor-pointer border ${
                    autoSubcategory === 'mats'
                      ? 'bg-gold text-dark-bg border-gold shadow-lg shadow-gold/20 font-bold scale-[1.02]'
                      : isLightTheme
                        ? 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                        : 'bg-dark-card/50 border-dark-border/60 text-gray-400 hover:text-white hover:bg-dark-card'
                  }`}
                >
                  <span className="text-sm shrink-0">🪵</span>
                  <span>{lang === 'ru' ? 'Коврики в салон и багажник' : 'Salon we bagaj kowrikler'}</span>
                </button>
                <button
                  onClick={() => setAutoSubcategory('car_cover')}
                  className={`px-3.5 py-2.5 rounded-xl transition-all duration-300 flex items-center gap-2 cursor-pointer border ${
                    autoSubcategory === 'car_cover'
                      ? 'bg-gold text-dark-bg border-gold shadow-lg shadow-gold/20 font-bold scale-[1.02]'
                      : isLightTheme
                        ? 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                        : 'bg-dark-card/50 border-dark-border/60 text-gray-400 hover:text-white hover:bg-dark-card'
                  }`}
                >
                  <span className="text-sm shrink-0">🛡️</span>
                  <span>{lang === 'ru' ? 'Чехол для машины' : 'Awtoulag çeholy'}</span>
                </button>
                <button
                  onClick={() => setAutoSubcategory('seat_cover')}
                  className={`px-3.5 py-2.5 rounded-xl transition-all duration-300 flex items-center gap-2 cursor-pointer border ${
                    autoSubcategory === 'seat_cover'
                      ? 'bg-gold text-dark-bg border-gold shadow-lg shadow-gold/20 font-bold scale-[1.02]'
                      : isLightTheme
                        ? 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                        : 'bg-dark-card/50 border-dark-border/60 text-gray-400 hover:text-white hover:bg-dark-card'
                  }`}
                >
                  <span className="text-sm shrink-0">💺</span>
                  <span>{lang === 'ru' ? 'Чехол для сидения' : 'Sidenýa çeholy'}</span>
                </button>
                <button
                  onClick={() => setAutoSubcategory('armrest_mats')}
                  className={`px-3.5 py-2.5 rounded-xl transition-all duration-300 flex items-center gap-2 cursor-pointer border ${
                    autoSubcategory === 'armrest_mats'
                      ? 'bg-gold text-dark-bg border-gold shadow-lg shadow-gold/20 font-bold scale-[1.02]'
                      : isLightTheme
                        ? 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                        : 'bg-dark-card/50 border-dark-border/60 text-gray-400 hover:text-white hover:bg-dark-card'
                  }`}
                >
                  <span className="text-sm shrink-0">📏</span>
                  <span>{lang === 'ru' ? 'Коврики для подлокотники' : 'Podlokotnik kowrikleri'}</span>
                </button>
                <button
                  onClick={() => setAutoSubcategory('lights_glass_body')}
                  className={`px-3.5 py-2.5 rounded-xl transition-all duration-300 flex items-center gap-2 cursor-pointer border ${
                    autoSubcategory === 'lights_glass_body'
                      ? 'bg-gold text-dark-bg border-gold shadow-lg shadow-gold/20 font-bold scale-[1.02]'
                      : isLightTheme
                        ? 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                        : 'bg-dark-card/50 border-dark-border/60 text-gray-400 hover:text-white hover:bg-dark-card'
                  }`}
                >
                  <span className="text-sm shrink-0">💡</span>
                  <span>{lang === 'ru' ? 'Стекла фара корпус' : 'Faran otdelni aynasy sona menzesh owadanla'}</span>
                </button>
                <button
                  onClick={() => setAutoSubcategory('others')}
                  className={`px-3.5 py-2.5 rounded-xl transition-all duration-300 flex items-center gap-2 cursor-pointer border ${
                    autoSubcategory === 'others'
                      ? 'bg-gold text-dark-bg border-gold shadow-lg shadow-gold/20 font-bold scale-[1.02]'
                      : isLightTheme
                        ? 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                        : 'bg-dark-card/50 border-dark-border/60 text-gray-400 hover:text-white hover:bg-dark-card'
                  }`}
                >
                  <span className="text-sm shrink-0">📦</span>
                  <span>{lang === 'ru' ? 'Другие (пока)' : 'Başgalar (häzirlikçe)'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Быстрая навигация для Одежды и Аксессуаров */}
          {(activeCategory === 'clothing' || activeCategory === 'accessories') && activeSubcategory && (
            <div className="space-y-2">
              <span className={`text-[10px] font-sans font-bold uppercase tracking-wider block ${
                isLightTheme ? 'text-slate-500' : 'text-gold'
              }`}>
                {lang === 'ru' ? 'Выберите тип товара:' : 'Haryt görnüşini saýlaň:'}
              </span>
              
              <div className="flex flex-wrap gap-1.5 rounded-xl font-sans text-[10px] font-semibold">
                <button
                  onClick={() => setClothingSubcategory('all')}
                  className={`px-3.5 py-2.5 rounded-xl transition-all duration-300 flex items-center gap-2 cursor-pointer border ${
                    clothingSubcategory === 'all'
                      ? 'bg-gold text-dark-bg border-gold shadow-lg shadow-gold/20 font-bold scale-[1.02]'
                      : isLightTheme
                        ? 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                        : 'bg-dark-card/50 border-dark-border/60 text-gray-400 hover:text-white hover:bg-dark-card'
                  }`}
                >
                  <span className="text-sm shrink-0">✨</span>
                  <span>{lang === 'ru' ? 'Все товары' : 'Ähli harytlar'}</span>
                </button>
                <button
                  onClick={() => setClothingSubcategory('обувь')}
                  className={`px-3.5 py-2.5 rounded-xl transition-all duration-300 flex items-center gap-2 cursor-pointer border ${
                    clothingSubcategory === 'обувь'
                      ? 'bg-gold text-dark-bg border-gold shadow-lg shadow-gold/20 font-bold scale-[1.02]'
                      : isLightTheme
                        ? 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                        : 'bg-dark-card/50 border-dark-border/60 text-gray-400 hover:text-white hover:bg-dark-card'
                  }`}
                >
                  <span className="text-sm shrink-0">👟</span>
                  <span>{lang === 'ru' ? 'Обувь' : 'Aýakgaplar'}</span>
                </button>
                <button
                  onClick={() => setClothingSubcategory('куртки')}
                  className={`px-3.5 py-2.5 rounded-xl transition-all duration-300 flex items-center gap-2 cursor-pointer border ${
                    clothingSubcategory === 'куртки'
                      ? 'bg-gold text-dark-bg border-gold shadow-lg shadow-gold/20 font-bold scale-[1.02]'
                      : isLightTheme
                        ? 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                        : 'bg-dark-card/50 border-dark-border/60 text-gray-400 hover:text-white hover:bg-dark-card'
                  }`}
                >
                  <span className="text-sm shrink-0">🧥</span>
                  <span>{lang === 'ru' ? 'Куртки' : 'Kurtkalar'}</span>
                </button>
                <button
                  onClick={() => setClothingSubcategory('футболки')}
                  className={`px-3.5 py-2.5 rounded-xl transition-all duration-300 flex items-center gap-2 cursor-pointer border ${
                    clothingSubcategory === 'футболки'
                      ? 'bg-gold text-dark-bg border-gold shadow-lg shadow-gold/20 font-bold scale-[1.02]'
                      : isLightTheme
                        ? 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                        : 'bg-dark-card/50 border-dark-border/60 text-gray-400 hover:text-white hover:bg-dark-card'
                  }`}
                >
                  <span className="text-sm shrink-0">👕</span>
                  <span>{lang === 'ru' ? 'Футболки' : 'Futbolkalar'}</span>
                </button>
                <button
                  onClick={() => setClothingSubcategory('платья')}
                  className={`px-3.5 py-2.5 rounded-xl transition-all duration-300 flex items-center gap-2 cursor-pointer border ${
                    clothingSubcategory === 'платья'
                      ? 'bg-gold text-dark-bg border-gold shadow-lg shadow-gold/20 font-bold scale-[1.02]'
                      : isLightTheme
                        ? 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                        : 'bg-dark-card/50 border-dark-border/60 text-gray-400 hover:text-white hover:bg-dark-card'
                  }`}
                >
                  <span className="text-sm shrink-0">👗</span>
                  <span>{lang === 'ru' ? 'Платья' : 'Köýnekler'}</span>
                </button>
                <button
                  onClick={() => setClothingSubcategory('аксессуары')}
                  className={`px-3.5 py-2.5 rounded-xl transition-all duration-300 flex items-center gap-2 cursor-pointer border ${
                    clothingSubcategory === 'аксессуары'
                      ? 'bg-gold text-dark-bg border-gold shadow-lg shadow-gold/20 font-bold scale-[1.02]'
                      : isLightTheme
                        ? 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                        : 'bg-dark-card/50 border-dark-border/60 text-gray-400 hover:text-white hover:bg-dark-card'
                  }`}
                >
                  <span className="text-sm shrink-0">⌚</span>
                  <span>{lang === 'ru' ? 'Аксессуары' : 'Aksessuarlar'}</span>
                </button>
              </div>
            </div>
          )}
          
          {/* 3. Результаты (Перемещено наверх по требованию: "сразу начинай показывать товары") */}
          <div className="pt-2">
            {allFilteredProducts.length === 0 ? (
              <div className="bg-dark-card border border-dark-border rounded-2xl py-16 px-6 text-center space-y-4">
                <Info className="w-12 h-12 text-gold/30 mx-auto" />
                <h3 className="text-xl font-serif text-white tracking-wide">{t('not_found', 'catalog')}</h3>
                <p className="text-gray-400 text-xs font-sans max-w-sm mx-auto">
                  {t('not_found_desc', 'catalog')}
                </p>
                <button
                  onClick={handleResetFilters}
                  className="btn-gold text-xs px-5 py-2 mt-2 animate-pulse"
                >
                  {t('reset_filters', 'catalog')}
                </button>
              </div>
            ) : searchQuery ? (
              /* Если активен поиск, выводим товары единой плоской сеткой */
              <div className="space-y-4">
                <div className="text-xs text-gray-400 font-sans mb-2">{t('search_results', 'catalog')} {allFilteredProducts.length}</div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                  {allFilteredProducts.map((product) => (
                    <ProductCard 
                      key={product.id} 
                      product={product} 
                      onClick={() => onProductClick(product)} 
                      isFavorite={favoriteIds.includes(product.id)}
                      onToggleFavorite={() => onToggleFavorite?.(product.id)}
                      isLightTheme={isLightTheme}
                    />
                  ))}
                </div>
              </div>
            ) : (
              /* Если это страница раздела, выводим все товары единой компактной сеткой */
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                {allFilteredProducts.map((product) => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    onClick={() => onProductClick(product)} 
                    isFavorite={favoriteIds.includes(product.id)}
                    onToggleFavorite={() => onToggleFavorite?.(product.id)}
                    isLightTheme={isLightTheme}
                  />
                ))}
              </div>
            )}
          </div>

          {/* 4. Панель Поиска и Сортировки (Перемещено под товары для удобства) */}
          <div className={`flex flex-col gap-2 md:flex-row md:items-center md:justify-between p-2 rounded-xl shadow-lg border opacity-80 hover:opacity-100 transition-opacity ${
            isLightTheme 
              ? 'bg-white border-slate-200 shadow-sm' 
              : 'bg-dark-card border-dark-border/80 shadow-md'
          }`}>
            {/* Поисковая строка */}
            <div className="relative flex-grow max-w-md">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                placeholder={t('search_placeholder', 'catalog')}
                className={`w-full border rounded-full pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:border-gold transition-colors font-sans ${
                  isLightTheme 
                    ? 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400' 
                    : 'bg-dark-input border-dark-border text-white placeholder-gray-500'
                }`}
              />
            </div>

            {/* Сортировка */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setOnlyInStock(!onlyInStock)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-sans font-medium transition-all duration-300 cursor-pointer ${
                  onlyInStock
                    ? 'border-gold bg-gold/10 text-gold shadow-md shadow-gold/5'
                    : isLightTheme 
                      ? 'border-slate-200 text-slate-600 hover:border-gold/50 hover:text-slate-800'
                      : 'border-dark-border text-gray-400 hover:border-gold/30 hover:text-gray-300'
                }`}
              >
                <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border transition-all ${
                  onlyInStock ? 'border-gold bg-gold text-dark-bg' : isLightTheme ? 'border-slate-300 bg-transparent' : 'border-gray-500 bg-transparent'
                }`}>
                  {onlyInStock && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                </div>
                <span>{t('only_in_stock', 'catalog')}</span>
              </button>

              <div className={`relative inline-flex items-center border rounded-full px-2 py-1.5 ${
                isLightTheme ? 'bg-slate-50 border-slate-200' : 'bg-dark-input border-dark-border'
              }`}>
                <span className="text-[9px] text-gray-500 uppercase tracking-wider font-semibold mr-1 font-sans">{t('sort_label', 'catalog')}</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className={`bg-transparent text-[10px] font-sans font-medium focus:outline-none cursor-pointer pr-0.5 ${
                    isLightTheme ? 'text-slate-700' : 'text-gray-200'
                  }`}
                >
                  <option value="newest" className={isLightTheme ? 'bg-white text-slate-800' : 'bg-dark-card text-white'}>{t('sort_newest', 'catalog')}</option>
                  <option value="price-asc" className={isLightTheme ? 'bg-white text-slate-800' : 'bg-dark-card text-white'}>{t('sort_price_asc', 'catalog')}</option>
                  <option value="price-desc" className={isLightTheme ? 'bg-white text-slate-800' : 'bg-dark-card text-white'}>{t('sort_price_desc', 'catalog')}</option>
                </select>
              </div>
            </div>
          </div>

        </div>
      )}

    </motion.div>
  );
};
