import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Loader2, LogIn, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

interface AdminLoginProps {
  onLogin: () => void;
}

export default function AdminLogin({ onLogin }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      // Verify admin status via edge function
      const { data, error: fnError } = await supabase.functions.invoke('admin-orders', {
        body: { action: 'list' },
      });
      if (fnError || data?.error) {
        await supabase.auth.signOut();
        toast.error('Not authorized as admin');
        return;
      }
      toast.success('Welcome, Admin!');
      onLogin();
    } catch (err: any) {
      toast.error(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

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
            <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" className="bg-muted/50 border-border" onKeyDown={e => e.key === 'Enter' && handleLogin()} />
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
