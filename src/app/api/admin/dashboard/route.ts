import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeOrder } from "@/lib/serializers";

export async function GET() {
  const [totalProducts, stockAgg, activePreorders, orders, recentOrders] = await Promise.all([
    prisma.product.count({ where: { deletedAt: null } }),
    prisma.stock.aggregate({ where: { product: { deletedAt: null } }, _sum: { quantity: true } }),
    prisma.order.count({
      where: { isPreorder: true, status: { notIn: ["Yetkazildi", "BekorQilindi"] } },
    }),
    prisma.order.findMany({ where: { status: { not: "BekorQilindi" } }, select: { total: true } }),
    prisma.order.findMany({
      include: { customer: true, lines: { include: { product: { select: { name: true } } } } },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  const monthlyRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0);

  return NextResponse.json({
    totalProducts,
    totalStock: stockAgg._sum.quantity ?? 0,
    activePreorders,
    monthlyRevenue,
    recentOrders: recentOrders.map(serializeOrder),
  });
}
