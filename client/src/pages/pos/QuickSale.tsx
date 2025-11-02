// Quick Sale Page - POS App main transaction interface

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/api";
import { usePOSTransactionStore } from "@/store/posTransaction";
import { useSessionStore } from "@/store/session";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { NumberPad } from "@/components/NumberPad";
import { ProductCard } from "@/components/ProductCard";
import { formatRupiah } from "@/utils/money";
import { Trash2, User, Ticket, CreditCard, TrendingUp, X } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Product } from "@shared/schema";

export default function QuickSale() {
  const { currentUser } = useSessionStore();
  const { items, customerId, customerEmail, voucherCode, addItem, updateQuantity, removeItem, setCustomer, setVoucherCode, clearTransaction, getSubtotal } = usePOSTransactionStore();
  const { toast } = useToast();
  const [customerEmailInput, setCustomerEmailInput] = useState("");
  const [voucherInput, setVoucherInput] = useState("");
  const [successDialog, setSuccessDialog] = useState(false);
  const [pointsEarned, setPointsEarned] = useState(0);

  const { data: products = [] } = useQuery({
    queryKey: ['/api/products'],
  });

  const { data: preview } = useQuery({
    queryKey: ['/api/orders/preview', items, voucherCode],
    queryFn: () => items.length > 0 ? api.previewPrice(items, voucherCode) : null,
    enabled: items.length > 0,
  });

  const chargeMutation = useMutation({
    mutationFn: async () => {
      if (!customerEmail) throw new Error('Customer email required');
      
      // Find or create user
      let customer = await api.getUserByEmail(customerEmail);
      if (!customer) {
        customer = await api.createUser({
          email: customerEmail,
          password: 'default',
          role: 'user',
          outletId: null,
        });
      }

      // Create order as the customer
      const order = await api.createCheckout(items, voucherCode);
      
      // Mark as paid immediately
      const paidOrder = await api.markPaid(order.id);
      
      return paidOrder;
    },
    onSuccess: (order) => {
      setPointsEarned(order.pointsEarned);
      setSuccessDialog(true);
      clearTransaction();
      setCustomerEmailInput("");
      setVoucherInput("");
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/loyalty'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Transaction Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAddProduct = (product: Product) => {
    addItem(product.id, product.name, product.price, product.imageUrl || undefined);
  };

  const handleSetCustomer = () => {
    if (customerEmailInput.trim()) {
      setCustomer(null, customerEmailInput);
      toast({
        title: "Customer Set",
        description: customerEmailInput,
      });
    }
  };

  const handleValidateVoucher = async () => {
    if (voucherInput.trim()) {
      const voucher = await api.validateVoucher(voucherInput.toUpperCase());
      if (voucher && voucher.status === 'ACTIVE') {
        const subtotal = getSubtotal();
        if (voucher.minSpendRp > subtotal) {
          toast({
            title: "Minimum Spend Not Met",
            description: `Minimum spend ${formatRupiah(voucher.minSpendRp)} required`,
            variant: "destructive",
          });
        } else {
          setVoucherCode(voucherInput.toUpperCase());
          toast({
            title: "Voucher Applied",
            description: `${formatRupiah(voucher.valueRp)} discount`,
          });
        }
      } else {
        toast({
          title: "Invalid Voucher",
          description: "Voucher is invalid or expired",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      {/* Products Sidebar */}
      <div className="w-80 border-r flex-shrink-0 hidden lg:flex flex-col">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-lg">Products</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-1 gap-3">
            {products.map((product: Product) => (
              <Button
                key={product.id}
                variant="outline"
                onClick={() => handleAddProduct(product)}
                className="h-auto p-4 rounded-2xl flex flex-col items-start gap-2 hover-elevate"
                data-testid={`button-add-product-${product.id}`}
              >
                <span className="font-semibold">{product.name}</span>
                <span className="font-mono text-sm">{formatRupiah(product.price)}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Transaction Builder */}
      <div className="flex-1 flex flex-col">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-semibold">Quick Sale</h1>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <Card className="rounded-2xl mb-6">
            <CardHeader>
              <CardTitle>Transaction Items</CardTitle>
            </CardHeader>
            <CardContent>
              {items.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Select products to add to transaction
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.productId} className="flex items-center gap-4 p-3 bg-muted/30 rounded-xl">
                      <div className="flex-1">
                        <div className="font-medium">{item.productName}</div>
                        <div className="text-sm text-muted-foreground font-mono">{formatRupiah(item.price)}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value) || 0)}
                          className="w-20 text-center font-mono"
                          min="1"
                          data-testid={`input-quantity-${item.productId}`}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(item.productId)}
                          data-testid={`button-remove-item-${item.productId}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="font-mono font-semibold w-24 text-right">
                        {formatRupiah(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {preview && (
            <Card className="rounded-2xl">
              <CardContent className="p-6 space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-mono font-semibold">{formatRupiah(preview.subtotal)}</span>
                </div>
                {preview.voucherDiscount > 0 && (
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span>Discount (50% cap)</span>
                    <span className="font-mono font-semibold">-{formatRupiah(preview.voucherDiscount)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-xl font-bold">
                  <span>TOTAL</span>
                  <span className="font-mono" data-testid="text-pos-total">{formatRupiah(preview.total)}</span>
                </div>
                {preview.pointsToEarn > 0 && (
                  <div className="flex items-center gap-2 text-primary">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm">Customer earns +{preview.pointsToEarn} points</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Right Panel - Customer & Payment */}
      <div className="w-96 border-l flex-shrink-0 flex flex-col">
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          {/* Customer Input */}
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="w-4 h-4" />
                Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                placeholder="customer@email.com"
                value={customerEmailInput}
                onChange={(e) => setCustomerEmailInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSetCustomer()}
                className="h-12 rounded-xl"
                data-testid="input-customer-email"
              />
              {customerEmail && (
                <div className="flex items-center justify-between p-3 bg-primary/10 rounded-xl">
                  <span className="text-sm font-mono">{customerEmail}</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setCustomer(null, "")}>
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Voucher Input */}
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Ticket className="w-4 h-4" />
                Voucher
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="VOUCHER CODE"
                  value={voucherInput}
                  onChange={(e) => setVoucherInput(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && handleValidateVoucher()}
                  className="h-12 rounded-xl font-mono uppercase"
                  data-testid="input-voucher-code-pos"
                />
                <Button onClick={handleValidateVoucher} className="rounded-xl">Apply</Button>
              </div>
              {voucherCode && (
                <div className="flex items-center justify-between p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                  <span className="text-sm font-mono font-semibold">{voucherCode}</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setVoucherCode("")}>
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Charge Button */}
        <div className="p-6 border-t">
          <Button
            onClick={() => chargeMutation.mutate()}
            disabled={items.length === 0 || !customerEmail || chargeMutation.isPending}
            className="w-full h-16 rounded-2xl text-lg font-bold gap-2"
            data-testid="button-charge"
          >
            <CreditCard className="w-5 h-5" />
            {chargeMutation.isPending ? "Processing..." : "Charge"}
          </Button>
        </div>
      </div>

      {/* Success Dialog */}
      <Dialog open={successDialog} onOpenChange={setSuccessDialog}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl text-center">Transaction Complete!</DialogTitle>
          </DialogHeader>
          <div className="py-8 text-center">
            <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
              <TrendingUp className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-4xl font-bold font-mono text-primary mb-2">
              +{pointsEarned}
            </div>
            <p className="text-muted-foreground">Points Earned</p>
          </div>
          <Button onClick={() => setSuccessDialog(false)} className="w-full rounded-xl">
            New Transaction
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
