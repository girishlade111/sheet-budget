import { Transaction } from "@/types/transaction";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SummaryCardsProps {
  stats: {
    totalIncome: number;
    totalExpense: number;
    balance: number;
  };
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);

export const SummaryCards = ({ stats }: SummaryCardsProps) => {
  return (
    <section className="grid gap-4 md:grid-cols-3 lg:gap-6" aria-label="Financial summary">
      <Card className="metric-card animate-card-float">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Income</CardTitle>
          <span className="rounded-full bg-primary/15 px-2 py-1 text-xs font-semibold text-primary">Inflow</span>
        </CardHeader>
        <CardContent className="space-y-1">
          <p className="text-2xl font-semibold tracking-tight text-primary-foreground">{formatCurrency(stats.totalIncome)}</p>
          <p className="text-xs text-muted-foreground">All income transactions from your sheet</p>
        </CardContent>
      </Card>

      <Card className="metric-card animate-card-float [animation-delay:0.2s]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Expense</CardTitle>
          <span className="rounded-full bg-destructive/15 px-2 py-1 text-xs font-semibold text-destructive">Outflow</span>
        </CardHeader>
        <CardContent className="space-y-1">
          <p className="text-2xl font-semibold tracking-tight text-destructive-foreground">
            {formatCurrency(stats.totalExpense)}
          </p>
          <p className="text-xs text-muted-foreground">All expense transactions from your sheet</p>
        </CardContent>
      </Card>

      <Card className="metric-card animate-card-float [animation-delay:0.4s]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">Net Balance</CardTitle>
          <span className="rounded-full bg-accent/15 px-2 py-1 text-xs font-semibold text-accent">Position</span>
        </CardHeader>
        <CardContent className="space-y-1">
          <p
            className={`text-2xl font-semibold tracking-tight ${
              stats.balance >= 0 ? "text-primary-foreground" : "text-destructive-foreground"
            }`}
          >
            {formatCurrency(stats.balance)}
          </p>
          <p className="text-xs text-muted-foreground">
            {stats.balance >= 0 ? "You are in surplus this period" : "You are in deficit this period"}
          </p>
        </CardContent>
      </Card>
    </section>
  );
};
