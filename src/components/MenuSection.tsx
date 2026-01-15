import { useState, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Clock, Flame, Snowflake, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { useCart } from '@/contexts/CartContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  intensity?: number;
  temperature?: 'hot' | 'cold';
}

const menuItems: MenuItem[] = [
  {
    id: '1',
    name: 'Titan Espresso',
    description: 'Our signature double-shot, rich with notes of dark chocolate and toasted caramel. The foundation of strength.',
    price: 4.50,
    category: 'espresso',
    image: 'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=400&h=400&fit=crop',
    intensity: 5,
    temperature: 'hot',
  },
  {
    id: '2',
    name: 'Nebula Americano',
    description: 'Espresso expanded with pristine water, creating a cosmic depth of flavor.',
    price: 4.00,
    category: 'espresso',
    image: 'https://images.unsplash.com/photo-1497515114583-e747f31a4ddf?w=400&h=400&fit=crop',
    intensity: 3,
    temperature: 'hot',
  },
  {
    id: '3',
    name: 'Quantum Latte',
    description: 'Silky steamed milk meets bold espresso in a state of perfect balance.',
    price: 5.50,
    category: 'espresso',
    image: 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=400&h=400&fit=crop',
    intensity: 2,
    temperature: 'hot',
  },
  {
    id: '4',
    name: 'Arctic Cold Brew',
    description: '24-hour steeped perfection. Smooth, potent, and undeniably refreshing.',
    price: 5.00,
    category: 'cold',
    image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=400&fit=crop',
    intensity: 4,
    temperature: 'cold',
  },
  {
    id: '5',
    name: 'Nitro Surge',
    description: 'Cold brew infused with nitrogen for a creamy, cascade pour experience.',
    price: 6.00,
    category: 'cold',
    image: 'https://images.unsplash.com/photo-1592663527359-cf6642f54cff?w=400&h=400&fit=crop',
    intensity: 4,
    temperature: 'cold',
  },
  {
    id: '6',
    name: 'Iced Caramel Titan',
    description: 'Bold espresso, creamy milk, and our house-made caramel over ice.',
    price: 6.50,
    category: 'cold',
    image: 'https://images.unsplash.com/photo-1553909489-cd47e0907980?w=400&h=400&fit=crop',
    intensity: 3,
    temperature: 'cold',
  },
  {
    id: '7',
    name: 'Prometheus Blend',
    description: 'Our limited reserve blend. Complex, fruity, with a finish that ignites the senses.',
    price: 7.50,
    category: 'signature',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop',
    intensity: 5,
    temperature: 'hot',
  },
  {
    id: '8',
    name: 'Atlas Mocha',
    description: 'The weight of the world in chocolate and espresso, crowned with whipped cream.',
    price: 6.50,
    category: 'signature',
    image: 'https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?w=400&h=400&fit=crop',
    intensity: 3,
    temperature: 'hot',
  },
  {
    id: '9',
    name: 'Hyperion Freeze',
    description: 'A frozen blended creation with espresso, vanilla, and a golden drizzle.',
    price: 7.00,
    category: 'signature',
    image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=400&fit=crop',
    intensity: 2,
    temperature: 'cold',
  },
];

const categories = [
  { id: 'espresso', name: 'Espresso', icon: Flame },
  { id: 'cold', name: 'Cold Brew', icon: Snowflake },
  { id: 'signature', name: 'Signature Titans', icon: Clock },
];

export default function MenuSection() {
  const [activeCategory, setActiveCategory] = useState('espresso');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });
  const { addItem } = useCart();

  const filteredItems = menuItems.filter(item => item.category === activeCategory);

  return (
    <section
      id="menu"
      ref={sectionRef}
      className="py-32 bg-background relative overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-accent/5 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-secondary/5 blur-3xl" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-5xl md:text-6xl font-bold tracking-tight mb-6">
            <span className="text-foreground">The </span>
            <span className="text-gold-gradient">Menu</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Each creation is a testament to precision, crafted for those who refuse to settle.
          </p>
        </motion.div>

        {/* Category Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-center gap-4 mb-16 flex-wrap"
        >
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <motion.button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-display text-sm tracking-wider transition-all ${
                  activeCategory === category.id
                    ? 'bg-accent text-accent-foreground'
                    : 'glass-card text-foreground/70 hover:text-foreground'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon size={18} />
                {category.name}
              </motion.button>
            );
          })}
        </motion.div>

        {/* Menu Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="wait">
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                onClick={() => setSelectedItem(item)}
                className="glass-card p-6 cursor-pointer group hover:border-accent/30 transition-all"
              >
                {/* Image */}
                <div className="relative aspect-square rounded-xl overflow-hidden mb-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  {/* Temperature Badge */}
                  <div className="absolute top-3 right-3">
                    <div className={`p-2 rounded-full ${
                      item.temperature === 'hot' ? 'bg-orange-500/80' : 'bg-blue-500/80'
                    }`}>
                      {item.temperature === 'hot' ? <Flame size={14} /> : <Snowflake size={14} />}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-xl font-semibold text-secondary">
                      {item.name}
                    </h3>
                    <span className="font-display text-accent text-lg">
                      ${item.price.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm line-clamp-2">
                    {item.description}
                  </p>
                  
                  {/* Intensity Indicator */}
                  {item.intensity && (
                    <div className="flex items-center gap-2 pt-2">
                      <span className="text-xs text-muted-foreground">Intensity</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <div
                            key={level}
                            className={`w-2 h-2 rounded-full ${
                              level <= item.intensity!
                                ? 'bg-accent'
                                : 'bg-muted'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Order Modal */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="glass-card border-accent/20 max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl text-secondary">
              {selectedItem?.name}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {selectedItem?.description}
            </DialogDescription>
          </DialogHeader>
          
          {selectedItem && (
            <div className="space-y-6">
              <img
                src={selectedItem.image}
                alt={selectedItem.name}
                className="w-full aspect-video object-cover rounded-xl"
              />
              
              <div className="flex items-center justify-between">
                <span className="font-display text-2xl text-accent">
                  ${selectedItem.price.toFixed(2)}
                </span>
                
                <motion.button
                  className="btn-electric px-8 py-3 bg-accent text-accent-foreground font-display text-sm tracking-wider rounded-full flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    addItem({
                      id: selectedItem.id,
                      name: selectedItem.name,
                      price: selectedItem.price,
                      image: selectedItem.image,
                    });
                    toast.success("Added to Cart", {
                      description: `${selectedItem.name} - $${selectedItem.price.toFixed(2)}`,
                    });
                    setSelectedItem(null);
                  }}
                >
                  <ShoppingCart size={18} />
                  Add to Cart
                </motion.button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}