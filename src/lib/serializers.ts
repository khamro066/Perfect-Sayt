import type {
  Product as DbProduct,
  ProductColor,
  ProductSize,
  Category,
  Order as DbOrder,
  OrderLine as DbOrderLine,
  Customer as DbCustomer,
  Review as DbReview,
} from "@/generated/prisma/client";

type ProductWithRelations = DbProduct & {
  category: Category;
  colors: ProductColor[];
  sizes: ProductSize[];
};

export function serializeProduct(p: ProductWithRelations) {
  return {
    id: p.id,
    name: p.name,
    brand: p.brand,
    gender: p.gender,
    category: p.category.name,
    material: p.material,
    price: Number(p.price),
    oldPrice: p.oldPrice ? Number(p.oldPrice) : undefined,
    rating: Number(p.rating),
    ratingCount: p.ratingCount,
    description: p.description,
    productionDays: p.productionDays ?? undefined,
    colors: p.colors.map((c) => c.hex),
    sizes: p.sizes.map((s) => s.size).sort((a, b) => a - b),
    isNew: p.isNew,
    sold: p.sold,
    images: p.images,
    createdAt: p.createdAt.toISOString().slice(0, 10),
  };
}

type OrderWithRelations = DbOrder & {
  customer: DbCustomer;
  lines: (DbOrderLine & { product: { name: string } })[];
  reviews?: { productId: string }[];
};

export function serializeOrder(o: OrderWithRelations) {
  return {
    id: o.id,
    orderNumber: o.orderNumber,
    customerName: `${o.customer.ism} ${o.customer.familiya ?? ""}`.trim(),
    phone: o.customer.phone,
    address: o.address ?? undefined,
    payment: o.payment ?? undefined,
    total: Number(o.total),
    status: o.status === "Yolda" ? "Yo'lda" : o.status === "BekorQilindi" ? "Bekor qilindi" : o.status,
    isPreorder: o.isPreorder,
    lines: o.lines.map((l) => ({
      productId: l.productId,
      productName: l.product.name,
      colorHex: l.colorHex,
      size: l.size,
      qty: l.qty,
      unitPrice: Number(l.unitPrice),
    })),
    reviewedProductIds: o.reviews?.map((r) => r.productId) ?? [],
    createdAt: o.createdAt.toISOString().slice(0, 10),
  };
}

export function serializeReview(r: DbReview & { customer: DbCustomer }) {
  return {
    id: r.id,
    productId: r.productId,
    customerName: `${r.customer.ism} ${r.customer.familiya ?? ""}`.trim(),
    rating: r.rating,
    text: r.text,
    status: r.status,
    createdAt: r.createdAt.toISOString().slice(0, 10),
  };
}

/** Maps the frontend's literal "Yo'lda" / "Bekor qilindi" strings to Prisma enum keys. */
export function toOrderStatusEnum(status: string): "Yangi" | "Tasdiqlandi" | "Tayyorlanmoqda" | "Yolda" | "Yetkazildi" | "BekorQilindi" {
  if (status === "Yo'lda") return "Yolda";
  if (status === "Bekor qilindi") return "BekorQilindi";
  return status as "Yangi" | "Tasdiqlandi" | "Tayyorlanmoqda" | "Yetkazildi";
}
