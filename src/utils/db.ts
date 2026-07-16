import { Product, Order } from '../types';
import { INITIAL_PRODUCTS } from '../data/initialProducts';

const PRODUCTS_KEY = 'levelup_products';
const ORDERS_KEY = 'levelup_orders';

export const dbService = {
  // --- PRODUCTS ---
  getProducts(): Product[] {
    const stored = localStorage.getItem(PRODUCTS_KEY);
    if (!stored) {
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(INITIAL_PRODUCTS));
      return INITIAL_PRODUCTS;
    }
    try {
      const products: Product[] = JSON.parse(stored);
      // Проверяем наличие новой категории "home" (Дом и уют), новой авто-подкатегории и новой категории "accessories" в localStorage
      const hasHomeCategory = products.some(p => p.category === 'home');
      const hasNewAutoSubcategory = products.some(p => p.subcategory === 'lights_glass_body');
      const hasAccessoriesCategory = products.some(p => p.category === 'accessories');
      if (!hasHomeCategory || !hasNewAutoSubcategory || !hasAccessoriesCategory) {
        localStorage.setItem(PRODUCTS_KEY, JSON.stringify(INITIAL_PRODUCTS));
        return INITIAL_PRODUCTS;
      }
      return products;
    } catch {
      return INITIAL_PRODUCTS;
    }
  },

  saveProducts(products: Product[]): void {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  },

  addProduct(productData: Omit<Product, 'id' | 'createdAt'>): Product {
    const products = this.getProducts();
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      createdAt: Date.now()
    };
    products.unshift(newProduct);
    this.saveProducts(products);
    return newProduct;
  },

  updateProduct(updatedProduct: Product): void {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === updatedProduct.id);
    if (index !== -1) {
      products[index] = updatedProduct;
      this.saveProducts(products);
    }
  },

  deleteProduct(id: string): void {
    const products = this.getProducts();
    const filtered = products.filter(p => p.id !== id);
    this.saveProducts(filtered);
  },

  // --- ORDERS ---
  getOrders(): Order[] {
    const stored = localStorage.getItem(ORDERS_KEY);
    const seedOrders: Order[] = [
      {
        id: 'TM-101A2B',
        customerName: 'Максат Дурдыев',
        customerPhone: '+993 65 123456',
        customerAddress: 'г. Ашхабад, ул. Махтумкули, д. 45',
        shippingMethod: 'Авиа заказ (10-15 дней)',
        items: [
          {
            productId: 'auto-custom-mats',
            productTitle: 'Кожаные 3D-коврики ручной работы (на заказ)',
            price: 1800,
            selectedShipping: 'air',
            shippingCost: 150,
            quantity: 1
          }
        ],
        totalPrice: 1950,
        prepaymentAmount: 500,
        prepaymentMethod: 'courier',
        remainingBalance: 1450,
        status: 'completed',
        createdAt: Date.now() - 5 * 24 * 3600 * 1000
      },
      {
        id: 'TM-202B3C',
        customerName: 'Гуля Нурмурадова',
        customerPhone: '+993 61 987654',
        customerAddress: 'г. Ашхабад, 10-й мкрн, д. 12, кв. 4',
        shippingMethod: 'Авиа заказ (10-15 дней)',
        items: [
          {
            productId: 'access-w-watch1',
            productTitle: 'Женские кварцевые часы LLU Luxury Diamond',
            price: 3100,
            selectedShipping: 'air',
            shippingCost: 50,
            quantity: 1
          }
        ],
        totalPrice: 3150,
        prepaymentAmount: 1000,
        prepaymentMethod: 'office',
        remainingBalance: 2150,
        status: 'shipped',
        createdAt: Date.now() - 2 * 24 * 3600 * 1000
      },
      {
        id: 'TM-303C4D',
        customerName: 'Арслан Аманов',
        customerPhone: '+993 63 456789',
        customerAddress: 'г. Мары, ул. Битараплык, д. 8',
        shippingMethod: 'Сухопутный заказ (25-30 дней)',
        items: [
          {
            productId: 'auto-1',
            productTitle: 'Кожаный органайзер в багажник Premium',
            price: 350,
            selectedShipping: 'truck',
            shippingCost: 100,
            quantity: 1
          }
        ],
        totalPrice: 450,
        prepaymentAmount: 150,
        prepaymentMethod: 'courier',
        remainingBalance: 300,
        status: 'processing',
        createdAt: Date.now() - 1 * 24 * 3600 * 1000
      }
    ];

    if (!stored) {
      localStorage.setItem(ORDERS_KEY, JSON.stringify(seedOrders));
      return seedOrders;
    }
    
    try {
      const parsedOrders: Order[] = JSON.parse(stored);
      // Migrate old IDs if they still exist
      let migrated = false;
      parsedOrders.forEach(o => {
        if (o.id === 'ord-101') { o.id = 'TM-101A2B'; migrated = true; }
        if (o.id === 'ord-202') { o.id = 'TM-202B3C'; migrated = true; }
        if (o.id === 'ord-303') { o.id = 'TM-303C4D'; migrated = true; }
      });
      if (migrated) {
        localStorage.setItem(ORDERS_KEY, JSON.stringify(parsedOrders));
      }
      return parsedOrders;
    } catch {
      return [];
    }
  },

  saveOrders(orders: Order[]): void {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  },

  createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'status'>): Order {
    const orders = this.getOrders();
    const generateCode = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let code = 'TM-';
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return code;
    };
    
    const newOrder: Order = {
      ...orderData,
      id: generateCode(),
      status: 'pending',
      createdAt: Date.now()
    };
    orders.unshift(newOrder);
    this.saveOrders(orders);
    return newOrder;
  },

  updateOrderStatus(orderId: string, status: Order['status']): void {
    const orders = this.getOrders();
    const index = orders.findIndex(o => o.id === orderId);
    if (index !== -1) {
      orders[index].status = status;
      this.saveOrders(orders);
    }
  }
};
