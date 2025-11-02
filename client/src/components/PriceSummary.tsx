// Price Summary Component - displays pricing breakdown

import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatRupiah } from "@/utils/money";
import { AlertCircle, TrendingUp } from "lucide-react";

interface PriceSummaryProps {
  subtotal: number;
  voucherDiscount?: number;
  total: number;
  pointsToEarn?: number;
  discountCapped?: boolean;
  className?: string;
}

export function PriceSummary({
  subtotal,
  voucherDiscount = 0,
  total,
  pointsToEarn = 0,
  discountCapped = false,
  className = "",
}: PriceSummaryProps) {
  return (
    <Card className={`rounded-2xl ${className}`}>
      <CardContent className="p-6 space-y-4">
        <h3 className="font-semibold text-lg">Price Summary</h3>
        
        <div className="space-y-3">
          {/* Subtotal */}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-mono" data-testid="text-subtotal">{formatRupiah(subtotal)}</span>
          </div>

          {/* Voucher Discount */}
          {voucherDiscount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-green-600 dark:text-green-400">Voucher Discount</span>
              <span className="font-mono text-green-600 dark:text-green-400 font-semibold" data-testid="text-discount">
                -{formatRupiah(voucherDiscount)}
              </span>
            </div>
          )}

          {/* Discount Cap Warning */}
          {discountCapped && (
            <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
              <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-yellow-800 dark:text-yellow-200">
                Discount capped at 50% of subtotal
              </p>
            </div>
          )}

          <Separator />

          {/* Total */}
          <div className="flex justify-between items-baseline">
            <span className="font-semibold text-lg">Total</span>
            <span className="font-mono font-bold text-2xl" data-testid="text-total">
              {formatRupiah(total)}
            </span>
          </div>

          {/* Points to Earn */}
          {pointsToEarn > 0 && (
            <div className="flex items-center justify-between p-3 bg-primary/5 rounded-xl border border-primary/20">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Points to earn</span>
              </div>
              <span className="font-mono font-bold text-primary" data-testid="text-points-to-earn">
                +{pointsToEarn}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
