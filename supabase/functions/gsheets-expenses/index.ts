import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SHEETS_API_KEY = Deno.env.get("GOOGLE_SHEETS_API_KEY");
const RAW_SHEET_ID = (Deno.env.get("GOOGLE_SHEET_ID") ?? "").trim();

// Normalize sheet ID: accept either the raw ID (1sx4...) or a full docs.google.com URL
const SHEET_ID = (() => {
  if (!RAW_SHEET_ID) return "";
  if (RAW_SHEET_ID.includes("/spreadsheets/")) {
    try {
      const afterD = RAW_SHEET_ID.split("/d/")[1];
      const core = afterD ? afterD.split("/")[0] : RAW_SHEET_ID;
      return core.split("?")[0];
    } catch {
      return RAW_SHEET_ID;
    }
  }
  // If it's not a full URL, still strip any accidental query/hash
  return RAW_SHEET_ID.split("?")[0].split("#")[0];
})();

const SHEET_NAME = "Table1";

if (!SHEETS_API_KEY || !SHEET_ID) {
  console.error("Google Sheets env vars are not set or sheet ID is empty.");
}

type TransactionRow = [
  string, // Transaction_ID
  string, // Date
  string, // Transaction_Type
  string, // Amount
  string, // Category
  string, // Sub_Category
  string, // Source_From
  string, // Spent_On_To
  string, // Payment_Mode
  string, // Account_Name
  string, // Is_Recurring
  string, // Description
];

const parseBoolean = (value: string): boolean => {
  const normalized = value.toString().trim().toLowerCase();
  return ["true", "1", "yes", "y"].includes(normalized);
};

const corsPreflight = (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  return null;
};

const validateTransaction = (body: any): { ok: boolean; errors?: string[] } => {
  const errors: string[] = [];

  if (!body) {
    return { ok: false, errors: ["Request body is required"] };
  }

  const requiredString = (field: string, max = 120) => {
    const value = (body[field] ?? "").toString().trim();
    if (!value) errors.push(`${field} is required`);
    if (value.length > max) errors.push(`${field} must be <= ${max} characters`);
  };

  requiredString("date", 20);
  requiredString("transactionType", 16);
  requiredString("amount", 32);
  requiredString("category");

  const amountNum = Number(body.amount);
  if (!Number.isFinite(amountNum) || amountNum <= 0) {
    errors.push("amount must be a positive number");
  }

  const type = (body.transactionType ?? "").toString().toLowerCase();
  if (!['income', 'expense'].includes(type)) {
    errors.push("transactionType must be 'Income' or 'Expense'");
  }

  if (errors.length) return { ok: false, errors };
  return { ok: true };
};

const mapRowToObject = (row: TransactionRow) => {
  const [
    Transaction_ID,
    Date,
    Transaction_Type,
    Amount,
    Category,
    Sub_Category,
    Source_From,
    Spent_On_To,
    Payment_Mode,
    Account_Name,
    Is_Recurring,
    Description,
  ] = row;

  const amountNum = Number(Amount ?? "0");

  return {
    id: Transaction_ID,
    date: Date,
    transactionType: Transaction_Type,
    amount: amountNum,
    category: Category,
    subCategory: Sub_Category,
    sourceFrom: Source_From,
    spentOnTo: Spent_On_To,
    paymentMode: Payment_Mode,
    accountName: Account_Name,
    isRecurring: parseBoolean(Is_Recurring ?? "false"),
    description: Description,
  };
};

const buildAppendBody = (body: any): TransactionRow => {
  const nextId = (body.nextId ?? "").toString().trim() || "";

  return [
    nextId,
    (body.date ?? "").toString().trim(),
    (body.transactionType ?? "").toString().trim(),
    (body.amount ?? "").toString().trim(),
    (body.category ?? "").toString().trim(),
    (body.subCategory ?? "").toString().trim(),
    (body.sourceFrom ?? "").toString().trim(),
    (body.spentOnTo ?? "").toString().trim(),
    (body.paymentMode ?? "").toString().trim(),
    (body.accountName ?? "").toString().trim(),
    (body.isRecurring ?? "false").toString().trim(),
    (body.description ?? "").toString().trim(),
  ];
};

const sheetsBase = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}`;

serve(async (req: Request) => {
  const preflight = corsPreflight(req);
  if (preflight) return preflight;

  if (!SHEETS_API_KEY || !SHEET_ID) {
    return new Response(JSON.stringify({ error: "Google Sheets is not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  console.log("[gsheets-expenses] Using sheetsBase", sheetsBase, "sheetName", SHEET_NAME);

  try {
    if (req.method === "GET") {
      // Fetch all rows
      const range = encodeURIComponent(`${SHEET_NAME}!A2:L`);
      const apiUrl = `${sheetsBase}/values/${range}?key=${SHEETS_API_KEY}`;
      console.log("[gsheets-expenses] GET", apiUrl);

      const res = await fetch(apiUrl);
      if (!res.ok) {
        const text = await res.text();
        console.error("Sheets read error", res.status, text);
        return new Response(
          JSON.stringify({
            error: "Failed to read from sheet",
            status: res.status,
            details: text.slice(0, 300),
          }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      const data = await res.json();
      const rows: string[][] = data.values ?? [];

      const transactions = rows
        .filter((r) => r.length >= 4)
        .map((row) => {
          const normalized = [
            row[0] ?? "",
            row[1] ?? "",
            row[2] ?? "",
            row[3] ?? "0",
            row[4] ?? "",
            row[5] ?? "",
            row[6] ?? "",
            row[7] ?? "",
            row[8] ?? "",
            row[9] ?? "",
            row[10] ?? "false",
            row[11] ?? "",
          ] as TransactionRow;
          return mapRowToObject(normalized);
        });

      return new Response(JSON.stringify({ transactions }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (req.method === "POST") {
      const body = await req.json();
      const validation = validateTransaction(body);
      if (!validation.ok) {
        return new Response(JSON.stringify({ error: "Invalid payload", details: validation.errors }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Compute next ID by fetching current last row id (simple strategy)
      const idRange = encodeURIComponent(`${SHEET_NAME}!A2:A`);
      const idUrl = `${sheetsBase}/values/${idRange}?key=${SHEETS_API_KEY}`;
      console.log("[gsheets-expenses] ID lookup", idUrl);
      const idRes = await fetch(idUrl);
      let nextId = 1;
      if (idRes.ok) {
        const idData = await idRes.json();
        const rows: string[][] = idData.values ?? [];
        if (rows.length > 0) {
          const lastVal = rows[rows.length - 1][0];
          const lastNum = Number(lastVal);
          if (Number.isFinite(lastNum)) nextId = lastNum + 1;
        }
      }

      const rowToAppend = buildAppendBody({ ...body, nextId });

      const appendRange = encodeURIComponent(`${SHEET_NAME}!A2:L`);
      const appendUrl = `${sheetsBase}/values/${appendRange}:append?valueInputOption=USER_ENTERED&key=${SHEETS_API_KEY}`;
      console.log("[gsheets-expenses] APPEND", appendUrl, "row", rowToAppend);

      const appendRes = await fetch(appendUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ values: [rowToAppend] }),
      });

      if (!appendRes.ok) {
        const text = await appendRes.text();
        console.error("Sheets append error", appendRes.status, text);
        return new Response(
          JSON.stringify({
            error: "Failed to append to sheet",
            status: appendRes.status,
            details: text.slice(0, 300),
          }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 201,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("gsheets-expenses function error", error);
    return new Response(JSON.stringify({ error: "Unexpected error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
