import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  variant?: "default" | "danger" | "warning" | "success";
}

export function StatCard({ title, value, subtitle, icon: Icon, trend, variant = "default" }: StatCardProps) {
  return (
    <div className="bg-card rounded-lg border p-6 flex items-start justify-between">
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold tracking-tight">{value}</p>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        {trend && (
          <p className={cn(
            "text-xs font-medium",
            trend.startsWith("+") ? "text-risk-low" : trend.startsWith("-") ? "text-risk-high" : "text-muted-foreground"
          )}>
            {trend}
          </p>
        )}
      </div>
      <div className={cn(
        "p-3 rounded-lg",
        variant === "danger" && "bg-risk-high-bg",
        variant === "warning" && "bg-risk-medium-bg",
        variant === "success" && "bg-risk-low-bg",
        variant === "default" && "bg-muted"
      )}>
        <Icon className={cn(
          "h-5 w-5",
          variant === "danger" && "text-risk-high",
          variant === "warning" && "text-risk-medium",
          variant === "success" && "text-risk-low",
          variant === "default" && "text-muted-foreground"
        )} />
      </div>
    </div>
  );
}
