import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Bell, Search, Sun, Moon, Monitor } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useAlerts } from "@/hooks/useAlerts";
import { useProfile } from "@/hooks/useProfile";
import { useTheme } from "@/hooks/useTheme";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RiskBadge } from "@/components/RiskBadge";
import type { RiskLevel } from "@/data/sampleData";
import { useProfile } from "@/hooks/useProfile";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { RiskBadge } from "@/components/RiskBadge";
import type { RiskLevel } from "@/data/sampleData";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { data: alerts = [] } = useAlerts();
  const { data: profile } = useProfile();
  const unreadCount = alerts.filter((a) => !a.is_read).length;
  const [searchValue, setSearchValue] = useState("");
  const navigate = useNavigate();

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : profile?.email?.[0]?.toUpperCase() || "U";

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/transactions?search=${encodeURIComponent(searchValue.trim())}`);
      setSearchValue("");
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
                      <span className="absolute -top-0.5 -right-0.5 h-5 w-5 rounded-full bg-destructive flex items-center justify-center text-[10px] font-bold text-destructive-foreground animate-pulse-slow">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="end">
                  <div className="p-3 border-b font-semibold text-sm flex items-center justify-between">
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                      <span className="bg-destructive text-destructive-foreground text-xs px-2 py-0.5 rounded-full">{unreadCount}</span>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {alerts.filter((a) => !a.is_read).slice(0, 6).map((alert) => (
                      <div key={alert.id} className="p-3 border-b last:border-0 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-2 mb-1">
                          <RiskBadge level={alert.severity as RiskLevel} />
                          <span className="text-[10px] text-muted-foreground">{new Date(alert.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">{alert.message}</p>
                      </div>
                    ))}
                    {unreadCount === 0 && (
                      <div className="p-6 text-center text-sm text-muted-foreground">
                        <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
                        No new notifications
                      </div>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <Link to="/alerts" className="block p-2.5 text-center text-sm text-primary hover:underline border-t font-medium">
                      View all alerts →
                    </Link>
                  )}
                </PopoverContent>
              </Popover>

              {/* User Avatar */}
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
                  {initials}
                </div>
                {profile && (
                  <div className="hidden md:block">
                    <p className="text-xs font-medium leading-none">{profile.full_name || profile.email}</p>
                    <p className="text-[10px] text-muted-foreground">{profile.role || "user"}</p>
                  </div>
                )}
              </div>
            </div>
          </header>
          <main className="flex-1 p-6 overflow-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
