// Overview Page - Admin App dashboard

import { useQuery } from "@tanstack/react-query";
import { api } from "@/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Users, Ticket, DollarSign, ShoppingCart } from "lucide-react";
import { formatRupiah } from "@/utils/money";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function Overview() {
  const { data: kpis } = useQuery({
    queryKey: ['/api/admin/kpis'],
    queryFn: () => api.getDashboardKPIs(),
  });

  const { data: revenueData = [] } = useQuery({
    queryKey: ['/api/admin/revenue'],
    queryFn: () => api.getRevenueData(7),
  });

  const kpiCards = [
    {
      title: "Total Revenue",
      value: formatRupiah(kpis?.totalRevenue || 0),
      change: kpis?.revenueChange || 0,
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      title: "Active Users",
      value: kpis?.activeUsers || 0,
      change: kpis?.usersChange || 0,
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Vouchers Redeemed",
      value: kpis?.vouchersRedeemed || 0,
      change: kpis?.vouchersChange || 0,
      icon: Ticket,
      color: "text-purple-600",
    },
    {
      title: "Avg Transaction",
      value: formatRupiah(kpis?.avgTransaction || 0),
      change: kpis?.avgTransactionChange || 0,
      icon: ShoppingCart,
      color: "text-orange-600",
    },
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6">Dashboard Overview</h1>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {kpiCards.map((kpi) => {
            const Icon = kpi.icon;
            const isPositive = kpi.change >= 0;
            const TrendIcon = isPositive ? TrendingUp : TrendingDown;

            return (
              <Card key={kpi.title} className="rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${kpi.color}`} />
                    </div>
                    <div className={`flex items-center gap-1 text-xs ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      <TrendIcon className="w-3 h-3" />
                      <span>{Math.abs(kpi.change).toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="text-3xl font-bold font-mono mb-1">{kpi.value}</div>
                  <div className="text-sm text-muted-foreground">{kpi.title}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Revenue Chart */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Revenue Trend (7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '12px',
                  }}
                  formatter={(value: number) => formatRupiah(value)}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
