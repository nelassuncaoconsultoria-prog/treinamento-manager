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
        <DashboardLayout>
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/funcionarios" component={Employees} />
          <Route path="/employees/:id" component={EmployeeProfile} />
          <Route path="/cursos" component={Courses} />
          <Route path="/atribuicoes" component={Assignments} />
          <Route path="/relatorios" component={Reports} />
          <Route path="/usuarios" component={Users} />
          <Route path="/" component={Dashboard} />
          <Route path="/404" component={NotFound} />
          <Route component={NotFound} />
        </DashboardLayout>
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
