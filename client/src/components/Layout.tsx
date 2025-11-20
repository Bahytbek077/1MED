import { useStore, Role } from "@/lib/store";
import { useLocation, Link } from "wouter";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Users, 
  Stethoscope, 
  Settings, 
  LogOut, 
  Activity,
  MessageSquare,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { currentUser, logout } = useStore();
  const [_, setLocation] = useLocation();

  if (!currentUser) {
    setLocation("/");
    return null;
  }

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  const getNavItems = (role: Role) => {
    switch (role) {
      case 'patient':
        return [
          { icon: Activity, label: "My Journey", path: "/patient/dashboard" },
          { icon: MessageSquare, label: "Chat with Doctor", path: "/patient/chat" },
        ];
      case 'doctor':
        return [
          { icon: Users, label: "Patients", path: "/doctor/dashboard" },
          { icon: MessageSquare, label: "Messages", path: "/doctor/messages" },
        ];
      case 'admin':
        return [
          { icon: LayoutDashboard, label: "Overview", path: "/admin/dashboard" },
          { icon: FileText, label: "Plans", path: "/admin/plans" },
          { icon: Users, label: "Users", path: "/admin/users" },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems(currentUser.role);

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-sidebar-border fixed h-full hidden md:flex flex-col z-10">
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-2 text-primary">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Stethoscope className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight font-heading text-foreground">1MED</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <a className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                window.location.pathname === item.path 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}>
                <item.icon className="h-4 w-4" />
                {item.label}
              </a>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-primary font-bold">
              {currentUser.name.charAt(0)}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">{currentUser.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{currentUser.role}</p>
            </div>
          </div>
          <Button variant="outline" className="w-full justify-start text-muted-foreground" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Log out
          </Button>
        </div>
      </aside>

      {/* Mobile Header Placeholder (simplified) */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b z-20 flex items-center px-4">
         <span className="font-bold">1MED</span>
      </div>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 min-h-screen p-6 md:p-8 pt-20 md:pt-8">
        <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}
