import { Transaction } from "@/types/transaction";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TransactionsTableProps {
  transactions: Transaction[];
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);

export const TransactionsTable = ({ transactions }: TransactionsTableProps) => {
  return (
    <section aria-label="Transactions list" className="glass-panel">
      <Card className="border-none bg-transparent shadow-none">
        <CardContent className="p-0">
          <ScrollArea className="h-[360px]">
            <table className="min-w-full border-separate border-spacing-y-1 text-xs">
              <thead className="sticky top-0 z-10 bg-background/80 backdrop-blur">
                <tr className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-2 text-left font-medium">Date</th>
                  <th className="px-4 py-2 text-left font-medium">Type</th>
                  <th className="px-4 py-2 text-left font-medium">Category</th>
                  <th className="px-4 py-2 text-left font-medium">Amount</th>
                  <th className="px-4 py-2 text-left font-medium">Account</th>
                  <th className="px-4 py-2 text-left font-medium">Description</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-[11px] text-muted-foreground">
                      No transactions match your filters yet.
                    </td>
                  </tr>
                )}
                {transactions.map((t) => (
                  <tr
                    key={t.id + t.date + t.amount}
                    className="group cursor-default rounded-xl border border-transparent bg-card/40 align-middle transition-colors hover:border-border/70 hover:bg-card/80"
                  >
                    <td className="px-4 py-2 align-middle text-xs text-muted-foreground">{t.date}</td>
                    <td className="px-4 py-2 align-middle text-xs font-medium">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] ${
                          t.transactionType === "Income"
                            ? "bg-primary/15 text-primary"
                            : "bg-destructive/15 text-destructive"
                        }`}
                      >
                        {t.transactionType}
                      </span>
                    </td>
                    <td className="px-4 py-2 align-middle text-xs text-foreground">
                      {t.category || "—"}
                      {t.subCategory && (
                        <span className="ml-1 text-[11px] text-muted-foreground">/ {t.subCategory}</span>
                      )}
                    </td>
                    <td className="px-4 py-2 align-middle text-xs font-semibold text-foreground">
                      {formatCurrency(t.amount)}
                    </td>
                    <td className="px-4 py-2 align-middle text-xs text-muted-foreground">{t.accountName || "—"}</td>
                    <td className="px-4 py-2 align-middle text-xs text-muted-foreground">
                      {t.description || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollArea>
        </CardContent>
      </Card>
    </section>
  );
};
