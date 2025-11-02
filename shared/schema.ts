import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users Table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("user"), // 'user' | 'pos' | 'admin'
  pointsBalance: integer("points_balance").notNull().default(0),
  outletId: varchar("outlet_id"),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Products Table
export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  price: integer("price").notNull(), // in rupiah
  imageUrl: text("image_url"),
  category: text("category"),
  stock: integer("stock").notNull().default(0),
});

export const insertProductSchema = createInsertSchema(products).omit({ id: true });
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

// Orders Table
export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  subtotal: integer("subtotal").notNull(),
  voucherDiscount: integer("voucher_discount").notNull().default(0),
  total: integer("total").notNull(),
  pointsEarned: integer("points_earned").notNull().default(0),
  status: text("status").notNull().default("PENDING"), // 'PENDING' | 'PAID' | 'CANCELLED'
  voucherCode: text("voucher_code"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  paidAt: timestamp("paid_at"),
});

export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true });
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

// Order Items Table
export const orderItems = pgTable("order_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").notNull(),
  productId: varchar("product_id").notNull(),
  productName: text("product_name").notNull(),
  price: integer("price").notNull(),
  quantity: integer("quantity").notNull().default(1),
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({ id: true });
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type OrderItem = typeof orderItems.$inferSelect;

// Vouchers Table
export const vouchers = pgTable("vouchers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull().unique(),
  userId: varchar("user_id").notNull(),
  valueRp: integer("value_rp").notNull(),
  minSpendRp: integer("min_spend_rp").notNull(),
  status: text("status").notNull().default("ACTIVE"), // 'ACTIVE' | 'USED' | 'EXPIRED'
  createdAt: timestamp("created_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  orderId: varchar("order_id"),
});

export const insertVoucherSchema = createInsertSchema(vouchers).omit({ id: true, createdAt: true });
export type InsertVoucher = z.infer<typeof insertVoucherSchema>;
export type Voucher = typeof vouchers.$inferSelect;

// Campaign Configuration Table
export const campaigns = pgTable("campaigns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  accrualPer: integer("accrual_per").notNull().default(10000), // points = floor(total / accrualPer)
  redeemValue: integer("redeem_value").notNull().default(500), // points needed per tier
  discountCapPct: integer("discount_cap_pct").notNull().default(50), // max discount %
  expiryDays: integer("expiry_days").notNull().default(90), // voucher expiry in days
  isActive: boolean("is_active").notNull().default(true),
});

export const insertCampaignSchema = createInsertSchema(campaigns).omit({ id: true });
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;
export type Campaign = typeof campaigns.$inferSelect;

// Merchants/Outlets Table
export const merchants = pgTable("merchants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  location: text("location"),
  contactEmail: text("contact_email"),
});

export const insertMerchantSchema = createInsertSchema(merchants).omit({ id: true });
export type InsertMerchant = z.infer<typeof insertMerchantSchema>;
export type Merchant = typeof merchants.$inferSelect;

// Merchant Product Overrides (optional price/stock overrides per outlet)
export const merchantProductOverrides = pgTable("merchant_product_overrides", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  merchantId: varchar("merchant_id").notNull(),
  productId: varchar("product_id").notNull(),
  overridePrice: integer("override_price"),
  overrideStock: integer("override_stock"),
});

export const insertMerchantProductOverrideSchema = createInsertSchema(merchantProductOverrides).omit({ id: true });
export type InsertMerchantProductOverride = z.infer<typeof insertMerchantProductOverrideSchema>;
export type MerchantProductOverride = typeof merchantProductOverrides.$inferSelect;

// Frontend-only types (for cart management)
export type CartItem = {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  imageUrl?: string;
};

export type VoucherRedemptionTier = {
  pointsCost: number;
  valueRp: number;
  minSpendRp: number;
};

// API Response types
export type PricePreview = {
  subtotal: number;
  voucherDiscount: number;
  total: number;
  discountCapped: boolean;
  pointsToEarn: number;
};

export type UserStats = {
  pointsBalance: number;
  totalOrders: number;
  lifetimeSpent: number;
  nextVoucherProgress: {
    currentPoints: number;
    pointsNeeded: number;
    percentComplete: number;
  };
};

export type DashboardKPI = {
  totalRevenue: number;
  activeUsers: number;
  vouchersRedeemed: number;
  avgTransaction: number;
  revenueChange: number;
  usersChange: number;
  vouchersChange: number;
  avgTransactionChange: number;
};

export type RevenueDataPoint = {
  date: string;
  revenue: number;
};
