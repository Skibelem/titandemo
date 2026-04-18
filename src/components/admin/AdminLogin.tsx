import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Loader2, LogIn, ArrowLeft, UserPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

interface AdminLoginProps {
  onLogin: () => void;
}

type Mode = 'signin' | 'signup';

export default function AdminLogin({ onLogin }: AdminLoginProps) {
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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

  const handleSignup = async () => {
    if (!email || !password || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-admin-user', {
        body: { email, password },
      });
      if (error || data?.error) {
        const msg = data?.error || error?.message || 'Failed to create account';
        if (msg.includes('admin_users')) {
          toast.error('This email is not authorized as an admin');
        } else {
          toast.error(msg);
        }
        return;
      }
      toast.success(data?.action === 'updated' ? 'Password updated! Please sign in.' : 'Account created! Please sign in.');
      setMode('signin');
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const isSignup = mode === 'signup';

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

        <div className="flex gap-2 p-1 bg-muted/30 rounded-full">
          <button
            onClick={() => setMode('signin')}
            className={`flex-1 py-2 rounded-full text-sm font-medium transition-colors ${!isSignup ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Sign In
          </button>
          <button
            onClick={() => setMode('signup')}
            className={`flex-1 py-2 rounded-full text-sm font-medium transition-colors ${isSignup ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Create Account
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-foreground">Admin Email</Label>
            <Input
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@titanscoffee.com"
              className="bg-muted/50 border-border"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-foreground">Password</Label>
            <Input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={isSignup ? 'At least 8 characters' : 'Enter password'}
              className="bg-muted/50 border-border"
              onKeyDown={e => e.key === 'Enter' && !isSignup && handleLogin()}
            />
          </div>
          {isSignup && (
            <div className="space-y-2">
              <Label className="text-foreground">Confirm Password</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="bg-muted/50 border-border"
                onKeyDown={e => e.key === 'Enter' && handleSignup()}
              />
            </div>
          )}
          <motion.button
            className="w-full btn-electric py-4 bg-accent text-accent-foreground font-display tracking-wider rounded-full flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={isSignup ? handleSignup : handleLogin}
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : isSignup ? <UserPlus size={20} /> : <LogIn size={20} />}
            {loading ? (isSignup ? 'Creating...' : 'Authenticating...') : isSignup ? 'Create Account' : 'Access Dashboard'}
          </motion.button>
          {isSignup && (
            <p className="text-xs text-muted-foreground text-center">
              Only emails pre-authorized in the admin list can create an account.
            </p>
          )}
        </div>

        <Link to="/" className="flex items-center justify-center gap-2 text-muted-foreground hover:text-accent transition-colors text-sm">
          <ArrowLeft size={16} /> Back to Store
        </Link>
      </motion.div>
    </div>
  );
}
