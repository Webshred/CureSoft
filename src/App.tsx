import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import InventoryPage from "./pages/InventoryPage";
import FinancePage from "./pages/FinancePage";
import HelpPage from "./pages/HelpPage";
import AccountPage from "./pages/AccountPage";
import BillingPage from "./pages/BillingPage";
import EmployeesPage from "./pages/EmployeesPage";
import SettingsPage from "./pages/SettingsPage";
import AuthPage from "./pages/AuthPage";
import { useEffect, useState } from "react";
import { CRMProvider } from "./contexts/CRMContext";
import { AppSettingsProvider } from "./contexts/AppSettingsContext";
import { AuthProvider } from "./contexts/AuthContext";
import { trackPageView } from "./utils/analytics";
import { Toaster } from "./components/ui/toaster";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    },
  },
});

const RouterChangeHandler = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    const pageName = location.pathname === '/' ? 'dashboard' : location.pathname.replace(/^\//, '');
    trackPageView(pageName);
  }, [location.pathname]);

  return children;
};

const ProtectedRoute = ({ element, allowedRoles }: { element: JSX.Element, allowedRoles: string[] }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  if (!token) return <Navigate to="/auth" replace />;
  if (!allowedRoles.includes(role || '')) return <Navigate to="/unauthorized" replace />;
  return element;
};

const App = () => {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedRole = localStorage.getItem('role');
    setRole(storedRole);
    setLoading(false);
  }, []);

  if (loading) return null;
  if (role === 'user') {
    return (
      <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Routes>
              <Route path="/facturation" element={<BillingPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/compte" element={<AccountPage />} />
              <Route path="*" element={<Navigate to="/facturation" />} />
            </Routes>
            <Toaster />
          </TooltipProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
        <RouterChangeHandler>
          <AppSettingsProvider>
            <AuthProvider>
              <CRMProvider>
                <TooltipProvider>
                  <Routes>
                    <Route path="/" element={<ProtectedRoute element={<Index />} allowedRoles={["admin"]} />} />
                    <Route path="/inventaire" element={<ProtectedRoute element={<InventoryPage />} allowedRoles={["admin"]} />} />
                    <Route path="/finances" element={<ProtectedRoute element={<FinancePage />} allowedRoles={["admin"]} />} />
                    <Route path="/employes" element={<ProtectedRoute element={<EmployeesPage />} allowedRoles={["admin"]} />} />
                    <Route path="/parametres" element={<ProtectedRoute element={<SettingsPage />} allowedRoles={["admin"]} />} />
                    <Route path="/aide" element={<ProtectedRoute element={<HelpPage />} allowedRoles={["admin"]} />} />
                    <Route path="/compte" element={<ProtectedRoute element={<AccountPage />} allowedRoles={["admin" , "user"]} />} />
                    <Route path="/facturation" element={<ProtectedRoute element={<BillingPage />} allowedRoles={["admin","user"]} />} />
                    <Route path="/auth" element={<AuthPage />} />
                    <Route path="/unauthorized" element={<div className="p-10 text-center text-xl">Unauthorized Access</div>} />
                    <Route path="*" element={<Navigate to="/" />} />
                  </Routes>
                  <Toaster />
                </TooltipProvider>
              </CRMProvider>
            </AuthProvider>
          </AppSettingsProvider>
        </RouterChangeHandler>
    </QueryClientProvider>
  );
};

export default App;
