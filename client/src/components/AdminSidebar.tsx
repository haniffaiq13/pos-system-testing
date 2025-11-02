// Admin/POS Sidebar Navigation

import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Package,
  Settings,
  Users,
  Ticket,
  Store,
  Wrench,
  ShoppingCart,
  UserSearch,
} from "lucide-react";

interface SidebarProps {
  role: 'admin' | 'pos';
}

const adminItems = [
  { path: "/admin/overview", label: "Overview", icon: LayoutDashboard },
  { path: "/admin/products", label: "Products", icon: Package },
  { path: "/admin/users", label: "Users", icon: Users },
  { path: "/admin/tools", label: "Tools", icon: Wrench },
];

const posItems = [
  { path: "/pos/sale", label: "Quick Sale", icon: ShoppingCart },
  { path: "/pos/customers", label: "Customers", icon: UserSearch },
];

export function AdminSidebar({ role }: SidebarProps) {
  const [location] = useLocation();
  const items = role === 'admin' ? adminItems : posItems;

  return (
    <div className="w-64 border-r bg-sidebar min-h-screen flex flex-col">
      <div className="p-6">
        <h2 className="font-semibold text-lg capitalize">{role} Panel</h2>
      </div>
      <nav className="flex-1 px-3 space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;

          return (
            <Link key={item.path} href={item.path}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 rounded-xl",
                  isActive && "bg-sidebar-accent"
                )}
                data-testid={`link-${item.path.replace('/', '-')}`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Button>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
