import { useState, useMemo } from "react";
import { SummaryCards } from "@/components/SummaryCards";
import { ChartsSection } from "@/components/ChartsSection";
import { FiltersBar } from "@/components/FiltersBar";
import { TransactionsTable } from "@/components/TransactionsTable";
import { AddTransactionDialog } from "@/components/AddTransactionDialog";
import { useTransactions } from "@/hooks/use-transactions";
import { TransactionFilters } from "@/types/transaction";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [filters, setFilters] = useState<TransactionFilters>({ type: "All" });
  const { toast } = useToast();
  const { query, stats, filtered, addTransaction, isAdding } = useTransactions(filters);

  const categories = useMemo(() => {
    const set = new Set<string>();
    query.data?.transactions.forEach((t) => {
      if (t.category) set.add(t.category);
    });
    return Array.from(set).sort();
  }, [query.data]);

  const handleRefresh = async () => {
    try {
      await query.refetch();
      toast({ title: "Synced", description: "Data refreshed from Google Sheets." });
    } catch {
      toast({ title: "Refresh failed", description: "Unable to sync from Google Sheets.", variant: "destructive" });
    }
  };

  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[hsl(var(--gradient-hero))] to-[hsl(var(--gradient-hero-alt))] text-xs font-bold text-primary-foreground shadow-lg ring-accent-soft">
              EF
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-tight md:text-base">Expense Flow</h1>
              <p className="text-[11px] text-muted-foreground">
                Live expense tracker connected to your Google Sheet
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="hidden items-center gap-1 text-[11px] md:inline-flex"
              onClick={handleRefresh}
              disabled={query.isFetching}
            >
              <RefreshCw className={`h-3 w-3 ${query.isFetching ? "animate-spin" : ""}`} />
              Sync now
            </Button>
            <AddTransactionDialog onSubmit={addTransaction} isSubmitting={isAdding} />
          </div>
        </nav>
      </header>

      <section className="relative flex-1">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_hsl(var(--gradient-hero)/0.16),_transparent_55%),radial-gradient(circle_at_bottom,_hsl(var(--gradient-hero-alt)/0.22),_transparent_60%)] opacity-80" />
        <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-5 px-4 py-6 pb-10">
          {query.isLoading ? (
            <div className="mt-20 flex flex-col items-center justify-center gap-3 text-center">
              <div className="h-16 w-16 animate-spin rounded-full border-2 border-muted border-t-primary" />
              <p className="text-xs text-muted-foreground">Connecting to Google Sheets…</p>
            </div>
          ) : query.isError ? (
            <div className="mt-16 rounded-xl border border-destructive/50 bg-destructive/10 px-4 py-3 text-xs text-destructive-foreground">
              Unable to load data from Google Sheets. Please confirm access permissions and API quota.
            </div>
          ) : (
            <>
              <SummaryCards stats={stats} />

              <FiltersBar
                categories={categories}
                filters={filters}
                onChange={setFilters}
              />

              <div className="grid gap-5 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1.3fr)] lg:items-start">
                <TransactionsTable transactions={filtered} />
                <ChartsSection transactions={filtered} />
              </div>

              {query.isFetching && !query.isLoading && (
                <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-card/70 px-2 py-1 text-[11px] text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Syncing latest changes from Google Sheets…
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
};

export default Index;
