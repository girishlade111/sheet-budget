import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { NewTransactionInput } from "@/hooks/use-transactions";
import { useToast } from "@/hooks/use-toast";

const schema = z.object({
  date: z.string().trim().min(1, "Date is required"),
  transactionType: z.enum(["Income", "Expense"]),
  amount: z.string().trim().min(1, "Amount is required"),
  category: z.string().trim().min(1, "Category is required"),
  subCategory: z.string().trim().optional(),
  sourceFrom: z.string().trim().optional(),
  spentOnTo: z.string().trim().optional(),
  paymentMode: z.string().trim().optional(),
  accountName: z.string().trim().optional(),
  isRecurring: z.boolean().optional(),
  description: z.string().trim().optional(),
});

interface AddTransactionDialogProps {
  onSubmit: (payload: NewTransactionInput) => Promise<unknown>;
  isSubmitting: boolean;
}

export const AddTransactionDialog = ({ onSubmit, isSubmitting }: AddTransactionDialogProps) => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<NewTransactionInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      transactionType: "Expense",
      isRecurring: false,
    },
  });

  const handleSubmit = async (values: NewTransactionInput) => {
    try {
      await onSubmit(values);
      toast({
        title: "Transaction added",
        description: "Your Google Sheet has been updated.",
      });
      form.reset({ transactionType: values.transactionType, isRecurring: false });
      setOpen(false);
    } catch (error: any) {
      toast({
        title: "Unable to add transaction",
        description: error?.message ?? "Please review your input and try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="hero" size="lg">
          Add transaction
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-panel max-h-[90vh] max-w-xl overflow-y-auto border border-border/70 bg-card/95">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">New transaction</DialogTitle>
        </DialogHeader>

        <form
          className="mt-4 grid gap-3 text-xs md:grid-cols-2"
          onSubmit={form.handleSubmit(handleSubmit)}
          noValidate
        >
          <div className="space-y-1.5 md:col-span-1">
            <Label htmlFor="date">Date (DD/MM/YYYY)</Label>
            <Input id="date" type="text" inputMode="numeric" {...form.register("date")} />
            {form.formState.errors.date && (
              <p className="text-[11px] text-destructive">{form.formState.errors.date.message}</p>
            )}
          </div>

          <div className="space-y-1.5 md:col-span-1">
            <Label htmlFor="transactionType">Type</Label>
            <select
              id="transactionType"
              className="h-9 w-full rounded-md border border-input bg-background px-2 text-xs"
              {...form.register("transactionType")}
            >
              <option value="Income">Income</option>
              <option value="Expense">Expense</option>
            </select>
            {form.formState.errors.transactionType && (
              <p className="text-[11px] text-destructive">{form.formState.errors.transactionType.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="amount">Amount</Label>
            <Input id="amount" type="number" step="0.01" {...form.register("amount")} />
            {form.formState.errors.amount && (
              <p className="text-[11px] text-destructive">{form.formState.errors.amount.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="category">Category</Label>
            <Input id="category" type="text" {...form.register("category")} />
            {form.formState.errors.category && (
              <p className="text-[11px] text-destructive">{form.formState.errors.category.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="subCategory">Sub-category</Label>
            <Input id="subCategory" type="text" {...form.register("subCategory")} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sourceFrom">Source / From</Label>
            <Input id="sourceFrom" type="text" {...form.register("sourceFrom")} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="spentOnTo">Spent on / To</Label>
            <Input id="spentOnTo" type="text" {...form.register("spentOnTo")} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="paymentMode">Payment mode</Label>
            <Input id="paymentMode" type="text" {...form.register("paymentMode")} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="accountName">Account</Label>
            <Input id="accountName" type="text" {...form.register("accountName")} />
          </div>

          <div className="flex items-center gap-2 md:col-span-2">
            <Switch
              id="isRecurring"
              checked={form.watch("isRecurring") ?? false}
              onCheckedChange={(val) => form.setValue("isRecurring", val)}
            />
            <Label htmlFor="isRecurring" className="text-xs">
              Recurring transaction
            </Label>
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" type="text" {...form.register("description")} />
          </div>

          <div className="mt-2 flex justify-end gap-2 md:col-span-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
