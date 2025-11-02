import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navbar } from "@/components/Navbar";
import { UserNav } from "@/components/UserNav";
import { AdminSidebar } from "@/components/AdminSidebar";
import { RequireRole } from "@/components/RequireRole";
import { useSessionStore } from "@/store/session";
import { useEffect } from "react";

// User Pages
import Marketplace from "@/pages/user/Marketplace";
import Checkout from "@/pages/user/Checkout";
import MeDashboard from "@/pages/user/MeDashboard";
import Vouchers from "@/pages/user/Vouchers";
import Orders from "@/pages/user/Orders";

// POS Pages
import QuickSale from "@/pages/pos/QuickSale";
import Customers from "@/pages/pos/Customers";

// Admin Pages
import Overview from "@/pages/admin/Overview";
import Products from "@/pages/admin/Products";
import Users from "@/pages/admin/Users";
import Tools from "@/pages/admin/Tools";

function Router() {
  const { currentUser, setCurrentUser } = useSessionStore();
  const [location, setLocation] = useLocation();

  // Initialize with default user if none selected
  useEffect(() => {
    if (!currentUser) {
      // Auto-select hanif@demo.io as default user
      import("@/api").then(({ api }) => {
        api.getUserByEmail("hanif@demo.io").then((user) => {
          if (user) setCurrentUser(user);
        });
      });
    }
  }, [currentUser, setCurrentUser]);

  // Role-based redirects - enforce proper role routing
  useEffect(() => {
    if (!currentUser) return;

    const role = currentUser.role;
    
    // Redirect to appropriate default page based on role
    if (role === 'admin' && !location.startsWith('/admin')) {
      setLocation('/admin/overview');
    } else if (role === 'pos' && !location.startsWith('/pos')) {
      setLocation('/pos/sale');
    } else if (role === 'user' && (location.startsWith('/admin') || location.startsWith('/pos'))) {
      setLocation('/');
    }
  }, [currentUser, location, setLocation]);

  const role = currentUser?.role || 'user';

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="flex flex-1">
        {/* Sidebar for Admin/POS */}
        {(role === 'admin' || role === 'pos') && (
          <AdminSidebar role={role} />
        )}

        {/* Main Content */}
        <div className="flex-1">
          <Switch>
            {/* User Routes - require user role */}
            <Route path="/">
              <RequireRole roles={['user']}>
                <Marketplace />
              </RequireRole>
            </Route>
            <Route path="/checkout">
              <RequireRole roles={['user']}>
                <Checkout />
              </RequireRole>
            </Route>
            <Route path="/me">
              <RequireRole roles={['user']}>
                <MeDashboard />
              </RequireRole>
            </Route>
            <Route path="/vouchers">
              <RequireRole roles={['user']}>
                <Vouchers />
              </RequireRole>
            </Route>
            <Route path="/orders">
              <RequireRole roles={['user']}>
                <Orders />
              </RequireRole>
            </Route>

            {/* POS Routes */}
            <Route path="/pos/sale">
              <RequireRole roles={['pos']}>
                <QuickSale />
              </RequireRole>
            </Route>
            <Route path="/pos/customers">
              <RequireRole roles={['pos']}>
                <Customers />
              </RequireRole>
            </Route>

            {/* Admin Routes */}
            <Route path="/admin/overview">
              <RequireRole roles={['admin']}>
                <Overview />
              </RequireRole>
            </Route>
            <Route path="/admin/products">
              <RequireRole roles={['admin']}>
                <Products />
              </RequireRole>
            </Route>
            <Route path="/admin/users">
              <RequireRole roles={['admin']}>
                <Users />
              </RequireRole>
            </Route>
            <Route path="/admin/tools">
              <RequireRole roles={['admin']}>
                <Tools />
              </RequireRole>
            </Route>

            {/* 404 */}
            <Route>
              <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                  <h1 className="text-4xl font-bold mb-4">404</h1>
                  <p className="text-muted-foreground">Page not found</p>
                </div>
              </div>
            </Route>
          </Switch>
        </div>
      </div>

      {/* Bottom Tab Bar for User on Mobile */}
      {role === 'user' && <UserNav />}

      <Toaster />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
