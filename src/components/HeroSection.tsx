import { useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import FloatingCoffeeBean from './FloatingCoffeeBean';

const titleChars = "TITAN COFFEE".split('');

export default function HeroSection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true });

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const charVariants = {
    hidden: { opacity: 0, y: 50, rotateX: -90 },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden hero-gradient"
    >
      {/* 3D Coffee Bean */}
      <FloatingCoffeeBean />

      {/* Content Overlay */}
      <div className="relative z-10 container mx-auto px-6 text-center">
        {/* Main Title with Text Reveal */}
        <motion.h1
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="font-display text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-tight mb-8"
        >
          {titleChars.map((char, i) => (
            <motion.span
              key={i}
              variants={charVariants}
              className={`inline-block ${char === ' ' ? 'w-4 md:w-8' : ''} ${
                char === 'T' && i === 0 ? 'text-accent' : 'text-secondary'
              }`}
              style={{ perspective: '1000px' }}
            >
              {char === ' ' ? '\u00A0' : char}
            </motion.span>
          ))}
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="font-sans text-lg md:text-xl text-foreground/70 max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          Engineered for those who demand more. A fusion of precision roasting 
          and uncompromising quality—fuel for the future's pioneers.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 1, duration: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <motion.a
            href="#menu"
            className="btn-electric px-10 py-4 bg-accent text-accent-foreground font-display text-sm tracking-widest rounded-full"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            EXPLORE MENU
          </motion.a>
          <motion.a
            href="#socials"
            className="px-10 py-4 border border-foreground/20 text-foreground font-display text-sm tracking-widest rounded-full hover:border-accent hover:text-accent transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            JOIN THE MOVEMENT
          </motion.a>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 rounded-full border-2 border-foreground/30 flex justify-center pt-2"
          >
            <motion.div className="w-1 h-2 bg-accent rounded-full" />
          </motion.div>
        </motion.div>
      </div>

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-background/50 pointer-events-none" />
    </section>
  );
}