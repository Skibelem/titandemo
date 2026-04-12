import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CartItem } from '@/contexts/CartContext';

interface CreateOrderData {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  deliveryType: 'pickup' | 'delivery';
  deliveryAddress?: string;
  deliveryLat?: number;
  deliveryLng?: number;
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
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_name: data.customerName,
          customer_phone: data.customerPhone,
          email: data.customerEmail,
          delivery_type: data.deliveryType,
          delivery_address: data.deliveryAddress || null,
          delivery_lat: data.deliveryLat || null,
          delivery_lng: data.deliveryLng || null,
          pickup_time: data.pickupTime,
          subtotal: data.subtotal,
          tax: data.tax,
          total: data.total,
          payment_status: 'pending',
        })
        .select('id, order_token')
        .single();

      if (orderError) {
        console.error('Error creating order:', orderError);
        throw orderError;
      }

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

      return {
        orderId: orderData.id,
        orderToken: orderData.order_token,
      };
    },
  });
}

export function useVerifyPayment() {
  return useMutation({
    mutationFn: async ({ reference, orderId }: { reference: string; orderId: string }) => {
      const { data, error } = await supabase.functions.invoke('verify-payment', {
        body: { reference, orderId },
      });

      if (error) throw error;
      return data;
    },
  });
}
