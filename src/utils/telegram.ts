import { Order } from '../types';

/**
 * Escapes HTML special characters to prevent Telegram API formatting errors.
 */
function escapeHtml(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Sends a highly formatted HTML notification to a Telegram Bot.
 * Proxies through the secure server-side endpoint /api/telegram/send.
 */
export async function sendOrderTelegramNotification(order: Order): Promise<boolean> {
  try {
    const formattedDate = new Date(order.createdAt).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const cleanPhone = order.customerPhone.replace(/[^0-9+]/g, '');
    const escapedCustomerName = escapeHtml(order.customerName);
    const escapedCustomerPhone = escapeHtml(order.customerPhone);
    const escapedCustomerAddress = escapeHtml(order.customerAddress);
    const escapedShippingMethod = escapeHtml(order.shippingMethod);

    // Format order items
    const itemsList = order.items.map((item, idx) => {
      const sizeStr = item.selectedSize ? ` [Размер: ${item.selectedSize}]` : '';
      const optionStr = item.selectedOption ? ` [Опция: ${item.selectedOption.name}]` : '';
      const shippingIcon = item.selectedShipping === 'air' ? '✈️' : '🚛';
      const escapedTitle = escapeHtml(`${item.productTitle}${sizeStr}${optionStr}`);
      return `${idx + 1}. <b>${escapedTitle}</b>\n    ${item.quantity} шт × ${item.price} TMT ${shippingIcon}`;
    }).join('\n');

    let prepaymentSection = '';
    if (order.prepaymentAmount !== undefined) {
      const methodLabel = order.prepaymentMethod === 'courier' 
        ? '🚖 Вызов курьера за авансом (Авто)' 
        : '🏢 Клиент приедет лично в офис';
      prepaymentSection = `💳 <b>Внесенный аванс:</b> ${order.prepaymentAmount} TMT\n` +
        `ℹ️ <b>Способ передачи:</b> ${escapeHtml(methodLabel)}\n` +
        `📉 <b>Остаток при получении:</b> <b>${order.remainingBalance} TMT</b>\n` +
        `━━━━━━━━━━━━━━━━━━\n`;
    }

    // Build the beautiful HTML message
    const message = `🔔 <b>НОВЫЙ ЗАКАЗ В LEVEL UP</b>\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `🆔 <b>Заказ:</b> <code>#${escapeHtml(order.id.split('-')[1] || order.id)}</code>\n` +
      `📅 <b>Дата:</b> ${escapeHtml(formattedDate)}\n\n` +
      `👤 <b>Клиент:</b> ${escapedCustomerName}\n` +
      `📞 <b>Телефон:</b> ${escapedCustomerPhone}\n` +
      `📍 <b>Адрес:</b> ${escapedCustomerAddress}\n` +
      `🚚 <b>Доставка:</b> ${escapedShippingMethod}\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `📦 <b>Содержимое заказа:</b>\n${itemsList}\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      prepaymentSection +
      `💰 <b>ОБЩАЯ СУММА ЗАКАЗА:</b> <b>${order.totalPrice.toLocaleString('ru-RU')} TMT</b>\n\n` +
      `👉 <a href="tel:${cleanPhone}">Позвонить клиенту</a> | <a href="tel:${cleanPhone}">Чат в IMO</a>`;

    const url = `/api/telegram/send`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: message,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Telegram API proxy response error:', errorText);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to send Telegram notification:', error);
    return false;
  }
}

/**
 * Triggers a test message to Telegram to verify credentials.
 */
export async function testTelegramNotification(): Promise<{ success: boolean; message: string }> {
  try {
    const url = `/api/telegram/send`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: '🔔 <b>Тестовое уведомление LEVEL UP</b>\n\nПоздравляем! Ваша интеграция с Telegram работает успешно! 🎉',
        parse_mode: 'HTML',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, message: `Ошибка API Telegram прокси: ${errorText}` };
    }

    return { success: true, message: 'Тестовое уведомление успешно отправлено!' };
  } catch (error: any) {
    return { success: false, message: `Ошибка сети/запроса: ${error.message || error}` };
  }
}
