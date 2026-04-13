import { useState } from "react";
import { Search, CheckCircle, XCircle, Plus, ArrowUpDown } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { RiskBadge, StatusBadge } from "@/components/RiskBadge";
import { TransactionActions } from "@/components/TransactionActions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useTransactions, useCreateTransaction, useUpdateTransactionStatus, type DbTransaction } from "@/hooks/useTransactions";
import type { RiskLevel, TransactionStatus } from "@/data/sampleData";
import { toast } from "sonner";

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

const CATEGORIES = ["Retail", "Food & Dining", "Gas & Transport", "Entertainment", "ATM Withdrawal", "Wire Transfer", "Online Purchase", "Cryptocurrency"];

type SortKey = "date" | "amount" | "status" | "risk";
type SortDir = "asc" | "desc";

const RISK_ORDER: Record<string, number> = { high: 3, medium: 2, low: 1 };
const STATUS_ORDER: Record<string, number> = { fraud: 4, flagged: 3, pending: 2, safe: 1 };

export default function Transactions() {
  const { data: transactions = [], isLoading } = useTransactions();
  const createTxn = useCreateTransaction();
  const updateStatus = useUpdateTransactionStatus();

  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selected, setSelected] = useState<DbTransaction | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const [newAmount, setNewAmount] = useState("");
  const [newMerchant, setNewMerchant] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newCategory, setNewCategory] = useState("Retail");
  const [newCard, setNewCard] = useState("4532");
  const [newDesc, setNewDesc] = useState("");

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  };

  const filtered = transactions
    .filter((t) => {
      const matchSearch =
        t.merchant.toLowerCase().includes(search.toLowerCase()) ||
        t.id.toLowerCase().includes(search.toLowerCase()) ||
        t.location.toLowerCase().includes(search.toLowerCase());
      const matchRisk = riskFilter === "all" || t.risk_level === riskFilter;
      const matchStatus = statusFilter === "all" || t.status === statusFilter;
      return matchSearch && matchRisk && matchStatus;
    })
    .sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "date": cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime(); break;
        case "amount": cmp = a.amount - b.amount; break;
        case "status": cmp = (STATUS_ORDER[a.status] || 0) - (STATUS_ORDER[b.status] || 0); break;
        case "risk": cmp = (RISK_ORDER[a.risk_level] || 0) - (RISK_ORDER[b.risk_level] || 0); break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

  const markAs = (id: string, status: string) => {
    updateStatus.mutate({ id, status });
    setSelected(null);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(newAmount);
    if (isNaN(amount) || amount <= 0) { toast.error("Amount must be a positive number"); return; }
    if (!newMerchant.trim()) { toast.error("Merchant is required"); return; }
    try {
      await createTxn.mutateAsync({
        amount, merchant: newMerchant.trim(), location: newLocation.trim(),
        category: newCategory, card_last4: newCard, description: newDesc.trim(),
      });
      toast.success("Transaction created — fraud evaluation applied automatically.");
      setShowCreate(false);
      setNewAmount(""); setNewMerchant(""); setNewLocation(""); setNewDesc("");
    } catch (err: any) {
      toast.error(err.message || "Failed to create transaction");
    }
  };

  const SortHeader = ({ label, sortKeyName }: { label: string; sortKeyName: SortKey }) => (
    <th
      className="p-4 font-medium text-muted-foreground cursor-pointer hover:text-foreground select-none"
      onClick={() => toggleSort(sortKeyName)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <ArrowUpDown className={`h-3 w-3 ${sortKey === sortKeyName ? "opacity-100" : "opacity-30"}`} />
      </span>
    </th>
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
            <p className="text-muted-foreground text-sm">Monitor and review all transactions</p>
          </div>
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4 mr-2" /> New Transaction
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search transactions..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={riskFilter} onValueChange={setRiskFilter}>
            <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Risk Level" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Risks</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="safe">Safe</SelectItem>
              <SelectItem value="flagged">Flagged</SelectItem>
              <SelectItem value="fraud">Fraud</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="bg-card rounded-lg border overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-muted-foreground">Loading transactions...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <SortHeader label="Date" sortKeyName="date" />
                    <th className="text-left p-4 font-medium text-muted-foreground">Merchant</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Location</th>
                    <SortHeader label="Amount" sortKeyName="amount" />
                    <SortHeader label="Risk" sortKeyName="risk" />
                    <th className="text-center p-4 font-medium text-muted-foreground">Score</th>
                    <SortHeader label="Status" sortKeyName="status" />
                    <th className="text-center p-4 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.map((txn) => (
                    <tr key={txn.id} className={`hover:bg-muted/30 cursor-pointer transition-colors ${txn.risk_level === "high" ? "bg-risk-high/[0.03]" : ""}`} onClick={() => setSelected(txn)}>
                      <td className="p-4 text-muted-foreground">{new Date(txn.created_at).toLocaleDateString()}</td>
                      <td className="p-4 font-medium">{txn.merchant}</td>
                      <td className="p-4 text-muted-foreground">{txn.location}</td>
                      <td className="p-4 text-right font-medium">{formatCurrency(txn.amount)}</td>
                      <td className="p-4 text-center"><RiskBadge level={txn.risk_level as RiskLevel} /></td>
                      <td className="p-4 text-center">
                        <span className={`font-mono font-bold ${txn.risk_score >= 70 ? "text-risk-high" : txn.risk_score >= 40 ? "text-risk-medium" : "text-risk-low"}`}>{txn.risk_score}</span>
                      </td>
                      <td className="p-4 text-center"><StatusBadge status={txn.status as TransactionStatus} /></td>
                      <td className="p-4 text-center"><TransactionActions txn={txn} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {!isLoading && filtered.length === 0 && (
            <div className="p-12 text-center text-muted-foreground">No transactions match your filters.</div>
          )}
        </div>
      </div>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Transaction Details</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-muted-foreground">Date & Time</p><p className="font-medium">{new Date(selected.created_at).toLocaleString()}</p></div>
                <div><p className="text-muted-foreground">Merchant</p><p className="font-medium">{selected.merchant}</p></div>
                <div><p className="text-muted-foreground">Location</p><p className="font-medium">{selected.location}</p></div>
                <div><p className="text-muted-foreground">Amount</p><p className="font-medium text-lg">{formatCurrency(selected.amount)}</p></div>
                <div><p className="text-muted-foreground">Card</p><p className="font-mono font-medium">•••• {selected.card_last4}</p></div>
                <div><p className="text-muted-foreground">Category</p><p className="font-medium">{selected.category}</p></div>
                <div><p className="text-muted-foreground">Risk Score</p>
                  <p className={`font-mono font-bold text-lg ${selected.risk_score >= 70 ? "text-risk-high" : selected.risk_score >= 40 ? "text-risk-medium" : "text-risk-low"}`}>{selected.risk_score}/100</p>
                </div>
              </div>
              {selected.description && <div><p className="text-muted-foreground text-sm">Description</p><p className="text-sm">{selected.description}</p></div>}
              <div className="flex items-center gap-2">
                <RiskBadge level={selected.risk_level as RiskLevel} />
                <StatusBadge status={selected.status as TransactionStatus} />
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1 text-risk-low border-risk-low hover:bg-risk-low-bg" onClick={() => markAs(selected.id, "safe")}>
                  <CheckCircle className="h-4 w-4 mr-2" /> Mark Safe
                </Button>
                <Button variant="outline" className="flex-1 text-risk-high border-risk-high hover:bg-risk-high-bg" onClick={() => markAs(selected.id, "fraud")}>
                  <XCircle className="h-4 w-4 mr-2" /> Mark Fraud
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Transaction</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Amount ($)</Label>
                <Input type="number" step="0.01" min="0.01" required value={newAmount} onChange={(e) => setNewAmount(e.target.value)} placeholder="1000.00" />
              </div>
              <div className="space-y-2">
                <Label>Merchant</Label>
                <Input required value={newMerchant} onChange={(e) => setNewMerchant(e.target.value)} placeholder="Amazon" />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input required value={newLocation} onChange={(e) => setNewLocation(e.target.value)} placeholder="New York, NY" />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={newCategory} onValueChange={setNewCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Card Last 4</Label>
                <Input value={newCard} onChange={(e) => setNewCard(e.target.value)} maxLength={4} placeholder="4532" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Optional description" />
            </div>
            <Button type="submit" className="w-full" disabled={createTxn.isPending}>
              {createTxn.isPending ? "Creating..." : "Create Transaction"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
