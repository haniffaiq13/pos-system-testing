// API endpoint interfaces

import type {
  Product,
  Order,
  OrderItem,
  User,
  Voucher,
  Campaign,
  Merchant,
  MerchantProductOverride,
  CartItem,
  PricePreview,
  UserStats,
  DashboardKPI,
  RevenueDataPoint,
} from "@shared/schema";

export interface ApiAdapter {
  // Auth
  login(email: string, password: string): Promise<User>;
  register(input: {
    email: string;
    password: string;
    role?: User["role"];
    outletId?: string | null;
  }): Promise<User>;

  // Products
  getProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | null>;
  createProduct(product: Omit<Product, 'id'>): Promise<Product>;
  updateProduct(id: string, product: Partial<Product>): Promise<Product>;
  deleteProduct(id: string): Promise<void>;

  // Orders
  previewPrice(cart: CartItem[], voucherCode?: string): Promise<PricePreview>;
  createCheckout(cart: CartItem[], voucherCode?: string): Promise<Order>;
  getOrders(userId?: string): Promise<Order[]>;
  getOrder(id: string): Promise<Order | null>;
  getOrderItems(orderId: string): Promise<OrderItem[]>;
  markPaid(orderId: string): Promise<Order>;

  // Points & Loyalty
  getPoints(userId: string): Promise<number>;
  getUserStats(userId: string): Promise<UserStats>;
  redeemVoucher(userId: string, pointsCost: number): Promise<Voucher>;
  validateVoucher(code: string): Promise<Voucher | null>;
  getVouchers(userId?: string, status?: string): Promise<Voucher[]>;
  issueVoucher(userId: string, valueRp: number): Promise<Voucher>;

  // Campaign
  getCampaign(): Promise<Campaign>;
  updateCampaign(campaign: Partial<Campaign>): Promise<Campaign>;

  // Users
  getUsers(): Promise<User[]>;
  getUser(id: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  createUser(user: Omit<User, 'id' | 'pointsBalance'>): Promise<User>;
  updateUser(id: string, user: Partial<User>): Promise<User>;

  // Merchants
  getOutlets(): Promise<Merchant[]>;
  getOutlet(id: string): Promise<Merchant | null>;
  createOutlet(merchant: Omit<Merchant, 'id'>): Promise<Merchant>;
  updateOutlet(id: string, merchant: Partial<Merchant>): Promise<Merchant>;
  deleteOutlet(id: string): Promise<void>;

  // Product Overrides
  getProductOverrides(merchantId: string): Promise<MerchantProductOverride[]>;
  setProductOverride(override: Omit<MerchantProductOverride, 'id'>): Promise<MerchantProductOverride>;

  // Admin Stats
  getDashboardKPIs(): Promise<DashboardKPI>;
  getRevenueData(days: number): Promise<RevenueDataPoint[]>;

  // Admin Tools
  resetStorage(): Promise<void>;
}
