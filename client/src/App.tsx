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
import AdminUsers from "@/pages/AdminUsers";
import AdminPlans from "@/pages/AdminPlans";
import AdminServices from "@/pages/AdminServices";
import AdminAssignments from "@/pages/AdminAssignments";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Auth} />
      <Route path="/patient/dashboard" component={PatientDashboard} />
      <Route path="/patient/chat" component={PatientDashboard} /> {/* Reuse for now */}
      <Route path="/doctor/dashboard" component={DoctorDashboard} />
      <Route path="/doctor/messages" component={DoctorDashboard} /> {/* Reuse for now */}
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/plans" component={AdminPlans} />
      <Route path="/admin/services" component={AdminServices} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/admin/assignments" component={AdminAssignments} />
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
