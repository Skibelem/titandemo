import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

export default function Footer() {
  return (
    <footer id="footer" className="py-20 bg-background border-t border-border/50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-accent/5 blur-3xl -translate-x-1/2 translate-y-1/2" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <h3 className="font-display text-3xl font-bold tracking-wider text-secondary">
              TITANS<span className="text-accent">.</span>
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Engineered for those who demand more. Premium coffee experiences 
              crafted for the modern pioneer.
            </p>
            <div className="flex items-center gap-2 text-accent">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-xs font-display tracking-wider">POWERED BY FUTURE</span>
            </div>
          </motion.div>

          {/* Location Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-6"
          >
            <h4 className="font-display text-lg font-semibold tracking-wider text-secondary">
              Find Us
            </h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3 text-muted-foreground">
                <MapPin size={18} className="text-accent mt-1 flex-shrink-0" />
                <span className="text-sm">
                  123 Future Avenue<br />
                  Innovation District<br />
                  New Metro City, NM 12345
                </span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Phone size={18} className="text-accent flex-shrink-0" />
                <span className="text-sm">(555) TITAN-01</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Mail size={18} className="text-accent flex-shrink-0" />
                <span className="text-sm">hello@titanscoffee.com</span>
              </div>
            </div>
          </motion.div>

          {/* Hours Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            <h4 className="font-display text-lg font-semibold tracking-wider text-secondary">
              Hours
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Clock size={18} className="text-accent flex-shrink-0" />
                <div className="text-sm">
                  <p>Monday - Friday</p>
                  <p className="text-secondary">6:00 AM - 10:00 PM</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="w-[18px]" />
                <div className="text-sm">
                  <p>Saturday - Sunday</p>
                  <p className="text-secondary">7:00 AM - 11:00 PM</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Newsletter Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="space-y-6"
          >
            <h4 className="font-display text-lg font-semibold tracking-wider text-secondary">
              Stay Updated
            </h4>
            <p className="text-muted-foreground text-sm">
              Get exclusive offers and be the first to know about new blends.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-4 py-3 rounded-full bg-muted border border-border text-sm focus:outline-none focus:border-accent transition-colors"
              />
              <motion.button
                className="btn-electric px-6 py-3 bg-accent text-accent-foreground font-display text-sm tracking-wider rounded-full"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                Join
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <p className="text-muted-foreground text-xs">
            © 2024 Titans Coffee. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-muted-foreground hover:text-accent text-xs transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-muted-foreground hover:text-accent text-xs transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-muted-foreground hover:text-accent text-xs transition-colors">
              Careers
            </a>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}