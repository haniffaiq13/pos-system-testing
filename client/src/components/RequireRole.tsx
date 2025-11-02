// RequireRole Component - route guard for role-based access

import { useSessionStore } from "@/store/session";

interface RequireRoleProps {
  roles: string[];
  children: React.ReactNode;
}

export function RequireRole({ roles, children }: RequireRoleProps) {
  const { currentUser } = useSessionStore();

  if (!currentUser) {
    return <div className="flex items-center justify-center min-h-screen">
      <p className="text-muted-foreground">Loading...</p>
    </div>;
  }

  if (roles.length > 0 && !roles.includes(currentUser.role)) {
    // Role enforcement handled by App-level redirect
    return null;
  }

  return <>{children}</>;
}
