import { useState } from "react";
import { AlertTriangle, CheckCircle2, Bell } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { RiskBadge } from "@/components/RiskBadge";
import { Button } from "@/components/ui/button";
import { useAlerts, useMarkAlertRead, useMarkAllAlertsRead } from "@/hooks/useAlerts";
import type { RiskLevel } from "@/data/sampleData";

export default function Alerts() {
  const { data: alerts = [], isLoading } = useAlerts();
  const markRead = useMarkAlertRead();
  const markAllRead = useMarkAllAlertsRead();
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");

  const filtered = alerts.filter((a) =>
    filter === "all" ? true : filter === "unread" ? !a.is_read : a.is_read
  );

  const unreadCount = alerts.filter((a) => !a.is_read).length;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Alerts</h1>
            <p className="text-muted-foreground text-sm">{unreadCount} unread alert{unreadCount !== 1 ? "s" : ""}</p>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={() => markAllRead.mutate()}>
              <CheckCircle2 className="h-4 w-4 mr-2" /> Mark all read
            </Button>
          )}
        </div>

        <div className="flex gap-2">
          {(["all", "unread", "read"] as const).map((f) => (
            <Button key={f} variant={filter === f ? "default" : "outline"} size="sm" onClick={() => setFilter(f)} className="capitalize">{f}</Button>
          ))}
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading alerts...</div>
        ) : (
          <div className="space-y-3">
            {filtered.map((alert) => (
              <div
                key={alert.id}
                className={`bg-card rounded-lg border p-5 flex items-start gap-4 transition-colors ${!alert.is_read ? "border-l-4 border-l-risk-high" : ""}`}
              >
                <div className={`p-2 rounded-lg flex-shrink-0 ${alert.severity === "high" ? "bg-risk-high-bg" : "bg-risk-medium-bg"}`}>
                  <AlertTriangle className={`h-5 w-5 ${alert.severity === "high" ? "text-risk-high" : "text-risk-medium"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <RiskBadge level={alert.severity as RiskLevel} />
                    {!alert.is_read && <span className="h-2 w-2 rounded-full bg-primary animate-pulse-slow" />}
                  </div>
                  <p className="text-sm text-muted-foreground">{alert.message}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span>{new Date(alert.created_at).toLocaleString()}</span>
                  </div>
                </div>
                {!alert.is_read && (
                  <Button variant="ghost" size="sm" onClick={() => markRead.mutate(alert.id)}>Dismiss</Button>
                )}
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No alerts to show.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
