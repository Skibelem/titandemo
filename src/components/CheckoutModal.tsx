import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Coffee, MapPin, Clock, CreditCard, User, Phone, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useCart } from '@/contexts/CartContext';
import { useCreateOrder } from '@/hooks/useOrders';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CheckoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type CheckoutStep = 'details' | 'pickup' | 'payment' | 'success';

export default function CheckoutModal({ open, onOpenChange }: CheckoutModalProps) {
  const { items, totalPrice, clearCart } = useCart();
  const [step, setStep] = useState<CheckoutStep>('details');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    pickupTime: '15',
  });
  const [orderConfirmation, setOrderConfirmation] = useState<{ orderId: string } | null>(null);

  const createOrder = useCreateOrder();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    if (step === 'details') {
      if (!formData.name || !formData.phone) {
        toast.error('Please fill in all fields');
        return;
      }
      setStep('pickup');
    } else if (step === 'pickup') {
      setStep('payment');
    } else if (step === 'payment') {
      try {
        const tax = totalPrice * 0.08;
        const total = totalPrice + tax;
        
        const result = await createOrder.mutateAsync({
          customerName: formData.name,
          customerPhone: formData.phone,
          pickupTime: parseInt(formData.pickupTime),
          items,
          subtotal: totalPrice,
          tax,
          total,
        });
        
        setOrderConfirmation({ orderId: result.orderId });
        setStep('success');
        toast.success('Order placed successfully!');
      } catch (error) {
        console.error('Failed to create order:', error);
        toast.error('Failed to place order. Please try again.');
      }
    }
  };

  const handleClose = () => {
    if (step === 'success') {
      clearCart();
      setStep('details');
      setFormData({ name: '', phone: '', pickupTime: '15' });
      setOrderConfirmation(null);
    }
    onOpenChange(false);
  };

  const total = totalPrice * 1.08;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="glass-card border-accent/20 max-w-lg overflow-hidden">
        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {['details', 'pickup', 'payment', 'success'].map((s, i) => (
            <div key={s} className="flex items-center">
              <motion.div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-display ${
                  step === s || ['details', 'pickup', 'payment', 'success'].indexOf(step) > i
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
                animate={step === s ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                {['details', 'pickup', 'payment', 'success'].indexOf(step) > i ? (
                  <Check size={16} />
                ) : (
                  i + 1
                )}
              </motion.div>
              {i < 3 && (
                <div className={`w-8 h-0.5 ${
                  ['details', 'pickup', 'payment', 'success'].indexOf(step) > i
                    ? 'bg-accent'
                    : 'bg-muted'
                }`} />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 'details' && (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <DialogHeader>
                <DialogTitle className="font-display text-2xl text-secondary flex items-center gap-2">
                  <User className="text-accent" size={24} />
                  Your Details
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your name"
                    className="bg-muted/50 border-border focus:border-accent"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-foreground">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="(555) 123-4567"
                      className="bg-muted/50 border-border focus:border-accent pl-10"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'pickup' && (
            <motion.div
              key="pickup"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <DialogHeader>
                <DialogTitle className="font-display text-2xl text-secondary flex items-center gap-2">
                  <MapPin className="text-accent" size={24} />
                  Pickup Details
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                  <div className="flex items-start gap-3">
                    <MapPin className="text-accent mt-1" size={20} />
                    <div>
                      <h4 className="font-display text-secondary font-medium">Titans Coffee</h4>
                      <p className="text-muted-foreground text-sm">123 Desert Tech Blvd</p>
                      <p className="text-muted-foreground text-sm">San Francisco, CA 94105</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground flex items-center gap-2">
                    <Clock size={16} className="text-accent" />
                    Pickup Time
                  </Label>
                  <select
                    name="pickupTime"
                    value={formData.pickupTime}
                    onChange={handleInputChange}
                    className="w-full bg-muted/50 border border-border rounded-lg px-4 py-3 text-foreground focus:border-accent focus:outline-none"
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">1 hour</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'payment' && (
            <motion.div
              key="payment"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <DialogHeader>
                <DialogTitle className="font-display text-2xl text-secondary flex items-center gap-2">
                  <CreditCard className="text-accent" size={24} />
                  Payment
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-3">
                  <h4 className="font-display text-secondary font-medium">Order Summary</h4>
                  {items.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {item.quantity}x {item.name}
                      </span>
                      <span className="text-foreground">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                  <div className="border-t border-border pt-2 flex justify-between">
                    <span className="text-muted-foreground">Tax (8%)</span>
                    <span className="text-foreground">${(totalPrice * 0.08).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-display text-lg">
                    <span className="text-foreground">Total</span>
                    <span className="text-accent">${total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-accent/10 border border-accent/20 text-center">
                  <p className="text-muted-foreground text-sm mb-2">
                    Demo Mode - No real payment
                  </p>
                  <p className="text-accent font-display">Click "Place Order" to complete</p>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8 space-y-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                className="w-24 h-24 mx-auto rounded-full bg-accent/20 flex items-center justify-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.4 }}
                  className="w-16 h-16 rounded-full bg-accent flex items-center justify-center"
                >
                  <Check className="text-accent-foreground" size={32} />
                </motion.div>
              </motion.div>

              <div>
                <motion.h3
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="font-display text-3xl text-secondary mb-2"
                >
                  Order Confirmed!
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="text-muted-foreground"
                >
                  Your order will be ready in {formData.pickupTime} minutes
                </motion.p>
                {orderConfirmation && (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.65 }}
                    className="text-muted-foreground/60 text-sm mt-2"
                  >
                    Order #{orderConfirmation.orderId.slice(0, 8).toUpperCase()}
                  </motion.p>
                )}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="flex items-center justify-center gap-2 text-accent"
              >
                <Coffee size={20} />
                <span className="font-display">Thank you, {formData.name}!</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {step !== 'success' && (
          <motion.button
            className="w-full btn-electric mt-6 py-4 bg-accent text-accent-foreground font-display text-lg tracking-wider rounded-full flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={createOrder.isPending}
          >
            {createOrder.isPending ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Processing...
              </>
            ) : (
              <>
                {step === 'details' && 'Continue to Pickup'}
                {step === 'pickup' && 'Continue to Payment'}
                {step === 'payment' && 'Place Order'}
              </>
            )}
          </motion.button>
        )}
      </DialogContent>
    </Dialog>
  );
}
