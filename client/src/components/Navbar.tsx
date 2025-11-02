// Main Navbar Component

import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Coins, LogOut, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PointsBadge } from "./PointsBadge";
import { CartDrawer } from "./CartDrawer";
import { api } from "@/api";
import { useSessionStore } from "@/store/session";
import { useCartStore } from "@/store/cart";

export function Navbar() {
  const { currentUser, logout } = useSessionStore();
  const [, setLocation] = useLocation();

  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const isCartOpen = useCartStore((state) => state.isOpen);
  const openCart = useCartStore((state) => state.openCart);
  const closeCart = useCartStore((state) => state.closeCart);
  const totalItems = useCartStore((state) =>
    state.items.reduce((total, item) => total + item.quantity, 0),
  );

  const { data: stats } = useQuery({
    queryKey: ["/api/loyalty/stats", currentUser?.id],
    queryFn: () =>
      currentUser && currentUser.role === "user"
        ? api.getUserStats(currentUser.id)
        : null,
    enabled: !!currentUser && currentUser.role === "user",
  });

  return (
    <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-lg">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <Coins className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="hidden text-xl font-bold sm:inline">PointHub</span>
        </div>

        {/* Right - User Info */}
        <div className="flex items-center gap-4">
          {currentUser?.role === "user" && (
            <>
              {stats && <PointsBadge points={stats.pointsBalance} />}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative h-10 w-10 rounded-xl"
                  onClick={openCart}
                  data-testid="button-navbar-cart"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {totalItems > 0 && (
                    <Badge className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-destructive px-1 text-xs text-destructive-foreground">
                      {totalItems}
                    </Badge>
                  )}
                </Button>
              </div>
            </>
          )}

          {currentUser && (
            <>
              <div className="hidden md:block">
                <div className="text-sm font-medium">{currentUser.email}</div>
                <div className="text-xs capitalize text-muted-foreground">
                  {currentUser.role}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-xl"
                onClick={() => {
                  logout();
                  closeCart();
                  setLocation("/login");
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Keluar
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Global Cart Drawer */}
      {currentUser?.role === "user" && (
        <CartDrawer
          open={isCartOpen}
          onOpenChange={(open) => (open ? openCart() : closeCart())}
          items={items}
          onUpdateQuantity={updateQuantity}
          onRemoveItem={removeItem}
          onCheckout={() => {
            closeCart();
            setLocation("/checkout");
          }}
        />
      )}
    </div>
  );
}
