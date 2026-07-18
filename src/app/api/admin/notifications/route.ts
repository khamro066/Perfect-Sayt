import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const notifications = await prisma.notification.findMany({
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return NextResponse.json(
    notifications.map((n) => ({
      id: n.id,
      time: n.createdAt.toTimeString().slice(0, 5),
      read: n.read,
      customerName: n.customerName,
      productSummary: n.productSummary,
      amount: Number(n.amount),
      kind: n.kind,
    }))
  );
}
