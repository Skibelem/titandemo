import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, ShoppingBag, Eye, Clock, CheckCircle, XCircle, AlertCircle, Loader2, LogIn, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

interface OrderItem {
  id: string;
  product_name: string;
  product_price: number;
  quantity: number;
}

interface Order {
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

export default function Admin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const handleLogin = async () => {
    if (!email) {
      toast.error('Please enter your admin email');
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-orders', {
        body: { adminEmail: email, adminPassword: password || 'admin' },
      });
      if (error) throw error;
      if (data.error) {
        toast.error(data.error);
        return;
      }
      setOrders(data.orders || []);
      setIsAuthenticated(true);
      toast.success('Welcome, Admin!');
    } catch {
      toast.error('Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const refreshOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-orders', {
        body: { adminEmail: email, adminPassword: password || 'admin' },
      });
      if (error) throw error;
      setOrders(data.orders || []);
    } catch {
      toast.error('Failed to refresh');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 w-full max-w-md space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-accent/20 flex items-center justify-center mb-4">
              <Shield className="text-accent" size={32} />
            </div>
            <h1 className="font-display text-3xl text-secondary">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-2">Titans Coffee Order Management</p>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-foreground">Admin Email</Label>
              <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@titanscoffee.com" className="bg-muted/50 border-border" />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Password</Label>
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" className="bg-muted/50 border-border" />
            </div>
            <motion.button
              className="w-full btn-electric py-4 bg-accent text-accent-foreground font-display tracking-wider rounded-full flex items-center justify-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <LogIn size={20} />}
              {loading ? 'Authenticating...' : 'Access Dashboard'}
            </motion.button>
          </div>
          <Link to="/" className="flex items-center justify-center gap-2 text-muted-foreground hover:text-accent transition-colors text-sm">
            <ArrowLeft size={16} /> Back to Store
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="text-accent" size={24} />
            <h1 className="font-display text-xl text-secondary">Titans Admin</h1>
          </div>
          <div className="flex items-center gap-4">
            <motion.button onClick={refreshOrders} disabled={loading} className="px-4 py-2 bg-accent/10 text-accent rounded-full font-display text-sm hover:bg-accent/20 transition-colors flex items-center gap-2" whileTap={{ scale: 0.95 }}>
              {loading ? <Loader2 className="animate-spin" size={16} /> : <Eye size={16} />}
              Refresh
            </motion.button>
            <Link to="/" className="text-muted-foreground hover:text-accent transition-colors text-sm flex items-center gap-1">
              <ArrowLeft size={16} /> Store
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
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
                      onClick={() => setSelectedOrder(order)}
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
      </main>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4" onClick={() => setSelectedOrder(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl text-secondary">Order #{selectedOrder.id.slice(0, 8).toUpperCase()}</h2>
              <button onClick={() => setSelectedOrder(null)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div><span className="text-muted-foreground">Customer:</span> <span className="text-foreground">{selectedOrder.customer_name}</span></div>
                <div><span className="text-muted-foreground">Phone:</span> <span className="text-foreground">{selectedOrder.customer_phone}</span></div>
                <div><span className="text-muted-foreground">Email:</span> <span className="text-foreground">{selectedOrder.email || 'N/A'}</span></div>
                <div><span className="text-muted-foreground">Payment:</span> <span className={`capitalize ${selectedOrder.payment_status === 'paid' ? 'text-green-400' : 'text-yellow-400'}`}>{selectedOrder.payment_status}</span></div>
                {selectedOrder.payment_reference && (
                  <div className="col-span-2"><span className="text-muted-foreground">Ref:</span> <span className="text-foreground font-mono text-xs">{selectedOrder.payment_reference}</span></div>
                )}
              </div>

              {/* Delivery / Pickup Section */}
              <div className="border-t border-border pt-3">
                <h3 className="font-display text-secondary mb-2 flex items-center gap-2">
                  {selectedOrder.delivery_type === 'delivery' ? (
                    <><span className="inline-block w-2 h-2 rounded-full bg-blue-400" /> Delivery</>
                  ) : (
                    <><span className="inline-block w-2 h-2 rounded-full bg-green-400" /> Pickup</>
                  )}
                </h3>
                {selectedOrder.delivery_type === 'delivery' ? (
                  <div className="space-y-2">
                    {selectedOrder.delivery_address && (
                      <p className="text-foreground text-sm">{selectedOrder.delivery_address}</p>
                    )}
                    {selectedOrder.delivery_lat && selectedOrder.delivery_lng && (
                      <a
                        href={`https://www.google.com/maps?q=${selectedOrder.delivery_lat},${selectedOrder.delivery_lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-accent text-xs hover:underline"
                      >
                        📍 View on Map ({selectedOrder.delivery_lat.toFixed(4)}, {selectedOrder.delivery_lng.toFixed(4)})
                      </a>
                    )}
                    {!selectedOrder.delivery_address && !selectedOrder.delivery_lat && (
                      <p className="text-muted-foreground text-xs">No address provided</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-foreground text-sm">Titans Coffee — 123 Desert Tech Blvd, Lagos</p>
                    <p className="text-muted-foreground text-xs">Pickup in {selectedOrder.pickup_time} minutes</p>
                  </div>
                )}
              </div>

              <div className="border-t border-border pt-3">
                <h3 className="font-display text-secondary mb-2">Items</h3>
                {selectedOrder.order_items?.map(item => (
                  <div key={item.id} className="flex justify-between py-1">
                    <span className="text-muted-foreground">{item.quantity}x {item.product_name}</span>
                    <span className="text-foreground">₦{(Number(item.product_price) * item.quantity).toLocaleString('en-NG')}</span>
                  </div>
                ))}
                <div className="border-t border-border mt-2 pt-2 flex justify-between font-display">
                  <span className="text-foreground">Total</span>
                  <span className="text-accent">₦{Number(selectedOrder.total).toLocaleString('en-NG')}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
