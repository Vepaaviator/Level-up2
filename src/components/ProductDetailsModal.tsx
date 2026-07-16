import React, { useState, useEffect } from 'react';
import { Product, ProductOption, Review } from '../types';
import { X, ChevronLeft, ChevronRight, Plane, Truck, ShoppingBag, Check, Star, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../utils/languageContext';

interface ProductDetailsModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (
    product: Product,
    size?: string,
    option?: ProductOption,
    shipping?: 'air' | 'truck',
    shippingCost?: number
  ) => void;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  product,
  onClose,
  onAddToCart
}) => {
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined);
  const [selectedOption, setSelectedOption] = useState<ProductOption | undefined>(undefined);
  const [selectedShipping, setSelectedShipping] = useState<'air' | 'truck'>('air');
  const [showError, setShowError] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const { t, lang } = useLanguage();

  // Состояния для отзывов
  const [activeTab, setActiveTab] = useState<'order' | 'reviews'>('order');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReviewName, setNewReviewName] = useState('');
  const [newReviewComment, setNewReviewComment] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    if (product) {
      setActiveImgIndex(0);
      setSelectedOption(product.customOptions && product.customOptions.length > 0 ? product.customOptions[0] : undefined);
      setSelectedSize(undefined);
      setSelectedShipping('air');
      setAddedToCart(false);
      setShowError(false);
      setActiveTab('order');
      setReviewSuccess(false);
      setReviewError('');
      setNewReviewName('');
      setNewReviewComment('');
      setNewReviewRating(5);

      // Загрузка отзывов из localStorage
      const stored = localStorage.getItem(`levelup_reviews_${product.id}`);
      if (stored) {
        try {
          setReviews(JSON.parse(stored));
        } catch {
          setReviews([]);
        }
      } else {
        // Начальные отзывы для красивого отображения (seeding)
        const initialReviews: Review[] = [
          {
            id: `rev-init-1-${product.id}`,
            productId: product.id,
            userName: lang === 'ru' ? 'Аман' : 'Aman',
            rating: 5,
            comment: lang === 'ru' ? 'Очень качественный товар, полностью оправдал ожидания! Доставили вовремя.' : 'Örän ýokary hilli haryt, garaşyşymdan hem gowy çykdy! Wagtynda eltip berdiler.',
            createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000
          },
          {
            id: `rev-init-2-${product.id}`,
            productId: product.id,
            userName: lang === 'ru' ? 'Дженнет' : 'Jennet',
            rating: 4,
            comment: lang === 'ru' ? 'Рекомендую к покупке. Качество премиальное.' : 'Satyn almagy maslahat berýärin. Hili hakykatdan hem premial.',
            createdAt: Date.now() - 10 * 24 * 60 * 60 * 1000
          }
        ];
        localStorage.setItem(`levelup_reviews_${product.id}`, JSON.stringify(initialReviews));
        setReviews(initialReviews);
      }
    }
  }, [product, lang]);

  if (!product) return null;

  const imagesList = product.images && product.images.length > 0 
    ? product.images 
    : [product.image];

  const handlePrevImage = () => {
    setActiveImgIndex((prev) => (prev === 0 ? imagesList.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setActiveImgIndex((prev) => (prev === imagesList.length - 1 ? 0 : prev + 1));
  };

  const basePrice = product.price + (selectedOption ? selectedOption.priceModifier : 0);
  const totalPriceWithShipping = basePrice; // Доставка оплачивается при получении по весу

  const discountPercent = product.oldPrice 
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) 
    : 0;

  const handleAdd = () => {
    if (product.category === 'clothing' && product.sizes && product.sizes.length > 0 && !selectedSize) {
      setActiveTab('order'); // Если вкладка отзывов активна, переключаем на заказ
      setShowError(true);
      return;
    }

    onAddToCart(product, selectedSize, selectedOption, selectedShipping, 0);
    setAddedToCart(true);
    setTimeout(() => {
      setAddedToCart(false);
      onClose(); // Автоматически закрываем модалку после выбора и добавления!
    }, 600);
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewComment.trim() || newReviewRating < 1) {
      setReviewError(lang === 'ru' ? 'Пожалуйста, введите текст отзыва!' : 'Haýyş, seslenmeňizi ýazyň!');
      return;
    }

    const defaultName = lang === 'ru' ? 'Покупатель' : 'Müşderi';
    const finalName = newReviewName.trim() || defaultName;

    const newReview: Review = {
      id: `rev-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      productId: product.id,
      userName: finalName,
      rating: newReviewRating,
      comment: newReviewComment,
      createdAt: Date.now()
    };

    const updated = [newReview, ...reviews];
    setReviews(updated);
    localStorage.setItem(`levelup_reviews_${product.id}`, JSON.stringify(updated));

    setNewReviewName('');
    setNewReviewComment('');
    setNewReviewRating(5);
    setReviewError('');
    setReviewSuccess(true);
    setTimeout(() => setReviewSuccess(false), 3000);
  };

  // Расчет среднего рейтинга
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '5.0';

  const translatedTitle = t(product.title, 'products');
  const translatedDesc = t(product.description, 'products');

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        {/* Темный оверлей */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black backdrop-blur-md"
        />

        {/* Контейнер модалки */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          className="bg-dark-card border border-dark-border w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh] md:max-h-[85vh] z-10"
        >
          {/* Кнопка закрытия */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 text-gray-400 hover:text-gold transition-colors p-2 bg-dark-bg/80 hover:bg-dark-bg border border-dark-border rounded-full"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Внутренний скроллинг всей информации */}
          <div className="overflow-y-auto p-6 sm:p-8 space-y-6 flex-grow">
            
            {/* Сетка: Десктоп - 2 колонки, Мобильный - 1 колонка. Правая колонка идет первой в HTML, чтобы на мобильных быть сверху! */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-start">
              
              {/* ПРАВАЯ КОЛОНКА (На мобильных рендерится первой благодаря DOM порядку) */}
              <div className="space-y-5 md:order-2">
                {/* 1. Категория и Рейтинг */}
                <div className="flex items-center justify-between gap-4 pt-2">
                  <span className="text-[10px] text-gold font-bold font-sans uppercase tracking-[0.25em] bg-gold/10 border border-gold/15 rounded px-2.5 py-1">
                    {product.category === 'auto' 
                      ? t('category_auto', 'productDetails') 
                      : product.category === 'home' 
                        ? t('category_home', 'productDetails') 
                        : product.gender === 'men' 
                          ? t('category_clothing_men', 'productDetails') 
                          : t('category_clothing_women', 'productDetails')
                    }
                  </span>

                  {/* Средний рейтинг */}
                  <div className="flex items-center gap-1.5 bg-dark-bg/60 border border-dark-border/60 px-2.5 py-1 rounded-full shadow-xs mr-8">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-bold font-mono text-gray-200">{avgRating}</span>
                    <span className="text-[10px] text-gray-500">({reviews.length})</span>
                  </div>
                </div>

                {/* 2. Название */}
                <h2 className="text-xl sm:text-2xl font-serif text-white tracking-wide leading-tight">
                  {translatedTitle}
                </h2>

                {/* ИНТЕГРИРОВАННЫЙ РАЗДЕЛ ВЫБОРА ПАРАМЕТРОВ И ПОКУПКИ */}
                <div className="bg-dark-bg/30 border border-dark-border/30 rounded-2xl p-4 sm:p-5 space-y-5 shadow-inner">
                  <span className="text-[10px] text-gold/90 font-sans font-bold uppercase tracking-wider block border-b border-dark-border/20 pb-2">
                    {lang === 'ru' ? 'Выбор параметров товара' : 'Haryt görnüşlerini saýlamak'}
                  </span>

                  {/* Выбор размера для одежды */}
                  {product.category === 'clothing' && product.sizes && product.sizes.length > 0 && product.inStock && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold font-sans">{t('choose_size', 'productDetails')}</span>
                        {showError && (
                          <span className="text-red-400 text-[10px] font-sans font-medium animate-pulse">
                            {t('choose_size_error', 'productDetails')}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {product.sizes.map((size) => {
                          const isSelected = selectedSize === size;
                          return (
                            <button
                              key={size}
                              type="button"
                              onClick={() => {
                                setSelectedSize(size);
                                setShowError(false);
                              }}
                              className={`h-9 min-w-[2.25rem] px-2.5 flex items-center justify-center rounded-xl border text-xs font-sans font-semibold transition-all duration-300 cursor-pointer ${
                                isSelected
                                  ? 'border-gold bg-gold text-dark-bg shadow-lg shadow-gold/25'
                                  : 'border-dark-border text-gray-300 hover:border-gold/50'
                              }`}
                            >
                              {size}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Выбор комплектации / опций */}
                  {product.customOptions && product.customOptions.length > 0 && product.inStock && (
                    <div className="space-y-2">
                      <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold font-sans block">{t('choose_option', 'productDetails')}</span>
                      <div className="flex flex-col gap-2">
                        {product.customOptions.map((option) => {
                          const isSelected = selectedOption?.name === option.name;
                          return (
                            <button
                              key={option.name}
                              type="button"
                              onClick={() => setSelectedOption(option)}
                              className={`w-full text-left p-3 rounded-2xl border text-xs font-sans transition-all duration-300 flex items-center justify-between cursor-pointer ${
                                isSelected
                                  ? 'border-gold bg-gold/10 text-gold'
                                  : 'border-dark-border text-gray-300 hover:border-gold/30'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${isSelected ? 'border-gold' : 'border-gray-500'}`}>
                                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-gold" />}
                                </div>
                                <span className="font-semibold">{option.name}</span>
                              </div>
                              <span className={`font-mono font-bold ${isSelected ? 'text-gold' : 'text-gray-400'}`}>
                                {option.priceModifier === 0 ? t('no_extra', 'productDetails') : `+${option.priceModifier.toLocaleString('ru-RU')} TMT`}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Способ доставки из Китая */}
                  {product.inStock && (
                    <div className="space-y-2">
                      <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold font-sans block">
                        {t('delivery_method', 'productDetails')}
                      </span>
                      <div className="grid grid-cols-2 gap-3">
                        {/* Авиадоставка */}
                        <button
                          type="button"
                          onClick={() => setSelectedShipping('air')}
                          className={`flex flex-col p-3 rounded-xl border text-left transition-all relative cursor-pointer ${
                            selectedShipping === 'air'
                              ? 'border-gold bg-gold/10 text-gold shadow-md shadow-gold/5'
                              : 'border-dark-border text-gray-400 hover:border-gold/30 hover:text-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Plane className="w-3.5 h-3.5 text-gold" />
                            <span className="text-xs font-bold font-sans uppercase tracking-wider">{t('air', 'productCard')}</span>
                          </div>
                          <span className="text-[10px] opacity-80 block font-sans">7-10 {t('days', 'productDetails')}</span>
                          <span className="text-xs font-bold mt-1 font-mono">150 TMT / кг</span>
                          <span className="text-[9px] mt-0.5 text-gray-500 block">{t('weight', 'productDetails')}</span>
                          {selectedShipping === 'air' && (
                            <div className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-gold" />
                          )}
                        </button>

                        {/* Автодоставка */}
                        <button
                          type="button"
                          onClick={() => setSelectedShipping('truck')}
                          className={`flex flex-col p-3 rounded-xl border text-left transition-all relative cursor-pointer ${
                            selectedShipping === 'truck'
                              ? 'border-gold bg-gold/10 text-gold shadow-md shadow-gold/5'
                              : 'border-dark-border text-gray-400 hover:border-gold/30 hover:text-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Truck className="w-3.5 h-3.5 text-gold" />
                            <span className="text-xs font-bold font-sans uppercase tracking-wider">{t('truck', 'productCard')}</span>
                          </div>
                          <span className="text-[10px] opacity-80 block font-sans">25-30 {t('days', 'productDetails')}</span>
                          <span className="text-xs font-bold mt-1 font-mono">50 TMT / кг</span>
                          <span className="text-[9px] mt-0.5 text-gray-500 block">{t('weight', 'productDetails')}</span>
                          {selectedShipping === 'truck' && (
                            <div className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-gold" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Блок цены и кнопки заказа */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-dark-bg/60 p-4 rounded-xl border border-dark-border/40 mt-3 shadow-inner">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-400 uppercase tracking-widest font-sans">{t('item_price', 'productDetails')}</span>
                      <div className="flex items-baseline gap-2 mt-0.5">
                        <span className="text-xl sm:text-2xl font-bold font-sans text-gold">
                          {totalPriceWithShipping.toLocaleString('ru-RU')} TMT
                        </span>
                        {product.oldPrice && (
                          <span className="text-xs text-gray-500 line-through font-sans">
                            {(product.oldPrice + (selectedOption ? selectedOption.priceModifier : 0)).toLocaleString('ru-RU')} TMT
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-gray-400 font-sans mt-1 leading-relaxed">
                        <span>{selectedShipping === 'air' ? t('weight_note_air', 'productDetails') : t('weight_note_truck', 'productDetails')}</span>
                      </div>
                    </div>

                    {product.inStock ? (
                      <button
                        onClick={handleAdd}
                        disabled={addedToCart}
                        className={`btn-gold px-6 py-2.5 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer ${
                          addedToCart ? 'bg-emerald-500 hover:bg-emerald-500 border-emerald-500 text-white' : ''
                        }`}
                      >
                        {addedToCart ? (
                          <>
                            <Check className="w-4 h-4" />
                            <span>{t('added', 'productDetails')}</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-4 h-4 text-dark-bg" />
                            <span>{t('add_to_cart', 'productDetails')}</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2 rounded-xl text-center text-xs font-sans uppercase tracking-widest font-semibold">
                        {t('sold_out', 'productDetails')}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ЛЕВАЯ КОЛОНКА (СНИЗУ НА МОБИЛЬНЫХ С ФОТО И ОПИСАНИЕМ) */}
              <div className="space-y-6 md:order-1">
                {/* 4. Альбом / Слайдер с картинками (Фото) */}
                <div className="space-y-3">
                  <div className="relative flex items-center justify-center overflow-hidden rounded-2xl bg-dark-bg border border-dark-border/40 h-[220px] sm:h-[300px]">
                    {/* Метка скидки */}
                    {product.oldPrice && product.inStock && (
                      <span className="absolute top-4 left-4 z-10 bg-gold text-dark-bg font-sans font-extrabold text-[9px] tracking-widest uppercase rounded-full px-2.5 py-1 shadow-md">
                        -{discountPercent}%
                      </span>
                    )}

                    <img
                      src={imagesList[activeImgIndex]}
                      alt={translatedTitle}
                      className="max-w-full max-h-full object-contain p-2"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://placehold.co/600x800/1d1d1b/c5a85c?text=${encodeURIComponent(translatedTitle)}`;
                      }}
                    />

                    {/* Стрелочки перелистывания (только если картинок > 1) */}
                    {imagesList.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={handlePrevImage}
                          className="absolute left-3 p-1.5 rounded-full bg-black/60 text-white hover:bg-gold hover:text-dark-bg transition-all cursor-pointer border border-white/10"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={handleNextImage}
                          className="absolute right-3 p-1.5 rounded-full bg-black/60 text-white hover:bg-gold hover:text-dark-bg transition-all cursor-pointer border border-white/10"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Эскизы / Превьюшки (только если картинок > 1) */}
                  {imagesList.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto py-1 justify-center max-w-full scrollbar-none">
                      {imagesList.map((img, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActiveImgIndex(idx)}
                          className={`w-10 h-14 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${
                            activeImgIndex === idx ? 'border-gold scale-105 shadow-md shadow-gold/10' : 'border-dark-border opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 5. Вкладки: Описание / Отзывы */}
                <div className="flex border-b border-dark-border/40 pb-px">
                  <button
                    type="button"
                    onClick={() => setActiveTab('order')}
                    className={`flex-1 pb-3 text-xs font-semibold font-sans uppercase tracking-wider border-b-2 text-center transition-all cursor-pointer ${
                      activeTab === 'order'
                        ? 'border-gold text-gold font-bold'
                        : 'border-transparent text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    {t('tab_order', 'reviews')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('reviews')}
                    className={`flex-1 pb-3 text-xs font-semibold font-sans uppercase tracking-wider border-b-2 text-center transition-all cursor-pointer ${
                      activeTab === 'reviews'
                        ? 'border-gold text-gold font-bold'
                        : 'border-transparent text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    {t('tab_reviews', 'reviews')} ({reviews.length})
                  </button>
                </div>

                {/* 6. Контент вкладок (Описание или Отзывы) */}
                {activeTab === 'order' ? (
                  /* ВКЛАДКА ЗАКАЗА / ОПИСАНИЯ */
                  <div className="space-y-4 animate-fadeIn">
                    <p className="text-gray-400 text-xs sm:text-sm font-sans font-light leading-relaxed">
                      {translatedDesc}
                    </p>
                  </div>
                ) : (
                  /* ВКЛАДКА ОТЗЫВОВ */
                  <div className="space-y-5 animate-fadeIn">
                    {/* Список */}
                    <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                      {reviews.length === 0 ? (
                        <p className="text-xs text-gray-500 font-sans italic py-6 text-center">{t('no_reviews', 'reviews')}</p>
                      ) : (
                        reviews.map((rev) => (
                          <div key={rev.id} className="bg-dark-bg/40 border border-dark-border/40 rounded-2xl p-3.5 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-gray-300 font-sans">{rev.userName}</span>
                              <span className="text-[10px] text-gray-500 font-mono">{new Date(rev.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex text-amber-400 gap-0.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star 
                                  key={star} 
                                  className={`w-3 h-3 ${star <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-600'}`} 
                                />
                              ))}
                            </div>
                            <p className="text-xs text-gray-400 font-sans font-light leading-relaxed">{rev.comment}</p>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Форма */}
                    <form onSubmit={handleSubmitReview} className="border-t border-dark-border/40 pt-4 space-y-3">
                      <span className="text-xs text-gold/95 font-sans font-bold uppercase tracking-widest block">
                        {t('add_review', 'reviews')}
                      </span>

                      <div className="space-y-2.5">
                        {/* Оценка звездами */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400 font-sans">{t('rating_label', 'reviews')}</span>
                          <div className="flex text-amber-400 gap-1.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setNewReviewRating(star)}
                                className="focus:outline-none hover:scale-110 transition-all cursor-pointer"
                              >
                                <Star 
                                  className={`w-4 h-4 transition-colors ${star <= newReviewRating ? 'fill-amber-400 text-amber-400' : 'text-gray-600'}`} 
                                />
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Имя */}
                        <input
                          type="text"
                          placeholder={`${t('your_name', 'reviews')} (${lang === 'ru' ? 'необязательно, по умолчанию: Покупатель' : 'hökmany däl, bellenen: Müşderi'})`}
                          value={newReviewName}
                          onChange={(e) => setNewReviewName(e.target.value)}
                          className="w-full bg-dark-input border border-dark-border rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-gold transition-colors"
                        />

                        {/* Текст отзыва */}
                        <textarea
                          placeholder={t('your_comment', 'reviews')}
                          value={newReviewComment}
                          onChange={(e) => setNewReviewComment(e.target.value)}
                          rows={3}
                          className="w-full bg-dark-input border border-dark-border rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-gold resize-none transition-colors"
                        />
                      </div>

                      {reviewError && (
                        <p className="text-red-400 text-[10px] font-sans font-medium animate-pulse">{reviewError}</p>
                      )}

                      {reviewSuccess && (
                        <p className="text-emerald-400 text-[10px] font-sans font-medium animate-bounce">{t('success_message', 'reviews')}</p>
                      )}

                      <button
                        type="submit"
                        className="w-full btn-gold py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest cursor-pointer transition-all active:scale-[0.98]"
                      >
                        {t('submit_review', 'reviews')}
                      </button>
                    </form>
                  </div>
                )}
              </div>

            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
