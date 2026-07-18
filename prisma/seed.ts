import "dotenv/config";
import { PrismaClient, OrderStatus } from "../src/generated/prisma/client.js";

const prisma = new PrismaClient();

const CATEGORIES = ["Krossovka", "Klassik", "Lofer", "Skechers", "Etik", "Tapochka"];

interface SeedProduct {
  id: string;
  name: string;
  brand: string;
  gender: string;
  category: string;
  material: string;
  price: number;
  oldPrice?: number;
  rating: number;
  ratingCount: number;
  description: string;
  colors: string[];
  sizes: number[];
  isNew?: boolean;
  sold: number;
  createdAt: string;
}

const PRODUCTS: SeedProduct[] = [
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

function stockForProduct(p: SeedProduct): { colorHex: string; size: number; quantity: number }[] {
  if (p.id === "p4") {
    // Fully sold out, to demonstrate the pre-order flow.
    return p.colors.flatMap((colorHex) => p.sizes.map((size) => ({ colorHex, size, quantity: 0 })));
  }
  const base = Math.floor(p.sold / (p.colors.length * p.sizes.length)) + 2;
  const entries: { colorHex: string; size: number; quantity: number }[] = [];
  p.colors.forEach((colorHex, ci) => {
    p.sizes.forEach((size, si) => {
      const variance = [-2, 0, 3][(ci + si) % 3];
      let quantity = Math.max(0, base + variance);
      // p5 gets a couple of low/zero-stock sizes to demonstrate size-button disabling.
      if (p.id === "p5" && size === 42) quantity = 0;
      if (p.id === "p5" && size === 43) quantity = 2;
      entries.push({ colorHex, size, quantity });
    });
  });
  return entries;
}

async function main() {
  console.log("Clearing existing data...");
  await prisma.notification.deleteMany();
  await prisma.orderStatusHistory.deleteMany();
  await prisma.review.deleteMany();
  await prisma.orderLine.deleteMany();
  await prisma.order.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.stock.deleteMany();
  await prisma.productSize.deleteMany();
  await prisma.productColor.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  console.log("Seeding categories...");
  const categoryByName = new Map<string, string>();
  for (const name of CATEGORIES) {
    const cat = await prisma.category.create({
      data: { name, slug: name.toLowerCase() },
    });
    categoryByName.set(name, cat.id);
  }

  console.log("Seeding products, colors, sizes, stock...");
  const productDbId = new Map<string, string>();
  for (const p of PRODUCTS) {
    const created = await prisma.product.create({
      data: {
        name: p.name,
        brand: p.brand,
        gender: p.gender,
        categoryId: categoryByName.get(p.category)!,
        material: p.material,
        price: p.price,
        oldPrice: p.oldPrice,
        rating: p.rating,
        ratingCount: p.ratingCount,
        description: p.description,
        isNew: p.isNew ?? false,
        sold: p.sold,
        images: [],
        createdAt: new Date(p.createdAt),
        colors: { create: p.colors.map((hex) => ({ hex })) },
        sizes: { create: p.sizes.map((size) => ({ size })) },
      },
    });
    productDbId.set(p.id, created.id);

    await prisma.stock.createMany({
      data: stockForProduct(p).map((s) => ({
        productId: created.id,
        colorHex: s.colorHex,
        size: s.size,
        quantity: s.quantity,
      })),
    });
  }

  console.log("Seeding customers...");
  const dilnoza = await prisma.customer.create({
    data: {
      ism: "Dilnoza", familiya: "Karimova", phone: "+998901234567",
      viloyat: "Toshkent shahri", manzil: "Chilonzor tumani, 19-kvartal, 4-uy",
    },
  });
  const sardor = await prisma.customer.create({
    data: {
      ism: "Sardor", familiya: "Aliyev", phone: "+998907654321",
      viloyat: "Samarqand", manzil: "Registon ko'chasi 4",
    },
  });
  const malika = await prisma.customer.create({
    data: {
      ism: "Malika", familiya: "Yusupova", phone: "+998932221100",
      viloyat: "Farg'ona", manzil: "Mustaqillik ko'chasi 12",
    },
  });
  const aziza = await prisma.customer.create({
    data: {
      ism: "Aziza", familiya: "Rahimova", phone: "+998912223344",
      viloyat: "Toshkent shahri", manzil: "Yunusobod tumani",
    },
  });

  console.log("Seeding orders...");
  async function createOrder(opts: {
    orderNumber: string;
    customerId: string;
    total: number;
    status: OrderStatus;
    isPreorder: boolean;
    history: OrderStatus[];
    createdAt: string;
    address: string;
    payment: string;
    lines: { productId: string; colorHex: string; size: number; qty: number; unitPrice: number }[];
  }) {
    return prisma.order.create({
      data: {
        orderNumber: opts.orderNumber,
        customerId: opts.customerId,
        total: opts.total,
        status: opts.status,
        isPreorder: opts.isPreorder,
        kind: opts.isPreorder ? "preorder" : "order",
        stockApplied: opts.history.includes("Tasdiqlandi"),
        address: opts.address,
        payment: opts.payment,
        createdAt: new Date(opts.createdAt),
        lines: { create: opts.lines.map((l) => ({ ...l, productId: productDbId.get(l.productId)! })) },
        statusHistory: { create: opts.history.map((status) => ({ status })) },
      },
    });
  }

  const o1 = await createOrder({
    orderNumber: "PS-482910", customerId: dilnoza.id, total: 1115000,
    status: "Yetkazildi", isPreorder: false, createdAt: "2026-07-02",
    address: "Toshkent shahri, Chilonzor tumani, 19-kvartal, 4-uy", payment: "Naqd pul",
    history: ["Yangi", "Tasdiqlandi", "Tayyorlanmoqda", "Yolda", "Yetkazildi"],
    lines: [{ productId: "p1", colorHex: "#1b1a16", size: 42, qty: 1, unitPrice: 1115000 }],
  });
  await createOrder({
    orderNumber: "PS-471203", customerId: sardor.id, total: 890000,
    status: "Yolda", isPreorder: false, createdAt: "2026-06-28",
    address: "Samarqand, Registon ko'chasi 4", payment: "Karta orqali",
    history: ["Yangi", "Tasdiqlandi", "Tayyorlanmoqda", "Yolda"],
    lines: [{ productId: "p2", colorHex: "#1b1a16", size: 43, qty: 1, unitPrice: 890000 }],
  });
  await createOrder({
    orderNumber: "PS-469881", customerId: malika.id, total: 590000,
    status: "Yangi", isPreorder: false, createdAt: "2026-06-27",
    address: "Farg'ona, Mustaqillik ko'chasi 12", payment: "Naqd pul",
    history: ["Yangi"],
    lines: [{ productId: "p3", colorHex: "#6b4a2f", size: 41, qty: 1, unitPrice: 590000 }],
  });
  await createOrder({
    orderNumber: "PRE-58210", customerId: aziza.id, total: 1260000,
    status: "Tayyorlanmoqda", isPreorder: true, createdAt: "2026-07-08",
    address: "Toshkent shahri, Yunusobod tumani", payment: "Oldindan to'lov (30%)",
    history: ["Yangi", "Tasdiqlandi", "Tayyorlanmoqda"],
    lines: [{ productId: "p4", colorHex: "#f4f1ea", size: 38, qty: 3, unitPrice: 420000 }],
  });

  console.log("Seeding reviews...");
  await prisma.review.create({
    data: {
      productId: productDbId.get("p1")!, customerId: dilnoza.id, orderId: o1.id,
      rating: 5, text: "Juda qulay va sifatli, tavsiya qilaman!",
      status: "approved", createdAt: new Date("2026-07-03"),
    },
  });
  await prisma.review.create({
    data: {
      productId: productDbId.get("p7")!, customerId: malika.id, orderId: (await createOrder({
        orderNumber: "PS-450112", customerId: malika.id, total: 750000,
        status: "Yetkazildi", isPreorder: false, createdAt: "2026-07-01",
        address: "Farg'ona, Mustaqillik ko'chasi 12", payment: "Naqd pul",
        history: ["Yangi", "Tasdiqlandi", "Tayyorlanmoqda", "Yolda", "Yetkazildi"],
        lines: [{ productId: "p7", colorHex: "#f4f1ea", size: 38, qty: 1, unitPrice: 750000 }],
      })).id,
      rating: 4, text: "Sayt qulay, yetkazib berish tez bo'ldi. Rangi rasmga nisbatan biroz och.",
      status: "pending", createdAt: new Date("2026-07-10"),
    },
  });

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
