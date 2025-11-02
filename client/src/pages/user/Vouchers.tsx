// Vouchers Page - User App voucher redemption and management

import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/api";
import { useSessionStore } from "@/store/session";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatRupiah } from "@/utils/money";
import { VOUCHER_TIERS } from "@/utils/rules";
import { Gift, Ticket, Copy, Check, Calendar, DollarSign } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useState } from "react";
import { motion } from "framer-motion";

export default function Vouchers() {
  const { currentUser } = useSessionStore();
  const { toast } = useToast();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const { data: stats } = useQuery({
    queryKey: ['/api/loyalty/stats', currentUser?.id],
    queryFn: () => currentUser ? api.getUserStats(currentUser.id) : null,
    enabled: !!currentUser,
  });

  const { data: vouchers = [] } = useQuery({
    queryKey: ['/api/loyalty/vouchers', currentUser?.id],
    queryFn: () => currentUser ? api.getVouchers(currentUser.id) : [],
    enabled: !!currentUser,
  });

  const redeemMutation = useMutation({
    mutationFn: (pointsCost: number) => {
      if (!currentUser) throw new Error('Not logged in');
      return api.redeemVoucher(currentUser.id, pointsCost);
    },
    onSuccess: (voucher) => {
      queryClient.invalidateQueries({ queryKey: ['/api/loyalty'] });
      toast({
        title: "Voucher Redeemed!",
        description: `Your voucher code: ${voucher.code}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Redemption Failed",
        description: error.message || "Failed to redeem voucher",
        variant: "destructive",
      });
    },
  });

  const handleCopyCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast({
      title: "Copied!",
      description: "Voucher code copied to clipboard",
    });
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const activeVouchers = vouchers.filter((v: any) => v.status === 'ACTIVE');
  const usedVouchers = vouchers.filter((v: any) => v.status === 'USED');

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold mb-2">Vouchers</h1>
        <p className="text-muted-foreground mb-8">Redeem points for discount vouchers</p>

        {/* Redemption Tiers */}
        <Card className="rounded-2xl mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5" />
              Redeem Points
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              You have <span className="font-mono font-semibold">{stats?.pointsBalance || 0}</span> points
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {VOUCHER_TIERS.map((tier) => {
                const canRedeem = (stats?.pointsBalance || 0) >= tier.pointsCost;
                
                return (
                  <motion.div
                    key={tier.pointsCost}
                    whileHover={canRedeem ? { y: -4 } : {}}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className={`rounded-2xl border-2 ${canRedeem ? 'border-primary/20 bg-primary/5' : 'opacity-60'}`}>
                      <CardContent className="p-6 space-y-4">
                        <div className="text-center">
                          <div className="text-3xl font-bold font-mono text-primary">
                            {tier.pointsCost}
                          </div>
                          <div className="text-sm text-muted-foreground">points</div>
                        </div>

                        <Separator />

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Voucher Value</span>
                            <span className="font-mono font-semibold">{formatRupiah(tier.valueRp)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Min. Spend</span>
                            <span className="font-mono">{formatRupiah(Math.max(50000, tier.valueRp * 2))}</span>
                          </div>
                        </div>

                        <Button
                          onClick={() => redeemMutation.mutate(tier.pointsCost)}
                          disabled={!canRedeem || redeemMutation.isPending}
                          className="w-full rounded-xl"
                          data-testid={`button-redeem-${tier.pointsCost}`}
                        >
                          {canRedeem ? 'Redeem' : 'Not Enough Points'}
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Active Vouchers */}
        <Card className="rounded-2xl mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ticket className="w-5 h-5" />
              Active Vouchers
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeVouchers.length === 0 ? (
              <div className="text-center py-12">
                <Ticket className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">No active vouchers</p>
                <p className="text-sm text-muted-foreground mt-1">Redeem points to get vouchers</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {activeVouchers.map((voucher: any) => (
                  <Card key={voucher.id} className="rounded-2xl border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-3">
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-300 dark:border-green-700">
                              ACTIVE
                            </Badge>
                            <span className="font-mono font-bold text-lg" data-testid={`text-voucher-code-${voucher.id}`}>
                              {voucher.code}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleCopyCode(voucher.code)}
                              className="h-8 w-8"
                              data-testid={`button-copy-${voucher.code}`}
                            >
                              {copiedCode === voucher.code ? (
                                <Check className="w-4 h-4 text-green-600" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </Button>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4 text-muted-foreground" />
                              <span>Value: <span className="font-mono font-semibold">{formatRupiah(voucher.valueRp)}</span></span>
                            </div>
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4 text-muted-foreground" />
                              <span>Min. Spend: <span className="font-mono">{formatRupiah(voucher.minSpendRp)}</span></span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span>Expires: {new Date(voucher.expiresAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Used Vouchers */}
        {usedVouchers.length > 0 && (
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>Used Vouchers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {usedVouchers.map((voucher: any) => (
                  <div key={voucher.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border">
                    <div>
                      <div className="font-mono font-semibold">{voucher.code}</div>
                      <div className="text-sm text-muted-foreground">
                        Used on {new Date(voucher.usedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <Badge variant="outline">USED</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
