// Customers Page - POS App customer lookup

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PointsBadge } from "@/components/PointsBadge";
import { Search, User } from "lucide-react";

export default function Customers() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: users = [] } = useQuery({
    queryKey: ['/api/users'],
    queryFn: () => api.getUsers(),
  });

  const customers = users.filter((user: any) => user.role === 'user');
  const filteredCustomers = customers.filter((user: any) =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6">Customer Lookup</h1>

        <Card className="rounded-2xl mb-6">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search by email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 rounded-2xl"
                data-testid="input-search-customers"
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map((customer: any) => (
            <Card key={customer.id} className="rounded-2xl">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{customer.email}</div>
                    <PointsBadge points={customer.pointsBalance} className="mt-1" />
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>

        {filteredCustomers.length === 0 && (
          <Card className="rounded-2xl">
            <CardContent className="p-12 text-center">
              <Search className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">No customers found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
