import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";

interface ChartProps {
  transactions: Array<{
    status: string;
    risk_level: string;
    category: string;
    amount: number;
    created_at: string;
  }>;
}

const STATUS_COLORS: Record<string, string> = {
  safe: "hsl(142, 71%, 45%)",
  flagged: "hsl(38, 92%, 50%)",
  fraud: "hsl(0, 72%, 51%)",
  pending: "hsl(220, 15%, 60%)",
};

const RISK_COLORS: Record<string, string> = {
  high: "hsl(0, 72%, 51%)",
  medium: "hsl(38, 92%, 50%)",
  low: "hsl(142, 71%, 45%)",
};

export function StatusDistributionChart({ transactions }: ChartProps) {
  const data = Object.entries(
    transactions.reduce((acc, t) => {
      acc[t.status] = (acc[t.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  if (data.length === 0) return null;

  return (
    <div className="bg-card rounded-lg border p-6">
      <h3 className="font-semibold mb-4">Status Distribution</h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || "hsl(220, 15%, 60%)"} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function RiskAnalysisChart({ transactions }: ChartProps) {
  const categoryRisk = transactions.reduce((acc, t) => {
    if (!acc[t.category]) acc[t.category] = { category: t.category, high: 0, medium: 0, low: 0 };
    if (t.risk_level === "high") acc[t.category].high++;
    else if (t.risk_level === "medium") acc[t.category].medium++;
    else acc[t.category].low++;
    return acc;
  }, {} as Record<string, { category: string; high: number; medium: number; low: number }>);

  const data = Object.values(categoryRisk).slice(0, 6);
  if (data.length === 0) return null;

  return (
    <div className="bg-card rounded-lg border p-6">
      <h3 className="font-semibold mb-4">Risk by Category</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 90%)" />
          <XAxis dataKey="category" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="high" fill={RISK_COLORS.high} name="High" />
          <Bar dataKey="medium" fill={RISK_COLORS.medium} name="Medium" />
          <Bar dataKey="low" fill={RISK_COLORS.low} name="Low" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CompletionChart({ transactions }: ChartProps) {
  const total = transactions.length || 1;
  const reviewed = transactions.filter((t) => t.status === "safe" || t.status === "fraud").length;
  const pending = transactions.filter((t) => t.status === "flagged" || t.status === "pending").length;
  const pctReviewed = Math.round((reviewed / total) * 100);

  return (
    <div className="bg-card rounded-lg border p-6">
      <h3 className="font-semibold mb-4">Review Completion</h3>
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-32 h-32">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="50" fill="none" stroke="hsl(220, 15%, 90%)" strokeWidth="12" />
            <circle
              cx="60" cy="60" r="50" fill="none"
              stroke="hsl(220, 70%, 50%)" strokeWidth="12"
              strokeDasharray={`${pctReviewed * 3.14} ${314 - pctReviewed * 3.14}`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold">{pctReviewed}%</span>
          </div>
        </div>
        <div className="text-center text-sm text-muted-foreground">
          <p>{reviewed} reviewed · {pending} pending</p>
        </div>
      </div>
    </div>
  );
}
