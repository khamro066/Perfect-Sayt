export interface Product {
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
  productionDays?: number;
  colors: string[];
  sizes: number[];
  isNew?: boolean;
  sold: number;
  images?: string[];
  createdAt: string;
}

export interface StockEntry {
  productId: string;
  colorHex: string;
  size: number;
  quantity: number;
}

export interface Review {
  id: string;
  productId: string;
  customerName: string;
  rating: number;
  text: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export type OrderStatus =
  | "Yangi"
  | "To'lov tekshirilmoqda"
  | "Tasdiqlandi"
  | "Tayyorlanmoqda"
  | "Yo'lda"
  | "Yetkazildi"
  | "Bekor qilindi";

export interface OrderLine {
  productId: string;
  productName: string;
  colorHex: string;
  size: number;
  qty: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  address?: string;
  payment?: string;
  total: number;
  status: OrderStatus;
  isPreorder: boolean;
  lines: OrderLine[];
  reviewedProductIds?: string[];
  createdAt: string;
}

export interface Customer {
  id: string;
  ism: string;
  familiya?: string;
  phone: string;
  viloyat?: string;
  manzil?: string;
  totalSpent: number;
  orderCount: number;
}
