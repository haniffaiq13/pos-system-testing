// Main Navbar Component

import { RoleSwitcher } from "./RoleSwitcher";
import { PointsBadge } from "./PointsBadge";
import { useSessionStore } from "@/store/session";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/api";
import { Coins } from "lucide-react";

export function Navbar() {
  const { currentUser } = useSessionStore();

  const { data: stats } = useQuery({
    queryKey: ['/api/loyalty/stats', currentUser?.id],
    queryFn: () => currentUser && currentUser.role === 'user' ? api.getUserStats(currentUser.id) : null,
    enabled: !!currentUser && currentUser.role === 'user',
  });

  return (
    <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-lg">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <Coins className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl hidden sm:inline">PointHub</span>
        </div>

        {/* Center - Role Switcher */}
        <RoleSwitcher />

        {/* Right - User Info */}
        <div className="flex items-center gap-4">
          {currentUser?.role === 'user' && stats && (
            <PointsBadge points={stats.pointsBalance} />
          )}
          {currentUser && (
            <div className="hidden md:block">
              <div className="text-sm font-medium">{currentUser.email}</div>
              <div className="text-xs text-muted-foreground capitalize">{currentUser.role}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
