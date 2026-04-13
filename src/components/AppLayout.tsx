import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Bell, Search } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useAlerts } from "@/hooks/useAlerts";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { data: alerts = [] } = useAlerts();
  const unreadCount = alerts.filter((a) => !a.is_read).length;
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/transactions?search=${encodeURIComponent(searchValue.trim())}`);
      setSearchValue("");
      setSearchOpen(false);
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b bg-card px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              {/* Search */}
              <form onSubmit={handleSearchSubmit} className="hidden sm:flex items-center">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search transactions..."
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    className="pl-8 w-64 h-9"
                  />
                </div>
              </form>
            </div>
            <div className="flex items-center gap-3">
              {/* Notification Bell */}
              <Popover>
                <PopoverTrigger asChild>
                  <button className="relative p-2 rounded-md hover:bg-muted transition-colors">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 h-5 w-5 rounded-full bg-destructive flex items-center justify-center text-[10px] font-bold text-destructive-foreground">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="end">
                  <div className="p-3 border-b font-semibold text-sm">Notifications ({unreadCount})</div>
                  <div className="max-h-64 overflow-y-auto">
                    {alerts.filter((a) => !a.is_read).slice(0, 5).map((alert) => (
                      <div key={alert.id} className="p-3 border-b last:border-0 text-sm">
                        <p className="text-xs text-muted-foreground mb-1">{new Date(alert.created_at).toLocaleString()}</p>
                        <p className="line-clamp-2">{alert.message}</p>
                      </div>
                    ))}
                    {unreadCount === 0 && (
                      <div className="p-4 text-center text-sm text-muted-foreground">No new notifications</div>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <Link to="/alerts" className="block p-2 text-center text-sm text-primary hover:underline border-t">
                      View all alerts
                    </Link>
                  )}
                </PopoverContent>
              </Popover>

              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
                JD
              </div>
            </div>
          </header>
          <main className="flex-1 p-6 overflow-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
