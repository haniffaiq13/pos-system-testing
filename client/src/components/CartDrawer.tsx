// Cart Drawer Component - sliding cart panel for user app

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import { formatRupiah } from "@/utils/money";
import type { CartItem } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: () => void;
}

export function CartDrawer({
  open,
  onOpenChange,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}: CartDrawerProps) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full md:max-w-md flex flex-col p-0">
        <SheetHeader className="p-6 pb-4 border-b">
          <SheetTitle className="flex items-center gap-2 text-xl">
            <ShoppingCart className="w-5 h-5" />
            Shopping Cart
            {totalItems > 0 && (
              <span className="text-sm text-muted-foreground">({totalItems} items)</span>
            )}
          </SheetTitle>
        </SheetHeader>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <AnimatePresence mode="popLayout">
            {items.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center h-full text-center py-12"
              >
                <ShoppingCart className="w-16 h-16 text-muted-foreground/30 mb-4" />
                <p className="text-lg font-medium text-muted-foreground">Your cart is empty</p>
                <p className="text-sm text-muted-foreground mt-1">Add some products to get started</p>
              </motion.div>
            ) : (
              items.map((item) => (
                <motion.div
                  key={item.productId}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex gap-4 p-4 bg-card rounded-2xl border-2"
                  data-testid={`cart-item-${item.productId}`}
                >
                  {/* Product Image/Icon */}
                  <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex-shrink-0 overflow-hidden">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.productName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-2xl font-bold text-primary/20">
                          {item.productName.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold line-clamp-1" data-testid={`text-cart-item-name-${item.productId}`}>
                      {item.productName}
                    </h4>
                    <p className="text-sm font-mono text-muted-foreground mt-1">
                      {formatRupiah(item.price)}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex items-center gap-2 bg-muted rounded-xl p-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg"
                          onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
                          data-testid={`button-decrease-${item.productId}`}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="font-mono font-semibold w-8 text-center" data-testid={`text-quantity-${item.productId}`}>
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg"
                          onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                          data-testid={`button-increase-${item.productId}`}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg text-destructive hover:text-destructive"
                        onClick={() => onRemoveItem(item.productId)}
                        data-testid={`button-remove-${item.productId}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>

                      <span className="ml-auto font-mono font-semibold">
                        {formatRupiah(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <SheetFooter className="p-6 border-t mt-auto">
            <div className="w-full space-y-4">
              <div className="flex justify-between items-baseline">
                <span className="text-lg font-semibold">Subtotal</span>
                <span className="text-2xl font-mono font-bold" data-testid="text-cart-subtotal">
                  {formatRupiah(subtotal)}
                </span>
              </div>
              <Button
                onClick={onCheckout}
                className="w-full h-12 rounded-xl font-semibold text-base"
                data-testid="button-checkout"
              >
                Go to Payment
              </Button>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
