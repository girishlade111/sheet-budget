export type TransactionType = "Income" | "Expense";

export interface Transaction {
  id: string;
  date: string; // DD/MM/YYYY from sheet
  transactionType: TransactionType;
  amount: number;
  category: string;
  subCategory?: string;
  sourceFrom?: string;
  spentOnTo?: string;
  paymentMode?: string;
  accountName?: string;
  isRecurring: boolean;
  description?: string;
}

export interface TransactionFilters {
  fromDate?: string;
  toDate?: string;
  type?: TransactionType | "All";
  category?: string;
}

export interface TransactionStats {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}
