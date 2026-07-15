import { Product, StockEntry, Review, Order, Customer } from "./types";

export const CATEGORIES = ["Krossovka", "Klassik", "Lofer", "Skechers", "Etik", "Tapochka"] as const;
export const BRANDS = ["Qadam", "Zamin", "Uzstep", "Terra", "Volna", "Silk Road", "Atlas"] as const;
export const MATERIALS = ["Charm", "Zamsh", "Mesh", "Tekstil", "Rezina"] as const;
export const SIZES = [36, 37, 38, 39, 40, 41, 42, 43, 44, 45];
export const PROVINCES = [
  "Toshkent shahri", "Toshkent viloyati", "Samarqand", "Buxoro", "Andijon",
  "Farg'ona", "Namangan", "Qashqadaryo", "Surxondaryo", "Xorazm",
  "Navoiy", "Jizzax", "Sirdaryo", "Qoraqalpog'iston",
];

export const PRODUCTS: Product[] = [
  {
    id: "p1", name: "Court Classic", brand: "Qadam", gender: "Erkaklar",
    category: "Klassik", material: "Charm", price: 1115000, rating: 4.8, ratingCount: 24,
    description: "Klassik uslubdagi charm poyabzal — ish va kundalik kiyimga bir xilda mos keladi.",
    colors: ["#1b1a16", "#6b4a2f"], sizes: [40, 41, 42, 43, 44], sold: 89,
    createdAt: "2026-05-02",
  },
  {
    id: "p2", name: "Aero 270 Runner", brand: "Zamin", gender: "Erkaklar",
    category: "Krossovka", material: "Mesh", price: 890000, rating: 4.6, ratingCount: 51,
    description: "Yengil mesh matodan tayyorlangan yugurish krossovkasi, kuniga uzoq yurish uchun qulay.",
    colors: ["#1b1a16", "#f4f1ea", "#a83232"], sizes: [39, 40, 41, 42, 43, 44], sold: 143,
    createdAt: "2026-04-18",
  },
  {
    id: "p3", name: "Milano Loafer", brand: "Uzstep", gender: "Erkaklar",
    category: "Lofer", material: "Charm", price: 590000, oldPrice: 690000, rating: 4.3, ratingCount: 12,
    description: "Italyancha uslubdagi loafer — rasmiy va yarim-rasmiy tadbirlar uchun.",
    colors: ["#6b4a2f"], sizes: [40, 41, 42, 43], sold: 34,
    createdAt: "2026-03-11",
  },
  {
    id: "p4", name: "Riviera Sandal", brand: "Terra", gender: "Ayollar",
    category: "Tapochka", material: "Tekstil", price: 420000, rating: 4.1, ratingCount: 8,
    description: "Yozgi kunlar uchun yengil va nafis sandal.",
    colors: ["#f4f1ea", "#2c4a7a"], sizes: [36, 37, 38, 39], sold: 21,
    createdAt: "2026-06-01",
  },
  {
    id: "p5", name: "City Runner Pro", brand: "Volna", gender: "Erkaklar",
    category: "Krossovka", material: "Mesh", price: 980000, rating: 4.7, ratingCount: 33,
    description: "Shahar sharoitida kundalik foydalanish uchun mustahkam va yengil krossovka.",
    colors: ["#1b1a16", "#2c4a7a"], sizes: [41, 42, 43, 44, 45], sold: 67,
    createdAt: "2026-05-20",
  },
  {
    id: "p6", name: "Chelsea Boot", brand: "Silk Road", gender: "Ayollar",
    category: "Etik", material: "Charm", price: 1290000, rating: 4.9, ratingCount: 6,
    description: "Qishki mavsum uchun issiq va bardoshli charm botinka.",
    colors: ["#1b1a16"], sizes: [37, 38, 39, 40], isNew: true, sold: 9,
    createdAt: "2026-07-05",
  },
  {
    id: "p7", name: "Skechers Air Cool", brand: "Atlas", gender: "Ayollar",
    category: "Skechers", material: "Mesh", price: 750000, rating: 4.4, ratingCount: 19,
    description: "Yumshoq amortizatsiyaga ega, kun bo'yi qulaylik ta'minlaydigan model.",
    colors: ["#f4f1ea", "#a83232"], sizes: [36, 37, 38, 39, 40], sold: 52,
    createdAt: "2026-04-29",
  },
  {
    id: "p8", name: "Kids Bounce", brand: "Qadam", gender: "Bolalar",
    category: "Krossovka", material: "Tekstil", price: 350000, rating: 4.5, ratingCount: 14,
    description: "Bolalar uchun yengil va chidamli kundalik krossovka.",
    colors: ["#2c4a7a", "#a83232"], sizes: [36, 37, 38], sold: 41,
    createdAt: "2026-06-15",
  },
  {
    id: "p9", name: "Suede Derby", brand: "Zamin", gender: "Erkaklar",
    category: "Klassik", material: "Zamsh", price: 980000, oldPrice: 1150000, rating: 4.6, ratingCount: 17,
    description: "Zamsh materialidan tayyorlangan derby poyabzal, muloyim va nafis ko'rinish.",
    colors: ["#8a8880", "#1b1a16"], sizes: [40, 41, 42, 43, 44], sold: 28,
    createdAt: "2026-02-27",
  },
  {
    id: "p10", name: "Home Slipper Plush", brand: "Terra", gender: "Uniseks",
    category: "Tapochka", material: "Tekstil", price: 180000, rating: 4.2, ratingCount: 22,
    description: "Uy sharoiti uchun yumshoq va issiq shippak.",
    colors: ["#d8c7a8", "#8a8880"], sizes: [37, 38, 39, 40, 41, 42], sold: 76,
    createdAt: "2026-05-09",
  },
  {
    id: "p11", name: "Trail Blazer", brand: "Volna", gender: "Erkaklar",
    category: "Krossovka", material: "Rezina", price: 1050000, rating: 4.7, ratingCount: 15,
    description: "Tog'-adir sharoitida yurish uchun mustahkam taglikka ega krossovka.",
    colors: ["#1b1a16", "#0a5c3a"], sizes: [41, 42, 43, 44], sold: 18,
    createdAt: "2026-06-22",
  },
  {
    id: "p12", name: "Women's Ballet Flat", brand: "Uzstep", gender: "Ayollar",
    category: "Lofer", material: "Charm", price: 540000, rating: 4.0, ratingCount: 9,
    description: "Yengil va qulay balet uslubidagi charm poyabzal.",
    colors: ["#1b1a16", "#a83232", "#d8c7a8"], sizes: [36, 37, 38, 39, 40], sold: 31,
    createdAt: "2026-03-30",
  },
];

function seedStockForProduct(product: Product): StockEntry[] {
  const entries: StockEntry[] = [];
  const base = Math.floor(product.sold / (product.colors.length * product.sizes.length)) + 2;
  product.colors.forEach((colorHex, ci) => {
    product.sizes.forEach((size, si) => {
      const variance = [-2, 0, 3][(ci + si) % 3];
      const quantity = Math.max(0, base + variance);
      entries.push({ productId: product.id, colorHex, size, quantity });
    });
  });
  return entries;
}

// p4 (Riviera Sandal) is fully sold out to demonstrate the pre-order flow.
// p5 (City Runner Pro) has a couple of low-stock / sold-out sizes to demonstrate size-button disabling.
export const STOCK: StockEntry[] = PRODUCTS.flatMap((p) => {
  if (p.id === "p4") {
    return p.colors.flatMap((colorHex) =>
      p.sizes.map((size) => ({ productId: p.id, colorHex, size, quantity: 0 }))
    );
  }
  if (p.id === "p5") {
    return seedStockForProduct(p).map((e) => {
      if (e.size === 42) return { ...e, quantity: 0 };
      if (e.size === 43) return { ...e, quantity: 2 };
      return e;
    });
  }
  return seedStockForProduct(p);
});

export function getStock(productId: string, colorHex: string, size: number): number {
  return STOCK.find((s) => s.productId === productId && s.colorHex === colorHex && s.size === size)?.quantity ?? 0;
}

export function getTotalStock(productId: string): number {
  return STOCK.filter((s) => s.productId === productId).reduce((sum, s) => sum + s.quantity, 0);
}

export const REVIEWS: Review[] = [
  {
    id: "r1", productId: "p1", customerName: "Dilnoza Karimova", rating: 5,
    text: "Juda qulay va sifatli, tavsiya qilaman!", status: "approved", createdAt: "2026-07-03",
  },
  {
    id: "r2", productId: "p2", customerName: "Sardor Aliyev", rating: 5,
    text: "Original mahsulot, juda yengil va qulay. Yana buyurtma beraman.", status: "approved", createdAt: "2026-06-30",
  },
  {
    id: "r3", productId: "p7", customerName: "Malika Yusupova", rating: 4,
    text: "Sayt qulay, yetkazib berish tez bo'ldi. Rangi rasmga nisbatan biroz och.", status: "pending", createdAt: "2026-07-10",
  },
];

export const CUSTOMERS: Customer[] = [
  {
    id: "c1", ism: "Dilnoza", familiya: "Karimova", phone: "+998901234567",
    viloyat: "Toshkent shahri", manzil: "Chilonzor tumani, 19-kvartal, 4-uy",
    totalSpent: 1115000, orderCount: 1,
  },
];

export const ORDERS: Order[] = [
  {
    id: "o1", orderNumber: "PS-482910", customerName: "Dilnoza Karimova", phone: "+998901234567",
    address: "Toshkent shahri, Chilonzor tumani, 19-kvartal, 4-uy", payment: "Naqd pul",
    total: 1115000, status: "Yetkazildi", isPreorder: false,
    lines: [{ productId: "p1", productName: "Court Classic", colorHex: "#1b1a16", size: 42, qty: 1, unitPrice: 1115000 }],
    createdAt: "2026-07-02",
  },
  {
    id: "o2", orderNumber: "PS-471203", customerName: "Sardor Aliyev", phone: "+998907654321",
    address: "Samarqand, Registon ko'chasi 4", payment: "Karta orqali",
    total: 890000, status: "Yo'lda", isPreorder: false,
    lines: [{ productId: "p2", productName: "Aero 270 Runner", colorHex: "#1b1a16", size: 43, qty: 1, unitPrice: 890000 }],
    createdAt: "2026-06-28",
  },
  {
    id: "o3", orderNumber: "PS-469881", customerName: "Malika Yusupova", phone: "+998932221100",
    address: "Farg'ona, Mustaqillik ko'chasi 12", payment: "Naqd pul",
    total: 590000, status: "Yangi", isPreorder: false,
    lines: [{ productId: "p3", productName: "Milano Loafer", colorHex: "#6b4a2f", size: 41, qty: 1, unitPrice: 590000 }],
    createdAt: "2026-06-27",
  },
  {
    id: "o4", orderNumber: "PRE-58210", customerName: "Aziza Rahimova", phone: "+998912223344",
    address: "Toshkent shahri, Yunusobod tumani", payment: "Oldindan to'lov (30%)",
    total: 1260000, status: "Tayyorlanmoqda", isPreorder: true,
    lines: [{ productId: "p4", productName: "Riviera Sandal", colorHex: "#f4f1ea", size: 38, qty: 3, unitPrice: 420000 }],
    createdAt: "2026-07-08",
  },
];
