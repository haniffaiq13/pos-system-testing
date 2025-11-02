// Checkout Page - User App checkout and payment

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/api";
import { useCartStore } from "@/store/cart";
import { useSessionStore } from "@/store/session";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PriceSummary } from "@/components/PriceSummary";
import { VoucherApply } from "@/components/VoucherApply";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, CreditCard, Loader2 } from "lucide-react";
import { formatRupiah } from "@/utils/money";
import type { Voucher } from "@shared/schema";
import { motion } from "framer-motion";
import { queryClient } from "@/lib/queryClient";

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { items, clearCart } = useCartStore();
  const { currentUser } = useSessionStore();
  const { toast } = useToast();
  const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0 && !processingPayment) {
      setLocation('/');
    }
  }, [items.length, processingPayment, setLocation]);

  // Fetch price preview
  const { data: preview } = useQuery({
    queryKey: ['/api/orders/preview', items, appliedVoucher?.code],
    queryFn: async () => {
      if (items.length === 0) return null;
      return api.previewPrice(items, appliedVoucher?.code);
    },
    enabled: items.length > 0,
  });

  // Checkout mutation
  const checkoutMutation = useMutation({
    mutationFn: async () => {
      return api.createCheckout(items, appliedVoucher?.code);
    },
    onSuccess: async (order) => {
      setProcessingPayment(true);
      
      toast({
        title: "Payment Processing",
        description: "Your payment is being processed via Xendit...",
      });

      // Wait for webhook simulation (3 seconds)
      await new Promise(resolve => setTimeout(resolve, 3500));

      // Fetch updated order status
      const updatedOrder = await api.getOrder(order.id);
      
      if (updatedOrder?.status === 'PAID') {
        clearCart();
        queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
        queryClient.invalidateQueries({ queryKey: ['/api/loyalty'] });
        
        toast({
          title: "Payment Successful!",
          description: `You earned ${updatedOrder.pointsEarned} points!`,
        });
        
        setLocation('/me');
      }
    },
    onError: () => {
      setProcessingPayment(false);
      toast({
        title: "Payment Failed",
        description: "Failed to process payment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleApplyVoucher = async (code: string): Promise<Voucher | null> => {
    const voucher = await api.validateVoucher(code);
    if (voucher && voucher.status === 'ACTIVE') {
      if (voucher.minSpendRp > subtotal) {
        return null;
      }
      setAppliedVoucher(voucher);
      return voucher;
    }
    return null;
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
  };

  const handlePayment = () => {
    checkoutMutation.mutate();
  };

  if (items.length === 0 && !processingPayment) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-background/95 backdrop-blur-lg border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Button
            variant="ghost"
            onClick={() => setLocation('/')}
            className="gap-2"
            data-testid="button-back-to-marketplace"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Marketplace
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Order Summary - Left */}
          <div className="lg:col-span-3 space-y-6">
            <Card className="rounded-2xl">
              <CardContent className="p-6">
                <h2 className="font-semibold text-lg mb-4">Order Items</h2>
                <div className="space-y-4">
                  {items.map((item, index) => (
                    <div key={item.productId}>
                      {index > 0 && <Separator className="my-4" />}
                      <div className="flex justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-medium">{item.productName}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            Quantity: {item.quantity} × {formatRupiah(item.price)}
                          </p>
                        </div>
                        <div className="font-mono font-semibold">
                          {formatRupiah(item.price * item.quantity)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <VoucherApply
              onApply={handleApplyVoucher}
              onRemove={handleRemoveVoucher}
              appliedVoucher={appliedVoucher}
              subtotal={subtotal}
            />
          </div>

          {/* Payment - Right */}
          <div className="lg:col-span-2 space-y-6">
            <div className="lg:sticky lg:top-24 space-y-6">
              {preview && (
                <PriceSummary
                  subtotal={preview.subtotal}
                  voucherDiscount={preview.voucherDiscount}
                  total={preview.total}
                  pointsToEarn={preview.pointsToEarn}
                  discountCapped={preview.discountCapped}
                />
              )}

              <motion.div
                whileHover={processingPayment || checkoutMutation.isPending ? {} : { scale: 1.02 }}
                whileTap={processingPayment || checkoutMutation.isPending ? {} : { scale: 0.98 }}
              >
                <Button
                  onClick={handlePayment}
                  disabled={processingPayment || checkoutMutation.isPending || !preview}
                  className="w-full h-16 rounded-2xl font-semibold text-lg gap-3"
                  size="lg"
                  data-testid="button-pay-xendit"
                >
                  {processingPayment || checkoutMutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      Pay via Xendit (Simulate)
                    </>
                  )}
                </Button>
              </motion.div>

              <p className="text-xs text-center text-muted-foreground">
                Payment will be automatically confirmed in 3 seconds (demo simulation)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
