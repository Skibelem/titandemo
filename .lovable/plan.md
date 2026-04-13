

# Titans Coffee Admin Dashboard — Implementation Plan

## Current State

The admin dashboard at `/admin` has basic order viewing with stats cards, an orders table, and a detail modal. Authentication is email-only (no real password check). No product management, no order status updates, no real-time, no notifications.

## What You Asked For

Based on your answers:
- **Update order status** (pending → preparing → ready → completed/cancelled)
- **Manage products** (add, edit, delete menu items)
- **Real-time updates** (orders appear instantly)
- **Email + password login** (proper auth)
- **Customer list, notification sounds, print receipts**

---

## Phase 1: Secure Admin Authentication

Replace the current email-only check with proper Supabase Auth (email + password login). Admin users sign in via `supabase.auth.signInWithPassword()`, and the system verifies their email is in the `admin_users` table after login.

**Database changes:**
- Add an RLS UPDATE policy on `orders` so admins can change order status
- Add RLS INSERT/UPDATE/DELETE policies on `products` for admin management

**Files:** `src/pages/Admin.tsx`, `supabase/functions/admin-orders/index.ts` (update to use JWT auth instead of email/password in body)

---

## Phase 2: Order Status Management

Add status update controls to the order detail modal. Admin can move orders through: pending → preparing → ready → completed, or cancel at any stage. Uses a dropdown or button group.

**Database changes:** RLS policy allowing authenticated admins to UPDATE orders

**Files:** `src/pages/Admin.tsx`, `supabase/functions/admin-orders/index.ts` (add update-status action)

---

## Phase 3: Product Management (CRUD)

Add a "Products" tab to the admin dashboard with:
- Table listing all products with name, category, price, image
- Add new product form (name, description, price, category, temperature, intensity, image URL)
- Edit existing products inline or via modal
- Delete with confirmation

**Database changes:** RLS policies on `products` for INSERT/UPDATE/DELETE by admin

**Files:** `src/pages/Admin.tsx` (new Products tab/section)

---

## Phase 4: Real-Time Orders

Enable Supabase Realtime on the `orders` table so new orders and status changes appear instantly without refreshing.

**Database changes:**
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
```

**Files:** `src/pages/Admin.tsx` (add realtime subscription via `supabase.channel()`)

---

## Phase 5: Customer List, Notifications & Print

1. **Customer list tab** — Aggregate unique customers from orders (name, phone, email, order count, total spent)
2. **Notification sound** — Play an audio chime when a new order arrives via realtime
3. **Print receipt** — Add a "Print" button in the order detail modal that opens a print-friendly receipt layout using `window.print()`

**Files:** `src/pages/Admin.tsx` (customer tab, audio logic, print component)

---

## Technical Details

| Area | Approach |
|------|----------|
| Auth | Supabase Auth `signInWithPassword` + `is_admin_email()` check post-login |
| Order updates | Edge function with JWT verification, or direct Supabase client with RLS |
| Products CRUD | Direct Supabase client with admin RLS policies |
| Realtime | `supabase.channel('orders').on('postgres_changes', ...)` |
| Notifications | HTML5 `Audio` API with a bundled chime sound |
| Print | CSS `@media print` stylesheet + `window.print()` |

All phases maintain the current dark/glass-card design system and mobile responsiveness.

