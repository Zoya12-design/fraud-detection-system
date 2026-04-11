import { useState } from "react";
import {
  Activity,
  ShieldAlert,
  Clock,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { StatCard } from "@/components/StatCard";
import { RiskBadge, StatusBadge } from "@/components/RiskBadge";
import { dashboardStats, transactions, alerts } from "@/data/sampleData";
import { Link } from "react-router-dom";

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

export default function Dashboard() {
  const recentTxns = transactions.slice(0, 5);
  const recentAlerts = alerts.filter((a) => !a.read).slice(0, 4);
  const { riskDistribution, weeklyTrend } = dashboardStats;
  const maxTxn = Math.max(...weeklyTrend.map((d) => d.transactions));

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm">Real-time fraud monitoring overview</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Transactions"
            value={dashboardStats.totalTransactions.toLocaleString()}
            icon={Activity}
            trend="+12.5% from last week"
          />
          <StatCard
            title="Fraud Detected"
            value={dashboardStats.fraudDetected.toString()}
            icon={ShieldAlert}
            variant="danger"
            trend="+3 today"
          />
          <StatCard
            title="Pending Review"
            value={dashboardStats.pendingReview.toString()}
            icon={Clock}
            variant="warning"
            subtitle="Requires analyst review"
          />
          <StatCard
            title="Amount at Risk"
            value={formatCurrency(dashboardStats.fraudAmount)}
            icon={DollarSign}
            variant="danger"
            trend="-8.2% from last week"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Weekly Trend Chart */}
          <div className="lg:col-span-2 bg-card rounded-lg border p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-semibold">Weekly Transaction Volume</h2>
                <p className="text-sm text-muted-foreground">Transactions vs fraud detected</p>
              </div>
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex items-end gap-3 h-48">
              {weeklyTrend.map((d) => (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs text-muted-foreground">{d.fraud}</span>
                  <div className="w-full relative">
                    <div
                      className="w-full bg-primary/15 rounded-t"
                      style={{ height: `${(d.transactions / maxTxn) * 160}px` }}
                    >
                      <div
                        className="w-full bg-primary rounded-t absolute bottom-0"
                        style={{ height: `${(d.transactions / maxTxn) * 160}px` }}
                      />
                      <div
                        className="w-full bg-risk-high rounded-t absolute bottom-0"
                        style={{ height: `${(d.fraud / maxTxn) * 160}px` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">{d.day}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-6 mt-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-sm bg-primary" />
                Transactions
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-sm bg-risk-high" />
                Fraud
              </div>
            </div>
          </div>

          {/* Risk Distribution */}
          <div className="bg-card rounded-lg border p-6">
            <h2 className="font-semibold mb-6">Risk Distribution</h2>
            <div className="space-y-5">
              {(["high", "medium", "low"] as const).map((level) => {
                const count = riskDistribution[level];
                const total = riskDistribution.high + riskDistribution.medium + riskDistribution.low;
                const pct = ((count / total) * 100).toFixed(1);
                return (
                  <div key={level} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <RiskBadge level={level} />
                      <span className="text-muted-foreground">
                        {count.toLocaleString()} ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          level === "high"
                            ? "bg-risk-high"
                            : level === "medium"
                            ? "bg-risk-medium"
                            : "bg-risk-low"
                        }`}
                        style={{ width: `${pct}%`, minWidth: level !== "low" ? "4%" : undefined }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Transactions */}
          <div className="bg-card rounded-lg border">
            <div className="p-6 flex items-center justify-between border-b">
              <h2 className="font-semibold">Recent Transactions</h2>
              <Link to="/transactions" className="text-sm text-primary hover:underline flex items-center gap-1">
                View all <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="divide-y">
              {recentTxns.map((txn) => (
                <div key={txn.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`h-2 w-2 rounded-full flex-shrink-0 ${
                      txn.riskLevel === "high" ? "bg-risk-high" : txn.riskLevel === "medium" ? "bg-risk-medium" : "bg-risk-low"
                    }`} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{txn.merchant}</p>
                      <p className="text-xs text-muted-foreground">{txn.location}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-medium">{formatCurrency(txn.amount)}</p>
                    <StatusBadge status={txn.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Alerts */}
          <div className="bg-card rounded-lg border">
            <div className="p-6 flex items-center justify-between border-b">
              <h2 className="font-semibold">Unread Alerts</h2>
              <Link to="/alerts" className="text-sm text-primary hover:underline flex items-center gap-1">
                View all <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="divide-y">
              {recentAlerts.map((alert) => (
                <div key={alert.id} className="p-4 flex items-start gap-3">
                  <AlertTriangle className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                    alert.severity === "high" ? "text-risk-high" : "text-risk-medium"
                  }`} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">{alert.type}</span>
                      <RiskBadge level={alert.severity} />
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{alert.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(alert.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
