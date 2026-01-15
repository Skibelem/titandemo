import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

export default function CartButton() {
  const { totalItems, setIsCartOpen } = useCart();

  return (
    <motion.button
      className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-accent text-accent-foreground shadow-2xl flex items-center justify-center"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setIsCartOpen(true)}
      style={{
        boxShadow: '0 0 30px hsl(34 38% 64% / 0.4), 0 10px 40px hsl(0 0% 0% / 0.3)',
      }}
    >
      <ShoppingBag size={24} />
      <AnimatePresence>
        {totalItems > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-secondary text-secondary-foreground text-xs font-display font-bold flex items-center justify-center"
          >
            {totalItems}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
