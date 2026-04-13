import { motion } from 'framer-motion';
import { ShoppingBag, CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react';
import { Order } from './types';

interface OrdersTabProps {
  orders: Order[];
  onSelectOrder: (order: Order) => void;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400',
  preparing: 'bg-blue-500/20 text-blue-400',
  ready: 'bg-green-500/20 text-green-400',
  completed: 'bg-green-700/20 text-green-300',
  cancelled: 'bg-red-500/20 text-red-400',
};

const paymentStatusIcons: Record<string, typeof CheckCircle> = {
  paid: CheckCircle,
  pending: AlertCircle,
  failed: XCircle,
};

export default function OrdersTab({ orders, onSelectOrder }: OrdersTabProps) {
  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Orders', value: orders.length, icon: ShoppingBag },
          { label: 'Paid', value: orders.filter(o => o.payment_status === 'paid').length, icon: CheckCircle },
          { label: 'Pending Payment', value: orders.filter(o => o.payment_status === 'pending').length, icon: Clock },
          { label: 'Revenue', value: `₦${orders.filter(o => o.payment_status === 'paid').reduce((s, o) => s + Number(o.total), 0).toLocaleString('en-NG')}`, icon: ShoppingBag },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass-card p-4">
            <stat.icon className="text-accent mb-2" size={20} />
            <p className="text-muted-foreground text-xs">{stat.label}</p>
            <p className="font-display text-xl text-secondary">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Orders Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 font-display text-sm text-muted-foreground">Order</th>
                <th className="text-left p-4 font-display text-sm text-muted-foreground">Customer</th>
                <th className="text-left p-4 font-display text-sm text-muted-foreground hidden sm:table-cell">Type</th>
                <th className="text-left p-4 font-display text-sm text-muted-foreground hidden md:table-cell">Items</th>
                <th className="text-left p-4 font-display text-sm text-muted-foreground">Total</th>
                <th className="text-left p-4 font-display text-sm text-muted-foreground">Payment</th>
                <th className="text-left p-4 font-display text-sm text-muted-foreground hidden md:table-cell">Status</th>
                <th className="text-left p-4 font-display text-sm text-muted-foreground hidden lg:table-cell">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, i) => {
                const PayIcon = paymentStatusIcons[order.payment_status] || AlertCircle;
                return (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-border/50 hover:bg-muted/20 cursor-pointer transition-colors"
                    onClick={() => onSelectOrder(order)}
                  >
                    <td className="p-4 font-mono text-sm text-foreground">#{order.id.slice(0, 8).toUpperCase()}</td>
                    <td className="p-4">
                      <p className="text-foreground text-sm">{order.customer_name}</p>
                      <p className="text-muted-foreground text-xs">{order.customer_phone}</p>
                    </td>
                    <td className="p-4 hidden sm:table-cell">
                      <span className={`px-2 py-1 rounded-full text-xs capitalize ${
                        order.delivery_type === 'delivery' ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        {order.delivery_type}
                      </span>
                    </td>
                    <td className="p-4 text-muted-foreground text-sm hidden md:table-cell">
                      {order.order_items?.length || 0} items
                    </td>
                    <td className="p-4 font-display text-accent">₦{Number(order.total).toLocaleString('en-NG')}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                        order.payment_status === 'paid' ? 'bg-green-500/20 text-green-400' :
                        order.payment_status === 'failed' ? 'bg-red-500/20 text-red-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        <PayIcon size={12} />
                        {order.payment_status}
                      </span>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <span className={`px-2 py-1 rounded-full text-xs ${statusColors[order.status] || 'bg-muted text-muted-foreground'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4 text-muted-foreground text-sm hidden lg:table-cell">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
          {orders.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <ShoppingBag className="mx-auto mb-3" size={40} />
              <p>No orders yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
