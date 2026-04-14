import { useState } from "react";
import { Users, ShieldAlert, Activity, TrendingUp, Search, Ban, CheckCircle } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { StatCard } from "@/components/StatCard";
import { RiskBadge, StatusBadge } from "@/components/RiskBadge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTransactions, useUpdateTransactionStatus } from "@/hooks/useTransactions";
import { useAlerts } from "@/hooks/useAlerts";
import { useAllProfiles } from "@/hooks/useProfile";
import { useIsAdmin } from "@/hooks/useProfile";
import type { RiskLevel, TransactionStatus } from "@/data/sampleData";
import { toast } from "sonner";

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

export default function Admin() {
  const isAdmin = useIsAdmin();
  const { data: transactions = [], isLoading: txLoading } = useTransactions();
  const { data: alerts = [] } = useAlerts();
  const { data: profiles = [] } = useAllProfiles();
  const updateStatus = useUpdateTransactionStatus();

  const [txSearch, setTxSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");
  const [userSearch, setUserSearch] = useState("");

  if (!isAdmin) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-[60vh] text-center">
          <Ban className="h-16 w-16 text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground mt-2">You don't have admin privileges to access this page.</p>
        </div>
      </AppLayout>
    );
  }

  const totalTxns = transactions.length;
  const fraudCount = transactions.filter(t => t.status === "fraud").length;
  const highRiskCount = transactions.filter(t => t.risk_level === "high").length;
  const fraudRate = totalTxns > 0 ? ((fraudCount / totalTxns) * 100).toFixed(1) : "0";
  const totalAmount = transactions.reduce((s, t) => s + Number(t.amount), 0);
  const fraudAmount = transactions.filter(t => t.status === "fraud").reduce((s, t) => s + Number(t.amount), 0);

  const filteredTxns = transactions
    .filter(t => {
      const matchSearch = t.merchant.toLowerCase().includes(txSearch.toLowerCase()) ||
        t.location.toLowerCase().includes(txSearch.toLowerCase()) ||
        t.id.toLowerCase().includes(txSearch.toLowerCase());
      const matchRisk = riskFilter === "all" || t.risk_level === riskFilter;
      return matchSearch && matchRisk;
    });

  const filteredProfiles = profiles.filter(p =>
    (p.email || "").toLowerCase().includes(userSearch.toLowerCase()) ||
    (p.full_name || "").toLowerCase().includes(userSearch.toLowerCase())
  );

  const handleStatusChange = (id: string, status: string) => {
    updateStatus.mutate({ id, status }, {
      onSuccess: () => toast.success(`Transaction marked as ${status}`),
      onError: (err: any) => toast.error(err.message),
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Panel</h1>
          <p className="text-muted-foreground text-sm">Manage users, transactions, and system-wide fraud monitoring</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Users" value={profiles.length.toString()} icon={Users} />
          <StatCard title="Fraud Rate" value={`${fraudRate}%`} icon={ShieldAlert} variant="danger" />
          <StatCard title="High-Risk Txns" value={highRiskCount.toString()} icon={Activity} variant="warning" />
          <StatCard title="Amount at Risk" value={formatCurrency(fraudAmount)} icon={TrendingUp} variant="danger" />
        </div>

        <Tabs defaultValue="transactions" className="space-y-4">
          <TabsList>
            <TabsTrigger value="transactions">All Transactions</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
          </TabsList>

          <TabsContent value="transactions" className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search all transactions..." value={txSearch} onChange={e => setTxSearch(e.target.value)} className="pl-9" />
              </div>
              <Select value={riskFilter} onValueChange={setRiskFilter}>
                <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Risk Level" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risks</SelectItem>
                  <SelectItem value="high">High Only</SelectItem>
                  <SelectItem value="medium">Medium Only</SelectItem>
                  <SelectItem value="low">Low Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-card rounded-lg border overflow-hidden">
              {txLoading ? (
                <div className="p-12 text-center text-muted-foreground">Loading...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
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
                      {filteredTxns.map(txn => (
                        <tr key={txn.id} className={`hover:bg-muted/30 transition-colors ${txn.risk_level === "high" ? "bg-risk-high/[0.03]" : ""}`}>
                          <td className="p-4 text-muted-foreground">{new Date(txn.created_at).toLocaleDateString()}</td>
                          <td className="p-4 font-medium">{txn.merchant}</td>
                          <td className="p-4 text-muted-foreground">{txn.location}</td>
                          <td className="p-4 text-right font-medium">{formatCurrency(txn.amount)}</td>
                          <td className="p-4 text-center"><RiskBadge level={txn.risk_level as RiskLevel} /></td>
                          <td className="p-4 text-center">
                            <span className={`font-mono font-bold ${txn.risk_score >= 70 ? "text-risk-high" : txn.risk_score >= 40 ? "text-risk-medium" : "text-risk-low"}`}>{txn.risk_score}</span>
                          </td>
                          <td className="p-4 text-center"><StatusBadge status={txn.status as TransactionStatus} /></td>
                          <td className="p-4">
                            <div className="flex items-center justify-center gap-1">
                              <Button size="sm" variant="ghost" className="h-7 text-xs text-risk-low" onClick={() => handleStatusChange(txn.id, "safe")}>
                                <CheckCircle className="h-3 w-3 mr-1" />Approve
                              </Button>
                              <Button size="sm" variant="ghost" className="h-7 text-xs text-risk-high" onClick={() => handleStatusChange(txn.id, "fraud")}>
                                <Ban className="h-3 w-3 mr-1" />Reject
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {!txLoading && filteredTxns.length === 0 && (
                <div className="p-12 text-center text-muted-foreground">No transactions match filters.</div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search users..." value={userSearch} onChange={e => setUserSearch(e.target.value)} className="pl-9" />
            </div>

            <div className="bg-card rounded-lg border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-4 font-medium text-muted-foreground">Name</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Email</th>
                      <th className="text-center p-4 font-medium text-muted-foreground">Role</th>
                      <th className="text-center p-4 font-medium text-muted-foreground">Joined</th>
                      <th className="text-center p-4 font-medium text-muted-foreground">Transactions</th>
                      <th className="text-center p-4 font-medium text-muted-foreground">Risk Level</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredProfiles.map(profile => {
                      const userTxns = transactions.filter(t => t.user_id === profile.user_id);
                      const highRisk = userTxns.filter(t => t.risk_level === "high").length;
                      const userRisk: RiskLevel = highRisk >= 3 ? "high" : highRisk >= 1 ? "medium" : "low";
                      return (
                        <tr key={profile.id} className="hover:bg-muted/30 transition-colors">
                          <td className="p-4 font-medium">{profile.full_name || "—"}</td>
                          <td className="p-4 text-muted-foreground">{profile.email || "—"}</td>
                          <td className="p-4 text-center">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${profile.role === "admin" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                              {profile.role || "user"}
                            </span>
                          </td>
                          <td className="p-4 text-center text-muted-foreground">{new Date(profile.created_at).toLocaleDateString()}</td>
                          <td className="p-4 text-center font-medium">{userTxns.length}</td>
                          <td className="p-4 text-center"><RiskBadge level={userRisk} /></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {filteredProfiles.length === 0 && (
                <div className="p-12 text-center text-muted-foreground">No users found.</div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
