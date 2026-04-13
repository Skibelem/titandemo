-- Allow admins to UPDATE orders (e.g. change status)
CREATE POLICY "Admins can update orders"
ON public.orders
FOR UPDATE
TO authenticated
USING (public.is_admin_email(auth.email()))
WITH CHECK (public.is_admin_email(auth.email()));

-- Allow admins to INSERT products
CREATE POLICY "Admins can insert products"
ON public.products
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin_email(auth.email()));

-- Allow admins to UPDATE products
CREATE POLICY "Admins can update products"
ON public.products
FOR UPDATE
TO authenticated
USING (public.is_admin_email(auth.email()))
WITH CHECK (public.is_admin_email(auth.email()));

-- Allow admins to DELETE products
CREATE POLICY "Admins can delete products"
ON public.products
FOR DELETE
TO authenticated
USING (public.is_admin_email(auth.email()));

-- Enable realtime on orders table
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;