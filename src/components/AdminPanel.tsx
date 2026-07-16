import React, { useState, useEffect } from 'react';
import { Product, Order, ProductOption } from '../types';
import { dbService } from '../utils/db';
import { testTelegramNotification } from '../utils/telegram';
import { 
  Lock, Eye, EyeOff, ShieldCheck, ShoppingBag, Plus, Trash2, 
  RefreshCw, X, ArrowLeft, Upload, Grid, LogOut, Send, AlertCircle, CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshCatalog: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose, onRefreshCatalog }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  const [activeTab, setActiveTab] = useState<'orders' | 'products'>('orders');
  
  // Telegram testing states
  const [telegramTesting, setTelegramTesting] = useState(false);
  const [telegramTestResult, setTelegramTestResult] = useState<{ success: boolean; message: string } | null>(null);
  
  // Данные из бд
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderSearchQuery, setOrderSearchQuery] = useState('TM+');
  const [products, setProducts] = useState<Product[]>([]);

  // Форма добавления/редактирования товара
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [prodTitle, setProdTitle] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodOldPrice, setProdOldPrice] = useState('');
  const [prodCategory, setProdCategory] = useState<'auto' | 'clothing' | 'home'>('clothing');
  const [prodSubcategory, setProdSubcategory] = useState<'men' | 'women'>('men');
  const [prodSizes, setProdSizes] = useState(''); // Comma separated
  const [prodCustomOptionsStr, setProdCustomOptionsStr] = useState(''); // Получение опций в виде строки
  const [prodImage, setProdImage] = useState('');
  const [prodImages, setProdImages] = useState<string[]>([]);
  const [prodInStock, setProdInStock] = useState(true);
  const [prodWeight, setProdWeight] = useState('1'); // По умолчанию 1кг
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const loadData = () => {
    setOrders(dbService.getOrders());
    setProducts(dbService.getProducts());
  };

  const handleTestTelegram = async () => {
    setTelegramTesting(true);
    setTelegramTestResult(null);
    try {
      const res = await testTelegramNotification();
      setTelegramTestResult(res);
    } catch (err: any) {
      setTelegramTestResult({ 
        success: false, 
        message: err.message || 'Ошибка отправки тестового уведомления' 
      });
    } finally {
      setTelegramTesting(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '06041999') {
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Неверный пароль.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword('');
  };

  // Конвертация файла картинки в Base64
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Файл слишком большой. Выберите изображение до 2МБ.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProdImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Открытие формы добавления товара
  const handleOpenAddForm = () => {
    setEditingProduct(null);
    setProdTitle('');
    setProdDesc('');
    setProdPrice('');
    setProdOldPrice('');
    setProdCategory('clothing');
    setProdSubcategory('men');
    setProdSizes('S, M, L, XL');
    setProdCustomOptionsStr('');
    setProdImage('');
    setProdImages([]);
    setProdInStock(true);
    setProdWeight('1');
    setFormError('');
    setShowProductForm(true);
  };

  // Открытие формы редактирования товара
  const handleOpenEditForm = (product: Product) => {
    setEditingProduct(product);
    setProdTitle(product.title);
    setProdDesc(product.description);
    setProdPrice(product.price.toString());
    setProdOldPrice(product.oldPrice ? product.oldPrice.toString() : '');
    setProdCategory(product.category);
    if (product.category === 'clothing') {
      setProdSubcategory(product.subcategory || 'men');
    }
    setProdSizes(product.sizes ? product.sizes.join(', ') : '');
    
    // Преобразование опций в строку для редактирования
    const optionsStr = product.customOptions 
      ? product.customOptions.map(opt => `${opt.name}:${opt.priceModifier}`).join('; ')
      : '';
    setProdCustomOptionsStr(optionsStr);

    setProdImage(product.image);
    setProdImages(product.images || []);
    setProdInStock(product.inStock);
    setProdWeight((product.weight || 1).toString());
    setFormError('');
    setShowProductForm(true);
  };

  // Сохранение товара
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodTitle.trim() || !prodPrice || !prodImage) {
      setFormError('Заполните обязательные поля: Название, Цена и Изображение');
      return;
    }

    const priceNum = parseFloat(prodPrice);
    const oldPriceNum = prodOldPrice ? parseFloat(prodOldPrice) : undefined;
    const weightNum = 1; // Вес товара больше не используется по требованию клиента

    if (isNaN(priceNum) || priceNum <= 0) {
      setFormError('Цена должна быть положительным числом');
      return;
    }

    const sizesArr = prodCategory === 'clothing' && prodSizes.trim()
      ? prodSizes.split(',').map(s => s.trim()).filter(s => s.length > 0)
      : undefined;

    // Парсинг опций
    const customOptionsParsed = prodCustomOptionsStr.trim()
      ? prodCustomOptionsStr.split(';').map(part => {
          const [namePart, valPart] = part.split(':');
          return {
            name: namePart ? namePart.trim() : '',
            priceModifier: valPart ? parseFloat(valPart.trim()) || 0 : 0
          };
        }).filter(opt => opt.name.length > 0)
      : undefined;

    const productData = {
      title: prodTitle.trim(),
      description: prodDesc.trim(),
      price: priceNum,
      oldPrice: oldPriceNum,
      image: prodImage,
      images: prodImages.filter(img => img.trim().length > 0),
      category: prodCategory,
      subcategory: prodCategory === 'clothing' ? prodSubcategory : undefined,
      sizes: sizesArr,
      customOptions: customOptionsParsed,
      inStock: prodInStock,
      weight: weightNum
    };

    if (editingProduct) {
      dbService.updateProduct({
        ...editingProduct,
        ...productData
      });
    } else {
      dbService.addProduct(productData);
    }

    setShowProductForm(false);
    loadData();
    onRefreshCatalog();
  };

  // Удаление товара
  const handleDeleteProduct = (id: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этот товар?')) {
      dbService.deleteProduct(id);
      loadData();
      onRefreshCatalog();
    }
  };

  // Переключение статуса наличия товара прямо из таблицы
  const toggleStockStatus = (product: Product) => {
    const updated = { ...product, inStock: !product.inStock };
    dbService.updateProduct(updated);
    loadData();
    onRefreshCatalog();
  };

  // Изменение статуса заказа
  const handleUpdateOrderStatus = (orderId: string, status: Order['status']) => {
    dbService.updateOrderStatus(orderId, status);
    loadData();
  };

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <span className="bg-blue-500/10 text-blue-400 border border-blue-500/30 px-2.5 py-0.5 rounded-full text-xs font-sans">Ожидает оплаты</span>;
      case 'processing':
        return <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-full text-xs font-sans">В обработке</span>;
      case 'shipped':
        return <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 px-2.5 py-0.5 rounded-full text-xs font-sans">В пути</span>;
      case 'completed':
        return <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full text-xs font-sans">Доставлен</span>;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-dark-bg overflow-y-auto flex flex-col min-h-screen">
      
      {/* Шапка админ-панели */}
      <div className="bg-dark-card border-b border-dark-border px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-lg">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-gold" />
          <h1 className="text-2xl font-serif text-white tracking-wider uppercase">
            LEVEL UP <span className="text-gold font-sans font-semibold text-sm tracking-widest block md:inline md:ml-2">Панель управления</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-xs text-red-400 hover:text-red-300 font-sans transition-colors cursor-pointer bg-dark-card-lighter border border-dark-border rounded-full px-3.5 py-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Выйти</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gold transition-colors flex items-center gap-1 text-sm bg-dark-card-lighter border border-dark-border rounded-full px-3.5 py-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Назад в магазин</span>
          </button>
        </div>
      </div>

      <div className="flex-grow max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col">
        
        {!isAuthenticated ? (
          /* Форма авторизации */
          <div className="flex-grow flex items-center justify-center py-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-dark-card border border-dark-border rounded-2xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold/10 via-gold to-gold/10" />
              <div className="flex flex-col items-center mb-6">
                <div className="w-12 h-12 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold mb-3">
                  <Lock className="w-5 h-5" />
                </div>
                <h2 className="text-xl text-white font-serif tracking-wider uppercase">Вход для Администратора</h2>
                <p className="text-gray-400 text-xs mt-1">Доступ к заказам и наполнению каталога</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="relative">
                  <label className="block text-xs text-gray-400 mb-1 font-sans uppercase tracking-wider font-medium">Пароль</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-dark-input border border-dark-border rounded-xl px-4 py-3 text-sm text-white font-sans focus:outline-none focus:border-gold transition-colors pr-10"
                      placeholder="Введите пароль..."
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3.5 text-gray-500 hover:text-gold transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {loginError && (
                  <p className="text-red-400 text-xs font-sans">{loginError}</p>
                )}

                <button type="submit" className="btn-gold w-full py-3 text-sm">
                  Войти в панель
                </button>
              </form>

              <div className="mt-6 border-t border-dark-border/60 pt-4 text-center">
                <p className="text-[10px] text-gray-500 font-mono tracking-wider uppercase">
                  Пароль изменен администратором
                </p>
              </div>
            </motion.div>
          </div>
        ) : (
          /* Авторизованная зона */
          <div className="space-y-6 flex-grow flex flex-col">
            
            {/* Переключатель вкладок */}
            <div className="flex gap-2 border-b border-dark-border pb-1">
              <button
                onClick={() => setActiveTab('orders')}
                className={`px-5 py-3 text-sm font-sans uppercase tracking-widest relative cursor-pointer ${
                  activeTab === 'orders'
                    ? 'text-gold font-bold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <span>Заказы</span>
                {activeTab === 'orders' && (
                  <motion.div layoutId="admin-active-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('products')}
                className={`px-5 py-3 text-sm font-sans uppercase tracking-widest relative cursor-pointer ${
                  activeTab === 'products'
                    ? 'text-gold font-bold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <span>Товары в каталоге</span>
                {activeTab === 'products' && (
                  <motion.div layoutId="admin-active-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold" />
                )}
              </button>
            </div>

            {/* Вкладка Заказы */}
            {activeTab === 'orders' && (
              <div className="flex-grow space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h2 className="text-xl font-serif text-gray-900 tracking-wider flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-gold" />
                    <span>Поступившие Заказы ({orders.length})</span>
                  </h2>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="TM+..."
                      className="bg-dark-input border border-dark-border rounded-xl px-4 py-2 text-sm text-gray-900 focus:outline-none focus:border-gold"
                      value={orderSearchQuery}
                      onChange={(e) => setOrderSearchQuery(e.target.value)}
                    />
                    <button
                      onClick={loadData}
                      className="p-2 text-gray-600 hover:text-gold transition-colors bg-dark-card border border-dark-border rounded-full cursor-pointer flex items-center gap-1.5 text-xs font-sans uppercase tracking-wider"
                      title="Обновить список"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Обновить</span>
                    </button>
                  </div>
                </div>

                {orders.length === 0 ? (
                  <div className="bg-dark-card border border-dark-border rounded-2xl p-12 text-center">
                    <p className="text-gray-600 font-serif text-lg">Заказы пока не поступали</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.filter(o => {
                      let query = orderSearchQuery.toUpperCase();
                      if (query.startsWith('TM+')) {
                          query = 'TM-' + query.substring(3);
                      } else if (/^\d+$/.test(query)) {
                          query = 'TM-' + query;
                      }
                      return o.id.includes(query);
                    }).map((order) => (
                      <div
                        key={order.id}
                        className="bg-dark-card border border-dark-border rounded-2xl p-6 hover:border-gold/30 transition-all shadow-md flex flex-col md:flex-row md:items-start justify-between gap-6"
                      >
                        {/* Информация о клиенте и доставке */}
                        <div className="space-y-3 flex-grow max-w-md">
                          <div className="flex items-center gap-3">
                            <span className="text-gold font-mono font-bold text-sm bg-gold/10 px-3 py-1 rounded-lg">
                              #{order.id.split('-')[1] || order.id}
                            </span>
                            <span className="text-xs text-gray-400 font-sans">
                              {new Date(order.createdAt).toLocaleString('ru-RU')}
                            </span>
                          </div>

                          <div className="space-y-1 font-sans">
                            <p className="text-sm font-medium text-white">{order.customerName}</p>
                            <p className="text-xs text-gold font-semibold">{order.customerPhone}</p>
                            <p className="text-xs text-gray-300 mt-2">
                              <span className="text-gray-500 uppercase tracking-wider text-[10px] block font-medium">Способ и адрес доставки:</span>
                              <strong>{order.shippingMethod}:</strong> {order.customerAddress}
                            </p>

                            {order.prepaymentAmount !== undefined && (
                              <div className="bg-dark-card-lighter border border-dark-border/60 rounded-xl p-2.5 mt-2.5 space-y-1 text-xs font-sans">
                                <div className="flex justify-between gap-4">
                                  <span className="text-gray-400">Внесенный аванс:</span>
                                  <span className="text-gold font-bold font-mono">{order.prepaymentAmount} TMT</span>
                                </div>
                                <div className="flex justify-between gap-4">
                                  <span className="text-gray-400">Способ передачи аванса:</span>
                                  <span className="text-white text-right font-medium">
                                    {order.prepaymentMethod === 'courier' 
                                      ? '🚖 Вызов авто-курьера' 
                                      : '🏢 Личный визит в офис'}
                                  </span>
                                </div>
                                <div className="flex justify-between gap-4 border-t border-dark-border/40 pt-1 mt-1">
                                  <span className="text-gray-400 font-bold">Остаток при получении:</span>
                                  <span className="text-emerald-400 font-bold font-mono">{order.remainingBalance} TMT</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Список товаров в заказе */}
                        <div className="flex-grow border-t border-b md:border-t-0 md:border-b-0 border-dark-border/60 py-4 md:py-0">
                          <span className="text-gray-500 uppercase tracking-wider text-[10px] block font-medium font-sans mb-2">Содержимое заказа:</span>
                          <ul className="space-y-2 font-sans text-xs">
                            {order.items.map((item, idx) => (
                              <li key={idx} className="flex items-start justify-between gap-4 text-gray-300">
                                <span className="line-clamp-1 font-medium">
                                  {item.productTitle}
                                  {item.selectedSize && (
                                    <span className="text-gold font-bold ml-1.5 font-sans bg-dark-border border border-dark-border px-1.5 py-0.5 rounded text-[10px]">
                                      {item.selectedSize}
                                    </span>
                                  )}
                                </span>
                                <span className="text-gray-400 font-mono flex-shrink-0">
                                  {item.quantity} шт × {item.price.toLocaleString('ru-RU')} TMT
                                </span>
                              </li>
                            ))}
                          </ul>
                          <div className="border-t border-dark-border/40 mt-3 pt-3 flex justify-between items-center">
                            <span className="text-xs text-gray-400 font-serif">Общая сумма:</span>
                            <span className="text-gold font-bold text-base font-sans">
                              {order.totalPrice.toLocaleString('ru-RU')} TMT
                            </span>
                          </div>
                        </div>

                        {/* Статус и управление */}
                        <div className="flex flex-col items-stretch md:items-end gap-3 justify-between flex-shrink-0">
                          <div className="md:text-right">
                            <span className="text-gray-500 uppercase tracking-wider text-[10px] block font-medium font-sans mb-1.5">Статус:</span>
                            {getStatusBadge(order.status)}
                          </div>

                          <div className="flex flex-wrap gap-1.5 justify-end">
                            <button
                              onClick={() => handleUpdateOrderStatus(order.id, 'pending')}
                              className={`px-2 py-1 rounded-md border text-[9px] uppercase font-sans transition-colors cursor-pointer ${
                                order.status === 'pending'
                                  ? 'border-blue-500 bg-blue-500/10 text-blue-400 font-bold'
                                  : 'border-dark-border text-gray-400 hover:border-blue-500/40 hover:text-blue-400'
                              }`}
                            >
                              Ожидает оплаты
                            </button>
                            <button
                              onClick={() => handleUpdateOrderStatus(order.id, 'processing')}
                              className={`px-2 py-1 rounded-md border text-[9px] uppercase font-sans transition-colors cursor-pointer ${
                                order.status === 'processing'
                                  ? 'border-amber-500 bg-amber-500/10 text-amber-400 font-bold'
                                  : 'border-dark-border text-gray-400 hover:border-amber-500/40 hover:text-amber-400'
                              }`}
                            >
                              В обработку
                            </button>
                            <button
                              onClick={() => handleUpdateOrderStatus(order.id, 'shipped')}
                              className={`px-2 py-1 rounded-md border text-[9px] uppercase font-sans transition-colors cursor-pointer ${
                                order.status === 'shipped'
                                  ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400 font-bold'
                                  : 'border-dark-border text-gray-400 hover:border-indigo-500/40 hover:text-indigo-400'
                              }`}
                            >
                              В путь
                            </button>
                            <button
                              onClick={() => handleUpdateOrderStatus(order.id, 'completed')}
                              className={`px-2 py-1 rounded-md border text-[9px] uppercase font-sans transition-colors cursor-pointer ${
                                order.status === 'completed'
                                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 font-bold'
                                  : 'border-dark-border text-gray-400 hover:border-emerald-500/40 hover:text-emerald-400'
                              }`}
                            >
                              Доставлен
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Виджет проверки статуса Telegram */}
                <div className="bg-dark-card border border-dark-border/80 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm relative overflow-hidden">
                  <div className="space-y-1.5 max-w-2xl">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse inline-block" />
                      Интеграция с Telegram
                    </h3>
                    <p className="text-xs text-gray-600 font-sans leading-relaxed">
                      Для моментального получения уведомлений о новых заказах прямо на ваш телефон, настройте переменные окружения в настройках проекта.
                    </p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1.5 pt-1 text-xs">
                      <span className="flex items-center gap-1.5 font-sans font-medium text-gray-700">
                        Токен бота (VITE_TELEGRAM_BOT_TOKEN): 
                        {(import.meta as any).env.VITE_TELEGRAM_BOT_TOKEN ? (
                          <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Настроен
                          </span>
                        ) : (
                          <span className="text-red-600 font-bold flex items-center gap-0.5">
                            <X className="w-3.5 h-3.5" /> Отсутствует
                          </span>
                        )}
                      </span>
                      <span className="flex items-center gap-1.5 font-sans font-medium text-gray-700">
                        ID чата (VITE_TELEGRAM_CHAT_ID): 
                        {(import.meta as any).env.VITE_TELEGRAM_CHAT_ID ? (
                          <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Настроен
                          </span>
                        ) : (
                          <span className="text-red-600 font-bold flex items-center gap-0.5">
                            <X className="w-3.5 h-3.5" /> Отсутствует
                          </span>
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 flex flex-col items-stretch md:items-end gap-2">
                    <button
                      onClick={handleTestTelegram}
                      disabled={telegramTesting}
                      className="btn-gold text-xs py-2 px-4 flex items-center justify-center gap-1.5 font-sans font-bold cursor-pointer disabled:opacity-50"
                    >
                      {telegramTesting ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Отправка...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Проверить отправку</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {telegramTestResult && (
                  <div className={`p-4 rounded-xl border text-xs font-sans ${
                    telegramTestResult.success 
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}>
                    <div className="flex items-start gap-2.5">
                      {telegramTestResult.success ? (
                        <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                      ) : (
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                      )}
                      <div className="space-y-1">
                        <p className="font-bold">
                          {telegramTestResult.success ? 'Успешно!' : 'Ошибка при тестировании Telegram'}
                        </p>
                        <p className="opacity-90">{telegramTestResult.message}</p>
                        {!telegramTestResult.success && (
                          <p className="text-gray-600 mt-1.5 text-[11px] leading-relaxed">
                            💡 <b>Как это исправить:</b><br />
                            1. Убедитесь, что вы создали бота в Telegram через <b>@BotFather</b> и получили токен.<br />
                            2. Убедитесь, что добавили бота в чат/канал и написали ему <b>/start</b>.<br />
                            3. Получите ваш ID чата (например, через бота <b>@userinfobot</b>) и вставьте его.<br />
                            4. Пропишите полученные значения в Настройках проекта (Secrets / Переменные окружения) как <b>VITE_TELEGRAM_BOT_TOKEN</b> и <b>VITE_TELEGRAM_CHAT_ID</b>.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}


              </div>
            )}

            {/* Вкладка Товары */}
            {activeTab === 'products' && (
              <div className="flex-grow space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-serif text-white tracking-wider flex items-center gap-2">
                    <Grid className="w-5 h-5 text-gold" />
                    <span>Товары ({products.length})</span>
                  </h2>
                  <button
                    onClick={handleOpenAddForm}
                    className="btn-gold text-xs px-4 py-2 flex items-center gap-1.5 font-sans"
                  >
                    <Plus className="w-3.5 h-3.5 text-dark-bg" />
                    <span>Добавить товар</span>
                  </button>
                </div>

                {/* Таблица/Сетка товаров */}
                <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden shadow-lg">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse font-sans text-xs sm:text-sm">
                      <thead>
                        <tr className="border-b border-dark-border bg-dark-card-lighter text-gray-400 uppercase text-[10px] tracking-wider font-semibold">
                          <th className="p-4 w-16">Фото</th>
                          <th className="p-4">Название / Категория</th>
                          <th className="p-4">Варианты/Опции</th>
                          <th className="p-4">Цена</th>
                          <th className="p-4 text-center">Наличие</th>
                          <th className="p-4 text-right">Действия</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-dark-border/50">
                        {products.map((prod) => (
                          <tr key={prod.id} className="hover:bg-dark-card-lighter/40 transition-colors">
                            {/* Фото */}
                            <td className="p-4">
                              <img
                                src={prod.image}
                                alt={prod.title}
                                className="w-10 h-12 object-cover rounded bg-dark-card-lighter border border-dark-border"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = `https://placehold.co/50x60/1d1d1b/c5a85c?text=IMG`;
                                }}
                              />
                            </td>
                            {/* Название */}
                            <td className="p-4">
                              <p className="font-medium text-white text-sm line-clamp-1">{prod.title}</p>
                              <span className="text-[10px] text-gold/70 uppercase tracking-widest font-semibold">
                                {prod.category === 'auto' ? 'Автотовары' : 
                                 prod.category === 'home' ? 'Дом и уют' :
                                 `Одежда / ${prod.subcategory === 'men' ? 'Мужское' : 'Женское'}`}
                              </span>
                            </td>
                            {/* Варианты/Опции */}
                            <td className="p-4 text-gray-300">
                              {prod.customOptions && prod.customOptions.length > 0 ? (
                                <div className="flex flex-col gap-1 max-w-[200px]">
                                  {prod.customOptions.map(o => (
                                    <span key={o.name} className="text-[10px] text-gray-400 truncate">
                                      • <strong className="text-gray-300">{o.name}</strong> ({o.priceModifier >= 0 ? `+${o.priceModifier}` : o.priceModifier} TMT)
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-gray-500">—</span>
                              )}
                            </td>
                            {/* Цена */}
                            <td className="p-4">
                              <p className="text-white font-semibold">{prod.price.toLocaleString('ru-RU')} TMT</p>
                              {prod.oldPrice && (
                                <p className="text-xs text-gray-500 line-through">{prod.oldPrice.toLocaleString('ru-RU')} TMT</p>
                              )}
                            </td>
                            {/* Статус наличия */}
                            <td className="p-4 text-center">
                              <button
                                onClick={() => toggleStockStatus(prod)}
                                className={`px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase border transition-all cursor-pointer ${
                                  prod.inStock
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                                    : 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
                                }`}
                              >
                                {prod.inStock ? 'В наличии' : 'Нет в наличии'}
                              </button>
                            </td>
                            {/* Кнопки действий */}
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleOpenEditForm(prod)}
                                  className="p-1.5 text-gray-400 hover:text-gold hover:bg-dark-card-lighter rounded-lg transition-colors cursor-pointer"
                                  title="Редактировать"
                                >
                                  <RefreshCw className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(prod.id)}
                                  className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                                  title="Удалить"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}
      </div>

      {/* Оверлей-модалка добавления/редактирования товара */}
      <AnimatePresence>
        {showProductForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowProductForm(false)}
              className="absolute inset-0 bg-black backdrop-blur-xs"
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="bg-dark-card border border-dark-border w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-dark-border flex items-center justify-between bg-dark-card-lighter">
                <h3 className="text-xl font-serif text-white tracking-wide">
                  {editingProduct ? 'Редактировать товар' : 'Добавить новый товар'}
                </h3>
                <button
                  onClick={() => setShowProductForm(false)}
                  className="text-gray-400 hover:text-gold transition-colors p-1 cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="p-6 overflow-y-auto space-y-4 flex-grow font-sans text-sm pb-10">
                
                {/* Категория */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wider font-semibold">Категория *</label>
                    <select
                      value={prodCategory}
                      onChange={(e) => setProdCategory(e.target.value as 'auto' | 'clothing' | 'home')}
                      className="w-full bg-dark-input border border-dark-border rounded-xl px-4 py-2 text-white focus:outline-none focus:border-gold"
                    >
                      <option value="clothing">Одежда</option>
                      <option value="auto">Автотовары</option>
                      <option value="home">Дом и уют</option>
                    </select>
                  </div>

                  {prodCategory === 'clothing' && (
                    <div>
                      <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wider font-semibold">Подраздел *</label>
                      <select
                        value={prodSubcategory}
                        onChange={(e) => setProdSubcategory(e.target.value as 'men' | 'women')}
                        className="w-full bg-dark-input border border-dark-border rounded-xl px-4 py-2 text-white focus:outline-none focus:border-gold"
                      >
                        <option value="men">Мужское</option>
                        <option value="women">Женское</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Название */}
                <div>
                  <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wider font-semibold">Название товара *</label>
                  <input
                    type="text"
                    value={prodTitle}
                    onChange={(e) => setProdTitle(e.target.value)}
                    className="w-full bg-dark-input border border-dark-border rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-gold"
                    placeholder="Например, Кожаные 3D-коврики на заказ"
                  />
                </div>

                {/* Описание */}
                <div>
                  <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wider font-semibold">Описание</label>
                  <textarea
                    rows={3}
                    value={prodDesc}
                    onChange={(e) => setProdDesc(e.target.value)}
                    className="w-full bg-dark-input border border-dark-border rounded-xl px-4 py-2 text-white focus:outline-none focus:border-gold resize-none"
                    placeholder="Подробное описание товара, состав, особенности..."
                  />
                </div>

                {/* Цены */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wider font-semibold">Цена (TMT) *</label>
                    <input
                      type="number"
                      value={prodPrice}
                      onChange={(e) => setProdPrice(e.target.value)}
                      className="w-full bg-dark-input border border-dark-border rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-gold"
                      placeholder="1800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wider font-semibold">Старая цена (TMT)</label>
                    <input
                      type="number"
                      value={prodOldPrice}
                      onChange={(e) => setProdOldPrice(e.target.value)}
                      className="w-full bg-dark-input border border-dark-border rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-gold"
                      placeholder="2200"
                    />
                  </div>
                </div>

                {/* Размеры (только для одежды) */}
                {prodCategory === 'clothing' && (
                  <div>
                    <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wider font-semibold">
                      Размеры в наличии <span className="text-[10px] text-gray-500">(через запятую)</span>
                    </label>
                    <input
                      type="text"
                      value={prodSizes}
                      onChange={(e) => setProdSizes(e.target.value)}
                      className="w-full bg-dark-input border border-dark-border rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-gold"
                      placeholder="S, M, L, XL"
                    />
                  </div>
                )}

                {/* Кастомные опции / комплектации (для всех товаров) */}
                <div>
                  <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wider font-semibold">
                    Опции / Комплектации <span className="text-[10px] text-gray-500">(название:наценка через точку с запятой)</span>
                  </label>
                  <input
                    type="text"
                    value={prodCustomOptionsStr}
                    onChange={(e) => setProdCustomOptionsStr(e.target.value)}
                    className="w-full bg-dark-input border border-dark-border rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-gold"
                    placeholder="Например: Только салон: 0; Салон + Багажник: 750"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">
                    Формат: <span className="text-gold font-mono">Название опции: наценка; Вторая опция: наценка</span>. Пример: <span className="text-gray-300">Только салон: 0; Салон + Багажник: 750</span>
                  </p>
                </div>

                {/* Фотография */}
                <div className="space-y-2">
                  <label className="block text-xs text-gray-400 uppercase tracking-wider font-semibold">Фотография товара *</label>
                  <div className="flex flex-col sm:flex-row gap-4 items-stretch">
                    {/* Кнопка загрузки файла */}
                    <div className="flex-grow flex flex-col justify-center border-2 border-dashed border-dark-border rounded-xl p-4 bg-dark-input hover:border-gold/40 transition-colors relative cursor-pointer group text-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <div className="flex flex-col items-center justify-center gap-1">
                        <Upload className="w-5 h-5 text-gray-400 group-hover:text-gold transition-colors" />
                        <span className="text-xs text-gray-300 font-medium">Загрузить фото с компьютера</span>
                        <span className="text-[10px] text-gray-500">До 2 МБ, преобразуется в базу данных</span>
                      </div>
                    </div>

                    {/* Поле ввода URL картинки */}
                    <div className="flex-grow flex flex-col justify-between">
                      <div className="w-full">
                        <span className="text-[10px] text-gray-500 block mb-1">ИЛИ вставьте ссылку на изображение</span>
                        <input
                          type="text"
                          value={prodImage}
                          onChange={(e) => setProdImage(e.target.value)}
                          className="w-full bg-dark-input border border-dark-border rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-gold text-xs"
                          placeholder="https://images.unsplash.com/..."
                        />
                      </div>
                    </div>

                    {/* Предпросмотр */}
                    {prodImage && (
                      <div className="w-20 h-24 flex-shrink-0 border border-dark-border rounded-lg overflow-hidden bg-dark-input relative">
                        <img src={prodImage} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setProdImage('')}
                          className="absolute top-1 right-1 bg-black/65 text-red-400 rounded-full p-0.5 hover:bg-black"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Дополнительные фотографии */}
                <div className="space-y-3 border-t border-dark-border/40 pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-xs text-gray-400 uppercase tracking-wider font-semibold">Дополнительные фото ({prodImages.length})</label>
                      <p className="text-[10px] text-gray-500 font-light mt-0.5">Добавьте больше фотографий товара для слайдера в карточке товара</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setProdImages([...prodImages, ''])}
                      className="text-xs text-gold hover:text-white font-bold transition-colors cursor-pointer flex items-center gap-1 bg-gold/10 border border-gold/25 px-2.5 py-1.5 rounded-lg"
                    >
                      <Plus className="w-3.5 h-3.5" /> Добавить еще фото
                    </button>
                  </div>

                  {prodImages.map((imgUrl, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <div className="flex-grow">
                        <input
                          type="text"
                          value={imgUrl}
                          onChange={(e) => {
                            const newImages = [...prodImages];
                            newImages[index] = e.target.value;
                            setProdImages(newImages);
                          }}
                          className="w-full bg-dark-input border border-dark-border rounded-xl px-4 py-2 text-white focus:outline-none focus:border-gold text-xs"
                          placeholder={`Ссылка на дополнительное фото #${index + 1}...`}
                        />
                      </div>
                      
                      {/* Опция загрузки файла для этого конкретного дополнительного фото */}
                      <label className="flex-shrink-0 cursor-pointer bg-dark-card-lighter border border-dark-border hover:border-gold/40 p-2.5 rounded-xl text-gray-400 hover:text-gold transition-all relative">
                        <Upload className="w-4 h-4" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (file.size > 2 * 1024 * 1024) {
                                alert('Файл слишком большой. Выберите изображение до 2МБ.');
                                return;
                              }
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                const newImages = [...prodImages];
                                newImages[index] = reader.result as string;
                                setProdImages(newImages);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>

                      {imgUrl && (
                        <div className="w-10 h-10 flex-shrink-0 border border-dark-border rounded-lg overflow-hidden bg-dark-input">
                          <img src={imgUrl} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setProdImages(prodImages.filter((_, i) => i !== index));
                        }}
                        className="p-2.5 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer"
                        title="Удалить это фото"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {prodImages.length === 0 && (
                    <p className="text-[11px] text-gray-500 italic">Нет дополнительных изображений. Товар будет показываться только с одной главной фотографией.</p>
                  )}
                </div>

                {/* Флаг "В наличии" */}
                <div className="flex items-center gap-3 bg-dark-card-lighter border border-dark-border/60 p-3.5 rounded-xl">
                  <input
                    type="checkbox"
                    id="inStockCheckbox"
                    checked={prodInStock}
                    onChange={(e) => setProdInStock(e.target.checked)}
                    className="w-4 h-4 text-gold bg-dark-input border-dark-border rounded-md focus:ring-gold accent-gold"
                  />
                  <label htmlFor="inStockCheckbox" className="text-sm text-gray-300 select-none cursor-pointer">
                    Товар есть в наличии на складе (доступен к покупке)
                  </label>
                </div>

                {formError && (
                  <p className="text-red-400 text-xs font-sans animate-pulse">{formError}</p>
                )}

                <div className="border-t border-dark-border/60 pt-4 flex gap-3 justify-end bg-dark-card">
                  <button
                    type="button"
                    onClick={() => setShowProductForm(false)}
                    className="px-5 py-2.5 rounded-full text-xs uppercase tracking-wider font-sans border border-dark-border text-gray-400 hover:text-white transition-colors cursor-pointer"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    className="btn-gold text-xs px-6 py-2.5 cursor-pointer"
                  >
                    {editingProduct ? 'Сохранить изменения' : 'Создать товар'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
