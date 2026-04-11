import { cn } from "@/lib/utils";
import type { RiskLevel, TransactionStatus } from "@/data/sampleData";

export function RiskBadge({ level }: { level: RiskLevel }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        level === "high" && "bg-risk-high-bg text-risk-high",
        level === "medium" && "bg-risk-medium-bg text-risk-medium",
        level === "low" && "bg-risk-low-bg text-risk-low"
      )}
    >
      {level === "high" ? "High Risk" : level === "medium" ? "Medium Risk" : "Low Risk"}
    </span>
  );
}

export function StatusBadge({ status }: { status: TransactionStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize",
        status === "fraud" && "bg-risk-high-bg text-risk-high",
        status === "flagged" && "bg-risk-medium-bg text-risk-medium",
        status === "pending" && "bg-muted text-muted-foreground",
        status === "safe" && "bg-risk-low-bg text-risk-low"
      )}
    >
      {status}
    </span>
  );
}
