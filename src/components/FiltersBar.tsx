import { TransactionFilters } from "@/types/transaction";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FiltersBarProps {
  categories: string[];
  filters: TransactionFilters;
  onChange: (next: TransactionFilters) => void;
}

export const FiltersBar = ({ categories, filters, onChange }: FiltersBarProps) => {
  const update = (patch: Partial<TransactionFilters>) => onChange({ ...filters, ...patch });

  return (
    <section
      className="glass-panel flex flex-col gap-3 border border-border/60 px-4 py-3 text-xs md:flex-row md:items-center md:justify-between"
      aria-label="Transaction filters"
    >
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-[11px] uppercase tracking-wide text-muted-foreground">Date</span>
          <Input
            type="text"
            inputMode="numeric"
            placeholder="From DD/MM/YYYY"
            value={filters.fromDate ?? ""}
            onChange={(e) => update({ fromDate: e.target.value })}
            className="h-8 w-32 bg-background/60 text-xs"
          />
          <Input
            type="text"
            inputMode="numeric"
            placeholder="To DD/MM/YYYY"
            value={filters.toDate ?? ""}
            onChange={(e) => update({ toDate: e.target.value })}
            className="h-8 w-32 bg-background/60 text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] uppercase tracking-wide text-muted-foreground">Type</span>
          <Select
            value={filters.type ?? "All"}
            onValueChange={(value) => update({ type: value as any })}
          >
            <SelectTrigger className="h-8 w-28 bg-background/60 text-xs">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="Income">Income</SelectItem>
              <SelectItem value="Expense">Expense</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] uppercase tracking-wide text-muted-foreground">Category</span>
          <Select
            value={filters.category ?? "All"}
            onValueChange={(value) => update({ category: value })}
          >
            <SelectTrigger className="h-8 w-36 bg-background/60 text-xs">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground">
        Filters are applied client-side on top of live data from your Google Sheet.
      </p>
    </section>
  );
};
