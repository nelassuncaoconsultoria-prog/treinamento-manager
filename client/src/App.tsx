import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "./components/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import EmployeeProfile from "./pages/EmployeeProfile";
import Courses from "./pages/Courses";
import Assignments from "./pages/Assignments";
import Reports from "./pages/Reports";
import Users from "./pages/Users";
import Home from "./pages/Home";
import Login from "./pages/Login";

function Router() {
  const { isAuthenticated, loading, user } = useAuth();
  console.log('Router - isAuthenticated:', isAuthenticated, 'loading:', loading, 'user:', user);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/login" component={Login} />
      {!isAuthenticated && (
        <>
          <Route path="/" component={Home} />
          <Route path="/404" component={NotFound} />
          <Route component={NotFound} />
        </>
      )}
      {isAuthenticated && (
        <>
          <Route path="/dashboard">
            {() => (
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            )}
          </Route>
          <Route path="/funcionarios">
            {() => (
              <DashboardLayout>
                <Employees />
              </DashboardLayout>
            )}
          </Route>
          <Route path="/employees/:id">
            {(params) => (
              <DashboardLayout>
                <EmployeeProfile />
              </DashboardLayout>
            )}
          </Route>
          <Route path="/cursos">
            {() => (
              <DashboardLayout>
                <Courses />
              </DashboardLayout>
            )}
          </Route>
          <Route path="/atribuicoes">
            {() => (
              <DashboardLayout>
                <Assignments />
              </DashboardLayout>
            )}
          </Route>
          <Route path="/relatorios">
            {() => (
              <DashboardLayout>
                <Reports />
              </DashboardLayout>
            )}
          </Route>
          <Route path="/usuarios">
            {() => (
              <DashboardLayout>
                <Users />
              </DashboardLayout>
            )}
          </Route>
          <Route path="/">
            {() => (
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            )}
          </Route>
          <Route path="/404" component={NotFound} />
          <Route component={NotFound} />
        </>
      )}
    </Switch>
  );
}



function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
