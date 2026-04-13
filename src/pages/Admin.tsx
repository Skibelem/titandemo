import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import AdminLogin from '@/components/admin/AdminLogin';
import AdminHeader from '@/components/admin/AdminHeader';
import OrdersTab from '@/components/admin/OrdersTab';
import OrderDetailModal from '@/components/admin/OrderDetailModal';
import ProductsTab from '@/components/admin/ProductsTab';
import CustomersTab from '@/components/admin/CustomersTab';
import { Order } from '@/components/admin/types';

// Notification chime using Web Audio API
function playChime() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
  } catch {}
}

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [activeTab, setActiveTab] = useState('orders');
  const orderIdsRef = useRef<Set<string>>(new Set());

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-orders', {
        body: { action: 'list' },
      });
      if (error || data?.error) {
        if (data?.error === 'Unauthorized' || data?.error === 'Unauthorized - not an admin') {
          await supabase.auth.signOut();
          setIsAuthenticated(false);
          return;
        }
        throw new Error(data?.error || 'Failed');
      }
      const fetched = (data.orders || []) as Order[];
      setOrders(fetched);
      orderIdsRef.current = new Set(fetched.map((o: Order) => o.id));
    } catch {
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, []);

  // Check existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Verify admin status
        const { data, error } = await supabase.functions.invoke('admin-orders', {
          body: { action: 'list' },
        });
        if (!error && !data?.error) {
          setIsAuthenticated(true);
          setOrders((data.orders || []) as Order[]);
          orderIdsRef.current = new Set(((data.orders || []) as Order[]).map((o: Order) => o.id));
        }
      }
      setCheckingSession(false);
    };
    checkSession();
  }, []);

  // Realtime subscription
  useEffect(() => {
    if (!isAuthenticated) return;

    const channel = supabase
      .channel('admin-orders-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
        const newOrder = payload.new as any;
        if (!orderIdsRef.current.has(newOrder.id)) {
          playChime();
          toast.info(`New order from ${newOrder.customer_name}!`);
          // Refetch to get complete order with items
          fetchOrders();
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, (payload) => {
        const updated = payload.new as any;
        setOrders(prev => prev.map(o => o.id === updated.id ? { ...o, ...updated } : o));
        setSelectedOrder(prev => prev && prev.id === updated.id ? { ...prev, ...updated } : prev);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [isAuthenticated, fetchOrders]);

  const handleLogin = () => {
    setIsAuthenticated(true);
    fetchOrders();
  };

  const handleStatusUpdated = (orderId: string, status: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    setSelectedOrder(prev => prev && prev.id === orderId ? { ...prev, status } : prev);
  };

  if (checkingSession) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><div className="text-muted-foreground">Loading...</div></div>;
  }

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader
        loading={loading}
        onRefresh={fetchOrders}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={() => setIsAuthenticated(false)}
      />

      <main className="container mx-auto px-6 py-8">
        {activeTab === 'orders' && <OrdersTab orders={orders} onSelectOrder={setSelectedOrder} />}
        {activeTab === 'products' && <ProductsTab />}
        {activeTab === 'customers' && <CustomersTab orders={orders} />}
      </main>

      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusUpdated={handleStatusUpdated}
        />
      )}
    </div>
  );
}
