// Role Switcher Component - allows switching between user, pos, admin roles

import { useState } from "react";
import { useSessionStore } from "@/store/session";
import { Button } from "@/components/ui/button";
import { api } from "@/api";
import { useToast } from "@/hooks/use-toast";
import { User, Store, Shield, Loader2 } from "lucide-react";

const roles = [
  { value: 'user', label: 'User', icon: User, email: 'hanif@demo.io' },
  { value: 'pos', label: 'POS', icon: Store, email: 'pos@demo.io' },
  { value: 'admin', label: 'Admin', icon: Shield, email: 'admin@demo.io' },
];

export function RoleSwitcher() {
  const { currentUser, setCurrentUser } = useSessionStore();
  const { toast } = useToast();
  const [loadingRole, setLoadingRole] = useState<string | null>(null);

  const handleRoleSwitch = async (email: string, label: string, role: string) => {
    try {
      setLoadingRole(role);
      const user = await api.login(email, "password");
      if (user) {
        setCurrentUser(user);
        toast({
          title: `Switched to ${label}`,
          description: `Now viewing as ${email}`,
        });
      }
    } catch (error) {
      toast({
        title: "Error switching role",
        description: "Failed to switch role. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingRole(null);
    }
  };

  return (
    <div className="flex items-center gap-2 bg-muted/50 rounded-2xl p-1" data-testid="role-switcher">
      {roles.map((role) => {
        const Icon = role.icon;
        const isActive = currentUser?.role === role.value;
        const isLoading = loadingRole === role.value;
        
        return (
          <Button
            key={role.value}
            variant={isActive ? "secondary" : "ghost"}
            size="sm"
            onClick={() => handleRoleSwitch(role.email, role.label, role.value)}
            className="rounded-xl gap-2"
            data-testid={`button-role-${role.value}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Icon className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">{role.label}</span>
          </Button>
        );
      })}
    </div>
  );
}
