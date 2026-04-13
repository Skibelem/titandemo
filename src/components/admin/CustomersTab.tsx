import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import { Order } from './types';

interface CustomersTabProps {
  orders: Order[];
}

interface Customer {
  name: string;
  phone: string;
  email: string | null;
  orderCount: number;
  totalSpent: number;
  lastOrder: string;
}

export default function CustomersTab({ orders }: CustomersTabProps) {
  const customers = useMemo(() => {
    const map = new Map<string, Customer>();
    orders.forEach(order => {
      const key = order.customer_phone;
      const existing = map.get(key);
      if (existing) {
        existing.orderCount++;
        existing.totalSpent += Number(order.total);
        if (order.created_at > existing.lastOrder) {
          existing.lastOrder = order.created_at;
          existing.name = order.customer_name;
          existing.email = order.email || existing.email;
        }
      } else {
        map.set(key, {
          name: order.customer_name,
          phone: order.customer_phone,
          email: order.email,
          orderCount: 1,
          totalSpent: Number(order.total),
          lastOrder: order.created_at,
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => b.totalSpent - a.totalSpent);
  }, [orders]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-xl text-secondary">Customers ({customers.length})</h2>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 font-display text-sm text-muted-foreground">Customer</th>
                <th className="text-left p-4 font-display text-sm text-muted-foreground hidden sm:table-cell">Email</th>
                <th className="text-left p-4 font-display text-sm text-muted-foreground">Orders</th>
                <th className="text-left p-4 font-display text-sm text-muted-foreground">Total Spent</th>
                <th className="text-left p-4 font-display text-sm text-muted-foreground hidden md:table-cell">Last Order</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c, i) => (
                <motion.tr key={c.phone} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                  <td className="p-4">
                    <p className="text-foreground text-sm">{c.name}</p>
                    <p className="text-muted-foreground text-xs">{c.phone}</p>
                  </td>
                  <td className="p-4 text-muted-foreground text-sm hidden sm:table-cell">{c.email || '—'}</td>
                  <td className="p-4 text-foreground text-sm">{c.orderCount}</td>
                  <td className="p-4 font-display text-accent">₦{c.totalSpent.toLocaleString('en-NG')}</td>
                  <td className="p-4 text-muted-foreground text-sm hidden md:table-cell">{new Date(c.lastOrder).toLocaleDateString()}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {customers.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="mx-auto mb-3" size={40} />
              <p>No customers yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
