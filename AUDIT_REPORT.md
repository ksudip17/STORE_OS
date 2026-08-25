# StoreOS — Code Audit: Security, Bugs & UX

Audited against the repo on branch `arena/01a03701-store-os` (commit `c20e694`).
Next.js 16 · Supabase · Groq AI · React 19.

**Status key:** ✅ Fixed · ⬜ Not yet fixed / requires infra decision · ℹ️ Info

---

## 🔴 A. SECURITY VULNERABILITIES

### A1. Broken Access Control / IDOR — `getCustomerTransactions()` ✅
**Fixed** (`src/lib/actions/transactions.ts`): added auth check + ownership verification (looks up the customer, verifies its store belongs to the caller) before returning any transaction data. Extracted a shared `requireCustomerOwnership()` helper.

### A2. Middleware breaks OAuth login + mishandles API routes ✅
**Fixed** (`src/lib/supabase/middleware.ts`): removed the always-true `!pathname.startsWith('/') === false` condition; explicitly allow `/`, `/auth/callback`, and `/api/*` through; API routes now return `401` JSON instead of a 307 redirect.

### A3. No rate limiting on the AI endpoint ✅
**Fixed** (`src/app/api/ai/route.ts`): added a sliding-window rate limiter (10 requests/user/min) returning `429`. Note: in-memory — good for single-instance; swap for shared storage (Upstash) on multi-lambda deploys.

### A4. Prompt injection → PII exfiltration via AI assistant ✅
**Fixed** (`src/app/api/ai/route.ts`): hardened the system prompt with explicit security rules (context-is-data, no prompt/context disclosure, cap on phone numbers revealed); prompt & history length capped.

### A5. Missing security headers / no CSP ✅
**Fixed** (`next.config.ts`): added `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Strict-Transport-Security`, `Permissions-Policy`, and a `Content-Security-Policy`.

### A6. Missing `supabase/schema.sql` + RLS policies ✅
**Fixed**: created `supabase/schema.sql` with `profiles`, `stores`, `customers`, `transactions` tables, **Row Level Security on all tables**, the `update_customer_balance()` trigger, the profile auto-creation trigger, and indexes.
> ⬜ **Action required:** apply this schema to your Supabase project (SQL editor). Until then the app relies on whatever is currently in the cloud.

### A7. No server-side input validation on server actions ✅
**Fixed** (`src/lib/actions/customers.ts`, `stores.ts`, `transactions.ts`): added Zod schemas (Zod v4, using `.issues`) + UUID checks on all create/update/delete actions.

### A8. `addFullPayment` trusts client-supplied `balance` ✅
**Fixed** (`transactions.ts`): signature reduced to `addFullPayment(customerId)`; balance is re-read from the DB after ownership check, never taken from the client.

### A9. AI route `history` is unvalidated ✅
**Fixed** (`route.ts`): history is validated (roles must be `user`/`assistant`), sanitized, length-capped, and limited to the 6 most recent.

### A10. Internal `error.message` leaks to users ✅
**Fixed** (`src/app/(dashboard)/dashboard/error.tsx`): replaced with a generic message; removed `error`/`profile` unused props.

---

## 🟠 B. BUGS / FUNCTIONAL ISSUES

1. **`/stores` page is a dead placeholder** ✅ **Fixed** (`src/app/(dashboard)/store/page.tsx`): now a real store listing (fetch stores + customers, empty state, Add Store dialog).
2. **N+1 query on store detail page** ✅ **Fixed** (`store/[storeId]/page.tsx` + new `getTransactionsForCustomers()`): single batched query grouped into `transactionsByCustomer`.
3. **Currency inconsistency in PDF (₹ vs Rs.)** ✅ **Fixed** (`CustomerPDF.tsx`): now uses `Rs.` + `en-NP` locale.
4. **Landing-footer buttons are dead** ⬜ Not yet wired (Privacy/Terms pages don't exist yet — product decision).
5. **OAuth `redirectTo` uses `NEXT_PUBLIC_SITE_URL`** ✅ **Fixed** (`src/app/page.tsx`): always uses `window.location.origin`.
6. **`IndianRupee` (₹) icon in Nepali-context app** ✅ **Fixed** (`AddCustomerDialog.tsx`): replaced with a `Wallet` icon.
7. **`getCustomers()` calls `getStores()` internally** ℹ️ Minor duplicate fetch; acceptable.
8. **Landing mobile nav has no sign-in button** ✅ **Fixed**: added a mobile "Get Started" CTA to the nav.

---

## 🟢 C. UI / UX IMPROVEMENTS

1. **Dark mode declared but not wired** ⬜ Either implement a toggle or remove the unused `.dark` CSS.
2. **`/stores` page** ✅ Built (see B1).
3. **Consistent currency** ✅ PDF + icon now `Rs.`/`Wallet` (see B3/B6).
4. **Optimistic UI for transactions** ⬜ Nice-to-have; currently full `router.refresh()`.
5. **Realtime toasts on new sales/payments** ⬜ Nice-to-have.
6. **Accessibility pass on icon-only buttons** ✅ Added `aria-label`s to Sidebar (hamburger/close/sign-out) and AIChat (open/clear/close).
7. **Empty/loading/error states** ℹ️ Mostly present; store-detail tx table + analytics could use more.
8. **Search debounce / sort on customers** ⬜ Nice-to-have for large lists.

---

## Verification
- `npx tsc --noEmit` ✅ passes (no new type errors).
- `npx eslint` on all modified files ✅ no new errors/warnings.
- `npm run build` fails **only** on the Geist Google-Font fetch — confirmed this also fails on the **original** commit `c20e694` in a clean worktree. It is a sandbox **network** limitation, not a code issue.

## Recommended next steps for you
1. Apply `supabase/schema.sql` to your Supabase project and verify RLS is enabled.
2. Swap the in-memory AI rate limiter for a shared store (Upstash) if you scale to multiple instances.
3. Wire the landing footer links (Privacy/Terms/Contact) or remove them.
