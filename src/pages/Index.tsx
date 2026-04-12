import { useEffect } from 'react';
import Navigation from '@/components/Navigation';
import HeroSection from '@/components/HeroSection';
import MenuSection from '@/components/MenuSection';
import SocialsSection from '@/components/SocialsSection';
import Footer from '@/components/Footer';
import CartButton from '@/components/CartButton';
import CartSidebar from '@/components/CartSidebar';

const Index = () => {
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  return (
    <main className="min-h-screen bg-background overflow-x-hidden">
      <Navigation />
      <HeroSection />
      <MenuSection />
      <SocialsSection />
      <Footer />
      <CartButton />
      <CartSidebar />
    </main>
  );
};

export default Index;