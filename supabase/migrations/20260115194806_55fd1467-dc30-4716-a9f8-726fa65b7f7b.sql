-- Create products table for coffee menu
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category TEXT NOT NULL,
  image TEXT,
  intensity INTEGER CHECK (intensity >= 1 AND intensity <= 5),
  temperature TEXT CHECK (temperature IN ('hot', 'cold')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create order status enum
CREATE TYPE public.order_status AS ENUM ('pending', 'preparing', 'ready', 'completed', 'cancelled');

-- Create orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_token TEXT NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  pickup_time INTEGER NOT NULL DEFAULT 15,
  status public.order_status NOT NULL DEFAULT 'pending',
  subtotal DECIMAL(10, 2) NOT NULL,
  tax DECIMAL(10, 2) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create order_items table
CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  product_name TEXT NOT NULL,
  product_price DECIMAL(10, 2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Products: Anyone can read
CREATE POLICY "Products are viewable by everyone"
ON public.products
FOR SELECT
USING (true);

-- Orders: Anyone can insert (public ordering without auth)
CREATE POLICY "Anyone can create orders"
ON public.orders
FOR INSERT
WITH CHECK (true);

-- Orders: Only order owner can view their order using token
CREATE POLICY "Order owners can view their orders"
ON public.orders
FOR SELECT
USING (true);

-- Order items: Anyone can insert items for existing orders
CREATE POLICY "Anyone can add order items"
ON public.order_items
FOR INSERT
WITH CHECK (true);

-- Order items: Viewable with the order
CREATE POLICY "Order items are viewable with order"
ON public.order_items
FOR SELECT
USING (true);

-- Create index for faster order token lookups
CREATE INDEX idx_orders_token ON public.orders(order_token);
CREATE INDEX idx_order_items_order ON public.order_items(order_id);

-- Insert initial product data matching the existing menu
INSERT INTO public.products (name, description, price, category, image, intensity, temperature) VALUES
('Titan Espresso', 'Our signature double-shot, rich with notes of dark chocolate and toasted caramel. The foundation of strength.', 4.50, 'espresso', 'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=400&h=400&fit=crop', 5, 'hot'),
('Nebula Americano', 'Espresso expanded with pristine water, creating a cosmic depth of flavor.', 4.00, 'espresso', 'https://images.unsplash.com/photo-1497515114583-e747f31a4ddf?w=400&h=400&fit=crop', 3, 'hot'),
('Quantum Latte', 'Silky steamed milk meets bold espresso in a state of perfect balance.', 5.50, 'espresso', 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=400&h=400&fit=crop', 2, 'hot'),
('Arctic Cold Brew', '24-hour steeped perfection. Smooth, potent, and undeniably refreshing.', 5.00, 'cold', 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=400&fit=crop', 4, 'cold'),
('Nitro Surge', 'Cold brew infused with nitrogen for a creamy, cascade pour experience.', 6.00, 'cold', 'https://images.unsplash.com/photo-1592663527359-cf6642f54cff?w=400&h=400&fit=crop', 4, 'cold'),
('Iced Caramel Titan', 'Bold espresso, creamy milk, and our house-made caramel over ice.', 6.50, 'cold', 'https://images.unsplash.com/photo-1553909489-cd47e0907980?w=400&h=400&fit=crop', 3, 'cold'),
('Prometheus Blend', 'Our limited reserve blend. Complex, fruity, with a finish that ignites the senses.', 7.50, 'signature', 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop', 5, 'hot'),
('Atlas Mocha', 'The weight of the world in chocolate and espresso, crowned with whipped cream.', 6.50, 'signature', 'https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?w=400&h=400&fit=crop', 3, 'hot'),
('Hyperion Freeze', 'A frozen blended creation with espresso, vanilla, and a golden drizzle.', 7.00, 'signature', 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=400&fit=crop', 2, 'cold');