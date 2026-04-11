import { useState } from "react";
import { Search, Filter, CheckCircle, XCircle } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { RiskBadge, StatusBadge } from "@/components/RiskBadge";
import { transactions as initialTransactions, type Transaction, type RiskLevel, type TransactionStatus } from "@/data/sampleData";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

export default function Transactions() {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Transaction | null>(null);

  const filtered = transactions.filter((t) => {
    const matchSearch =
      t.merchant.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toLowerCase().includes(search.toLowerCase()) ||
      t.location.toLowerCase().includes(search.toLowerCase());
    const matchRisk = riskFilter === "all" || t.riskLevel === riskFilter;
    const matchStatus = statusFilter === "all" || t.status === statusFilter;
    return matchSearch && matchRisk && matchStatus;
  });

  const markAs = (id: string, status: TransactionStatus) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status } : t))
    );
    setSelected(null);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground text-sm">
            Monitor and review all transactions
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={riskFilter} onValueChange={setRiskFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Risk Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Risks</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="safe">Safe</SelectItem>
              <SelectItem value="flagged">Flagged</SelectItem>
              <SelectItem value="fraud">Fraud</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="bg-card rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-4 font-medium text-muted-foreground">ID</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Date</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Merchant</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Location</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">Amount</th>
                  <th className="text-center p-4 font-medium text-muted-foreground">Risk</th>
                  <th className="text-center p-4 font-medium text-muted-foreground">Score</th>
                  <th className="text-center p-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-center p-4 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((txn) => (
                  <tr
                    key={txn.id}
                    className={`hover:bg-muted/30 cursor-pointer transition-colors ${
                      txn.riskLevel === "high" ? "bg-risk-high/[0.03]" : ""
                    }`}
                    onClick={() => setSelected(txn)}
                  >
                    <td className="p-4 font-mono text-xs">{txn.id}</td>
                    <td className="p-4 text-muted-foreground">
                      {new Date(txn.date).toLocaleDateString()}
                    </td>
                    <td className="p-4 font-medium">{txn.merchant}</td>
                    <td className="p-4 text-muted-foreground">{txn.location}</td>
                    <td className="p-4 text-right font-medium">{formatCurrency(txn.amount)}</td>
                    <td className="p-4 text-center">
                      <RiskBadge level={txn.riskLevel} />
                    </td>
                    <td className="p-4 text-center">
                      <span className={`font-mono font-bold ${
                        txn.riskScore >= 70 ? "text-risk-high" : txn.riskScore >= 40 ? "text-risk-medium" : "text-risk-low"
                      }`}>
                        {txn.riskScore}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <StatusBadge status={txn.status} />
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => markAs(txn.id, "safe")}
                          className="p-1 rounded hover:bg-risk-low-bg text-risk-low"
                          title="Mark as safe"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => markAs(txn.id, "fraud")}
                          className="p-1 rounded hover:bg-risk-high-bg text-risk-high"
                          title="Mark as fraud"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="p-12 text-center text-muted-foreground">
              No transactions match your filters.
            </div>
          )}
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Transaction ID</p>
                  <p className="font-mono font-medium">{selected.id}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date & Time</p>
                  <p className="font-medium">{new Date(selected.date).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Merchant</p>
                  <p className="font-medium">{selected.merchant}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Location</p>
                  <p className="font-medium">{selected.location}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Amount</p>
                  <p className="font-medium text-lg">{formatCurrency(selected.amount)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Card</p>
                  <p className="font-mono font-medium">•••• {selected.cardLast4}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Category</p>
                  <p className="font-medium">{selected.category}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Risk Score</p>
                  <p className={`font-mono font-bold text-lg ${
                    selected.riskScore >= 70 ? "text-risk-high" : selected.riskScore >= 40 ? "text-risk-medium" : "text-risk-low"
                  }`}>{selected.riskScore}/100</p>
                </div>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Description</p>
                <p className="text-sm">{selected.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <RiskBadge level={selected.riskLevel} />
                <StatusBadge status={selected.status} />
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  className="flex-1 text-risk-low border-risk-low hover:bg-risk-low-bg"
                  onClick={() => markAs(selected.id, "safe")}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark Safe
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 text-risk-high border-risk-high hover:bg-risk-high-bg"
                  onClick={() => markAs(selected.id, "fraud")}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Mark Fraud
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
