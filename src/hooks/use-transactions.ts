import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Transaction, TransactionFilters, TransactionStats } from "@/types/transaction";

const API_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gsheets-expenses`;

const transactionSchema = z.object({
  date: z
    .string()
    .trim()
    .min(1, "Date is required")
    .max(20, "Date is too long"),
  transactionType: z.enum(["Income", "Expense"]),
  amount: z
    .string()
    .trim()
    .refine((val) => {
      const n = Number(val);
      return Number.isFinite(n) && n > 0;
    }, "Amount must be a positive number"),
  category: z.string().trim().min(1, "Category is required").max(80),
  subCategory: z.string().trim().max(80).optional().or(z.literal("")),
  sourceFrom: z.string().trim().max(80).optional().or(z.literal("")),
  spentOnTo: z.string().trim().max(80).optional().or(z.literal("")),
  paymentMode: z.string().trim().max(40).optional().or(z.literal("")),
  accountName: z.string().trim().max(80).optional().or(z.literal("")),
  isRecurring: z.boolean().optional(),
  description: z.string().trim().max(200).optional().or(z.literal("")),
});

export type NewTransactionInput = z.infer<typeof transactionSchema>;

const computeStats = (transactions: Transaction[]): TransactionStats => {
  return transactions.reduce(
    (acc, t) => {
      if (t.transactionType === "Income") {
        acc.totalIncome += t.amount;
      } else if (t.transactionType === "Expense") {
        acc.totalExpense += t.amount;
      }
      acc.balance = acc.totalIncome - acc.totalExpense;
      return acc;
    },
    { totalIncome: 0, totalExpense: 0, balance: 0 },
  );
};

const applyFilters = (transactions: Transaction[], filters: TransactionFilters): Transaction[] => {
  return transactions.filter((t) => {
    if (filters.type && filters.type !== "All" && t.transactionType !== filters.type) return false;
    if (filters.category && filters.category !== "All" && t.category !== filters.category) return false;

    if (filters.fromDate || filters.toDate) {
      const [d, m, y] = t.date.split("/").map(Number);
      const tDate = new Date(y, m - 1, d).getTime();
      if (filters.fromDate) {
        const [fd, fm, fy] = filters.fromDate.split("/").map(Number);
        const fromTs = new Date(fy, fm - 1, fd).getTime();
        if (tDate < fromTs) return false;
      }
      if (filters.toDate) {
        const [td, tm, ty] = filters.toDate.split("/").map(Number);
        const toTs = new Date(ty, tm - 1, td).getTime();
        if (tDate > toTs) return false;
      }
    }

    return true;
  });
};

export const useTransactions = (filters: TransactionFilters) => {
  const queryClient = useQueryClient();

  const query = useQuery<{ transactions: Transaction[] }>({
    queryKey: ["transactions"],
    queryFn: async () => {
      const res = await fetch(API_BASE);
      if (!res.ok) {
        throw new Error("Failed to load transactions");
      }
      return res.json();
    },
    staleTime: 15_000,
  });

  const filtered = useMemo(() => {
    if (!query.data?.transactions) return [] as Transaction[];
    return applyFilters(query.data.transactions, filters);
  }, [query.data, filters]);

  const stats = useMemo(() => computeStats(filtered), [filtered]);

  const mutation = useMutation({
    mutationFn: async (input: NewTransactionInput) => {
      const parsed = transactionSchema.safeParse(input);
      if (!parsed.success) {
        const message = parsed.error.errors[0]?.message ?? "Invalid input";
        throw new Error(message);
      }

      const res = await fetch(API_BASE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parsed.data),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        const message = json.error ?? "Failed to add transaction";
        throw new Error(message);
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });

  return {
    query,
    stats,
    filtered,
    addTransaction: mutation.mutateAsync,
    isAdding: mutation.isPending,
  };
};
