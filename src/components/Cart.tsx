import React, { useState, useEffect } from 'react';
import { CartItem, Order, ProductOption, Product } from '../types';
import { X, Trash2, Plus, Minus, Check, MapPin, Truck, Plane, ShoppingBag, Info, Heart, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { dbService } from '../utils/db';
import { useLanguage } from '../utils/languageContext';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number, size?: string, option?: ProductOption) => void;
  onRemoveItem: (productId: string, size?: string, option?: ProductOption) => void;
  onCheckout: (orderData: Omit<Order, 'id' | 'createdAt' | 'status'>) => Order;
  favoriteIds?: string[];
  onToggleFavorite?: (productId: string) => void;
  products?: Product[];
  onProductClick?: (product: Product) => void;
}

export const Cart: React.FC<CartProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  favoriteIds = [],
  onToggleFavorite,
  products = [],
  onProductClick
}) => {
  const [activeTab, setActiveTab] = useState<'cart' | 'favorites' | 'history'>('cart');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+993 64 ');
  const [address, setAddress] = useState('');
  const [shippingMethod, setShippingMethod] = useState('courier'); // 'courier' | 'regions'
  const [orderSuccess, setOrderSuccess] = useState<Order | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; phone?: string; address?: string }>({});
  const { t, lang } = useLanguage();

  const [usePrepayment, setUsePrepayment] = useState(true);
  const [prepaymentVal, setPrepaymentVal] = useState('');
  const [prepaymentMethod, setPrepaymentMethod] = useState<'courier' | 'office'>('office');
  const [prepaymentError, setPrepaymentError] = useState('');

  const checkoutFormRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && activeTab === 'cart' && cartItems.length > 0) {
      // Плавный скролл к форме оформления через небольшую задержку после открытия панели
      setTimeout(() => {
        checkoutFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 550);
    }
  }, [isOpen, activeTab, cartItems.length]);

  // Расчет суммы заказа с учетом выбранных опций товаров (без автоматического веса)
  const totalSum = cartItems.reduce((acc, item) => {
    const unitPrice = item.product.price + (item.selectedOption ? item.selectedOption.priceModifier : 0);
    return acc + unitPrice * item.quantity;
  }, 0);

  useEffect(() => {
    if (usePrepayment && totalSum > 0) {
      setPrepaymentVal(Math.ceil(totalSum * 0.2).toString());
    }
  }, [totalSum, usePrepayment]);

  const validateForm = () => {
    setPrepaymentError('');
    const tempErrors: typeof errors = {};
    if (!name.trim()) {
      tempErrors.name = t('validation_name', 'cart');
    }
    
    const digits = phone.replace(/[^0-9]/g, '');
    if (!phone.trim() || phone === '+993 ' || phone === '+993 64 ') {
      tempErrors.phone = t('validation_phone', 'cart');
    } else if (!phone.trim().startsWith('+993')) {
      tempErrors.phone = t('validation_phone_start', 'cart');
    } else if (digits.length < 11) { // 993 + 8 цифр
      tempErrors.phone = t('validation_phone_digits', 'cart');
    }

    if (!address.trim()) {
      tempErrors.address = t('validation_address', 'cart');
    }

    if (usePrepayment) {
      const pAmt = parseInt(prepaymentVal);
      const minPrepayment = Math.ceil(totalSum * 0.2);
      if (isNaN(pAmt)) {
        setPrepaymentError(lang === 'ru' ? 'Введите сумму аванса' : 'Awans mukdaryny ýazyň');
        setErrors(tempErrors);
        return false;
      } else if (pAmt < minPrepayment) {
        setPrepaymentError(lang === 'ru' ? `Минимальный аванс: ${minPrepayment} TMT` : `Iň pes awans: ${minPrepayment} TMT`);
        setErrors(tempErrors);
        return false;
      } else if (pAmt > totalSum) {
        setPrepaymentError(lang === 'ru' ? 'Аванс не может превышать сумму заказа' : 'Awans umumy bahadan uly bolup bilmez');
        setErrors(tempErrors);
        return false;
      }
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    setTimeout(() => {
      const orderItems = cartItems.map(item => {
        const itemPrice = item.product.price + (item.selectedOption ? item.selectedOption.priceModifier : 0);
        return {
          productId: item.product.id,
          productTitle: t(item.product.title, 'products') + 
            (item.selectedOption ? ` [${item.selectedOption.name}]` : '') + 
            ` (${item.selectedShipping === 'air' ? t('air', 'productCard') : t('truck', 'productCard')})`,
          price: itemPrice,
          selectedSize: item.selectedSize,
          selectedOption: item.selectedOption,
          selectedShipping: item.selectedShipping,
          shippingCost: item.shippingCost,
          quantity: item.quantity
        };
      });

      const shippingLabel = 
        shippingMethod === 'courier' ? t('method_courier', 'cart') : t('method_regions', 'cart');

      const pAmt = usePrepayment ? (parseInt(prepaymentVal) || Math.ceil(totalSum * 0.2)) : undefined;
      const pMethod = usePrepayment ? prepaymentMethod : undefined;
      const rBal = usePrepayment ? (totalSum - pAmt) : undefined;

      const order = onCheckout({
        customerName: name,
        customerPhone: phone.trim(),
        customerAddress: address,
        shippingMethod: shippingLabel,
        items: orderItems,
        totalPrice: totalSum,
        prepaymentAmount: pAmt,
        prepaymentMethod: pMethod,
        remainingBalance: rBal
      });

      setOrderSuccess(order);
      setIsSubmitting(false);

      // Очистка формы
      setName('');
      setPhone('+993 ');
      setAddress('');
      setShippingMethod('courier');
      setUsePrepayment(true);
      setPrepaymentVal('');
      setPrepaymentMethod('office');
    }, 1200);
  };

  const handleCloseSuccess = () => {
    setOrderSuccess(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Темный оверлей */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-50 backdrop-blur-xs"
          />

          {/* Панель корзины */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-dark-card border-l border-dark-border z-50 shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Хедер корзины */}
            <div className="p-5 border-b border-dark-border flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-gold" />
                  <h2 className="text-xl font-serif text-white tracking-wide">LEVEL UP</h2>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gold transition-colors p-1"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Переключатель вкладок внутри Корзины */}
              <div className="flex bg-dark-input border border-dark-border p-1 rounded-full h-10 font-sans text-xs font-semibold gap-1">
                <button
                  onClick={() => { setActiveTab('cart'); setOrderSuccess(null); }}
                  className={`flex-1 h-full rounded-full transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                    activeTab === 'cart' ? 'bg-gold text-dark-bg' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <span>{t('cart_tab', 'cart')} ({cartItems.reduce((acc, item) => acc + item.quantity, 0)})</span>
                </button>
                <button
                  onClick={() => { setActiveTab('favorites'); setOrderSuccess(null); }}
                  className={`flex-1 h-full rounded-full transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                    activeTab === 'favorites' ? 'bg-gold text-dark-bg' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <span>{t('favorites_tab', 'cart')} ({favoriteIds.length})</span>
                </button>
                <button
                  onClick={() => { setActiveTab('history'); setOrderSuccess(null); }}
                  className={`flex-1 h-full rounded-full transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                    activeTab === 'history' ? 'bg-gold text-dark-bg' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <span>{t('history_tab', 'cart')}</span>
                </button>
              </div>
            </div>

            {/* Основной контент */}
            <div className="flex-grow overflow-y-auto p-5 space-y-5">
              {activeTab === 'favorites' ? (
                /* Секция Избранного */
                <div className="space-y-4 py-1">
                  <div className="text-center space-y-1 py-1">
                    <h3 className="text-sm font-serif text-white uppercase tracking-wider">{t('favorites_tab', 'cart')}</h3>
                    <p className="text-[10px] text-gray-500 font-sans">
                      {lang === 'ru' 
                        ? 'Сохраненные товары для быстрого просмотра и заказа' 
                        : 'Görmek we sargyt etmek üçin halanan harytlar'
                      }
                    </p>
                  </div>

                  {favoriteIds.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center py-16 space-y-3">
                      <Heart className="w-12 h-12 text-dark-border stroke-[1.2]" />
                      <p className="text-xs font-serif text-gray-400 max-w-[200px]">
                        {t('favorites_empty', 'cart')}
                      </p>
                      <p className="text-[10px] text-gray-500 max-w-[220px]">
                        {t('favorites_empty_desc', 'cart')}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {products
                        .filter(p => favoriteIds.includes(p.id))
                        .map((product) => {
                          const translatedTitle = t(product.title, 'products');
                          return (
                            <motion.div
                              key={product.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="flex items-center gap-3 bg-dark-card-lighter border border-dark-border rounded-xl p-3 relative font-sans"
                            >
                              <img
                                src={product.image}
                                alt={translatedTitle}
                                className="w-14 h-18 object-cover rounded-lg bg-dark-card cursor-pointer"
                                onClick={() => onProductClick?.(product)}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = `https://placehold.co/100x130/1d1d1b/c5a85c?text=IMG`;
                                }}
                              />
                              <div className="flex-grow min-w-0 pr-6">
                                <h4 
                                  onClick={() => onProductClick?.(product)}
                                  className="text-xs font-semibold text-white truncate cursor-pointer hover:text-gold transition-colors"
                                >
                                  {translatedTitle}
                                </h4>
                                <p className="text-gold font-bold text-xs mt-1">
                                  {product.price.toLocaleString('ru-RU')} TMT
                                </p>
                                <button
                                  onClick={() => onProductClick?.(product)}
                                  className="mt-2 text-[10px] text-gold font-bold uppercase tracking-wider flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
                                >
                                  <span>{lang === 'ru' ? 'Выбрать и заказать' : 'Saýla we sargyt et'}</span>
                                </button>
                              </div>
                              
                              {/* Кнопка удаления из избранного */}
                              <button
                                type="button"
                                onClick={() => onToggleFavorite?.(product.id)}
                                className="absolute top-2 right-2 text-red-400 hover:text-red-500 transition-colors p-1 cursor-pointer"
                                title="Убрать из избранного"
                              >
                                <Heart className="w-3.5 h-3.5 fill-current" />
                              </button>
                            </motion.div>
                          );
                        })}
                    </div>
                  )}
                </div>
              ) : activeTab === 'history' ? (
                /* История заказов клиента */
                <div className="space-y-4 py-1">
                  <div className="text-center space-y-1 py-1">
                    <h3 className="text-sm font-serif text-white uppercase tracking-wider">{t('history_tab', 'cart')}</h3>
                    <p className="text-[10px] text-gray-500 font-sans">
                      {lang === 'ru' 
                        ? 'Статусы ваших отправлений из Китая в реальном времени' 
                        : 'Hytaýdan sargytlaryňyzyň hakyky wagtda statuslary'
                      }
                    </p>
                  </div>

                  {dbService.getOrders().length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center py-16 space-y-4">
                      <ShoppingBag className="w-12 h-12 text-dark-border stroke-[1.2] animate-pulse" />
                      <p className="text-xs font-serif text-gray-400 max-w-[200px]">
                        {lang === 'ru'
                          ? 'Вы еще не оформляли заказы в нашем магазине'
                          : 'Siz entek dükanymyzda sargyt etmediňiz'
                        }
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {dbService.getOrders().map((order) => {
                        const dateStr = new Date(order.createdAt).toLocaleString(lang === 'ru' ? 'ru-RU' : 'en-US', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        });

                        // Маппинг статусов на русский и туркменский языки
                        const statusMapping = {
                          'pending': { 
                            label: lang === 'ru' ? 'Ожидает оплаты' : 'Tölege garaşylýar', 
                            colorClass: 'bg-blue-500/15 text-blue-400 border-blue-500/30' 
                          },
                          'processing': { 
                            label: lang === 'ru' ? 'В обработке' : 'Taýýarlanylýar', 
                            colorClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30' 
                          },
                          'shipped': { 
                            label: lang === 'ru' ? 'В пути' : 'Ýolda', 
                            colorClass: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30' 
                          },
                          'completed': { 
                            label: lang === 'ru' ? 'Доставлен' : 'Gowşuryldy', 
                            colorClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' 
                          }
                        };

                        const currentStatus = statusMapping[order.status] || { 
                          label: order.status, 
                          colorClass: 'bg-gray-500/15 text-gray-400 border-gray-500/30' 
                        };

                        return (
                          <div key={order.id} className="bg-dark-card-lighter border border-dark-border rounded-2xl p-4 space-y-3 font-sans shadow-md">
                            <div className="flex items-center justify-between">
                              <span className="text-gold font-mono font-bold text-[10px] bg-gold/10 px-2 py-0.5 rounded-lg">
                                #{order.id.split('-')[1] || order.id}
                              </span>
                              <span className="text-[10px] text-gray-500 font-medium">
                                {dateStr}
                              </span>
                            </div>

                            <div className="space-y-1.5 text-xs border-b border-dark-border/40 pb-2">
                              {order.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between text-gray-300 gap-4">
                                  <span className="line-clamp-1 font-light text-[11px]">
                                    {item.productTitle} {item.selectedSize && `[${lang === 'ru' ? 'Размер' : 'Ölçeg'}: ${item.selectedSize}]`}
                                  </span>
                                  <span className="font-mono text-gray-400 text-[11px] flex-shrink-0">
                                    {item.quantity} {lang === 'ru' ? 'шт' : 'sany'}
                                  </span>
                                </div>
                              ))}
                            </div>

                            {order.prepaymentAmount !== undefined && (
                              <div className="text-[10px] bg-dark-bg/50 border border-dark-border/40 rounded-lg p-2 flex justify-between gap-2">
                                <span className="text-gray-400">
                                  {lang === 'ru' ? 'Аванс:' : 'Awans:'} <strong className="text-gold font-mono font-medium">{order.prepaymentAmount} TMT</strong>
                                </span>
                                <span className="text-gray-400 text-right">
                                  {lang === 'ru' ? 'Остаток:' : 'Galan:'} <strong className="text-emerald-400 font-mono font-medium">{order.remainingBalance} TMT</strong>
                                </span>
                              </div>
                            )}

                            <div className="flex items-center justify-between pt-1">
                              <div className="flex flex-col">
                                <span className="text-[9px] text-gray-500 uppercase tracking-widest font-semibold">
                                  {lang === 'ru' ? 'Статус:' : 'Status:'}
                                </span>
                                <span className={`inline-flex items-center px-2 py-0.5 mt-0.5 rounded-full text-[10px] font-semibold border ${currentStatus.colorClass}`}>
                                  {currentStatus.label}
                                </span>
                              </div>
                              <div className="text-right">
                                <span className="text-[9px] text-gray-500 uppercase tracking-widest font-semibold block">
                                  {lang === 'ru' ? 'Сумма:' : 'Jemi:'}
                                </span>
                                <span className="text-gold font-bold text-xs">
                                  {order.totalPrice.toLocaleString('ru-RU')} TMT
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : orderSuccess ? (
                /* Сообщение об успешном заказе */
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center text-center h-full py-6"
                >
                  <div className="w-14 h-14 rounded-full bg-gold/15 flex items-center justify-center text-gold mb-4 shadow-lg shadow-gold/10">
                    <Check className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-serif text-white tracking-wide mb-2">{t('order_success', 'cart')}</h3>
                  <div className="bg-gold/10 border border-gold/30 rounded-lg py-3 px-6 mb-4 inline-block">
                    <p className="text-gray-300 font-sans text-[10px] uppercase tracking-wider mb-1">
                      {lang === 'ru' ? 'Ваш трек-код для отслеживания:' : 'Yzarlaýyş koduňyz:'}
                    </p>
                    <p className="text-gold font-mono font-bold text-lg tracking-widest uppercase">
                      {orderSuccess.id}
                    </p>
                  </div>
                  <div className="bg-dark-card-lighter border border-dark-border rounded-xl p-4 w-full text-left space-y-2 mb-4 font-sans">
                    <p className="text-xs text-gray-400"><strong className="text-gray-300">{t('customer', 'cart')}</strong> {orderSuccess.customerName}</p>
                    <p className="text-xs text-gray-400"><strong className="text-gray-300">{t('phone', 'cart')}</strong> {orderSuccess.customerPhone}</p>
                    <p className="text-xs text-gray-400"><strong className="text-gray-300">{lang === 'ru' ? 'Способ доставки:' : 'Eltip berme görnüşi:'}</strong> {orderSuccess.shippingMethod}</p>
                    <p className="text-xs text-gray-400"><strong className="text-gray-300">{lang === 'ru' ? 'Адрес:' : 'Salgy:'}</strong> {orderSuccess.customerAddress}</p>
                    
                    {orderSuccess.prepaymentAmount !== undefined && (
                      <div className="border-t border-dark-border/40 pt-2 space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-400">{lang === 'ru' ? 'Аванс (предоплата):' : 'Awans tölegi:'}</span>
                          <span className="text-gold font-semibold font-mono">{orderSuccess.prepaymentAmount} TMT</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">{lang === 'ru' ? 'Передача аванса:' : 'Gowşurmak usuly:'}</span>
                          <span className="text-white">
                            {orderSuccess.prepaymentMethod === 'courier' 
                              ? (lang === 'ru' ? 'Вызов машины (курьер - БЕСПЛАТНО, без чека)' : 'Kuryer ugratmak (MUGT, çek berilmeýär)')
                              : (lang === 'ru' ? 'Лично приеду в офис' : 'Ofise özüm barjak')}
                          </span>
                        </div>
                        {orderSuccess.prepaymentMethod === 'office' && (
                          <div className="bg-gold/5 border border-gold/20 rounded-lg p-2 mt-1.5 text-[10px] text-gray-300 leading-normal font-light space-y-0.5">
                            <p className="font-medium text-gold">🏢 {lang === 'ru' ? 'Наш адрес и часы работы:' : 'Salgymyz we iş wagtymyz:'}</p>
                            <p>{lang === 'ru' ? 'г. Ашхабад, Мир 7/5 по Сурикова, дом 54' : 'Aşgabat ş., Mir 7/5 Surikowa köçesi, jaý 54'}</p>
                            <p>{lang === 'ru' ? 'Режим работы: 09:00 - 21:00 (Ежедневно)' : 'Iş wagty: 09:00 - 21:00 (Her gün)'}</p>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-400">{lang === 'ru' ? 'Остаток к оплате:' : 'Galan töleg:'}</span>
                          <span className="text-emerald-400 font-semibold font-mono">{orderSuccess.remainingBalance} TMT</span>
                        </div>
                      </div>
                    )}

                    <div className="border-t border-dark-border/60 pt-2 flex justify-between items-center">
                      <span className="text-xs text-gray-400 uppercase tracking-widest font-semibold">{t('total_payment', 'cart')}</span>
                      <span className="text-gold font-bold text-base font-sans">{orderSuccess.totalPrice.toLocaleString('ru-RU')} TMT</span>
                    </div>
                  </div>

                  {/* Приличные и красивые условия оплаты по требованию клиента */}
                  <div className="bg-gold/5 border border-gold/20 rounded-xl p-3.5 w-full text-left space-y-2 mb-6 font-sans">
                    <h4 className="text-[10px] text-gold uppercase tracking-wider font-extrabold flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5" /> {t('payment_types', 'cart')}
                    </h4>
                    <ul className="space-y-1 text-[10px] text-gray-300 leading-relaxed font-light">
                      <li>• <strong className="text-white font-medium">{t('on_delivery', 'cart')}</strong> {t('on_delivery_desc', 'cart')}</li>
                      <li>• <strong className="text-white font-medium">{t('prepayment', 'cart')}</strong> {t('prepayment_desc', 'cart')} <span className="text-gold font-bold font-mono">+993 64 30-01-86</span>.</li>
                    </ul>
                  </div>
                  <button onClick={handleCloseSuccess} className="btn-gold w-full text-xs py-3 rounded-xl cursor-pointer">
                    {t('continue_shopping', 'cart')}
                  </button>
                </motion.div>
              ) : cartItems.length === 0 ? (
                /* Пустая корзина */
                <div className="flex flex-col items-center justify-center text-center h-full py-12">
                  <ShoppingBag className="w-14 h-14 text-dark-border mb-4 stroke-[1.2]" />
                  <p className="text-base font-serif text-gray-300 mb-5">{t('empty', 'cart')}</p>
                  <button
                    onClick={onClose}
                    className="btn-gold text-xs px-5 py-2 cursor-pointer"
                  >
                    {lang === 'ru' ? 'Перейти в каталог' : 'Kataloga dolanmak'}
                  </button>
                </div>
              ) : (
                /* Список товаров в корзине */
                <div className="space-y-4">
                  <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                    {cartItems.map((item) => {
                      const baseItemPrice = item.product.price + (item.selectedOption ? item.selectedOption.priceModifier : 0);
                      const itemTotal = baseItemPrice * item.quantity;
                      
                      return (
                        <motion.div
                          key={`${item.product.id}-${item.selectedSize || 'nosize'}-${item.selectedOption?.name || 'nooption'}-${item.selectedShipping}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-3 bg-dark-card-lighter border border-dark-border rounded-xl p-3 relative"
                        >
                          <img
                            src={item.product.image}
                            alt={t(item.product.title, 'products')}
                            className="w-14 h-18 object-cover rounded-lg bg-dark-card"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://placehold.co/100x130/1d1d1b/c5a85c?text=IMG`;
                            }}
                          />
                          <div className="flex-grow min-w-0 pr-6">
                            <h4 className="text-xs font-sans font-semibold text-white truncate">{t(item.product.title, 'products')}</h4>
                            
                            <div className="flex flex-wrap gap-1 mt-1">
                              {item.selectedSize && (
                                <span className="inline-block bg-dark-border border border-dark-border/85 text-[9px] text-gray-300 font-sans px-1.5 py-0.5 rounded">
                                  {item.selectedSize}
                                </span>
                              )}
                              {item.selectedOption && (
                                <span className="inline-block bg-gold/10 border border-gold/15 text-[9px] text-gold font-sans px-1.5 py-0.5 rounded">
                                  {item.selectedOption.name}
                                </span>
                              )}
                              <span className="inline-block bg-gold/10 border border-gold/15 text-[9px] text-gold font-sans px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                {item.selectedShipping === 'air' ? <Plane className="w-2.5 h-2.5" /> : <Truck className="w-2.5 h-2.5" />}
                                <span>{item.selectedShipping === 'air' ? t('air', 'productCard') : t('truck', 'productCard')}</span>
                              </span>
                            </div>

                            <div className="flex items-center justify-between mt-2">
                              <span className="text-gold font-bold font-sans text-xs sm:text-sm">
                                {itemTotal.toLocaleString('ru-RU')} TMT
                              </span>
                              
                              {/* Кнопки количества */}
                              <div className="flex items-center border border-dark-border rounded-lg overflow-hidden h-6 bg-dark-card">
                                <button
                                  type="button"
                                  onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1, item.selectedSize, item.selectedOption)}
                                  className="px-1.5 text-gray-400 hover:text-gold transition-colors"
                                >
                                  <Minus className="w-2.5 h-2.5" />
                                </button>
                                <span className="px-1.5 text-[11px] font-sans text-white font-medium bg-dark-card">
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1, item.selectedSize, item.selectedOption)}
                                  className="px-1.5 text-gray-400 hover:text-gold transition-colors"
                                >
                                  <Plus className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                          
                          {/* Кнопка удаления */}
                          <button
                            type="button"
                            onClick={() => onRemoveItem(item.product.id, item.selectedSize, item.selectedOption)}
                            className="absolute top-2 right-2 text-gray-500 hover:text-red-400 transition-colors p-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Итог */}
                  <div className="border-t border-dark-border/85 pt-3.5 space-y-1.5">
                    <div className="flex justify-between items-center text-xs text-gray-400">
                      <span>{lang === 'ru' ? 'Товары в корзине:' : 'Sebet harytlary:'}</span>
                      <span className="text-white font-medium">{cartItems.reduce((acc, i) => acc + i.quantity, 0)} {lang === 'ru' ? 'шт' : 'sany'}</span>
                    </div>
                    <div className="flex justify-between items-center text-base font-bold">
                      <span className="text-gray-300 font-serif">{t('total_payment', 'cart')}</span>
                      <span className="text-gold font-sans text-lg">{totalSum.toLocaleString('ru-RU')} TMT</span>
                    </div>
                    <div className="bg-gold/5 border border-gold/15 rounded-xl p-3 mt-1.5 text-[10px] text-gray-400 font-sans leading-relaxed space-y-2">
                      <div className="flex items-start gap-2">
                        <Info className="w-3.5 h-3.5 text-gold shrink-0 mt-0.5" />
                        <span>
                          <strong>{t('delivery_note', 'cart')}</strong><br />
                          ✈️ {t('air', 'productCard')}: 150 TMT / кг (10-15 {lang === 'ru' ? 'дней' : 'gün'})<br />
                          🚛 {t('truck', 'productCard')}: 50 TMT / кг (25-30 {lang === 'ru' ? 'дней' : 'gün'})
                        </span>
                      </div>
                      <div className="border-t border-gold/10 pt-1.5 mt-1.5">
                        <p className="text-gray-300 font-medium">{t('payment_method', 'cart')}</p>
                        <p className="text-[9px] text-gray-400 font-light mt-0.5">
                          💵 {t('on_delivery', 'cart')} {t('on_delivery_desc', 'cart')} {lang === 'ru' ? 'либо' : 'ýa-da'} 📱 {t('prepayment', 'cart')} {t('prepayment_desc', 'cart')} <span className="text-gold font-bold font-mono">+993 64 30-01-86</span>.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Разделитель */}
                  <div className="border-t border-dark-border/40 my-3" />

                  {/* Форма оформления заказа */}
                  <div ref={checkoutFormRef} className="pt-1" />
                  <form onSubmit={handleSubmitOrder} className="space-y-3.5">
                    <h3 className="text-base font-serif text-white tracking-wide border-l-2 border-gold pl-2 uppercase text-xs font-semibold">{t('checkout_title', 'cart')}</h3>
                    
                    {/* Способ доставки (УДАЛЕН ШОУРУМ) */}
                    <div>
                      <label className="block text-[10px] text-gray-400 mb-1 font-sans font-bold uppercase tracking-wider">{lang === 'ru' ? 'Способ доставки' : 'Eltip bermek usuly'}</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setShippingMethod('courier')}
                          className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                            shippingMethod === 'courier'
                              ? 'border-gold bg-gold/10 text-gold'
                              : 'border-dark-border text-gray-400 hover:border-gold/30'
                          }`}
                        >
                          <Truck className="w-4 h-4 mb-0.5" />
                          <span className="text-[10px] font-sans font-semibold">{t('method_courier', 'cart')}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setShippingMethod('regions')}
                          className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                            shippingMethod === 'regions'
                              ? 'border-gold bg-gold/10 text-gold'
                              : 'border-dark-border text-gray-400 hover:border-gold/30'
                          }`}
                        >
                          <MapPin className="w-4 h-4 mb-0.5" />
                          <span className="text-[10px] font-sans font-semibold">{t('method_regions', 'cart')}</span>
                        </button>
                      </div>
                    </div>

                    {/* Имя */}
                    <div>
                      <label className="block text-[10px] text-gray-400 mb-1 font-sans font-bold uppercase tracking-wider">{t('your_name', 'cart')} *</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
                        }}
                        className={`w-full bg-dark-input border ${errors.name ? 'border-red-400' : 'border-dark-border'} rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-gold transition-colors font-sans`}
                        placeholder={lang === 'ru' ? 'Например, Мердан' : 'Meselem, Merdan'}
                      />
                      {errors.name && <p className="text-red-400 text-[10px] mt-1 font-sans">{errors.name}</p>}
                    </div>

                    {/* Телефон */}
                    <div>
                      <label className="block text-[10px] text-gray-400 mb-1 font-sans font-bold uppercase tracking-wider">{t('phone_number', 'cart')} *</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => {
                          let val = e.target.value;
                          if (!val.startsWith('+993')) {
                            val = '+993 ' + val.replace(/^\+?9?9?3?/, '').trim();
                          }
                          setPhone(val);
                          if (errors.phone) setErrors(prev => ({ ...prev, phone: undefined }));
                        }}
                        className={`w-full bg-dark-input border ${errors.phone ? 'border-red-400' : 'border-dark-border'} rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-gold transition-colors font-sans`}
                        placeholder="+993 65 12-34-56"
                      />
                      {errors.phone && <p className="text-red-400 text-[10px] mt-1 font-sans">{errors.phone}</p>}
                    </div>

                    {/* Адрес */}
                    <div>
                      <label className="block text-[10px] text-gray-400 mb-1 font-sans font-bold uppercase tracking-wider">{t('delivery_address', 'cart')} *</label>
                      <textarea
                        rows={2}
                        value={address}
                        onChange={(e) => {
                          setAddress(e.target.value);
                          if (errors.address) setErrors(prev => ({ ...prev, address: undefined }));
                        }}
                        className={`w-full bg-dark-input border ${errors.address ? 'border-red-400' : 'border-dark-border'} rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-gold transition-colors font-sans resize-none`}
                        placeholder={
                          shippingMethod === 'regions' 
                            ? (lang === 'ru' ? 'Укажите велаят, город и адрес доставки' : 'Welaýatyňyzy, şäheriňizi we salgyňyzy ýazyň')
                            : (lang === 'ru' ? 'Укажите улицу, дом, квартиру в Ашхабаде' : 'Aşgabatdaky köçäni, jaýy we kwartirany ýazyň')
                        }
                      />
                      {errors.address && <p className="text-red-400 text-[10px] mt-1 font-sans">{errors.address}</p>}
                    </div>

                    {/* Аванс (Минимум 20%) */}
                    <div className="bg-dark-card-lighter border border-dark-border rounded-xl p-3.5 space-y-3 font-sans">
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={usePrepayment}
                            onChange={(e) => {
                              setUsePrepayment(e.target.checked);
                              if (e.target.checked) {
                                setPrepaymentVal(Math.ceil(totalSum * 0.2).toString());
                              } else {
                                setPrepaymentVal('');
                              }
                              setPrepaymentError('');
                            }}
                            className="rounded border-dark-border text-gold focus:ring-0 focus:ring-offset-0 bg-dark-bg w-4 h-4 accent-gold cursor-pointer"
                          />
                          <span className="text-xs font-semibold text-white uppercase tracking-wide">
                            {lang === 'ru' ? 'Внести аванс (Мин. 20%)' : 'Awans tölemek (Min. 20%)'}
                          </span>
                        </label>
                        <span className="text-[10px] text-gold font-mono font-bold bg-gold/10 px-2 py-0.5 rounded">
                          {lang === 'ru' ? 'Рекомендуется' : 'Maslahat berilýär'}
                        </span>
                      </div>

                      <p className="text-[10px] text-gray-400 font-light leading-relaxed">
                        {lang === 'ru' 
                          ? 'Предоплата гарантирует быструю авиа/авто доставку и резерв товара. Минимальный аванс составляет 20% от суммы заказа.' 
                          : 'Öňünden töleg harydyň çalt eltilmegini üpjün edýär. Sebediň umumy bahasynyň azyndan 20% awans bolmaly.'}
                      </p>

                      {usePrepayment && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="space-y-3 pt-1"
                        >
                          {/* Поле ввода суммы */}
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-[10px] text-gray-400 font-bold uppercase">
                                {lang === 'ru' ? 'Сумма аванса (TMT)' : 'Awans mukdary (TMT)'}
                              </span>
                              <span className="text-[10px] text-gold font-semibold font-mono">
                                {lang === 'ru' ? `Мин: ${Math.ceil(totalSum * 0.2)} TMT` : `Min: ${Math.ceil(totalSum * 0.2)} TMT`}
                              </span>
                            </div>
                            <input
                              type="number"
                              value={prepaymentVal}
                              onChange={(e) => {
                                setPrepaymentVal(e.target.value);
                                setPrepaymentError('');
                              }}
                              className={`w-full bg-dark-input border ${prepaymentError ? 'border-red-400' : 'border-dark-border'} rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-gold transition-colors font-sans`}
                              placeholder={`${Math.ceil(totalSum * 0.2)}`}
                            />
                            {prepaymentError && (
                              <p className="text-red-400 text-[10px] mt-1 font-sans">{prepaymentError}</p>
                            )}
                          </div>

                          {/* Способ получения аванса */}
                          <div className="space-y-1.5">
                            <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                              {lang === 'ru' ? 'Как вы хотите передать аванс?' : 'Awansy nähili gowşurmak isleýärsiňiz?'}
                            </span>
                            <div className="grid grid-cols-1 gap-2">
                              {/* 1. Машину/курьера отправить */}
                              <button
                                type="button"
                                onClick={() => setPrepaymentMethod('courier')}
                                className={`flex items-start gap-3 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                                  prepaymentMethod === 'courier'
                                    ? 'border-gold bg-gold/10 text-gold shadow-md shadow-gold/5'
                                    : 'border-dark-border text-gray-400 hover:border-gold/30'
                                }`}
                              >
                                <Truck className="w-4 h-4 mt-0.5 shrink-0 text-gold" />
                                <div className="space-y-0.5">
                                  <span className="text-[10px] font-sans font-semibold block text-white">
                                    {lang === 'ru' ? 'Отправить машину за авансом (Авто-курьер - БЕСПЛАТНО)' : 'Awans üçin kuryer ugratmak (Ulagly - MUGT)'}
                                  </span>
                                  <span className="text-[9px] text-gray-400 block font-light leading-normal">
                                    {lang === 'ru' 
                                      ? 'Мы бесплатно отправим к вам машину, чтобы забрать аванс' 
                                      : 'Awansy almak üçin salgyňyza kuryerimiz mugt barar'}
                                  </span>
                                </div>
                              </button>

                              {/* 2. Приеду лично в офис */}
                              <button
                                type="button"
                                onClick={() => setPrepaymentMethod('office')}
                                className={`flex items-start gap-3 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                                  prepaymentMethod === 'office'
                                    ? 'border-gold bg-gold/10 text-gold shadow-md shadow-gold/5'
                                    : 'border-dark-border text-gray-400 hover:border-gold/30'
                                }`}
                              >
                                <Home className="w-4 h-4 mt-0.5 shrink-0 text-gold" />
                                <div className="space-y-0.5">
                                  <span className="text-[10px] font-sans font-semibold block text-white">
                                    {lang === 'ru' ? 'Приеду лично в наш офис LEVEL UP' : 'Ofisimize özüm gelip gowşuraryn'}
                                  </span>
                                  <span className="text-[9px] text-gray-400 block font-light leading-normal">
                                    {lang === 'ru' 
                                      ? 'г. Ашхабад, Мир 7/5 по Сурикова, дом 54 (Режим работы: 09:00 - 21:00)' 
                                      : 'Aşgabat ş., Mir 7/5 Surikowa köçesi, jaý 54 (Iş wagty: 09:00 - 21:00)'}
                                  </span>
                                </div>
                              </button>

                            </div>

                            {/* Дополнительная плашка с информацией о выбранном типе */}
                            <AnimatePresence mode="wait">
                              {prepaymentMethod === 'office' && (
                                <motion.div
                                  initial={{ opacity: 0, y: -5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -5 }}
                                  className="bg-gold/5 border border-gold/15 rounded-xl p-2.5 text-[10px] text-gray-300 font-sans mt-2 space-y-1"
                                >
                                  <p className="font-semibold text-gold">🏢 {lang === 'ru' ? 'Информация об офисе:' : 'Ofis maglumaty:'}</p>
                                  <p>📍 {lang === 'ru' ? 'Адрес: г. Ашхабад, Мир 7/5 по Сурикова, дом 54' : 'Salgy: Aşgabat ş., Mir 7/5 Surikowa köçesi, jaý 54'}</p>
                                  <p>🕐 {lang === 'ru' ? 'Часы работы: 09:00 - 21:00 (Ежедневно)' : 'Iş wagtlary: 09:00 - 21:00 (Her gün)'}</p>
                                  <p>⚡ {lang === 'ru' ? 'Прием заказов на сайте: Круглосуточно 24/7' : 'Sahytda sargyt kabul etmek: 24/7 Tölegli'}</p>
                                </motion.div>
                              )}



                              {prepaymentMethod === 'courier' && (
                                <motion.div
                                  initial={{ opacity: 0, y: -5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -5 }}
                                  className="bg-gold/5 border border-gold/15 rounded-xl p-2.5 text-[10px] text-gray-300 font-sans mt-2 space-y-1"
                                >
                                  <p className="font-semibold text-gold">🚖 {lang === 'ru' ? 'Служба авто-курьеров LEVEL UP:' : 'LEVEL UP awto-kuryer gullugy:'}</p>
                                  <p>{lang === 'ru' ? 'Вызов авто-курьера полностью БЕСПЛАТНЫЙ. Обратите внимание: чек при приеме аванса не выдается.' : 'Awans üçin awto-kuryer çagyrmak dolulygyna MUGT-dur. Bellik: Awans alnanda çek berilmeýär.'}</p>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </motion.div>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-gold w-full py-3 mt-2 flex items-center justify-center gap-2 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-dark-bg border-t-transparent rounded-full animate-spin"></div>
                          <span>{t('submitting', 'cart')}</span>
                        </>
                      ) : (
                        <span>{t('confirm_order', 'cart')}</span>
                      )}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
