import "dotenv/config";
import { PrismaClient, OrderStatus } from "../src/generated/prisma/client.js";

const prisma = new PrismaClient();

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
  const [sneakers, boots, sandals] = await Promise.all([
    prisma.category.create({ data: { name: "Krossovkalar", slug: "krossovkalar" } }),
    prisma.category.create({ data: { name: "Botinkalar", slug: "botinkalar" } }),
    prisma.category.create({ data: { name: "Sandallar", slug: "sandallar" } }),
  ]);

  console.log("Seeding products...");
  const airRunner = await prisma.product.create({
    data: {
      name: "Air Runner Pro",
      brand: "Nike",
      gender: "Erkaklar",
      categoryId: sneakers.id,
      material: "Charm",
      price: 850000,
      oldPrice: 990000,
      rating: 4.6,
      ratingCount: 3,
      description:
        "Yengil va qulay kundalik krossovka, uzoq masofalarga yurish uchun mos.",
      colors: {
        create: [{ hex: "#101828" }, { hex: "#d7e0ec" }],
      },
      sizes: {
        create: [{ size: 40 }, { size: 41 }, { size: 42 }, { size: 43 }],
      },
    },
  });

  const urbanBoot = await prisma.product.create({
    data: {
      name: "Urban Classic Boot",
      brand: "Timberland",
      gender: "Erkaklar",
      categoryId: boots.id,
      material: "Naturel charm",
      price: 1450000,
      rating: 4.8,
      ratingCount: 1,
      description: "Qishki mavsum uchun issiq va bardoshli botinka.",
      productionDays: 7,
      colors: {
        create: [{ hex: "#5b3a29" }],
      },
      sizes: {
        create: [{ size: 42 }, { size: 43 }, { size: 44 }],
      },
    },
  });

  const summerSandal = await prisma.product.create({
    data: {
      name: "Coast Walk Sandal",
      brand: "Ecco",
      gender: "Ayollar",
      categoryId: sandals.id,
      material: "Tekstil",
      price: 420000,
      rating: 0,
      ratingCount: 0,
      description: "Yozgi kunlar uchun yengil va nafis sandal.",
      colors: {
        create: [{ hex: "#eef2f8" }, { hex: "#0e2a52" }],
      },
      sizes: {
        create: [{ size: 36 }, { size: 37 }, { size: 38 }],
      },
    },
  });

  console.log("Seeding stock...");
  await prisma.stock.createMany({
    data: [
      { productId: airRunner.id, colorHex: "#101828", size: 40, quantity: 8 },
      { productId: airRunner.id, colorHex: "#101828", size: 41, quantity: 2 },
      { productId: airRunner.id, colorHex: "#101828", size: 42, quantity: 0 },
      { productId: airRunner.id, colorHex: "#101828", size: 43, quantity: 5 },
      { productId: airRunner.id, colorHex: "#d7e0ec", size: 40, quantity: 4 },
      { productId: airRunner.id, colorHex: "#d7e0ec", size: 41, quantity: 4 },
      { productId: airRunner.id, colorHex: "#d7e0ec", size: 42, quantity: 4 },
      { productId: airRunner.id, colorHex: "#d7e0ec", size: 43, quantity: 4 },

      { productId: urbanBoot.id, colorHex: "#5b3a29", size: 42, quantity: 3 },
      { productId: urbanBoot.id, colorHex: "#5b3a29", size: 43, quantity: 1 },
      { productId: urbanBoot.id, colorHex: "#5b3a29", size: 44, quantity: 0 },

      { productId: summerSandal.id, colorHex: "#eef2f8", size: 36, quantity: 6 },
      { productId: summerSandal.id, colorHex: "#eef2f8", size: 37, quantity: 6 },
      { productId: summerSandal.id, colorHex: "#eef2f8", size: 38, quantity: 6 },
      { productId: summerSandal.id, colorHex: "#0e2a52", size: 36, quantity: 6 },
      { productId: summerSandal.id, colorHex: "#0e2a52", size: 37, quantity: 6 },
      { productId: summerSandal.id, colorHex: "#0e2a52", size: 38, quantity: 6 },
    ],
  });

  console.log("Seeding a test customer + delivered order...");
  const customer = await prisma.customer.create({
    data: {
      ism: "Dilnoza",
      familiya: "Karimova",
      phone: "+998901234567",
      viloyat: "Toshkent shahri",
      manzil: "Chilonzor tumani, 19-kvartal, 4-uy",
    },
  });

  const orderTotal = 850000; // 1x Air Runner Pro, size 40, black
  const order = await prisma.order.create({
    data: {
      orderNumber: "PS-482910",
      customerId: customer.id,
      total: orderTotal,
      status: OrderStatus.Yetkazildi,
      isPreorder: false,
      kind: "order",
      stockApplied: true,
      lines: {
        create: [
          {
            productId: airRunner.id,
            colorHex: "#101828",
            size: 40,
            qty: 1,
            unitPrice: 850000,
          },
        ],
      },
      statusHistory: {
        create: [
          { status: OrderStatus.Yangi },
          { status: OrderStatus.Tasdiqlandi },
          { status: OrderStatus.Tayyorlanmoqda },
          { status: OrderStatus.Yolda },
          { status: OrderStatus.Yetkazildi },
        ],
      },
    },
  });

  await prisma.review.create({
    data: {
      productId: airRunner.id,
      customerId: customer.id,
      orderId: order.id,
      rating: 5,
      text: "Juda qulay va sifatli, tavsiya qilaman!",
      status: "approved",
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
