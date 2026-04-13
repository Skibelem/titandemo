import { motion } from 'framer-motion';
import { Shield, Loader2, Eye, ArrowLeft, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface AdminHeaderProps {
  loading: boolean;
  onRefresh: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
}

const tabs = [
  { id: 'orders', label: 'Orders' },
  { id: 'products', label: 'Products' },
  { id: 'customers', label: 'Customers' },
];

export default function AdminHeader({ loading, onRefresh, activeTab, onTabChange, onLogout }: AdminHeaderProps) {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    onLogout();
  };

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="text-accent" size={24} />
          <h1 className="font-display text-xl text-secondary">Titans Admin</h1>
        </div>
        <div className="flex items-center gap-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-3 py-1.5 rounded-full font-display text-sm transition-colors ${
                activeTab === tab.id
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <motion.button onClick={onRefresh} disabled={loading} className="px-3 py-1.5 bg-accent/10 text-accent rounded-full font-display text-sm hover:bg-accent/20 transition-colors flex items-center gap-1.5" whileTap={{ scale: 0.95 }}>
            {loading ? <Loader2 className="animate-spin" size={14} /> : <Eye size={14} />}
            Refresh
          </motion.button>
          <button onClick={handleLogout} className="text-muted-foreground hover:text-destructive transition-colors" title="Logout">
            <LogOut size={18} />
          </button>
          <Link to="/" className="text-muted-foreground hover:text-accent transition-colors text-sm flex items-center gap-1">
            <ArrowLeft size={14} /> Store
          </Link>
        </div>
      </div>
    </header>
  );
}
