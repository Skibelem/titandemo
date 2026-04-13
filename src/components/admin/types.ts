export interface OrderItem {
  id: string;
  product_name: string;
  product_price: number;
  quantity: number;
}

export interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  email: string | null;
  delivery_type: string;
  delivery_address: string | null;
  delivery_lat: number | null;
  delivery_lng: number | null;
  pickup_time: number;
  status: string;
  subtotal: number;
  tax: number;
  total: number;
  payment_status: string;
  payment_reference: string | null;
  created_at: string;
  order_items: OrderItem[];
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  temperature: string | null;
  intensity: number | null;
  image: string | null;
  created_at: string;
}
