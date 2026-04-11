import { AppLayout } from "@/components/AppLayout";
import { dashboardStats, transactions } from "@/data/sampleData";
import { FileBarChart, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

export default function Reports() {
  const fraudTxns = transactions.filter((t) => t.status === "fraud");
  const flaggedTxns = transactions.filter((t) => t.status === "flagged");

  const topLocations = transactions
    .filter((t) => t.riskLevel === "high")
    .reduce((acc, t) => {
      acc[t.location] = (acc[t.location] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const sortedLocations = Object.entries(topLocations).sort((a, b) => b[1] - a[1]);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
            <p className="text-muted-foreground text-sm">Fraud analytics and summary reports</p>
          </div>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card rounded-lg border p-6 text-center">
            <p className="text-sm text-muted-foreground mb-1">Fraud Rate</p>
            <p className="text-3xl font-bold text-risk-high">
              {((dashboardStats.fraudDetected / dashboardStats.totalTransactions) * 100).toFixed(2)}%
            </p>
          </div>
          <div className="bg-card rounded-lg border p-6 text-center">
            <p className="text-sm text-muted-foreground mb-1">Avg Fraud Amount</p>
            <p className="text-3xl font-bold">
              {formatCurrency(dashboardStats.fraudAmount / dashboardStats.fraudDetected)}
            </p>
          </div>
          <div className="bg-card rounded-lg border p-6 text-center">
            <p className="text-sm text-muted-foreground mb-1">Detection Accuracy</p>
            <p className="text-3xl font-bold text-risk-low">97.3%</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top risky locations */}
          <div className="bg-card rounded-lg border p-6">
            <h2 className="font-semibold mb-4">High-Risk Locations</h2>
            <div className="space-y-3">
              {sortedLocations.map(([loc, count]) => (
                <div key={loc} className="flex items-center justify-between">
                  <span className="text-sm">{loc}</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 bg-risk-high rounded-full" style={{ width: `${count * 40}px` }} />
                    <span className="text-sm text-muted-foreground">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent fraud */}
          <div className="bg-card rounded-lg border p-6">
            <h2 className="font-semibold mb-4">Confirmed Fraud Transactions</h2>
            <div className="space-y-3">
              {fraudTxns.map((txn) => (
                <div key={txn.id} className="flex items-center justify-between p-3 bg-risk-high-bg rounded-lg">
                  <div>
                    <p className="text-sm font-medium">{txn.merchant}</p>
                    <p className="text-xs text-muted-foreground">{txn.location}</p>
                  </div>
                  <p className="text-sm font-bold text-risk-high">{formatCurrency(txn.amount)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
