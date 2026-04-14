import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, LineChart, Line, AreaChart, Area,
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
          <XAxis dataKey="category" tick={{ fontSize: 11 }} angle={-20} textAnchor="end" height={60} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="high" fill={RISK_COLORS.high} name="High" radius={[2, 2, 0, 0]} />
          <Bar dataKey="medium" fill={RISK_COLORS.medium} name="Medium" radius={[2, 2, 0, 0]} />
          <Bar dataKey="low" fill={RISK_COLORS.low} name="Low" radius={[2, 2, 0, 0]} />
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

export function DailyTrendChart({ transactions }: ChartProps) {
  // Group transactions by date
  const byDate = transactions.reduce((acc, t) => {
    const date = new Date(t.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    if (!acc[date]) acc[date] = { date, total: 0, flagged: 0, fraud: 0 };
    acc[date].total++;
    if (t.status === "flagged") acc[date].flagged++;
    if (t.status === "fraud") acc[date].fraud++;
    return acc;
  }, {} as Record<string, { date: string; total: number; flagged: number; fraud: number }>);

  const data = Object.values(byDate).reverse().slice(-14);
  if (data.length === 0) return null;

  return (
    <div className="bg-card rounded-lg border p-6">
      <h3 className="font-semibold mb-4">Daily Transaction Trends</h3>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(220, 70%, 50%)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(220, 70%, 50%)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorFraud" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(0, 72%, 51%)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(0, 72%, 51%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 90%)" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Area type="monotone" dataKey="total" stroke="hsl(220, 70%, 50%)" fill="url(#colorTotal)" name="Total" />
          <Area type="monotone" dataKey="flagged" stroke="hsl(38, 92%, 50%)" fill="hsl(38, 92%, 50%)" fillOpacity={0.1} name="Flagged" />
          <Area type="monotone" dataKey="fraud" stroke="hsl(0, 72%, 51%)" fill="url(#colorFraud)" name="Fraud" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
