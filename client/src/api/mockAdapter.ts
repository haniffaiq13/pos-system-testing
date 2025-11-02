// Mock API adapter using localStorage

import type { ApiAdapter } from "./types";
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
import { persist, retrieve, clearAll } from "@/utils/persist";
import {
  previewPrice as calculatePreview,
  calculateMinSpend,
  generateVoucherCode,
  calculateExpiryDate,
  getVoucherStatus,
  calculateNextVoucherProgress,
  VOUCHER_TIERS,
} from "@/utils/rules";
import productsSeed from "./data/products.json" assert { type: "json" };
// Generate UUID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Seed data initialization
function initializeSeedData() {
  if (retrieve('initialized')) return;

  // Seed Users
  const users: User[] = [
    {
      id: 'user-admin',
      email: 'admin@demo.io',
      password: 'password',
      role: 'admin',
      pointsBalance: 0,
      outletId: null,
    },
    {
      id: 'user-pos',
      email: 'pos@demo.io',
      password: 'password',
      role: 'pos',
      pointsBalance: 0,
      outletId: 'outlet-jakarta-a',
    },
    {
      id: 'user-hanif',
      email: 'hanif@demo.io',
      password: 'password',
      role: 'user',
      pointsBalance: 150,
      outletId: null,
    },
  ];

  // Seed Products
  const products: Product[] = (productsSeed as Product[]).map((product) => ({
    ...product,
  }));

  // Seed Campaign
  const campaign: Campaign = {
    id: 'campaign-default',
    name: 'Default Campaign',
    accrualPer: 10000,
    redeemValue: 500,
    discountCapPct: 50,
    expiryDays: 90,
    isActive: true,
  };

  // Seed Merchants
  const merchants: Merchant[] = [
    {
      id: 'outlet-jakarta-a',
      name: 'Jakarta Store A',
      location: 'Jakarta Pusat',
      contactEmail: 'jakarta-a@pointhub.io',
    },
    {
      id: 'outlet-jakarta-b',
      name: 'Jakarta Store B',
      location: 'Jakarta Selatan',
      contactEmail: 'jakarta-b@pointhub.io',
    },
  ];

  persist('users', users);
  persist('products', products);
  persist('orders', []);
  persist('orderItems', []);
  persist('vouchers', []);
  persist('campaign', campaign);
  persist('merchants', merchants);
  persist('merchantOverrides', []);
  persist('initialized', true);
}

class MockAdapter implements ApiAdapter {
  constructor() {
    initializeSeedData();
  }

  async login(email: string, password: string): Promise<User> {
    const users = await this.getUsers();
    const normalizedEmail = email.trim().toLowerCase();
    const user = users.find(
      (item) => item.email.toLowerCase() === normalizedEmail,
    );

    if (!user || user.password !== password) {
      throw new Error("Invalid email or password");
    }

    return user;
  }

  async register({
    email,
    password,
    role = "user",
    outletId = null,
  }: {
    email: string;
    password: string;
    role?: User["role"];
    outletId?: string | null;
  }): Promise<User> {
    const normalizedEmail = email.trim().toLowerCase();
    const users = await this.getUsers();

    if (users.some((user) => user.email.toLowerCase() === normalizedEmail)) {
      throw new Error("Email already registered");
    }

    const newUser: User = {
      id: generateId(),
      email: normalizedEmail,
      password,
      role,
      outletId,
      pointsBalance: 0,
    };

    users.push(newUser);
    persist("users", users);

    return newUser;
  }

  // Products
  async getProducts(): Promise<Product[]> {
    return retrieve<Product[]>('products') || [];
  }

  async getProduct(id: string): Promise<Product | null> {
    const products = await this.getProducts();
    return products.find(p => p.id === id) || null;
  }

  async createProduct(product: Omit<Product, 'id'>): Promise<Product> {
    const products = await this.getProducts();
    const newProduct: Product = {
      ...product,
      id: generateId(),
    };
    products.push(newProduct);
    persist('products', products);
    return newProduct;
  }

  async updateProduct(id: string, productUpdate: Partial<Product>): Promise<Product> {
    const products = await this.getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Product not found');
    
    products[index] = { ...products[index], ...productUpdate };
    persist('products', products);
    return products[index];
  }

  async deleteProduct(id: string): Promise<void> {
    const products = await this.getProducts();
    const filtered = products.filter(p => p.id !== id);
    persist('products', filtered);
  }

  // Orders
  async previewPrice(cart: CartItem[], voucherCode?: string): Promise<PricePreview> {
    const campaign = await this.getCampaign();
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    
    let voucherValueRp = 0;
    if (voucherCode) {
      const voucher = await this.validateVoucher(voucherCode);
      if (voucher && voucher.status === 'ACTIVE') {
        voucherValueRp = voucher.valueRp;
      }
    }

    return calculatePreview(subtotal, voucherValueRp, campaign);
  }

  async createCheckout(cart: CartItem[], voucherCode?: string): Promise<Order> {
    const orders = retrieve<Order[]>('orders') || [];
    const orderItems = retrieve<OrderItem[]>('orderItems') || [];
    const currentUser = retrieve<User>('currentUser');
    
    if (!currentUser) throw new Error('No user logged in');

    const preview = await this.previewPrice(cart, voucherCode);
    
    const order: Order = {
      id: generateId(),
      userId: currentUser.id,
      subtotal: preview.subtotal,
      voucherDiscount: preview.voucherDiscount,
      total: preview.total,
      pointsEarned: preview.pointsToEarn,
      status: 'PENDING',
      voucherCode: voucherCode || null,
      createdAt: new Date(),
      paidAt: null,
    };

    orders.push(order);
    persist('orders', orders);

    // Create order items
    cart.forEach(item => {
      const orderItem: OrderItem = {
        id: generateId(),
        orderId: order.id,
        productId: item.productId,
        productName: item.productName,
        price: item.price,
        quantity: item.quantity,
      };
      orderItems.push(orderItem);
    });
    persist('orderItems', orderItems);

    // Mark voucher as used if provided
    if (voucherCode) {
      const vouchers = retrieve<Voucher[]>('vouchers') || [];
      const voucherIndex = vouchers.findIndex(v => v.code === voucherCode);
      if (voucherIndex !== -1) {
        vouchers[voucherIndex].status = 'USED';
        vouchers[voucherIndex].usedAt = new Date();
        vouchers[voucherIndex].orderId = order.id;
        persist('vouchers', vouchers);
      }
    }

    // Simulate webhook: auto mark as paid after 3 seconds
    setTimeout(() => {
      this.markPaid(order.id).catch(console.error);
    }, 3000);

    return order;
  }

  async getOrders(userId?: string): Promise<Order[]> {
    const orders = retrieve<Order[]>('orders') || [];
    if (userId) {
      return orders.filter(o => o.userId === userId);
    }
    return orders;
  }

  async getOrder(id: string): Promise<Order | null> {
    const orders = await this.getOrders();
    return orders.find(o => o.id === id) || null;
  }

  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    const items = retrieve<OrderItem[]>('orderItems') || [];
    return items.filter(i => i.orderId === orderId);
  }

  async markPaid(orderId: string): Promise<Order> {
    const orders = retrieve<Order[]>('orders') || [];
    const order = orders.find(o => o.id === orderId);
    
    if (!order) throw new Error('Order not found');
    if (order.status === 'PAID') return order; // Idempotent

    order.status = 'PAID';
    order.paidAt = new Date();

    // Award points to user
    const users = retrieve<User[]>('users') || [];
    const userIndex = users.findIndex(u => u.id === order.userId);
    if (userIndex !== -1) {
      users[userIndex].pointsBalance += order.pointsEarned;
      persist('users', users);
    }

    persist('orders', orders);
    return order;
  }

  // Points & Loyalty
  async getPoints(userId: string): Promise<number> {
    const user = await this.getUser(userId);
    return user?.pointsBalance || 0;
  }

  async getUserStats(userId: string): Promise<UserStats> {
    const user = await this.getUser(userId);
    const orders = await this.getOrders(userId);
    const paidOrders = orders.filter(o => o.status === 'PAID');

    const pointsBalance = user?.pointsBalance || 0;
    const totalOrders = paidOrders.length;
    const lifetimeSpent = paidOrders.reduce((sum, o) => sum + o.total, 0);

    const nextVoucherProgress = calculateNextVoucherProgress(pointsBalance);

    return {
      pointsBalance,
      totalOrders,
      lifetimeSpent,
      nextVoucherProgress,
    };
  }

  async redeemVoucher(userId: string, pointsCost: number): Promise<Voucher> {
    const users = retrieve<User[]>('users') || [];
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) throw new Error('User not found');
    if (users[userIndex].pointsBalance < pointsCost) {
      throw new Error('Insufficient points');
    }

    // Find the tier
    const tier = VOUCHER_TIERS.find(t => t.pointsCost === pointsCost);
    if (!tier) throw new Error('Invalid points cost');

    // Deduct points
    users[userIndex].pointsBalance -= pointsCost;
    persist('users', users);

    const campaign = await this.getCampaign();
    const minSpend = calculateMinSpend(tier.valueRp);

    const voucher: Voucher = {
      id: generateId(),
      code: generateVoucherCode(),
      userId,
      valueRp: tier.valueRp,
      minSpendRp: minSpend,
      status: 'ACTIVE',
      createdAt: new Date(),
      expiresAt: calculateExpiryDate(campaign.expiryDays),
      usedAt: null,
      orderId: null,
    };

    const vouchers = retrieve<Voucher[]>('vouchers') || [];
    vouchers.push(voucher);
    persist('vouchers', vouchers);

    return voucher;
  }

  async validateVoucher(code: string): Promise<Voucher | null> {
    const vouchers = retrieve<Voucher[]>('vouchers') || [];
    const voucher = vouchers.find(v => v.code === code);
    
    if (!voucher) return null;

    // Update status based on expiry
    const currentStatus = getVoucherStatus(voucher.status, voucher.expiresAt);
    if (currentStatus !== voucher.status) {
      voucher.status = currentStatus;
      persist('vouchers', vouchers);
    }

    return voucher;
  }

  async getVouchers(userId?: string, status?: string): Promise<Voucher[]> {
    let vouchers = retrieve<Voucher[]>('vouchers') || [];

    // Update statuses
    vouchers = vouchers.map(v => ({
      ...v,
      status: getVoucherStatus(v.status, v.expiresAt),
    }));
    persist('vouchers', vouchers);

    if (userId) {
      vouchers = vouchers.filter(v => v.userId === userId);
    }
    if (status) {
      vouchers = vouchers.filter(v => v.status === status);
    }

    return vouchers.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async issueVoucher(userId: string, valueRp: number): Promise<Voucher> {
    const campaign = await this.getCampaign();
    const minSpend = calculateMinSpend(valueRp);

    const voucher: Voucher = {
      id: generateId(),
      code: generateVoucherCode(),
      userId,
      valueRp,
      minSpendRp: minSpend,
      status: 'ACTIVE',
      createdAt: new Date(),
      expiresAt: calculateExpiryDate(campaign.expiryDays),
      usedAt: null,
      orderId: null,
    };

    const vouchers = retrieve<Voucher[]>('vouchers') || [];
    vouchers.push(voucher);
    persist('vouchers', vouchers);

    return voucher;
  }

  // Campaign
  async getCampaign(): Promise<Campaign> {
    const campaign = retrieve<Campaign>('campaign');
    if (!campaign) throw new Error('Campaign not initialized');
    return campaign;
  }

  async updateCampaign(campaignUpdate: Partial<Campaign>): Promise<Campaign> {
    const campaign = await this.getCampaign();
    const updated = { ...campaign, ...campaignUpdate };
    persist('campaign', updated);
    return updated;
  }

  // Users
  async getUsers(): Promise<User[]> {
    return retrieve<User[]>('users') || [];
  }

  async getUser(id: string): Promise<User | null> {
    const users = await this.getUsers();
    return users.find(u => u.id === id) || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const users = await this.getUsers();
    return users.find(u => u.email === email) || null;
  }

  async createUser(userData: Omit<User, 'id' | 'pointsBalance'>): Promise<User> {
    const users = await this.getUsers();
    const user: User = {
      ...userData,
      id: generateId(),
      pointsBalance: 0,
    };
    users.push(user);
    persist('users', users);
    return user;
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    const users = await this.getUsers();
    const index = users.findIndex(u => u.id === id);
    if (index === -1) throw new Error('User not found');
    
    users[index] = { ...users[index], ...userData };
    persist('users', users);
    return users[index];
  }

  // Merchants
  async getOutlets(): Promise<Merchant[]> {
    return retrieve<Merchant[]>('merchants') || [];
  }

  async getOutlet(id: string): Promise<Merchant | null> {
    const merchants = await this.getOutlets();
    return merchants.find(m => m.id === id) || null;
  }

  async createOutlet(merchantData: Omit<Merchant, 'id'>): Promise<Merchant> {
    const merchants = await this.getOutlets();
    const merchant: Merchant = {
      ...merchantData,
      id: generateId(),
    };
    merchants.push(merchant);
    persist('merchants', merchants);
    return merchant;
  }

  async updateOutlet(id: string, merchantData: Partial<Merchant>): Promise<Merchant> {
    const merchants = await this.getOutlets();
    const index = merchants.findIndex(m => m.id === id);
    if (index === -1) throw new Error('Merchant not found');
    
    merchants[index] = { ...merchants[index], ...merchantData };
    persist('merchants', merchants);
    return merchants[index];
  }

  async deleteOutlet(id: string): Promise<void> {
    const merchants = await this.getOutlets();
    const filtered = merchants.filter(m => m.id !== id);
    persist('merchants', filtered);
  }

  // Product Overrides
  async getProductOverrides(merchantId: string): Promise<MerchantProductOverride[]> {
    const overrides = retrieve<MerchantProductOverride[]>('merchantOverrides') || [];
    return overrides.filter(o => o.merchantId === merchantId);
  }

  async setProductOverride(
    overrideData: Omit<MerchantProductOverride, 'id'>
  ): Promise<MerchantProductOverride> {
    const overrides = retrieve<MerchantProductOverride[]>('merchantOverrides') || [];
    
    // Check if override exists
    const existingIndex = overrides.findIndex(
      o => o.merchantId === overrideData.merchantId && o.productId === overrideData.productId
    );

    if (existingIndex !== -1) {
      overrides[existingIndex] = { ...overrides[existingIndex], ...overrideData };
      persist('merchantOverrides', overrides);
      return overrides[existingIndex];
    }

    const override: MerchantProductOverride = {
      ...overrideData,
      id: generateId(),
    };
    overrides.push(override);
    persist('merchantOverrides', overrides);
    return override;
  }

  // Admin Stats
  async getDashboardKPIs(): Promise<DashboardKPI> {
    const orders = retrieve<Order[]>('orders') || [];
    const users = retrieve<User[]>('users') || [];
    const vouchers = retrieve<Voucher[]>('vouchers') || [];

    const paidOrders = orders.filter(o => o.status === 'PAID');
    const totalRevenue = paidOrders.reduce((sum, o) => sum + o.total, 0);
    const activeUsers = users.filter(u => u.role === 'user').length;
    const vouchersRedeemed = vouchers.filter(v => v.status === 'USED').length;
    const avgTransaction = paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0;

    return {
      totalRevenue,
      activeUsers,
      vouchersRedeemed,
      avgTransaction,
      revenueChange: 12.5,
      usersChange: 8.3,
      vouchersChange: 15.7,
      avgTransactionChange: -3.2,
    };
  }

  async getRevenueData(days: number): Promise<RevenueDataPoint[]> {
    const orders = retrieve<Order[]>('orders') || [];
    const paidOrders = orders.filter(o => o.status === 'PAID');

    const data: RevenueDataPoint[] = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const dayOrders = paidOrders.filter(o => {
        const orderDate = new Date(o.paidAt!).toISOString().split('T')[0];
        return orderDate === dateStr;
      });

      const revenue = dayOrders.reduce((sum, o) => sum + o.total, 0);

      data.push({
        date: dateStr,
        revenue: revenue + Math.random() * 1000000, // Add some variance for demo
      });
    }

    return data;
  }

  // Admin Tools
  async resetStorage(): Promise<void> {
    clearAll();
    initializeSeedData();
  }
}

export const mockAdapter = new MockAdapter();
