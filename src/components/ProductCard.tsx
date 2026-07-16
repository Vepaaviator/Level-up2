import React from 'react';
import { Product } from '../types';
import { Plane, Truck, ArrowUpRight, Heart } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../utils/languageContext';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: (e: React.MouseEvent) => void;
  isLightTheme?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onClick, 
  isFavorite = false, 
  onToggleFavorite,
  isLightTheme = false
}) => {
  const { t } = useLanguage();
  const discountPercent = product.oldPrice 
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) 
    : 0;

  // Функция для динамического перевода заголовков товаров
  const translatedTitle = t(product.title, 'products');

  return (
    <motion.div
      id={`product-card-${product.id}`}
      onClick={onClick}
      className={`rounded-2xl overflow-hidden flex flex-col h-full group relative transition-all duration-300 ${
        isLightTheme 
          ? 'bg-white border border-slate-200/80 shadow-sm hover:border-gold hover:shadow-xl shadow-[0_-2px_8px_-1px_rgba(0,0,0,0.05)]' 
          : 'bg-dark-card border border-dark-border hover:border-gold/30 hover:shadow-2xl hover:shadow-gold/15 shadow-[0_-4px_10px_-2px_rgba(0,0,0,0.2)]'
      } cursor-pointer`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
    >
      {/* Кнопка "Сердечко" (Избранное) */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite?.(e);
        }}
        className="absolute top-2.5 right-2.5 z-20 p-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors cursor-pointer group/heart shadow-md border border-dark-border/40"
        title={isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}
      >
        <Heart 
          className={`w-3.5 h-3.5 transition-all duration-300 active:scale-75 ${
            isFavorite 
              ? 'fill-red-500 text-red-500 scale-110 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]' 
              : 'text-gray-300 group-hover/heart:text-red-400 group-hover/heart:scale-110'
          }`} 
        />
      </button>

      {/* Метка скидки */}
      {product.oldPrice && product.inStock && (
        <span className="absolute top-2.5 left-2.5 z-10 bg-gold text-dark-bg font-sans font-extrabold text-[9px] tracking-wider uppercase rounded-full px-2 py-0.5 shadow-md">
          -{discountPercent}%
        </span>
      )}

      {/* Изображение товара (квадратное) */}
      <div className={`relative aspect-square overflow-hidden ${isLightTheme ? 'bg-slate-100' : 'bg-dark-card-lighter'}`}>
        <img
          src={product.image}
          alt={translatedTitle}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-102"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://placehold.co/300x300/1d1d1b/c5a85c?text=${encodeURIComponent(translatedTitle)}`;
          }}
        />
        
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
            <span className="border border-dashed border-gray-400 text-gray-300 font-sans tracking-widest text-xs uppercase px-2.5 py-1 rounded-md rotate-[-4deg]">
              {t('out_of_stock', 'productCard')}
            </span>
          </div>
        )}

        {/* Наложение при наведении */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-end p-3">
          <div className="w-8 h-8 rounded-full bg-gold/90 text-dark-bg flex items-center justify-center transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-lg">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Контент (компактный, лаконичный) */}
      <div className="p-3.5 flex flex-col flex-grow space-y-1.5">
        <span className="text-[11px] text-gold uppercase tracking-[0.15em] mb-0.5 font-bold font-sans">
          {product.category === 'auto' 
            ? t('category_auto', 'productCard') 
            : product.category === 'home' 
              ? t('category_home', 'productCard') 
              : product.gender === 'men' 
                ? t('category_men', 'productCard') 
                : t('category_women', 'productCard')
          }
        </span>

        <h3 className={`text-sm sm:text-base font-serif font-medium tracking-wide group-hover:text-gold transition-colors line-clamp-1 ${
          isLightTheme ? 'text-slate-800' : 'text-white'
        }`}>
          {translatedTitle}
        </h3>

        {/* Небольшой значок вариантов доставки из Китая */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] text-gray-500 font-sans uppercase font-medium">{t('delivery', 'productCard')}</span>
          <div className="flex items-center gap-1.5">
            <span className={`flex items-center gap-0.5 text-[11px] font-semibold font-sans border rounded px-1.5 py-0.5 ${
              isLightTheme 
                ? 'text-gold-dark bg-gold/5 border-gold/15' 
                : 'text-gold/90 bg-gold/10 border-gold/10'
            }`} title="Авиа 7-10 дней">
              <Plane className="w-3 h-3" />
              <span>{t('air', 'productCard')}</span>
            </span>
            <span className={`flex items-center gap-0.5 text-[11px] font-semibold font-sans border rounded px-1.5 py-0.5 ${
              isLightTheme 
                ? 'text-gold-dark bg-gold/5 border-gold/15' 
                : 'text-gold/90 bg-gold/10 border-gold/10'
            }`} title="Авто 25-30 дней">
              <Truck className="w-3 h-3" />
              <span>{t('truck', 'productCard')}</span>
            </span>
          </div>
        </div>

        {/* Цена внизу */}
        <div className={`flex items-baseline justify-between mt-auto pt-2.5 border-t ${
          isLightTheme ? 'border-slate-100' : 'border-dark-border/40'
        }`}>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-sm sm:text-base font-sans font-bold tracking-wide ${
              isLightTheme ? 'text-gold-dark' : 'text-gold'
            }`}>
              {product.price.toLocaleString('ru-RU')} TMT
            </span>
            {product.oldPrice && (
              <span className="text-[11px] text-gray-500 line-through font-sans">
                {product.oldPrice.toLocaleString('ru-RU')} TMT
              </span>
            )}
          </div>
          <span className={`text-xs font-sans font-semibold flex items-center gap-0.5 ${
            isLightTheme 
              ? 'text-slate-500 group-hover:text-gold-dark' 
              : 'text-gray-400 group-hover:text-gold'
          }`}>
            {t('order_button', 'productCard')}
          </span>
        </div>
      </div>
    </motion.div>
  );
};
