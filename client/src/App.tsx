import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import MyIssues from "@/pages/MyIssues";
import AreaOverview from "@/pages/AreaOverview";
import { RoleProvider, useRole } from "@/contexts/RoleContext";
import AdminDashboard from "@/pages/AdminDashboard";
import WorkerDashboard from "@/pages/WorkerDashboard";

function Router() {
  const Guard = ({ role, children }: { role: 'admin' | 'worker'; children: any }) => {
    const { role: current } = useRole();
    if (role !== current) return <NotFound />;
    return children;
  };
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/my-issues" component={MyIssues} />
      <Route path="/area" component={AreaOverview} />
      <Route path="/admin">
        {() => (
          <Guard role="admin">
            <AdminDashboard />
          </Guard>
        )}
      </Route>
      <Route path="/worker">
        {() => (
          <Guard role="worker">
            <WorkerDashboard />
          </Guard>
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
