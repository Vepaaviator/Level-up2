import React, { useState } from 'react';
import { dbService } from '../utils/db';
import { Order } from '../types';
import { 
  Search, Package, MapPin, Phone, User, Calendar, 
  Truck, Plane, CreditCard, CheckCircle, Clock, 
  AlertCircle, ChevronRight, Check, Info
} from 'lucide-react';
import { useLanguage } from '../utils/languageContext';
import { motion, AnimatePresence } from 'motion/react';

interface OrderTrackingProps {
  isLightTheme?: boolean;
}

export const OrderTracking: React.FC<OrderTrackingProps> = ({ isLightTheme = false }) => {
  const { t, lang } = useLanguage();
  const [orderIdInput, setOrderIdInput] = useState('');
  const [foundOrder, setFoundOrder] = useState<Order | null>(null);
  const [searched, setSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Обработчик поиска
  const handleSearch = (idToSearch?: string) => {
    let id = (idToSearch || orderIdInput).trim().toUpperCase();
    
    // Если введены только цифры, добавляем префикс TM-
    if (/^\d+$/.test(id)) {
        id = 'TM-' + id;
    }
    
    // Заменяем кириллическую ТМ на латинскую TM на случай опечаток
    id = id.replace(/ТМ/g, 'TM').replace(/TМ/g, 'TM').replace(/ТM/g, 'TM');
    setSearched(true);
    
    if (!id) {
      setErrorMsg(lang === 'ru' ? 'Пожалуйста, введите код заказа' : 'Sargyt koduny giriziň');
      setFoundOrder(null);
      return;
    }

    const orders = dbService.getOrders();
    const match = orders.find(o => o.id.toUpperCase() === id);

    if (match) {
      setFoundOrder(match);
      setErrorMsg('');
      if (!idToSearch) {
        setOrderIdInput(match.id);
      }
    } else {
      setFoundOrder(null);
      setErrorMsg(
        lang === 'ru' 
          ? `Заказ с кодом "${id}" не найден. Проверьте правильность ввода.` 
          : `"${id}" kodly sargyt tapylmady. Ýazylyşyny barlaň.`
      );
    }
  };

    // Статусы и их перевод
    const getStatusDetails = (status: Order['status']) => {
      const statusMap = {
        pending: {
          label: lang === 'ru' ? 'Создан' : 'Döredildi',
          desc: lang === 'ru' ? 'Заказ успешно зарегистрирован и ожидает предоплаты' : 'Sargyt hasaba alyndy we tölege garaşylýar',
          color: 'text-amber-500 bg-amber-500/10 border-amber-500/30',
          stepLevel: 0,
        },
        processing: {
          label: lang === 'ru' ? 'В обработке' : 'Işlenilýär',
          desc: lang === 'ru' ? 'Предоплата получена, товар выкупается и готовится к отправке' : 'Deslapky töleg alyndy, haryt satyn alynýar we ýola taýýarlanýar',
          color: 'text-blue-500 bg-blue-500/10 border-blue-500/30',
          stepLevel: 1,
        },
        shipped: {
          label: lang === 'ru' ? 'Отправлен / В пути' : 'Ýolda / Ugradyldy',
          desc: lang === 'ru' ? 'Товар передан в службу доставки и следует в Ашхабад' : 'Haryt ugradyldy we Aşgabada tarap barýar',
          color: 'text-purple-500 bg-purple-500/10 border-purple-500/30',
          stepLevel: 2,
        },
        completed: {
          label: lang === 'ru' ? 'Доставлен' : 'Gowşuryldy',
          desc: lang === 'ru' ? 'Товар прибыл в Ашхабад и успешно доставлен клиенту' : 'Haryt Aşgabada geldi we müşderä gowşuryldy',
          color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30',
          stepLevel: 3,
        },
      };
      return statusMap[status] || statusMap.pending;
    };
  
    // Генерация таймлайна в зависимости от способа доставки
    const generateTimeline = (order: Order) => {
      const isAir = order.shippingMethod.includes('Авиа') || (order.items[0]?.selectedShipping === 'air');
      const createdAt = order.createdAt;
      const statusLevel = getStatusDetails(order.status).stepLevel;
      
      const ONE_DAY = 24 * 3600 * 1000;
  
      let steps = [];
      if (isAir) {
        steps = [
          { title: lang === 'ru' ? 'Склад в Пекине' : 'Pekindäki ammar', daysOffset: 0, icon: Package },
          { title: lang === 'ru' ? 'Загрузка' : 'Ýüklenýär', daysOffset: 2, icon: Truck },
          { title: lang === 'ru' ? 'В Полёте' : 'Uçuşda', daysOffset: 4, icon: Plane },
          { title: lang === 'ru' ? 'Выгрузка и Сортировка' : 'Düşürilýär we paýlanýar', daysOffset: 8, icon: Package },
          { title: lang === 'ru' ? 'Ашхабад❤️' : 'Aşgabat❤️', daysOffset: 12, icon: CheckCircle }
        ];
      } else {
        steps = [
          { title: lang === 'ru' ? 'Склад' : 'Ammar', daysOffset: 0, icon: Package },
          { title: lang === 'ru' ? 'Китайская таможня' : 'Hytaý gümrügi', daysOffset: 2, icon: CheckCircle },
          { title: lang === 'ru' ? 'Казахстан' : 'Gazagystan', daysOffset: 7, icon: Truck },
          { title: lang === 'ru' ? 'Узбекистан' : 'Özbegistan', daysOffset: 15, icon: Truck },
          { title: lang === 'ru' ? 'Таможня Туркменистана' : 'Türkmenistan gümrügi', daysOffset: 22, icon: AlertCircle },
          { title: lang === 'ru' ? 'Спасибо за ожидание ваш заказ в Ашхабаде 😍' : 'Sargydyňyz Aşgabatda, garaşanyňyz üçin sag boluň 😍', daysOffset: 28, icon: CheckCircle }
        ];
      }
  
      // Определяем сколько шагов пройдено
      let currentStepIndex = 0;
      if (statusLevel === 0) currentStepIndex = 0; // pending
      if (statusLevel === 1) currentStepIndex = 1; // processing
      if (statusLevel === 2) {
        // shipped - depends on days passed since createdAt
        const daysPassed = Math.floor((Date.now() - createdAt) / ONE_DAY);
        currentStepIndex = steps.findIndex(s => s.daysOffset > daysPassed) - 1;
        if (currentStepIndex < 2) currentStepIndex = 2; // minimum for shipped
        if (currentStepIndex >= steps.length - 1) currentStepIndex = steps.length - 2; // cap it before completed
      }
      if (statusLevel === 3) currentStepIndex = steps.length - 1; // completed
  
      return steps.map((step, idx) => {
        const stepDate = new Date(createdAt + step.daysOffset * ONE_DAY);
        return {
          ...step,
          isPassed: idx <= currentStepIndex,
          isCurrent: idx === currentStepIndex,
          dateFormatted: stepDate.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'tk-TM', { day: 'numeric', month: 'long', year: 'numeric' })
        };
      });
    };
  
    // Форматирование даты
    const formatDate = (timestamp: number) => {
      return new Date(timestamp).toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

  return (
    <div className={`max-w-4xl mx-auto px-4 py-8 ${isLightTheme ? 'text-gray-900' : 'text-white'}`}>
      {/* Заголовок */}
      <div className="text-center mb-8 flex flex-col items-center">
        <Package className="w-12 h-12 text-gold mb-3" />
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2 uppercase font-sans">
          {lang === 'ru' ? 'Где мой товар?' : 'Harydym nirede?'}
        </h1>
        <p className="text-gray-400 max-w-lg mx-auto text-sm mt-3">
          {lang === 'ru' 
            ? 'Введите уникальный код заказа для отслеживания его местоположения.' 
            : 'Harydyňyzyň nirededigini bilmek üçin sargyt belgisini giriziň.'}
        </p>
      </div>

      {/* Панель поиска */}
      <div className={`p-6 rounded-2xl mb-8 border ${isLightTheme ? 'bg-white border-gray-200 shadow-sm' : 'bg-[#121214] border-zinc-800'}`}>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
              <Search className="w-5 h-5" />
            </span>
            <input
              type="text"
              id="order-id-input-field"
              className={`w-full pl-10 pr-4 py-3 rounded-xl border font-mono text-sm focus:outline-none transition-all ${
                isLightTheme 
                  ? 'bg-gray-50 border-gray-300 text-gray-900 focus:border-amber-500' 
                  : 'bg-zinc-900 border-zinc-700 text-white focus:border-amber-500'
              }`}
              placeholder={lang === 'ru' ? 'Пример: TM-101A2B или TM-202B3C' : 'Mysal üçin: TM-101A2B ýa-da TM-202B3C'}
              value={orderIdInput}
              onChange={(e) => setOrderIdInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearch();
              }}
            />
          </div>
          <button
            id="order-search-btn"
            onClick={() => handleSearch()}
            className="px-8 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4" />
            {lang === 'ru' ? 'Найти' : 'Tap'}
          </button>
        </div>

        {/* Быстрый тест */}
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-gray-400 font-medium">
            {lang === 'ru' ? 'Быстрый тест (кликните для проверки):' : 'Çalt barlamak (görmek üçin basyň):'}
          </span>
          {['TM-101A2B', 'TM-202B3C', 'TM-303C4D'].map((id) => (
            <button
              key={id}
              onClick={() => {
                setOrderIdInput(id);
                handleSearch(id);
              }}
              className={`px-3 py-1 rounded-full border font-mono hover:scale-105 active:scale-95 transition-all ${
                isLightTheme 
                  ? 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300' 
                  : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-700'
              }`}
            >
              {id}
            </button>
          ))}
        </div>
      </div>

      {/* Вывод результатов */}
      <AnimatePresence mode="wait">
        {searched && errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-xl border flex gap-3 items-start ${
              isLightTheme ? 'bg-red-50 border-red-200 text-red-800' : 'bg-red-500/10 border-red-500/20 text-red-200'
            }`}
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
            <div>
              <p className="font-semibold text-sm">
                {lang === 'ru' ? 'Заказ не найден' : 'Sargyt tapylmady'}
              </p>
              <p className="text-xs text-opacity-80 mt-1">{errorMsg}</p>
            </div>
          </motion.div>
        )}

        {searched && foundOrder && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {/* Карточка основного статуса */}
            <div className={`p-6 rounded-2xl border ${isLightTheme ? 'bg-white border-gray-200 shadow-sm' : 'bg-[#121214] border-zinc-800'}`}>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-zinc-800">
                <div>
                  <span className="text-xs text-gray-400 font-mono tracking-wider">
                    {lang === 'ru' ? 'КОД ЗАКАЗА' : 'SARGYT KODY'}
                  </span>
                  <h2 className="text-xl font-bold font-mono text-amber-500 flex items-center gap-2 mt-1">
                    {foundOrder.id}
                  </h2>
                </div>
                <div className="flex flex-col md:items-end">
                  <span className="text-xs text-gray-400">
                    {lang === 'ru' ? 'Статус доставки' : 'Eltip berme ýagdaýy'}
                  </span>
                  <div className={`mt-1.5 px-4 py-1.5 rounded-full border text-xs font-semibold tracking-wide uppercase ${getStatusDetails(foundOrder.status).color}`}>
                    {getStatusDetails(foundOrder.status).label}
                  </div>
                </div>
              </div>

              {/* Интерактивный таймлайн */}
              <div className="py-6 px-2">
                <div className="relative pl-6 space-y-8">
                  {generateTimeline(foundOrder).map((step, idx, arr) => {
                    const StepIcon = step.icon;
                    const isPassed = step.isPassed;
                    const isCurrent = step.isCurrent;
                    const isLast = idx === arr.length - 1;

                    return (
                      <div key={idx} className="relative">
                        {/* Соединительная линия */}
                        {!isLast && (
                          <div className={`absolute left-[11px] top-8 bottom-[-32px] w-0.5 ${
                            isPassed && !isCurrent ? 'bg-amber-500' : isLightTheme ? 'bg-gray-200' : 'bg-zinc-800'
                          }`}></div>
                        )}
                        
                        <div className="flex items-start gap-4">
                          <div 
                            className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center border-2 mt-1 transition-all duration-500 ${
                              isPassed 
                                ? 'bg-amber-500 border-amber-500 text-black shadow-lg shadow-amber-500/20' 
                                : isLightTheme 
                                  ? 'bg-gray-100 border-gray-300 text-gray-400' 
                                  : 'bg-zinc-900 border-zinc-700 text-zinc-500'
                            }`}
                          >
                            {isPassed && !isCurrent ? (
                              <Check className="w-3 h-3 stroke-[3]" />
                            ) : (
                              <StepIcon className="w-3 h-3" />
                            )}
                          </div>
                          
                          <div className="flex flex-col">
                            <span className={`text-sm md:text-base font-bold transition-colors duration-300 ${
                              isCurrent 
                                ? 'text-amber-500' 
                                : isPassed 
                                  ? isLightTheme ? 'text-gray-900' : 'text-white' 
                                  : 'text-gray-500'
                            }`}>
                              {step.title}
                            </span>
                            <span className={`text-xs mt-1 font-mono ${
                              isPassed ? 'text-gray-400' : 'text-gray-600/50'
                            }`}>
                              {step.dateFormatted}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Детальное описание текущего состояния */}
              <div className={`p-4 rounded-xl border text-sm flex gap-3 ${
                isLightTheme ? 'bg-amber-50/50 border-amber-200 text-gray-800' : 'bg-zinc-900/50 border-zinc-800 text-zinc-300'
              }`}>
                <Info className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold">{lang === 'ru' ? 'Текущее состояние' : 'Häzirki ýagdaýy'}</h4>
                  <p className="text-xs mt-1 text-opacity-80 leading-relaxed">
                    {getStatusDetails(foundOrder.status).desc}
                  </p>
                </div>
              </div>
            </div>

            {/* Две колонки: Детали получателя и Детали оплаты */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Получатель */}
              <div className={`p-6 rounded-2xl border ${isLightTheme ? 'bg-white border-gray-200 shadow-sm' : 'bg-[#121214] border-zinc-800'}`}>
                <h3 className="text-base font-bold mb-4 flex items-center gap-2 border-b border-zinc-800 pb-2">
                  <User className="w-4 h-4 text-amber-500" />
                  {lang === 'ru' ? 'Данные получателя' : 'Müşderi maglumatlary'}
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">{lang === 'ru' ? 'Ф.И.О:' : 'F.At:'}</span>
                    <span className="font-medium">{foundOrder.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">{lang === 'ru' ? 'Телефон:' : 'Telefon:'}</span>
                    <span className="font-medium font-mono">{foundOrder.customerPhone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">{lang === 'ru' ? 'Адрес:' : 'Salgy:'}</span>
                    <span className="font-medium text-right max-w-[200px]">{foundOrder.customerAddress}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">{lang === 'ru' ? 'Способ доставки:' : 'Eltip berme usuly:'}</span>
                    <span className="font-medium text-amber-500 flex items-center gap-1">
                      {foundOrder.shippingMethod.includes('Авиа') ? (
                        <Plane className="w-3.5 h-3.5" />
                      ) : (
                        <Truck className="w-3.5 h-3.5" />
                      )}
                      {foundOrder.shippingMethod}
                    </span>
                  </div>
                </div>
              </div>

              {/* Расчет стоимости */}
              <div className={`p-6 rounded-2xl border ${isLightTheme ? 'bg-white border-gray-200 shadow-sm' : 'bg-[#121214] border-zinc-800'}`}>
                <h3 className="text-base font-bold mb-4 flex items-center gap-2 border-b border-zinc-800 pb-2">
                  <CreditCard className="w-4 h-4 text-amber-500" />
                  {lang === 'ru' ? 'Финансовый расчет' : 'Töleg we hasap'}
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">{lang === 'ru' ? 'Общая стоимость:' : 'Jemi baha:'}</span>
                    <span className="font-bold text-amber-500">{foundOrder.totalPrice} TMT</span>
                  </div>
                  {foundOrder.prepaymentAmount !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">{lang === 'ru' ? 'Внесено предоплаты:' : 'Deslapky töleg:'}</span>
                      <span className="font-semibold text-emerald-500">
                        {foundOrder.prepaymentAmount} TMT 
                        <span className="text-[10px] text-gray-500 font-normal ml-1">
                          ({foundOrder.prepaymentMethod === 'courier' ? (lang === 'ru' ? 'курьеру' : 'kuryer') : (lang === 'ru' ? 'в офис' : 'ofis')})
                        </span>
                      </span>
                    </div>
                  )}
                  {foundOrder.remainingBalance !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">{lang === 'ru' ? 'Остаток к оплате:' : 'Galan töleg:'}</span>
                      <span className="font-bold text-rose-500">{foundOrder.remainingBalance} TMT</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-400">{lang === 'ru' ? 'Дата оформления:' : 'Sargyt senesi:'}</span>
                    <span className="font-medium text-xs">{formatDate(foundOrder.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Список товаров в заказе */}
            <div className={`p-6 rounded-2xl border ${isLightTheme ? 'bg-white border-gray-200 shadow-sm' : 'bg-[#121214] border-zinc-800'}`}>
              <h3 className="text-base font-bold mb-4 flex items-center gap-2 border-b border-zinc-800 pb-3">
                <Package className="w-4 h-4 text-amber-500" />
                {lang === 'ru' ? 'Содержимое отправления' : 'Sargydyň harytlary'}
              </h3>
              <div className="divide-y divide-zinc-800">
                {foundOrder.items.map((item, index) => (
                  <div key={index} className="py-3 flex justify-between items-center text-sm first:pt-0 last:pb-0">
                    <div>
                      <h4 className="font-medium text-amber-500">{t(item.productTitle, 'products')}</h4>
                      <p className="text-xs text-gray-400 mt-1 flex items-center gap-2">
                        {item.selectedSize && (
                          <span>{lang === 'ru' ? 'Размер:' : 'Ölçegi:'} {item.selectedSize}</span>
                        )}
                        {item.selectedOption && (
                          <span>{item.selectedOption.name}</span>
                        )}
                        <span>{lang === 'ru' ? 'Доставка:' : 'Eltip berme:'} {item.selectedShipping === 'air' ? (lang === 'ru' ? 'Авиа' : 'Avia') : (lang === 'ru' ? 'Сухопутная' : 'Gury ýol')}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{item.price} TMT</p>
                      <p className="text-xs text-gray-400 mt-1">x{item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
