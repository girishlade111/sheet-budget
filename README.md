# Expense Flow (sheet-budget)

A live personal-finance dashboard that reads transactions straight from a Google Sheet and turns them into a searchable, filterable, charted budget view. Built with React + Vite and powered by a Supabase Edge Function that syncs rows from Google Sheets on demand.

**Built by Girish Lade** — [ladestack.in](https://ladestack.in)

## Features

- **Google Sheets sync** — expense/income rows are pulled from a Google Sheet (`Table1`) through the `gsheets-expenses` Supabase Edge Function; one-click refresh in the header.
- **Dashboard overview** — summary cards for total income, total expenses, and net balance, recomputed live from the synced data.
- **Charts** — spending breakdowns via Recharts (category splits, trends).
- **Filters & search** — filter by transaction type, category, and date range; full transaction table with sorting.
- **Add transaction** — validated dialog (React Hook Form + Zod) that appends a row back to the sheet through the edge function.
- **Dark/light themes** — `next-themes` powered theme toggle.
- **Modern UI** — shadcn/ui component library on Tailwind CSS with a polished, responsive layout.

## Tech stack

- React 18, TypeScript, Vite 5
- Tailwind CSS 3, shadcn/ui (Radix primitives), Lucide icons
- TanStack Query (data fetching/caching), React Router, React Hook Form + Zod, Recharts
- Supabase (`@supabase/supabase-js` + Edge Function in Deno) — bridge to the Google Sheets API
- Deployed as a fully static build on GitHub Pages

## Quick start

```sh
# 1. Clone
git clone https://github.com/girishlade111/sheet-budget.git
cd sheet-budget

# 2. Install
npm install

# 3. Configure — fill in your values in .env
# VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY,
# VITE_SUPABASE_PROJECT_ID

# 4. Run locally
npm run dev

# 5. Build a static production bundle
npm run build
```

## Project structure

```
src/
  pages/              # Index (dashboard), NotFound
  components/         # SummaryCards, ChartsSection, FiltersBar,
                      # TransactionsTable, AddTransactionDialog, NavLink,
                      # SocialLinks + shadcn ui/ primitives
  hooks/              # use-transactions (React Query + edge-function calls)
  integrations/supabase/  # generated client + Database types
  types/              # Transaction, filters, stats types
supabase/
  functions/gsheets-expenses/  # Deno edge function: Google Sheets read/write
```

## Environment variables

| Variable | Purpose |
| --- | --- |
| `VITE_SUPABASE_URL` | Supabase project URL (baked into the client at build time) |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/publishable key |
| `VITE_SUPABASE_PROJECT_ID` | Supabase project ref |

The `gsheets-expenses` edge function itself needs `GOOGLE_SHEET_ID` (sheet ID or full docs URL) plus the Sheets API key configured in the Supabase project — those live server-side, not in this repo.

## Deploy notes

The frontend is a pure static SPA (`vite build` → `dist/`), so it can be hosted anywhere static: GitHub Pages, Cloudflare Pages, Netlify, or Vercel. The `.env` values are baked in at build time; the edge function must already be deployed to your Supabase project for data sync to work.

## License

MIT — free to use and modify.
