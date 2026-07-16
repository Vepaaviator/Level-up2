import { Product } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  // --- АВТОТОВАРЫ ---
  {
    id: 'auto-custom-mats',
    title: 'Кожаные 3D-коврики ручной работы (на заказ)',
    description: 'Эксклюзивные многослойные 3D-коврики из премиальной экокожи на заказ напрямую с фабрики. Изготавливаются строго индивидуально под марку и модель вашего автомобиля. Идеально повторяют контуры пола, надежно фиксируются и защищают салон от влаги и грязи. Срок доставки: Авиа — 10-15 дней, Авто — 25-30 дней.',
    price: 1800,
    oldPrice: 2200,
    image: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=600&q=80'
    ],
    weight: 4.5,
    category: 'auto',
    subcategory: 'mats',
    inStock: true,
    customOptions: [
      { name: 'Только салон', priceModifier: 0 },
      { name: 'Салон + Багажник', priceModifier: 750 }
    ],
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 0.5
  },
  {
    id: 'auto-car-cover',
    title: 'Премиальный всесезонный тент-чехол для автомобиля',
    description: 'Защитный чехол из высокопрочного четырехслойного материала с мягкой хлопковой подкладкой. Надежно предохраняет кузов от палящего солнца, царапин, сильного ветра, пыли и птичьего помета. Оснащен светоотражающими полосами для ночной безопасности.',
    price: 680,
    oldPrice: 850,
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80'
    ],
    weight: 3.5,
    category: 'auto',
    subcategory: 'car_cover',
    inStock: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 1.5
  },
  {
    id: 'auto-seat-cover',
    title: 'Ортопедические накидки-чехлы из премиум-алькантары',
    description: 'Комплект роскошных накидок из износостойкой итальянской алькантары с анатомической поддержкой спины. Идеальная посадка, не скользят, защищают кожаные и тканевые сидения от износа. Зимой сохраняют тепло, летом дышат.',
    price: 1200,
    oldPrice: 1500,
    image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=600&q=80'
    ],
    weight: 2.8,
    category: 'auto',
    subcategory: 'seat_cover',
    inStock: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 1.8
  },
  {
    id: 'auto-armrest-mats',
    title: 'Силиконовые коврики в ниши подстаканников и подлокотник',
    description: 'Набор точных противоскользящих силиконовых ковриков для ниш дверей, центральной консоли и подлокотника. Препятствуют дребезжанию ключей и монет, поглощают влагу и легко моются.',
    price: 150,
    image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=600&q=80'
    ],
    weight: 0.4,
    category: 'auto',
    subcategory: 'armrest_mats',
    inStock: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2.2
  },
  {
    id: 'auto-headlight-lens',
    title: 'Защитные поликарбонатные стекла для передних фар',
    description: 'Высокопрочные стекла (линзы) передних блок-фар из оптического поликарбоната с двухсторонним защитным UV-лаком. Полностью восстанавливают кристальную прозрачность головного света и защищают от камней.',
    price: 490,
    oldPrice: 600,
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80'
    ],
    weight: 1.2,
    category: 'auto',
    subcategory: 'lights_glass_body',
    inStock: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2.5
  },
  {
    id: 'auto-1',
    title: 'Кожаный органайзер в багажник Premium',
    description: 'Изысканный органайзер из износостойкой экокожи с золотистой прострочкой. Идеально организует пространство багажника, придавая ему эстетичный вид. Имеет внутренние перегородки и боковые ручки для переноски.',
    price: 350,
    oldPrice: 450,
    image: 'https://images.unsplash.com/photo-1616422285623-13ff0162193c?auto=format&fit=crop&w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1616422285623-13ff0162193c?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=600&q=80'
    ],
    weight: 2.0,
    category: 'auto',
    subcategory: 'others',
    inStock: true,
    customOptions: [
      { name: 'Стандартный размер (S)', priceModifier: 0 },
      { name: 'Увеличенный размер (M)', priceModifier: 80 },
      { name: 'Максимальный объем (L)', priceModifier: 150 }
    ],
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5
  },
  {
    id: 'auto-2',
    title: 'Металлический держатель MagSafe с зарядкой',
    description: 'Магнитный держатель для телефона из авиационного алюминия с беспроводной быстрой зарядкой Qi 15W. Надежно крепится на воздуховод, сохраняя стабильность смартфона на любых неровностях дороги.',
    price: 220,
    image: 'https://images.unsplash.com/photo-1586105251261-72a756497a11?auto=format&fit=crop&w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1586105251261-72a756497a11?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1544200175-ca6e80a7b325?auto=format&fit=crop&w=600&q=80'
    ],
    weight: 0.3,
    category: 'auto',
    subcategory: 'others',
    inStock: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 4
  },
  {
    id: 'auto-3',
    title: 'Арома-диффузор из натурального дерева',
    description: 'Эксклюзивный подвесной ароматизатор ручной работы, выполненный из ценных пород дерева. В комплекте флакон с селективным парфюмом, который постепенно насыщает салон благородным шлейфом.',
    price: 120,
    oldPrice: 160,
    image: 'https://images.unsplash.com/photo-1615396899839-c99c121888b0?auto=format&fit=crop&w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1615396899839-c99c121888b0?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80'
    ],
    weight: 0.1,
    category: 'auto',
    subcategory: 'others',
    inStock: true,
    customOptions: [
      { name: 'Аромат: Сандал & Ваниль', priceModifier: 0 },
      { name: 'Аромат: Черный Кожаный', priceModifier: 0 },
      { name: 'Аромат: Элитный Табак', priceModifier: 20 }
    ],
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3
  },
  {
    id: 'auto-4',
    title: 'Цифровой портативный компрессор',
    description: 'Умный беспроводной насос с LCD-дисплеем и автоматическим отключением при достижении заданного давления. Оснащен ярким LED-фонарем для работы в темное время суток и функцией повербанка.',
    price: 480,
    image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=600&q=80'
    ],
    weight: 1.0,
    category: 'auto',
    subcategory: 'others',
    inStock: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2
  },

  // --- ОДЕЖДА (МУЖСКОЕ) ---
  {
    id: 'cloth-m1',
    title: 'Классическое кашемировое пальто LLU',
    description: 'Двубортное пальто премиального кроя из мягкого натурального кашемира. Идеальная посадка по фигуре, глубокий бежевый оттенок, шелковистая внутренняя подкладка. Подчеркнет безупречный статус своего владельца.',
    price: 2200,
    oldPrice: 2800,
    image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&w=600&q=80'
    ],
    weight: 1.6,
    category: 'clothing',
    gender: 'men',
    subcategory: 'куртки', // куртки/верхняя одежда
    sizes: ['S', 'M', 'L', 'XL'],
    customOptions: [
      { name: 'Обычная упаковка', priceModifier: 0 },
      { name: 'Подарочный фирменный бокс LLU', priceModifier: 120 }
    ],
    inStock: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 6
  },
  {
    id: 'cloth-m-jacket1',
    title: 'Мужская куртка-бомбер замшевая Premium',
    description: 'Куртка-бомбер из ультрамягкой натуральной замши премиальной выделки. Классический крой с эластичными манжетами и воротником. Удобные внутренние карманы на молнии.',
    price: 1900,
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=80'
    ],
    weight: 1.4,
    category: 'clothing',
    gender: 'men',
    subcategory: 'куртки',
    sizes: ['M', 'L', 'XL'],
    inStock: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 6.5
  },
  {
    id: 'cloth-m2',
    title: 'Водолазка из мериносовой шерсти',
    description: 'Тонкий, но невероятно теплый свитер-водолазка из 100% ультратонкой шерсти мериноса. Превосходно дышит, не колется и сохраняет форму после множества стирок. Идеальная базовая вещь.',
    price: 650,
    image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=600&q=80'
    ],
    weight: 0.4,
    category: 'clothing',
    gender: 'men',
    subcategory: 'футболки', // в категорию футболки и трикотаж
    sizes: ['M', 'L', 'XL'],
    inStock: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 7
  },
  {
    id: 'cloth-m-tee1',
    title: 'Мужская оверсайз футболка LLU Heavyweight',
    description: 'Плотная футболка из 100% органического хлопка премиального качества (плотность 280 г/м²). Спущенная линия плеча, широкий воротник в рубчик, износостойкий материал.',
    price: 280,
    oldPrice: 350,
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&w=600&q=80'
    ],
    weight: 0.3,
    category: 'clothing',
    gender: 'men',
    subcategory: 'футболки',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    inStock: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5.5
  },
  {
    id: 'cloth-m3',
    title: 'Кожаные ботинки Челси ручной работы',
    description: 'Элегантные челси из натуральной итальянской кожи растительного дубления. Кожаная подошва с резиновым профилактическим протектором, прочные эластичные вставки по бокам для легкого надевания.',
    price: 1500,
    oldPrice: 1900,
    image: 'https://images.unsplash.com/photo-1613852348851-df1739db8201?auto=format&fit=crop&w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1613852348851-df1739db8201?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80'
    ],
    weight: 1.2,
    category: 'clothing',
    gender: 'men',
    subcategory: 'обувь',
    sizes: ['41', '42', '43', '44'],
    inStock: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 8
  },

  // --- ОДЕЖДА (ЖЕНСКОЕ) ---
  {
    id: 'cloth-w1',
    title: 'Шёлковое платье-комбинация LLU Premium',
    description: 'Чувственное платье на тонких регулируемых бретелях из плотного натурального малбери-шёлка. Мягко струится по телу, создавая изящный силуэт с благородным деликатным мерцанием.',
    price: 1100,
    image: 'https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?auto=format&fit=crop&w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=600&q=80'
    ],
    weight: 0.3,
    category: 'clothing',
    gender: 'women',
    subcategory: 'платья',
    sizes: ['XS', 'S', 'M', 'L'],
    customOptions: [
      { name: 'Обычная упаковка', priceModifier: 0 },
      { name: 'Фирменный шелковый мешочек LLU', priceModifier: 50 }
    ],
    inStock: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 9
  },
  {
    id: 'cloth-w2',
    title: 'Шерстяной блейзер оверсайз',
    description: 'Структурированный двубортный блейзер свободного кроя. Выполнен из плотной костюмной шерсти, отлично держит форму плеч. Прекрасно сочетается как с классическими брюками, так и с джинсами.',
    price: 1300,
    oldPrice: 1600,
    image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=600&q=80'
    ],
    weight: 0.9,
    category: 'clothing',
    gender: 'women',
    subcategory: 'куртки', // к курткам / пиджакам
    sizes: ['S', 'M', 'L'],
    inStock: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 10
  },
  {
    id: 'cloth-w-jacket1',
    title: 'Женская укороченная кожаная куртка LLU',
    description: 'Стильная косуха из мягчайшей овечьей кожи наппа. Укороченный крой, премиальная фурнитура YKK, идеальная посадка. Базовый элемент для ультрамодных весенних образов.',
    price: 2100,
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&q=80'
    ],
    weight: 1.3,
    category: 'clothing',
    gender: 'women',
    subcategory: 'куртки',
    sizes: ['XS', 'S', 'M', 'L'],
    inStock: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 10.5
  },
  {
    id: 'cloth-w3',
    title: 'Кожаная минималистичная сумка-багет',
    description: 'Лаконичная женская сумка кросс-боди из мягкой зернистой кожи. Внутреннее отделение с замшевой подкладкой, качественная латунная фурнитура в золотистом исполнении. Стильный акцент любого образа.',
    price: 1600,
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=600&q=80'
    ],
    weight: 0.7,
    category: 'clothing',
    gender: 'women',
    subcategory: 'аксессуары',
    sizes: ['One Size'],
    inStock: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 11
  },
  {
    id: 'cloth-w-shoes1',
    title: 'Женские замшевые босоножки LLU',
    description: 'Утонченные босоножки из натуральной замши на устойчивом каблуке. Кожаная стелька анатомической формы, удобный ремешок для фиксации щиколотки. Подходят для вечерних и повседневных выходов.',
    price: 950,
    image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1535043934128-cf0b28d52f95?auto=format&fit=crop&w=600&q=80'
    ],
    weight: 0.6,
    category: 'clothing',
    gender: 'women',
    subcategory: 'обувь',
    sizes: ['36', '37', '38', '39', '40'],
    inStock: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 9.5
  },

  // --- ДОМ И УЮТ ---
  {
    id: 'home-candle',
    title: 'Арома-свеча Premium Soy Wax LLU',
    description: 'Дизайнерская селективная свеча из 100% натурального соевого воска в матовом стеклянном стакане со стильной деревянной крышкой. Деревянный фитиль при горении уютно потрескивает, создавая эффект камина. Время горения — до 50 часов.',
    price: 180,
    oldPrice: 240,
    image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?auto=format&fit=crop&w=600&q=80'
    ],
    weight: 0.4,
    category: 'home',
    subcategory: 'декор',
    inStock: true,
    customOptions: [
      { name: 'Аромат: Табак & Ваниль', priceModifier: 0 },
      { name: 'Аромат: Инжир & Дикая груша', priceModifier: 0 },
      { name: 'Аромат: Хвойный Лес & Кедр', priceModifier: 15 }
    ],
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 1
  },
  {
    id: 'home-vase',
    title: 'Дизайнерская керамическая ваза LLU Harmony',
    description: 'Уникальная ваза из матовой шамотной глины, выполненная в стиле органического минимализма. Плавные асимметричные изгибы идеально впишутся в современный интерьер и станут самодостаточным арт-объектом.',
    price: 450,
    image: 'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?auto=format&fit=crop&w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1581781870027-04212e231e96?auto=format&fit=crop&w=600&q=80'
    ],
    weight: 1.8,
    category: 'home',
    subcategory: 'декор',
    inStock: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2
  },
  {
    id: 'home-linen',
    title: 'Комплект постельного белья из Тенселя LLU',
    description: 'Элитное постельное белье из 100% тенселя (волокно эвкалипта) с шелковистым финишем. Обладает естественным охлаждающим эффектом, невероятно нежное на ощупь, гипоаллергенное и износостойкое. Дарит королевский комфорт во время сна.',
    price: 1800,
    oldPrice: 2200,
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80'
    ],
    weight: 2.6,
    category: 'home',
    subcategory: 'текстиль',
    sizes: ['Полуторный', 'Евро-стандарт', 'Семейный (2 пододеяльника)'],
    inStock: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3
  },
  {
    id: 'home-rug',
    title: 'Мягкий премиум коврик для ванной LLU SoftCloud',
    description: 'Ультра-впитывающий гипоаллергенный коврик для ванной с плотным высоким ворсом из микрофибры. Имеет латексную нескользящую основу. Дарит приятную мягкость уставшим ногам после водных процедур.',
    price: 250,
    image: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=600&q=80'
    ],
    weight: 0.8,
    category: 'home',
    subcategory: 'текстиль',
    inStock: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 4
  },
  {
    id: 'access-m-watch1',
    title: 'Мужские механические часы LLU Chrono Skeleton Premium',
    description: 'Изысканные механические часы с открытым механизмом (скелетон). Сапфировое стекло, корпус из нержавеющей хирургической стали 316L, японский автоподзавод. Ремешок из натуральной кожи крокодила. Идеальный аксессуар для ценителей точной механики.',
    price: 4200,
    oldPrice: 5500,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80'
    ],
    weight: 0.25,
    category: 'accessories',
    gender: 'men',
    subcategory: 'watches',
    inStock: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 0.1
  },
  {
    id: 'access-m-belt1',
    title: 'Мужской кожаный ремень LLU Classic Gold',
    description: 'Ремень ручной работы из цельного куска премиальной итальянской кожи растительного дубления. Классическая латунная пряжка с золотым напылением. Дополнит как деловой костюм, так и повседневные джинсы.',
    price: 650,
    oldPrice: 850,
    image: 'https://images.unsplash.com/photo-1624222247344-550fb8ecf7db?auto=format&fit=crop&w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1624222247344-550fb8ecf7db?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=600&q=80'
    ],
    weight: 0.35,
    category: 'accessories',
    gender: 'men',
    subcategory: 'accessories',
    sizes: ['105 см', '115 см', '125 см'],
    inStock: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 0.2
  },
  {
    id: 'access-w-watch1',
    title: 'Женские кварцевые часы LLU Luxury Diamond',
    description: 'Утонченные женские часы, украшенные сияющими кристаллами фианитов. Тонкий миланский сетчатый браслет из ювелирной стали с PVD-покрытием розового золота. Перламутровый циферблат и надежный швейцарский механизм.',
    price: 3100,
    oldPrice: 3900,
    image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=600&q=80'
    ],
    weight: 0.15,
    category: 'accessories',
    gender: 'women',
    subcategory: 'watches',
    inStock: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 0.3
  },
  {
    id: 'access-w-accessory1',
    title: 'Очки солнцезащитные LLU Black Cat-Eye',
    description: 'Роскошные солнцезащитные очки формы "кошачий глаз". Оправа из прочного гипоаллергенного ацетата целлюлозы. Темные поляризованные линзы с максимальной защитой от ультрафиолета UV400. Премиальный кожаный чехол в комплекте.',
    price: 890,
    oldPrice: 1100,
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=600&q=80'
    ],
    weight: 0.1,
    category: 'accessories',
    gender: 'women',
    subcategory: 'accessories',
    inStock: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 0.4
  }
];
