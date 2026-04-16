

# Set Up Admin Auth Account

## Problem
The `admin_users` table has `admin@titanscoffee.com` registered, but no corresponding authentication account exists. The admin can't log in.

## Solution
Create an auth account for the admin email so they can sign in at `/admin`.

### Steps

1. **Create the admin auth user** via a database migration that uses `auth.create_user()` or via the Supabase admin API — however, since we can't directly create auth users through migrations safely, the best approach is to:

   - Add a **simple signup flow** or use the Supabase client to create the account programmatically via an edge function.
   
   **Recommended approach:** Create a one-time edge function `create-admin-user` that:
   - Accepts an admin email and password
   - Uses the service role key to call `supabase.auth.admin.createUser()`
   - Only works if the email is already in the `admin_users` table
   - Auto-confirms the email so the admin can log in immediately

2. **Invoke the edge function once** to create the account with a password you choose.

3. **Optionally delete the edge function** after use, or keep it for future admin onboarding.

### Alternative
If you prefer, I can enable **auto-confirm for email signups** temporarily, and you can sign up directly at `/admin` with a modified login page that includes a "Create Account" option. Then disable auto-confirm after.

### What you'll need to decide
- **What password** do you want for the admin account? (You'll enter it as a secret or I'll prompt you during setup)

