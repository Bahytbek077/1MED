import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Auth from "@/pages/Auth";
import PatientDashboard from "@/pages/PatientDashboard";
import DoctorDashboard from "@/pages/DoctorDashboard";
import AdminDashboard from "@/pages/AdminDashboard";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Auth} />
      <Route path="/patient/dashboard" component={PatientDashboard} />
      <Route path="/patient/chat" component={PatientDashboard} /> {/* Reuse for now */}
      <Route path="/doctor/dashboard" component={DoctorDashboard} />
      <Route path="/doctor/messages" component={DoctorDashboard} /> {/* Reuse for now */}
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/plans" component={AdminDashboard} /> {/* Reuse for now */}
      <Route path="/admin/users" component={AdminDashboard} /> {/* Reuse for now */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
