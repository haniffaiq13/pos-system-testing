// Orders Page - User App order history

import { useQuery } from "@tanstack/react-query";
import { api } from "@/api";
import { useSessionStore } from "@/store/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { formatRupiah } from "@/utils/money";
import { ShoppingBag, Package, TrendingUp, Calendar } from "lucide-react";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";

export default function Orders() {
  const { currentUser } = useSessionStore();
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['/api/orders', currentUser?.id],
    queryFn: () => currentUser ? api.getOrders(currentUser.id) : [],
    enabled: !!currentUser,
  });

  const { data: allOrderItems = [] } = useQuery({
    queryKey: ['/api/orderItems'],
    queryFn: async () => {
      const items = await Promise.all(
        orders.map((order: any) => api.getOrderItems(order.id))
      );
      return items.flat();
    },
    enabled: orders.length > 0,
  });

  const getOrderItems = (orderId: string) => {
    return allOrderItems.filter((item: any) => item.orderId === orderId);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center gap-3 mb-8">
          <ShoppingBag className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Order History</h1>
            <p className="text-muted-foreground">{orders.length} total orders</p>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-muted animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <Card className="rounded-2xl">
            <CardContent className="p-12">
              <div className="text-center">
                <Package className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground">No orders yet</h3>
                <p className="text-sm text-muted-foreground mt-2">Your order history will appear here</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order: any) => {
              const items = getOrderItems(order.id);
              const isExpanded = expandedOrder === order.id;

              return (
                <Collapsible
                  key={order.id}
                  open={isExpanded}
                  onOpenChange={(open) => setExpandedOrder(open ? order.id : null)}
                >
                  <Card className="rounded-2xl border-2 overflow-hidden">
                    <CollapsibleTrigger className="w-full">
                      <CardHeader className="hover-elevate cursor-pointer">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <Package className="w-6 h-6 text-primary" />
                            </div>
                            <div className="flex-1 text-left">
                              <div className="flex items-center gap-3 flex-wrap">
                                <span className="font-mono text-sm text-muted-foreground">
                                  {new Date(order.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                  })}
                                </span>
                                <StatusBadge status={order.status} />
                                {order.voucherCode && (
                                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-mono">
                                    {order.voucherCode}
                                  </span>
                                )}
                              </div>
                              {items.length > 0 && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {items.length} {items.length === 1 ? 'item' : 'items'}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-4 md:flex-row-reverse">
                            <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                            <div className="text-right">
                              <div className="font-mono font-bold text-xl">{formatRupiah(order.total)}</div>
                              {order.status === 'PAID' && order.pointsEarned > 0 && (
                                <div className="flex items-center gap-1 text-primary text-sm font-medium mt-1">
                                  <TrendingUp className="w-4 h-4" />
                                  <span>+{order.pointsEarned} points</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <CardContent className="pt-0 pb-6 px-6">
                        <Separator className="mb-6" />
                        
                        {/* Order Items */}
                        <div className="space-y-4 mb-6">
                          <h4 className="font-semibold text-sm text-muted-foreground uppercase">Order Items</h4>
                          {items.map((item: any) => (
                            <div key={item.id} className="flex justify-between items-center p-3 bg-muted/30 rounded-xl">
                              <div>
                                <div className="font-medium">{item.productName}</div>
                                <div className="text-sm text-muted-foreground">
                                  Qty: {item.quantity} × {formatRupiah(item.price)}
                                </div>
                              </div>
                              <div className="font-mono font-semibold">
                                {formatRupiah(item.price * item.quantity)}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Order Summary */}
                        <div className="space-y-2 bg-muted/50 p-4 rounded-xl">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span className="font-mono">{formatRupiah(order.subtotal)}</span>
                          </div>
                          {order.voucherDiscount > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-green-600 dark:text-green-400">Voucher Discount</span>
                              <span className="font-mono text-green-600 dark:text-green-400">
                                -{formatRupiah(order.voucherDiscount)}
                              </span>
                            </div>
                          )}
                          <Separator />
                          <div className="flex justify-between font-semibold">
                            <span>Total</span>
                            <span className="font-mono">{formatRupiah(order.total)}</span>
                          </div>
                        </div>

                        {/* Payment Date */}
                        {order.paidAt && (
                          <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span>
                              Paid on {new Date(order.paidAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        )}
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
