import { Switch, Route, useLocation } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { useAuth } from "@/contexts/AuthContext";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import MyIssues from "@/pages/MyIssues";
import AreaOverview from "@/pages/AreaOverview";
import Landing from "@/pages/Landing";
import { RoleProvider, useRole } from "@/contexts/RoleContext";
import AdminDashboard from "@/pages/AdminDashboard";
import WorkerDashboard from "@/pages/WorkerDashboard";

function Router() {
  const RequireAuth = ({ children }: { children: any }) => {
    const { user, isLoading } = useAuth();
    const [, navigate] = useLocation();

    useEffect(() => {
      if (isLoading) return;
      if (!user) navigate("/");
    }, [isLoading, user, navigate]);

    if (isLoading) return null;
    if (!user) return null;
    return children;
  };

  const RoleGuard = ({ role, children }: { role: 'admin' | 'worker'; children: any }) => {
    const { role: current } = useRole();
    if (role !== current) return <NotFound />;
    return children;
  };

  const DashboardRedirect = () => {
    const { role } = useRole();
    const [, navigate] = useLocation();

    useEffect(() => {
      if (role === 'admin') navigate('/admin');
      else if (role === 'worker') navigate('/worker');
      else navigate('/assistant');
    }, [role, navigate]);

    return null;
  };

  return (
    <Switch>
      <Route path="/" component={Landing} />

      <Route path="/assistant">
        {() => (
          <RequireAuth>
            <Home />
          </RequireAuth>
        )}
      </Route>

      <Route path="/dashboard">
        {() => (
          <RequireAuth>
            <DashboardRedirect />
          </RequireAuth>
        )}
      </Route>

      <Route path="/my-issues">
        {() => (
          <RequireAuth>
            <MyIssues />
          </RequireAuth>
        )}
      </Route>

      <Route path="/area">
        {() => (
          <RequireAuth>
            <AreaOverview />
          </RequireAuth>
        )}
      </Route>

      <Route path="/admin">
        {() => (
          <RequireAuth>
            <RoleGuard role="admin">
              <AdminDashboard />
            </RoleGuard>
          </RequireAuth>
        )}
      </Route>
      <Route path="/worker">
        {() => (
          <RequireAuth>
            <RoleGuard role="worker">
              <WorkerDashboard />
            </RoleGuard>
          </RequireAuth>
        )}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <AuthProvider>
      <RoleProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </QueryClientProvider>
      </RoleProvider>
    </AuthProvider>
  );
}

export default App;
