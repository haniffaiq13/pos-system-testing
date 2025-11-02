// Real API adapter for backend integration

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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || 'Request failed');
  }

  return response.json();
}

class RealAdapter implements ApiAdapter {
  // Products
  async getProducts(): Promise<Product[]> {
    return request<Product[]>('/api/products');
  }

  async getProduct(id: string): Promise<Product | null> {
    return request<Product | null>(`/api/products/${id}`);
  }

  async createProduct(product: Omit<Product, 'id'>): Promise<Product> {
    return request<Product>('/api/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  }

  async updateProduct(id: string, product: Partial<Product>): Promise<Product> {
    return request<Product>(`/api/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(product),
    });
  }

  async deleteProduct(id: string): Promise<void> {
    await request<void>(`/api/products/${id}`, { method: 'DELETE' });
  }

  // Orders
  async previewPrice(cart: CartItem[], voucherCode?: string): Promise<PricePreview> {
    return request<PricePreview>('/api/orders/preview', {
      method: 'POST',
      body: JSON.stringify({ cart, voucherCode }),
    });
  }

  async createCheckout(cart: CartItem[], voucherCode?: string): Promise<Order> {
    return request<Order>('/api/orders/checkout', {
      method: 'POST',
      body: JSON.stringify({ cart, voucherCode }),
    });
  }

  async getOrders(userId?: string): Promise<Order[]> {
    const params = userId ? `?userId=${userId}` : '';
    return request<Order[]>(`/api/orders${params}`);
  }

  async getOrder(id: string): Promise<Order | null> {
    return request<Order | null>(`/api/orders/${id}`);
  }

  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    return request<OrderItem[]>(`/api/orders/${orderId}/items`);
  }

  async markPaid(orderId: string): Promise<Order> {
    return request<Order>(`/api/orders/${orderId}/mark-paid`, {
      method: 'POST',
    });
  }

  // Points & Loyalty
  async getPoints(userId: string): Promise<number> {
    const result = await request<{ points: number }>(`/api/loyalty/points/${userId}`);
    return result.points;
  }

  async getUserStats(userId: string): Promise<UserStats> {
    return request<UserStats>(`/api/loyalty/stats/${userId}`);
  }

  async redeemVoucher(userId: string, pointsCost: number): Promise<Voucher> {
    return request<Voucher>('/api/loyalty/redeem', {
      method: 'POST',
      body: JSON.stringify({ userId, pointsCost }),
    });
  }

  async validateVoucher(code: string): Promise<Voucher | null> {
    return request<Voucher | null>(`/api/loyalty/validate/${code}`);
  }

  async getVouchers(userId?: string, status?: string): Promise<Voucher[]> {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    if (status) params.append('status', status);
    const query = params.toString();
    return request<Voucher[]>(`/api/loyalty/vouchers${query ? `?${query}` : ''}`);
  }

  async issueVoucher(userId: string, valueRp: number): Promise<Voucher> {
    return request<Voucher>('/api/loyalty/issue', {
      method: 'POST',
      body: JSON.stringify({ userId, valueRp }),
    });
  }

  // Campaign
  async getCampaign(): Promise<Campaign> {
    return request<Campaign>('/api/campaign');
  }

  async updateCampaign(campaign: Partial<Campaign>): Promise<Campaign> {
    return request<Campaign>('/api/campaign', {
      method: 'PATCH',
      body: JSON.stringify(campaign),
    });
  }

  // Users
  async getUsers(): Promise<User[]> {
    return request<User[]>('/api/users');
  }

  async getUser(id: string): Promise<User | null> {
    return request<User | null>(`/api/users/${id}`);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return request<User | null>(`/api/users/email/${email}`);
  }

  async createUser(user: Omit<User, 'id' | 'pointsBalance'>): Promise<User> {
    return request<User>('/api/users', {
      method: 'POST',
      body: JSON.stringify(user),
    });
  }

  async updateUser(id: string, user: Partial<User>): Promise<User> {
    return request<User>(`/api/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(user),
    });
  }

  // Merchants
  async getOutlets(): Promise<Merchant[]> {
    return request<Merchant[]>('/api/merchants');
  }

  async getOutlet(id: string): Promise<Merchant | null> {
    return request<Merchant | null>(`/api/merchants/${id}`);
  }

  async createOutlet(merchant: Omit<Merchant, 'id'>): Promise<Merchant> {
    return request<Merchant>('/api/merchants', {
      method: 'POST',
      body: JSON.stringify(merchant),
    });
  }

  async updateOutlet(id: string, merchant: Partial<Merchant>): Promise<Merchant> {
    return request<Merchant>(`/api/merchants/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(merchant),
    });
  }

  async deleteOutlet(id: string): Promise<void> {
    await request<void>(`/api/merchants/${id}`, { method: 'DELETE' });
  }

  // Product Overrides
  async getProductOverrides(merchantId: string): Promise<MerchantProductOverride[]> {
    return request<MerchantProductOverride[]>(`/api/merchants/${merchantId}/overrides`);
  }

  async setProductOverride(
    override: Omit<MerchantProductOverride, 'id'>
  ): Promise<MerchantProductOverride> {
    return request<MerchantProductOverride>('/api/merchants/overrides', {
      method: 'POST',
      body: JSON.stringify(override),
    });
  }

  // Admin Stats
  async getDashboardKPIs(): Promise<DashboardKPI> {
    return request<DashboardKPI>('/api/admin/kpis');
  }

  async getRevenueData(days: number): Promise<RevenueDataPoint[]> {
    return request<RevenueDataPoint[]>(`/api/admin/revenue?days=${days}`);
  }

  // Admin Tools
  async resetStorage(): Promise<void> {
    await request<void>('/api/admin/reset', { method: 'POST' });
  }
}

export const realAdapter = new RealAdapter();
