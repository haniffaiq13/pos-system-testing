// Business rules for PointHub loyalty system

import type { Campaign, PricePreview } from "@shared/schema";

export function calculatePointsEarned(total: number, accrualPer: number): number {
  return Math.floor(total / accrualPer);
}

export function calculateMinSpend(valueRp: number): number {
  return Math.max(50000, valueRp * 2);
}

export function calculateVoucherDiscount(
  subtotal: number,
  voucherValueRp: number,
  discountCapPct: number
): { discount: number; capped: boolean } {
  const maxDiscount = Math.floor(subtotal * (discountCapPct / 100));
  const actualDiscount = Math.min(voucherValueRp, maxDiscount);
  return {
    discount: actualDiscount,
    capped: actualDiscount < voucherValueRp,
  };
}

export function previewPrice(
  subtotal: number,
  voucherValueRp: number | null,
  campaign: Campaign
): PricePreview {
  let voucherDiscount = 0;
  let discountCapped = false;

  if (voucherValueRp && voucherValueRp > 0) {
    const result = calculateVoucherDiscount(
      subtotal,
      voucherValueRp,
      campaign.discountCapPct
    );
    voucherDiscount = result.discount;
    discountCapped = result.capped;
  }

  const total = subtotal - voucherDiscount;
  const pointsToEarn = calculatePointsEarned(total, campaign.accrualPer);

  return {
    subtotal,
    voucherDiscount,
    total,
    discountCapped,
    pointsToEarn,
  };
}

export function generateVoucherCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'VCH-';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function calculateExpiryDate(expiryDays: number): Date {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + expiryDays);
  return expiry;
}

export function isVoucherExpired(expiresAt: Date | string): boolean {
  const expiryDate = typeof expiresAt === 'string' ? new Date(expiresAt) : expiresAt;
  return expiryDate < new Date();
}

export function getVoucherStatus(
  status: string,
  expiresAt: Date | string
): 'ACTIVE' | 'USED' | 'EXPIRED' {
  if (status === 'USED') return 'USED';
  if (isVoucherExpired(expiresAt)) return 'EXPIRED';
  return 'ACTIVE';
}

export const VOUCHER_TIERS = [
  { pointsCost: 100, valueRp: 50000 },
  { pointsCost: 200, valueRp: 100000 },
  { pointsCost: 500, valueRp: 300000 },
];

export function calculateNextVoucherProgress(currentPoints: number) {
  // Find the next tier
  const nextTier = VOUCHER_TIERS.find(tier => currentPoints < tier.pointsCost);
  
  if (!nextTier) {
    // User has enough for the highest tier
    return {
      currentPoints,
      pointsNeeded: VOUCHER_TIERS[VOUCHER_TIERS.length - 1].pointsCost,
      percentComplete: 100,
      nextTier: VOUCHER_TIERS[VOUCHER_TIERS.length - 1],
    };
  }

  return {
    currentPoints,
    pointsNeeded: nextTier.pointsCost,
    percentComplete: (currentPoints / nextTier.pointsCost) * 100,
    nextTier,
  };
}
