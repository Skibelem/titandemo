import { useState, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Coffee, MapPin, Clock, CreditCard, User, Phone, Loader2, Mail, Truck, Store, Navigation } from 'lucide-react';
import { toast } from 'sonner';
import { useCart } from '@/contexts/CartContext';
import { useCreateOrder, useVerifyPayment } from '@/hooks/useOrders';
import { usePaystack } from '@/hooks/usePaystack';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const LocationPickerMap = lazy(() => import('@/components/LocationPickerMap'));
const ShopLocationMap = lazy(() => import('@/components/ShopLocationMap'));

interface CheckoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type CheckoutStep = 'details' | 'delivery' | 'review' | 'success';

export default function CheckoutModal({ open, onOpenChange }: CheckoutModalProps) {
  const { items, totalPrice, clearCart } = useCart();
  const [step, setStep] = useState<CheckoutStep>('details');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    deliveryType: 'pickup' as 'pickup' | 'delivery',
    deliveryAddress: '',
    deliveryLat: undefined as number | undefined,
    deliveryLng: undefined as number | undefined,
    pickupTime: '15',
  });
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [orderConfirmation, setOrderConfirmation] = useState<{ orderId: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const createOrder = useCreateOrder();
  const verifyPayment = useVerifyPayment();
  const { pay, isLoaded: paystackLoaded } = usePaystack();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const tax = totalPrice * 0.08;
  const total = totalPrice + tax;

  const handleSubmit = async () => {
    if (step === 'details') {
      if (!formData.name || !formData.phone || !formData.email) {
        toast.error('Please fill in all fields');
        return;
      }
      if (!/\S+@\S+\.\S+/.test(formData.email)) {
        toast.error('Please enter a valid email');
        return;
      }
      setStep('delivery');
    } else if (step === 'delivery') {
      if (formData.deliveryType === 'delivery' && !formData.deliveryAddress) {
        toast.error('Please enter a delivery address or pick a location on the map');
        return;
      }
      setStep('review');
    } else if (step === 'review') {
      setIsProcessing(true);
      try {
        const result = await createOrder.mutateAsync({
          customerName: formData.name,
          customerPhone: formData.phone,
          customerEmail: formData.email,
          deliveryType: formData.deliveryType,
          deliveryAddress: formData.deliveryAddress,
          deliveryLat: formData.deliveryLat,
          deliveryLng: formData.deliveryLng,
          pickupTime: parseInt(formData.pickupTime),
          items,
          subtotal: totalPrice,
          tax,
          total,
        });

        pay({
          email: formData.email,
          amount: Math.round(total * 100),
          onSuccess: async (reference) => {
            try {
              await verifyPayment.mutateAsync({
                reference,
                orderId: result.orderId,
              });
              setOrderConfirmation({ orderId: result.orderId });
              setStep('success');
              toast.success('Payment successful! Order confirmed.');
            } catch {
              toast.error('Payment verification failed. Contact support.');
            } finally {
              setIsProcessing(false);
            }
          },
          onClose: () => {
            setIsProcessing(false);
            toast.info('Payment cancelled. Your order is saved and can be paid later.');
          },
        });
      } catch (error) {
        console.error('Failed to create order:', error);
        toast.error('Failed to place order. Please try again.');
        setIsProcessing(false);
      }
    }
  };

  const handleClose = () => {
    if (step === 'success') {
      clearCart();
      setStep('details');
      setFormData({ name: '', phone: '', email: '', deliveryType: 'pickup', deliveryAddress: '', deliveryLat: undefined, deliveryLng: undefined, pickupTime: '15' });
      setOrderConfirmation(null);
      setShowMapPicker(false);
    }
    onOpenChange(false);
  };

  const handleLocationSelect = (lat: number, lng: number, address: string) => {
    setFormData(prev => ({
      ...prev,
      deliveryLat: lat,
      deliveryLng: lng,
      deliveryAddress: address,
    }));
  };

  const steps = ['details', 'delivery', 'review', 'success'] as const;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="glass-card border-accent/20 max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center">
              <motion.div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-display ${
                  step === s || steps.indexOf(step) > i
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
                animate={step === s ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                {steps.indexOf(step) > i ? <Check size={16} /> : i + 1}
              </motion.div>
              {i < 3 && (
                <div className={`w-8 h-0.5 ${
                  steps.indexOf(step) > i ? 'bg-accent' : 'bg-muted'
                }`} />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 'details' && (
            <motion.div key="details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <DialogHeader>
                <DialogTitle className="font-display text-2xl text-secondary flex items-center gap-2">
                  <User className="text-accent" size={24} />
                  Your Details
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground">Full Name</Label>
                  <Input id="name" name="name" value={formData.name} onChange={handleInputChange} placeholder="Enter your full name" className="bg-muted/50 border-border focus:border-accent" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="your@email.com" className="bg-muted/50 border-border focus:border-accent pl-10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-foreground">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <Input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+234 xxx xxx xxxx" className="bg-muted/50 border-border focus:border-accent pl-10" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'delivery' && (
            <motion.div key="delivery" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <DialogHeader>
                <DialogTitle className="font-display text-2xl text-secondary flex items-center gap-2">
                  <MapPin className="text-accent" size={24} />
                  Delivery or Pickup
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => { setFormData(prev => ({ ...prev, deliveryType: 'pickup' })); setShowMapPicker(false); }}
                    className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${
                      formData.deliveryType === 'pickup'
                        ? 'border-accent bg-accent/10 text-accent'
                        : 'border-border bg-muted/30 text-muted-foreground hover:border-accent/50'
                    }`}
                  >
                    <Store size={24} />
                    <span className="font-display text-sm">Pickup</span>
                  </button>
                  <button
                    onClick={() => setFormData(prev => ({ ...prev, deliveryType: 'delivery' }))}
                    className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${
                      formData.deliveryType === 'delivery'
                        ? 'border-accent bg-accent/10 text-accent'
                        : 'border-border bg-muted/30 text-muted-foreground hover:border-accent/50'
                    }`}
                  >
                    <Truck size={24} />
                    <span className="font-display text-sm">Delivery</span>
                  </button>
                </div>

                {formData.deliveryType === 'pickup' && (
                  <div className="space-y-3">
                    <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                      <div className="flex items-start gap-3">
                        <MapPin className="text-accent mt-1" size={20} />
                        <div>
                          <h4 className="font-display text-secondary font-medium">Titans Coffee</h4>
                          <p className="text-muted-foreground text-sm">123 Desert Tech Blvd</p>
                          <p className="text-muted-foreground text-sm">Lagos, Nigeria</p>
                        </div>
                      </div>
                    </div>

                    <Suspense fallback={<div className="h-[160px] rounded-xl bg-muted/30 border border-border animate-pulse flex items-center justify-center text-muted-foreground text-sm">Loading map...</div>}>
                      <ShopLocationMap />
                    </Suspense>

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
                )}

                {formData.deliveryType === 'delivery' && (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="deliveryAddress" className="text-foreground">Delivery Address</Label>
                      <Input
                        id="deliveryAddress"
                        name="deliveryAddress"
                        value={formData.deliveryAddress}
                        onChange={handleInputChange}
                        placeholder="Enter your full delivery address"
                        className="bg-muted/50 border-border focus:border-accent"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-px bg-border" />
                      <span className="text-xs text-muted-foreground">or</span>
                      <div className="flex-1 h-px bg-border" />
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowMapPicker(!showMapPicker)}
                      className="w-full py-3 rounded-xl border border-border bg-muted/30 text-foreground font-display text-sm hover:border-accent/50 transition-colors flex items-center justify-center gap-2"
                    >
                      <Navigation size={16} className="text-accent" />
                      {showMapPicker ? 'Hide Map' : 'Pick Location on Map'}
                    </button>

                    {showMapPicker && (
                      <Suspense fallback={<div className="h-[200px] rounded-xl bg-muted/30 border border-border animate-pulse flex items-center justify-center text-muted-foreground text-sm">Loading map...</div>}>
                        <LocationPickerMap
                          onLocationSelect={handleLocationSelect}
                          selectedLat={formData.deliveryLat}
                          selectedLng={formData.deliveryLng}
                        />
                      </Suspense>
                    )}

                    {formData.deliveryLat && formData.deliveryLng && (
                      <p className="text-xs text-accent flex items-center gap-1">
                        <Check size={12} />
                        Location pinned on map
                      </p>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {step === 'review' && (
            <motion.div key="review" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <DialogHeader>
                <DialogTitle className="font-display text-2xl text-secondary flex items-center gap-2">
                  <CreditCard className="text-accent" size={24} />
                  Review & Pay
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-3">
                  <h4 className="font-display text-secondary font-medium">Order Summary</h4>
                  {items.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{item.quantity}x {item.name}</span>
                      <span className="text-foreground">₦{(item.price * item.quantity).toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
                    </div>
                  ))}
                  <div className="border-t border-border pt-2 flex justify-between">
                    <span className="text-muted-foreground">Tax (8%)</span>
                    <span className="text-foreground">₦{tax.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between font-display text-lg">
                    <span className="text-foreground">Total</span>
                    <span className="text-accent">₦{total.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name</span>
                    <span className="text-foreground">{formData.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email</span>
                    <span className="text-foreground">{formData.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phone</span>
                    <span className="text-foreground">{formData.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type</span>
                    <span className="text-foreground capitalize flex items-center gap-1">
                      {formData.deliveryType === 'pickup' ? <Store size={14} /> : <Truck size={14} />}
                      {formData.deliveryType}
                    </span>
                  </div>
                  {formData.deliveryType === 'delivery' && formData.deliveryAddress && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Address</span>
                      <span className="text-foreground text-right max-w-[60%]">{formData.deliveryAddress}</span>
                    </div>
                  )}
                  {formData.deliveryType === 'pickup' && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Pickup in</span>
                      <span className="text-foreground">{formData.pickupTime} min</span>
                    </div>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-accent/10 border border-accent/20 text-center">
                  <p className="text-accent font-display text-sm">You'll be redirected to Paystack to complete payment</p>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8 space-y-6">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, delay: 0.2 }} className="w-24 h-24 mx-auto rounded-full bg-accent/20 flex items-center justify-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, delay: 0.4 }} className="w-16 h-16 rounded-full bg-accent flex items-center justify-center">
                  <Check className="text-accent-foreground" size={32} />
                </motion.div>
              </motion.div>
              <div>
                <motion.h3 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="font-display text-3xl text-secondary mb-2">
                  Order Confirmed!
                </motion.h3>
                <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="text-muted-foreground">
                  Payment received. {formData.deliveryType === 'pickup' ? `Your order will be ready in ${formData.pickupTime} minutes.` : 'Your order is being prepared for delivery.'}
                </motion.p>
                {orderConfirmation && (
                  <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }} className="text-muted-foreground/60 text-sm mt-2">
                    Order #{orderConfirmation.orderId.slice(0, 8).toUpperCase()}
                  </motion.p>
                )}
              </div>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="flex items-center justify-center gap-2 text-accent">
                <Coffee size={20} />
                <span className="font-display">Thank you, {formData.name}!</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {step !== 'success' && (
          <div className="flex gap-3 mt-6">
            {step !== 'details' && (
              <motion.button
                className="flex-1 py-4 border border-border text-foreground font-display text-sm tracking-wider rounded-full hover:border-accent transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (step === 'delivery') setStep('details');
                  if (step === 'review') setStep('delivery');
                }}
              >
                Back
              </motion.button>
            )}
            <motion.button
              className="flex-1 py-4 btn-electric bg-accent text-accent-foreground font-display text-sm tracking-wider rounded-full flex items-center justify-center gap-2 disabled:opacity-50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <><Loader2 className="animate-spin" size={18} /> Processing...</>
              ) : step === 'review' ? (
                'Pay Now'
              ) : (
                'Continue'
              )}
            </motion.button>
          </div>
        )}

        {step === 'success' && (
          <motion.button
            className="w-full py-4 btn-electric bg-accent text-accent-foreground font-display text-sm tracking-wider rounded-full mt-4"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleClose}
          >
            Done
          </motion.button>
        )}
      </DialogContent>
    </Dialog>
  );
}
