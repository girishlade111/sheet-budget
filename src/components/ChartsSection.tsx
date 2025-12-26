import { Transaction } from "@/types/transaction";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from "recharts";

interface ChartsSectionProps {
  transactions: Transaction[];
}

const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--muted))", "hsl(var(--secondary))"];

export const ChartsSection = ({ transactions }: ChartsSectionProps) => {
  const byCategory = Object.values(
    transactions.reduce<Record<string, { category: string; total: number }>>((acc, t) => {
      const key = t.category || "Uncategorized";
      acc[key] = acc[key] || { category: key, total: 0 };
      if (t.transactionType === "Expense") acc[key].total += t.amount;
      return acc;
    }, {}),
  ).filter((c) => c.total > 0);

  const incomeVsExpense = [
    { label: "Income", value: transactions.filter((t) => t.transactionType === "Income").reduce((s, t) => s + t.amount, 0) },
    { label: "Expense", value: transactions.filter((t) => t.transactionType === "Expense").reduce((s, t) => s + t.amount, 0) },
  ];

  return (
    <section className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)] lg:gap-6">
      <Card className="glass-panel">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">Expenses by category</CardTitle>
        </CardHeader>
        <CardContent className="h-64 pb-4">
          {byCategory.length === 0 ? (
            <p className="text-xs text-muted-foreground">Add some expenses to see category breakdown.</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byCategory} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <XAxis dataKey="category" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderRadius: 12,
                    border: "1px solid hsl(var(--border))",
                    color: "hsl(var(--foreground))",
                  }}
                />
                <Bar dataKey="total" radius={[6, 6, 0, 0]} fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card className="glass-panel">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">Income vs Expense</CardTitle>
        </CardHeader>
        <CardContent className="h-64 pb-4">
          {incomeVsExpense.every((d) => d.value === 0) ? (
            <p className="text-xs text-muted-foreground">No data yet. Add a few transactions.</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={incomeVsExpense}
                  dataKey="value"
                  nameKey="label"
                  innerRadius={50}
                  outerRadius={76}
                  paddingAngle={3}
                >
                  {incomeVsExpense.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderRadius: 12,
                    border: "1px solid hsl(var(--border))",
                    color: "hsl(var(--foreground))",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </section>
  );
};
