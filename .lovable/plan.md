

# Add "Create Account" to Admin Login

## Problem
The edge function approach for creating admin accounts is clunky. The user wants a self-service "Create Account" flow directly on the `/admin` login page.

## Solution
Add a signup mode to `AdminLogin.tsx` that lets someone create an auth account — but **only** if their email exists in the `admin_users` table. The edge function `create-admin-user` handles the secure account creation (it already checks the admin_users table).

### Changes

1. **Update `AdminLogin.tsx`**
   - Add a toggle between "Sign In" and "Create Account" modes
   - In "Create Account" mode, collect email + password + confirm password
   - Call the `create-admin-user` edge function to create the account
   - On success, auto-switch to sign-in mode with a success toast
   - Non-admin emails get rejected by the edge function (403)

2. **No database changes needed** — the `admin_users` table and `create-admin-user` edge function already handle validation.

3. **Clean up the hardcoded password** — remove the `ADMIN_PASSWORD` secret since it's no longer needed; admins choose their own password via the form.

### Security
- Account creation is gated by the `admin_users` table check in the edge function
- The edge function uses the service role key server-side — no client exposure
- Password is chosen by the admin, not hardcoded

