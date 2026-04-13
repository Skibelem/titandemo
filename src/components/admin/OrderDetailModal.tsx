import { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Printer } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Order } from './types';

interface OrderDetailModalProps {
  order: Order;
  onClose: () => void;
  onStatusUpdated: (orderId: string, status: string) => void;
}

const statuses = ['pending', 'preparing', 'ready', 'completed', 'cancelled'] as const;

const statusFlow: Record<string, string[]> = {
  pending: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

export default function OrderDetailModal({ order, onClose, onStatusUpdated }: OrderDetailModalProps) {
  const [updating, setUpdating] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    setUpdating(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-orders', {
        body: { action: 'update-status', orderId: order.id, status: newStatus },
      });
      if (error || data?.error) throw new Error(data?.error || 'Failed');
      toast.success(`Order status updated to ${newStatus}`);
      onStatusUpdated(order.id, newStatus);
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html><head><title>Order #${order.id.slice(0, 8).toUpperCase()}</title>
      <style>
        body { font-family: monospace; padding: 20px; max-width: 300px; margin: 0 auto; }
        h1 { font-size: 18px; text-align: center; }
        .line { border-top: 1px dashed #000; margin: 10px 0; }
        .item { display: flex; justify-content: space-between; margin: 4px 0; }
        .total { font-weight: bold; font-size: 16px; }
        @media print { body { margin: 0; } }
      </style></head><body>
      <h1>TITANS COFFEE</h1>
      <p style="text-align:center">Order #${order.id.slice(0, 8).toUpperCase()}</p>
      <p style="text-align:center">${new Date(order.created_at).toLocaleString()}</p>
      <div class="line"></div>
      <p><strong>${order.customer_name}</strong><br/>${order.customer_phone}</p>
      <p>${order.delivery_type === 'delivery' ? `Delivery: ${order.delivery_address || 'Map pin'}` : `Pickup in ${order.pickup_time} min`}</p>
      <div class="line"></div>
      ${order.order_items?.map(item => `<div class="item"><span>${item.quantity}x ${item.product_name}</span><span>₦${(Number(item.product_price) * item.quantity).toLocaleString('en-NG')}</span></div>`).join('')}
      <div class="line"></div>
      <div class="item"><span>Subtotal</span><span>₦${Number(order.subtotal).toLocaleString('en-NG')}</span></div>
      <div class="item"><span>Tax</span><span>₦${Number(order.tax).toLocaleString('en-NG')}</span></div>
      <div class="item total"><span>Total</span><span>₦${Number(order.total).toLocaleString('en-NG')}</span></div>
      <div class="line"></div>
      <p style="text-align:center">Payment: ${order.payment_status}</p>
      <p style="text-align:center">Thank you! ☕</p>
      <script>window.print();window.close();</script>
      </body></html>
    `);
    printWindow.document.close();
  };

  const nextStatuses = statusFlow[order.status] || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto space-y-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl text-secondary">Order #{order.id.slice(0, 8).toUpperCase()}</h2>
          <div className="flex items-center gap-2">
            <button onClick={handlePrint} className="text-muted-foreground hover:text-accent transition-colors" title="Print Receipt">
              <Printer size={18} />
            </button>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">✕</button>
          </div>
        </div>

        {/* Status Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-muted-foreground text-sm">Status:</span>
          <span className={`px-2 py-1 rounded-full text-xs capitalize ${
            order.status === 'completed' ? 'bg-green-700/20 text-green-300' :
            order.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
            order.status === 'ready' ? 'bg-green-500/20 text-green-400' :
            order.status === 'preparing' ? 'bg-blue-500/20 text-blue-400' :
            'bg-yellow-500/20 text-yellow-400'
          }`}>{order.status}</span>
          {nextStatuses.map(s => (
            <motion.button
              key={s}
              onClick={() => handleStatusChange(s)}
              disabled={updating}
              className={`px-3 py-1 rounded-full text-xs font-display capitalize transition-colors ${
                s === 'cancelled' ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-accent/10 text-accent hover:bg-accent/20'
              }`}
              whileTap={{ scale: 0.95 }}
            >
              {updating ? <Loader2 className="animate-spin inline" size={12} /> : `→ ${s}`}
            </motion.button>
          ))}
        </div>

        <div className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-2">
            <div><span className="text-muted-foreground">Customer:</span> <span className="text-foreground">{order.customer_name}</span></div>
            <div><span className="text-muted-foreground">Phone:</span> <span className="text-foreground">{order.customer_phone}</span></div>
            <div><span className="text-muted-foreground">Email:</span> <span className="text-foreground">{order.email || 'N/A'}</span></div>
            <div><span className="text-muted-foreground">Payment:</span> <span className={`capitalize ${order.payment_status === 'paid' ? 'text-green-400' : 'text-yellow-400'}`}>{order.payment_status}</span></div>
            {order.payment_reference && (
              <div className="col-span-2"><span className="text-muted-foreground">Ref:</span> <span className="text-foreground font-mono text-xs">{order.payment_reference}</span></div>
            )}
          </div>

          {/* Delivery / Pickup */}
          <div className="border-t border-border pt-3">
            <h3 className="font-display text-secondary mb-2 flex items-center gap-2">
              {order.delivery_type === 'delivery' ? (
                <><span className="inline-block w-2 h-2 rounded-full bg-blue-400" /> Delivery</>
              ) : (
                <><span className="inline-block w-2 h-2 rounded-full bg-green-400" /> Pickup</>
              )}
            </h3>
            {order.delivery_type === 'delivery' ? (
              <div className="space-y-2">
                {order.delivery_address && <p className="text-foreground text-sm">{order.delivery_address}</p>}
                {order.delivery_lat && order.delivery_lng && (
                  <a
                    href={`https://www.google.com/maps?q=${order.delivery_lat},${order.delivery_lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-accent text-xs hover:underline"
                  >
                    📍 View on Map ({order.delivery_lat.toFixed(4)}, {order.delivery_lng.toFixed(4)})
                  </a>
                )}
                {!order.delivery_address && !order.delivery_lat && <p className="text-muted-foreground text-xs">No address provided</p>}
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-foreground text-sm">Titans Coffee — 123 Desert Tech Blvd, Lagos</p>
                <p className="text-muted-foreground text-xs">Pickup in {order.pickup_time} minutes</p>
              </div>
            )}
          </div>

          {/* Items */}
          <div className="border-t border-border pt-3">
            <h3 className="font-display text-secondary mb-2">Items</h3>
            {order.order_items?.map(item => (
              <div key={item.id} className="flex justify-between py-1">
                <span className="text-muted-foreground">{item.quantity}x {item.product_name}</span>
                <span className="text-foreground">₦{(Number(item.product_price) * item.quantity).toLocaleString('en-NG')}</span>
              </div>
            ))}
            <div className="border-t border-border mt-2 pt-2 flex justify-between font-display">
              <span className="text-foreground">Total</span>
              <span className="text-accent">₦{Number(order.total).toLocaleString('en-NG')}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
