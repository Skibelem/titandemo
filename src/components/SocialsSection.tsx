import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

interface SocialLink {
  name: string;
  icon: React.ReactNode;
  url: string;
  color: string;
  followers?: string;
}

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
  </svg>
);

const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const ThreadsIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.96-.065-1.182.408-2.256 1.332-3.023.855-.709 2.018-1.121 3.466-1.225.946-.068 1.911-.036 2.871.085-.097-.56-.322-1-.685-1.32-.47-.415-1.178-.626-2.104-.626h-.062c-.748.006-1.713.166-2.274.909l-1.63-1.18c.895-1.186 2.287-1.818 4.03-1.831h.094c1.5.013 2.723.456 3.636 1.318.903.852 1.398 2.063 1.473 3.6.506.078.987.182 1.439.313 1.418.41 2.526 1.136 3.298 2.158.9 1.191 1.322 2.77 1.254 4.696-.078 2.154-.96 4.063-2.55 5.52C17.96 23.053 15.478 23.975 12.186 24zm-.09-9.873c-.882.063-1.574.298-2.003.681-.373.333-.535.704-.51 1.137.032.567.32.978.857 1.223.611.28 1.39.338 2.106.298 1.053-.058 1.86-.454 2.4-1.18.399-.536.648-1.252.741-2.13-.61-.087-1.223-.13-1.829-.13-.59 0-1.179.034-1.762.101z"/>
  </svg>
);

const socialLinks: SocialLink[] = [
  { name: 'TikTok', icon: <TikTokIcon />, url: '#', color: 'hover:text-pink-500', followers: '50K' },
  { name: 'Instagram', icon: <InstagramIcon />, url: '#', color: 'hover:text-purple-500', followers: '75K' },
  { name: 'X', icon: <XIcon />, url: '#', color: 'hover:text-foreground', followers: '25K' },
  { name: 'Facebook', icon: <FacebookIcon />, url: '#', color: 'hover:text-blue-500', followers: '30K' },
  { name: 'LinkedIn', icon: <LinkedInIcon />, url: '#', color: 'hover:text-blue-400', followers: '10K' },
  { name: 'Threads', icon: <ThreadsIcon />, url: '#', color: 'hover:text-foreground', followers: '15K' },
];

const feedItems = [
  {
    id: 1,
    type: 'image',
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=400&fit=crop',
    likes: '2.4K',
    platform: 'instagram',
  },
  {
    id: 2,
    type: 'video',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=500&fit=crop',
    likes: '15K',
    platform: 'tiktok',
  },
  {
    id: 3,
    type: 'image',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&h=400&fit=crop',
    likes: '1.8K',
    platform: 'instagram',
  },
  {
    id: 4,
    type: 'image',
    image: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=400&h=300&fit=crop',
    likes: '3.2K',
    platform: 'instagram',
  },
  {
    id: 5,
    type: 'video',
    image: 'https://images.unsplash.com/photo-1559496417-e7f25cb247f3?w=400&h=500&fit=crop',
    likes: '22K',
    platform: 'tiktok',
  },
  {
    id: 6,
    type: 'image',
    image: 'https://images.unsplash.com/photo-1512568400610-62da28bc8a13?w=400&h=400&fit=crop',
    likes: '4.1K',
    platform: 'instagram',
  },
];

function MagneticButton({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const buttonRef = useRef<HTMLAnchorElement>(null);

  const handleMouse = (e: React.MouseEvent) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setPosition({ x: x * 0.3, y: y * 0.3 });
  };

  const resetPosition = () => setPosition({ x: 0, y: 0 });

  return (
    <motion.a
      ref={buttonRef}
      href="#"
      onMouseMove={handleMouse}
      onMouseLeave={resetPosition}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 150, damping: 15 }}
      className={className}
    >
      {children}
    </motion.a>
  );
}

export default function SocialsSection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  return (
    <section
      id="socials"
      ref={sectionRef}
      className="py-32 bg-titans-dark relative overflow-hidden"
    >
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-accent/5 blur-3xl" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-5xl md:text-6xl font-bold tracking-tight mb-6">
            <span className="text-foreground">Join the </span>
            <span className="text-gold-gradient">Community</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Follow our journey and become part of the Titans movement.
          </p>
        </motion.div>

        {/* Bento Grid Feed */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-16"
        >
          {feedItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              className={`relative group rounded-2xl overflow-hidden cursor-pointer ${
                index === 1 || index === 4 ? 'row-span-2' : ''
              }`}
            >
              <img
                src={item.image}
                alt={`Social post ${item.id}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <div className="flex items-center gap-2 text-secondary">
                  <span className="text-sm font-display">{item.likes}</span>
                  <span className="text-xs text-muted-foreground">likes</span>
                </div>
              </div>

              {/* Platform indicator */}
              <div className="absolute top-3 right-3 p-2 glass-card rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                {item.platform === 'tiktok' ? <TikTokIcon /> : <InstagramIcon />}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Social Links */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-wrap justify-center gap-6"
        >
          {socialLinks.map((social) => (
            <MagneticButton
              key={social.name}
              className={`glass-card p-4 flex flex-col items-center gap-2 min-w-[100px] text-foreground/70 ${social.color} transition-colors`}
            >
              {social.icon}
              <span className="font-display text-xs tracking-wider">{social.name}</span>
              {social.followers && (
                <span className="text-xs text-muted-foreground">{social.followers}</span>
              )}
            </MagneticButton>
          ))}
        </motion.div>
      </div>
    </section>
  );
}