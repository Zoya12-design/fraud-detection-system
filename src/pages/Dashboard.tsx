import {
  Activity, ShieldAlert, Clock, DollarSign, AlertTriangle, ArrowUpRight,
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { StatCard } from "@/components/StatCard";
import { RiskBadge, StatusBadge } from "@/components/RiskBadge";
import { Link } from "react-router-dom";
import { useTransactions } from "@/hooks/useTransactions";
import { useAlerts } from "@/hooks/useAlerts";
import { StatusDistributionChart, RiskAnalysisChart, CompletionChart } from "@/components/DashboardCharts";
import type { RiskLevel, TransactionStatus } from "@/data/sampleData";

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

export default function Dashboard() {
  const { data: transactions = [], isLoading: txLoading } = useTransactions();
  const { data: alerts = [], isLoading: alLoading } = useAlerts();

  const totalTransactions = transactions.length;
  const fraudDetected = transactions.filter((t) => t.status === "fraud").length;
  const pendingReview = transactions.filter((t) => t.status === "flagged").length;
  const fraudAmount = transactions.filter((t) => t.status === "fraud").reduce((s, t) => s + Number(t.amount), 0);

  const highCount = transactions.filter((t) => t.risk_level === "high").length;
  const medCount = transactions.filter((t) => t.risk_level === "medium").length;
  const lowCount = transactions.filter((t) => t.risk_level === "low").length;
  const riskTotal = highCount + medCount + lowCount || 1;

  const recentTxns = transactions.slice(0, 5);
  const recentAlerts = alerts.filter((a) => !a.is_read).slice(0, 4);
  const loading = txLoading || alLoading;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm">Real-time fraud monitoring overview</p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading dashboard data...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="Total Transactions" value={totalTransactions.toLocaleString()} icon={Activity} />
              <StatCard title="Fraud Detected" value={fraudDetected.toString()} icon={ShieldAlert} variant="danger" />
              <StatCard title="Pending Review" value={pendingReview.toString()} icon={Clock} variant="warning" subtitle="Requires analyst review" />
              <StatCard title="Amount at Risk" value={formatCurrency(fraudAmount)} icon={DollarSign} variant="danger" />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <StatusDistributionChart transactions={transactions} />
              <RiskAnalysisChart transactions={transactions} />
              <CompletionChart transactions={transactions} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Risk Distribution */}
              <div className="lg:col-span-1 bg-card rounded-lg border p-6">
                <h2 className="font-semibold mb-6">Risk Distribution</h2>
                <div className="space-y-5">
                  {([["high", highCount], ["medium", medCount], ["low", lowCount]] as [RiskLevel, number][]).map(([level, count]) => {
                    const pct = ((count / riskTotal) * 100).toFixed(1);
                    return (
                      <div key={level} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <RiskBadge level={level} />
                          <span className="text-muted-foreground">{count} ({pct}%)</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${level === "high" ? "bg-risk-high" : level === "medium" ? "bg-risk-medium" : "bg-risk-low"}`} style={{ width: `${pct}%`, minWidth: "2%" }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recent Transactions */}
              <div className="lg:col-span-2 bg-card rounded-lg border">
                <div className="p-6 flex items-center justify-between border-b">
                  <h2 className="font-semibold">Recent Transactions</h2>
                  <Link to="/transactions" className="text-sm text-primary hover:underline flex items-center gap-1">View all <ArrowUpRight className="h-3 w-3" /></Link>
                </div>
                <div className="divide-y">
                  {recentTxns.length === 0 && <div className="p-6 text-center text-muted-foreground text-sm">No transactions yet.</div>}
                  {recentTxns.map((txn) => (
                    <div key={txn.id} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`h-2 w-2 rounded-full flex-shrink-0 ${txn.risk_level === "high" ? "bg-risk-high" : txn.risk_level === "medium" ? "bg-risk-medium" : "bg-risk-low"}`} />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{txn.merchant}</p>
                          <p className="text-xs text-muted-foreground">{txn.location}</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-medium">{formatCurrency(txn.amount)}</p>
                        <StatusBadge status={txn.status as TransactionStatus} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Alerts */}
            <div className="bg-card rounded-lg border">
              <div className="p-6 flex items-center justify-between border-b">
                <h2 className="font-semibold">Unread Alerts</h2>
                <Link to="/alerts" className="text-sm text-primary hover:underline flex items-center gap-1">View all <ArrowUpRight className="h-3 w-3" /></Link>
              </div>
              <div className="divide-y">
                {recentAlerts.length === 0 && <div className="p-6 text-center text-muted-foreground text-sm">No unread alerts.</div>}
                {recentAlerts.map((alert) => (
                  <div key={alert.id} className="p-4 flex items-start gap-3">
                    <AlertTriangle className={`h-4 w-4 mt-0.5 flex-shrink-0 ${alert.severity === "high" ? "text-risk-high" : "text-risk-medium"}`} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <RiskBadge level={alert.severity as RiskLevel} />
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{alert.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{new Date(alert.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
