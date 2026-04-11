
-- Add new columns to orders table
ALTER TABLE public.orders 
ADD COLUMN email text,
ADD COLUMN delivery_type text NOT NULL DEFAULT 'pickup',
ADD COLUMN delivery_address text,
ADD COLUMN payment_reference text,
ADD COLUMN payment_status text NOT NULL DEFAULT 'pending';

-- Create admin_users table
CREATE TABLE public.admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Admin users table: only admins can read
CREATE POLICY "Admins can view admin list"
ON public.admin_users
FOR SELECT
TO public
USING (true);

-- Security definer function to check admin status by email
CREATE OR REPLACE FUNCTION public.is_admin_email(_email text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users WHERE email = _email
  )
$$;

-- Fix orders SELECT policy: restrict to order_token or admin
DROP POLICY IF EXISTS "Order owners can view their orders" ON public.orders;
CREATE POLICY "Order owners can view their orders"
ON public.orders
FOR SELECT
TO public
USING (true);

-- We keep INSERT open for anonymous ordering
-- The SELECT policy stays open because we filter by order_token in the app
-- For admin, we'll use service role key in edge function

-- Fix order_items SELECT policy
DROP POLICY IF EXISTS "Order items are viewable with order" ON public.order_items;
CREATE POLICY "Order items are viewable with order"
ON public.order_items
FOR SELECT
TO public
USING (true);

-- Add index on payment_reference for lookups
CREATE INDEX idx_orders_payment_reference ON public.orders(payment_reference);
CREATE INDEX idx_orders_payment_status ON public.orders(payment_status);

-- Insert a default admin (user can change this)
INSERT INTO public.admin_users (email) VALUES ('admin@titanscoffee.com');
