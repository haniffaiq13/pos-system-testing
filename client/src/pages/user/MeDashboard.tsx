// Me Dashboard Page - User App points and profile

import { useQuery } from "@tanstack/react-query";
import { api } from "@/api";
import { useSessionStore } from "@/store/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressRing } from "@/components/ProgressRing";
import { StatusBadge } from "@/components/StatusBadge";
import { formatRupiah } from "@/utils/money";
import { Coins, TrendingUp, ShoppingBag, Gift } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function MeDashboard() {
  const [, setLocation] = useLocation();
  const { currentUser } = useSessionStore();

  const { data: stats } = useQuery({
    queryKey: ['/api/loyalty/stats', currentUser?.id],
    queryFn: () => currentUser ? api.getUserStats(currentUser.id) : null,
    enabled: !!currentUser,
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['/api/orders', currentUser?.id],
    queryFn: () => currentUser ? api.getOrders(currentUser.id) : [],
    enabled: !!currentUser,
  });

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold mb-8">My Account</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Points Balance */}
          <Card className="rounded-2xl col-span-1 md:col-span-2">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <ProgressRing progress={stats?.nextVoucherProgress.percentComplete || 0} size={160}>
                  <div className="text-center">
                    <div className="text-3xl font-bold font-mono" data-testid="text-points-balance">
                      {stats?.pointsBalance || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">points</div>
                  </div>
                </ProgressRing>

                <div className="flex-1 space-y-4 text-center md:text-left">
                  <div>
                    <h3 className="text-lg font-semibold">Points Balance</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {stats?.nextVoucherProgress.pointsNeeded && stats.nextVoucherProgress.currentPoints < stats.nextVoucherProgress.pointsNeeded
                        ? `${stats.nextVoucherProgress.pointsNeeded - stats.nextVoucherProgress.currentPoints} points to next reward`
                        : 'You have enough points for all tiers!'}
                    </p>
                  </div>

                  <Button
                    onClick={() => setLocation('/vouchers')}
                    className="rounded-xl gap-2"
                    data-testid="button-redeem-vouchers"
                  >
                    <Gift className="w-4 h-4" />
                    Redeem Vouchers
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="space-y-6">
            <Card className="rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold font-mono">{stats?.totalOrders || 0}</div>
                    <div className="text-sm text-muted-foreground">Total Orders</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Coins className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-lg font-bold font-mono">{formatRupiah(stats?.lifetimeSpent || 0)}</div>
                    <div className="text-sm text-muted-foreground">Lifetime Spent</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Orders */}
        <Card className="rounded-2xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                Recent Orders
              </CardTitle>
              <Button
                variant="ghost"
                onClick={() => setLocation('/orders')}
                data-testid="button-view-all-orders"
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">No orders yet</p>
                <Button
                  variant="outline"
                  onClick={() => setLocation('/')}
                  className="mt-4 rounded-xl"
                >
                  Start Shopping
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order: any) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                        <StatusBadge status={order.status} />
                      </div>
                      {order.pointsEarned > 0 && order.status === 'PAID' && (
                        <p className="text-sm text-primary font-medium mt-1">
                          +{order.pointsEarned} points earned
                        </p>
                      )}
                    </div>
                    <div className="font-mono font-bold text-lg">
                      {formatRupiah(order.total)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
