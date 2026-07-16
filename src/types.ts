export interface ProductOption {
  name: string;
  priceModifier: number;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  oldPrice?: number; // Скидка (опционально)
  image: string; // Ссылка на главное фото или base64
  images?: string[]; // Несколько дополнительных фото ("Фото товара будет не одним имейте ввиду")
  weight?: number; // Вес товара в кг для расчета доставки (по умолчанию 1кг)
  category: 'auto' | 'clothing' | 'home' | 'accessories'; // Добавлен 'home' (Дом и уют) и 'accessories' (Часы и Аксессуары)
  gender?: 'men' | 'women'; // Для одежды
  subcategory?: string; // Будет обувь, футболки, куртки, декор, текстиль и т.д.
  sizes?: string[]; // Например, ['S', 'M', 'L', 'XL']
  customOptions?: ProductOption[]; // Например, 'Только салон' (+0 TMT) и 'Салон + Багажник' (+1200 TMT)
  inStock: boolean;
  createdAt: number;
}

export interface CartItem {
  product: Product;
  selectedSize?: string;
  selectedOption?: ProductOption;
  selectedShipping: 'air' | 'truck'; // 'air' (Авиа 10-15 дней) или 'truck' (Фура 25-30 дней)
  shippingCost: number; // Расчитанная стоимость доставки на основе веса и тарифа
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  shippingMethod: string;
  items: {
    productId: string;
    productTitle: string;
    price: number;
    selectedSize?: string;
    selectedOption?: ProductOption;
    selectedShipping: 'air' | 'truck';
    shippingCost: number;
    quantity: number;
  }[];
  totalPrice: number;
  prepaymentAmount?: number;
  prepaymentMethod?: 'courier' | 'office';
  remainingBalance?: number;
  status: 'pending' | 'processing' | 'shipped' | 'completed';
  createdAt: number;
}

export interface Review {
  id: string;
  productId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: number;
}


