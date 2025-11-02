// Voucher Apply Component - input and validation for voucher codes

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Ticket, X, AlertCircle } from "lucide-react";
import { formatRupiah } from "@/utils/money";
import type { Voucher } from "@shared/schema";

interface VoucherApplyProps {
  onApply: (code: string) => Promise<Voucher | null>;
  onRemove: () => void;
  appliedVoucher: Voucher | null;
  subtotal: number;
}

export function VoucherApply({ onApply, onRemove, appliedVoucher, subtotal }: VoucherApplyProps) {
  const [code, setCode] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState("");

  const handleApply = async () => {
    if (!code.trim()) return;
    
    setIsApplying(true);
    setError("");
    
    try {
      const voucher = await onApply(code.toUpperCase());
      if (!voucher) {
        setError("Invalid or expired voucher code");
      } else if (voucher.minSpendRp > subtotal) {
        setError(`Minimum spend ${formatRupiah(voucher.minSpendRp)} required`);
        onRemove();
      } else {
        setCode("");
      }
    } catch (err) {
      setError("Failed to apply voucher");
    } finally {
      setIsApplying(false);
    }
  };

  if (appliedVoucher) {
    return (
      <Card className="rounded-2xl border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold text-sm" data-testid="text-applied-voucher-code">
                    {appliedVoucher.code}
                  </span>
                  <Badge variant="outline" className="text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-300 dark:border-green-700">
                    Applied
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Value: {formatRupiah(appliedVoucher.valueRp)}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onRemove}
              className="flex-shrink-0"
              data-testid="button-remove-voucher"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Ticket className="w-5 h-5 text-primary" />
          <span className="font-medium">Have a voucher?</span>
        </div>
        
        <div className="flex gap-2">
          <Input
            placeholder="Enter voucher code"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setError("");
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleApply()}
            className="rounded-xl font-mono uppercase h-12"
            disabled={isApplying}
            data-testid="input-voucher-code"
          />
          <Button
            onClick={handleApply}
            disabled={!code.trim() || isApplying}
            className="rounded-xl px-6"
            data-testid="button-apply-voucher"
          >
            {isApplying ? "Applying..." : "Apply"}
          </Button>
        </div>

        {error && (
          <div className="flex items-start gap-2 p-3 bg-destructive/10 rounded-xl border border-destructive/20">
            <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
            <p className="text-sm text-destructive" data-testid="text-voucher-error">{error}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
