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
import LoginPage from "@/pages/auth/Login";
import RegisterPage from "@/pages/auth/Register";
import { ROLE_HOME } from "@/utils/routes";

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
  const { currentUser } = useSessionStore();
  const [location, setLocation] = useLocation();

  const isAuthRoute =
    location.startsWith("/login") || location.startsWith("/register");

  useEffect(() => {
    if (!currentUser && !isAuthRoute) {
      setLocation("/login");
    }
  }, [currentUser, isAuthRoute, setLocation]);

  // Role-based redirects - enforce proper role routing
  useEffect(() => {
    if (!currentUser) return;
    if (isAuthRoute) {
      const defaultPath = ROLE_HOME[currentUser.role];
      if (location !== defaultPath) {
        setLocation(defaultPath);
      }
      return;
    }

    const role = currentUser.role;

    // Redirect to appropriate default page based on role
    if (role === 'admin' && !location.startsWith('/admin')) {
      setLocation('/admin/overview');
    } else if (role === 'pos' && !location.startsWith('/pos')) {
      setLocation('/pos/sale');
    } else if (role === 'user' && (location.startsWith('/admin') || location.startsWith('/pos'))) {
      setLocation('/');
    }
  }, [currentUser, location, isAuthRoute, setLocation]);

  const role = currentUser?.role;

  const showShell = !isAuthRoute;
  const showSidebar = showShell && (role === "admin" || role === "pos");
  const showUserNav = showShell && role === "user";

  return (
    <div className="flex flex-col min-h-screen">
      {showShell && <Navbar />}

      <div className="flex flex-1">
        {/* Sidebar for Admin/POS */}
        {showSidebar && role && (
          <AdminSidebar role={role} />
        )}

        {/* Main Content */}
        <div className="flex-1">
          <Switch>
            <Route path="/login">
              <LoginPage />
            </Route>
            <Route path="/register">
              <RegisterPage />
            </Route>

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
              <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                  <h1 className="mb-4 text-4xl font-bold">404</h1>
                  <p className="text-muted-foreground">Page not found</p>
                </div>
              </div>
            </Route>
          </Switch>
        </div>
      </div>

      {/* Bottom Tab Bar for User on Mobile */}
      {showUserNav && <UserNav />}

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
