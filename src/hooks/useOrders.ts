import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CartItem } from '@/contexts/CartContext';

interface CreateOrderData {
  customerName: string;
  customerPhone: string;
  pickupTime: number;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
}

interface OrderResult {
  orderId: string;
  orderToken: string;
}

export function useCreateOrder() {
  return useMutation({
    mutationFn: async (data: CreateOrderData): Promise<OrderResult> => {
      console.log('Creating order:', data);

      // Create the order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_name: data.customerName,
          customer_phone: data.customerPhone,
          pickup_time: data.pickupTime,
          subtotal: data.subtotal,
          tax: data.tax,
          total: data.total,
        })
        .select('id, order_token')
        .single();

      if (orderError) {
        console.error('Error creating order:', orderError);
        throw orderError;
      }

      console.log('Order created:', orderData);

      // Create order items
      const orderItems = data.items.map(item => ({
        order_id: orderData.id,
        product_id: item.id,
        product_name: item.name,
        product_price: item.price,
        quantity: item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Error creating order items:', itemsError);
        throw itemsError;
      }

      console.log('Order items created successfully');

      return {
        orderId: orderData.id,
        orderToken: orderData.order_token,
      };
    },
  });
}
