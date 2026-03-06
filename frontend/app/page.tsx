'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ListingCard } from '@/components/ListingCard';
import { api } from '@/lib/api';
import type { Listing, Category } from '@/lib/types';
import {
  LaptopIcon, FurnitureIcon, CarIcon, FashionIcon,
  SportIcon, HomeIcon, BookIcon, GardenIcon, KidsIcon, ServicesIcon
} from '@/components/AnimatedCategoryIcons';

const CATEGORY_ANIMATIONS: Record<string, React.ElementType> = {
  electronics: LaptopIcon,
  furniture: FurnitureIcon,
  vehicles: CarIcon,
  fashion: FashionIcon,
  sports: SportIcon,
  home: HomeIcon,
  books: BookIcon,
  garden: GardenIcon,
  kids: KidsIcon,
  services: ServicesIcon,
};

export default function HomePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = () => {
    const q = searchQuery.trim();
    if (q) {
      router.push(`/listings?search=${encodeURIComponent(q)}`);
    } else {
      router.push('/listings');
    }
  };
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [listingsRes, catsRes] = await Promise.all([
          api.getListings({ page_size: 8, sort_by: 'popular' }),
          api.getCategories(),
        ]);
        setListings(listingsRes.items);
        setCategories(catsRes);
      } catch {
        // Handle error gracefully
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen">
      {/* ═══ Hero ═══ */}
      <section className="hero-gradient relative pt-16 pb-24 px-4 overflow-hidden">
        {/* Floating orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#6c5ce7]/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#00d2a0]/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />

        <div className="max-w-7xl mx-auto text-center relative">

          <div className="relative inline-block mb-6">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 2, 1.2], opacity: [0, 1, 0] }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="absolute inset-0 bg-[#6c5ce7] blur-[80px] rounded-full z-0"
            />
            <h1 className="text-5xl sm:text-7xl font-extrabold leading-tight relative z-10 flex flex-col items-center">
              <span className="flex overflow-hidden">
                {['B', 'u', 'y'].map((char, i) => (
                  <motion.span
                    key={i}
                    initial={{ y: -100, opacity: 0, filter: 'blur(10px)' }}
                    animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                    transition={{ type: 'spring', delay: i * 0.1, bounce: 0.6 }}
                    className="gradient-text inline-block"
                  >
                    {char}
                  </motion.span>
                ))}
                <span className="mx-2">&nbsp;</span>
                <motion.span
                  initial={{ scale: 0, opacity: 0, rotate: -180 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  transition={{ delay: 0.4, type: 'spring', bounce: 0.5 }}
                  className="gradient-text inline-block"
                >
                  &
                </motion.span>
                <span className="mx-2">&nbsp;</span>
                {['S', 'e', 'l', 'l'].map((char, i) => (
                  <motion.span
                    key={i}
                    initial={{ y: -100, opacity: 0, filter: 'blur(10px)' }}
                    animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                    transition={{ type: 'spring', delay: 0.5 + i * 0.1, bounce: 0.6 }}
                    className="gradient-text inline-block"
                  >
                    {char}
                  </motion.span>
                ))}
              </span>
              <motion.span
                initial={{ opacity: 0, y: 20, clipPath: 'inset(0 50% 0 50%)' }}
                animate={{ opacity: 1, y: 0, clipPath: 'inset(0 0% 0 0%)' }}
                transition={{ delay: 1.2, duration: 0.8, ease: 'circOut' }}
                className="text-white mt-2 inline-block"
              >
                Like Never Before
              </motion.span>
            </h1>
          </div>

          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8, duration: 1 }}
            className="text-lg sm:text-xl text-[#9898b0] max-w-2xl mx-auto mb-10"
          >
            Sweden&apos;s most trusted marketplace. Verified sellers, built-in payments, and a premium experience that puts your safety first.
          </motion.p>

          {/* Search bar */}
          <div className="max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center glass-card !rounded-2xl p-2 hover:!transform-none">
              <div className="pl-4 pr-3 text-[#6a6a82]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="Search for anything..."
                className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-[#6a6a82] text-base py-3"
              />
              <button onClick={handleSearch} className="btn-primary !rounded-xl !py-3 !px-6">
                Search
              </button>
            </div>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-12 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            {[
              { icon: '🛡️', text: 'Verified Sellers' },
              { icon: '💳', text: 'Secure Payments' },
              { icon: '📦', text: 'Shipping Protection' },
              { icon: '⚡', text: 'Instant Chat' },
            ].map((badge) => (
              <div key={badge.text} className="flex items-center gap-2 text-sm text-[#9898b0]">
                <span className="text-lg">{badge.icon}</span>
                <span>{badge.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Categories ═══ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.1 }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
                delayChildren: 0.1,
              }
            }
          }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-5"
        >
          {(categories.length > 0 ? categories.slice(0, 10) : [
            { name: 'Electronics', slug: 'electronics', icon: 'laptop' },
            { name: 'Furniture', slug: 'furniture', icon: 'sofa' },
            { name: 'Vehicles', slug: 'vehicles', icon: 'car' },
            { name: 'Fashion', slug: 'fashion', icon: 'shirt' },
            { name: 'Sports', slug: 'sports', icon: 'dumbbell' },
            { name: 'Home', slug: 'home', icon: 'home' },
            { name: 'Books', slug: 'books', icon: 'book-open' },
            { name: 'Garden', slug: 'garden', icon: 'flower-2' },
            { name: 'Kids', slug: 'kids', icon: 'baby' },
            { name: 'Services', slug: 'services', icon: 'wrench' },
          ]).map((cat) => (
            <motion.div
              key={cat.slug}
              onMouseEnter={() => setHoveredCategory(cat.slug)}
              onMouseLeave={() => setHoveredCategory(null)}
              onTouchStart={() => setHoveredCategory(cat.slug)}
              onTouchEnd={() => setTimeout(() => setHoveredCategory(null), 600)}
              onFocus={() => setHoveredCategory(cat.slug)}
              onBlur={() => setHoveredCategory(null)}
              variants={{
                hidden: { opacity: 0, y: 40, scale: 0.8, rotateX: 45, filter: 'blur(10px)' },
                visible: {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  rotateX: 0,
                  filter: 'blur(0px)',
                  transition: { type: 'spring', stiffness: 100, damping: 10, mass: 1 }
                }
              }}
              whileHover={{
                scale: 1.08,
                y: -8,
                rotateZ: Math.random() > 0.5 ? 2 : -2,
                transition: { type: 'spring', stiffness: 300, damping: 15 }
              }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href={`/listings?category=${cat.slug}`}
                className="relative block glass-card !rounded-2xl p-6 flex flex-col items-center justify-center group overflow-hidden h-full border border-white/10 hover:border-transparent transition-all duration-300"
              >
                {/* Futuristic spinning gradient border */}
                <div className="absolute inset-[-100%] animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#00000000_50%,#6c5ce7_100%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute inset-[2px] bg-[#0f0f13]/90 rounded-2xl backdrop-blur-xl group-hover:bg-[#0f0f13]/60 transition-colors duration-500 z-0" />

                {/* Animated inner core glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#00d2a0]/20 via-[#6c5ce7]/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 blur-xl scale-150 z-0" />

                <div className="relative z-10 w-16 h-16 md:w-20 md:h-20 mb-3 transform-gpu transition-all duration-500 group-hover:scale-125 group-hover:-translate-y-2 group-hover:drop-shadow-[0_0_25px_rgba(0,210,160,0.8)] text-[#a29bfe] group-hover:text-white">
                  {(() => {
                    const Icon = CATEGORY_ANIMATIONS[cat.slug] as any;
                    return Icon ? <Icon isHovered={hoveredCategory === cat.slug} /> : <span className="text-5xl">📦</span>;
                  })()}
                </div>

                <span className="relative z-10 text-sm md:text-base font-bold tracking-widest uppercase text-white/60 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#00d2a0] group-hover:to-[#6c5ce7] transition-all duration-300">
                  {cat.name}
                </span>

                {/* Scanline effect on hover */}
                <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(255,255,255,0.05)_50%)] bg-[length:100%_4px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-20 mix-blend-overlay" />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ═══ Featured Listings ═══ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Trending Now</h2>
            <p className="text-[#6a6a82] mt-1">Most popular items this week</p>
          </div>
          <Link href="/listings" className="btn-secondary text-sm">
            View All
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="glass-card overflow-hidden">
                <div className="aspect-[4/3] skeleton" />
                <div className="p-4 space-y-3">
                  <div className="h-4 skeleton w-3/4" />
                  <div className="h-3 skeleton w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : listings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {listings.map((listing, i) => (
              <ListingCard key={listing.id} listing={listing} index={i} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🏪</div>
            <h3 className="text-xl font-semibold text-white mb-2">No listings yet</h3>
            <p className="text-[#6a6a82] mb-6">Start the backend and run the seed script to populate data.</p>
            <div className="glass-card inline-block p-4 !rounded-xl text-left max-w-md">
              <code className="text-sm text-[#a29bfe]">
                docker compose up -d<br />
                cd backend<br />
                python seed_data.py
              </code>
            </div>
          </div>
        )}
      </section>

      {/* ═══ Why Marknaden ═══ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 mb-12">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Why Marknaden?</h2>
          <p className="text-[#6a6a82] mt-2">The marketplace experience you deserve</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: '🛡️',
              title: 'Trust & Safety',
              description: 'Verified profiles, scam detection, and a dedicated safety team. Trade with confidence.',
              gradient: 'from-[#6c5ce7]/20 to-transparent',
            },
            {
              icon: '⚡',
              title: 'Lightning Fast',
              description: 'Instant listing creation, real-time chat, and smart search that understands what you want.',
              gradient: 'from-[#00d2a0]/20 to-transparent',
            },
            {
              icon: '💎',
              title: 'Premium Experience',
              description: 'Beautiful design, seamless payments (Stripe, Klarna, Swish), and shipping built-in.',
              gradient: 'from-[#ff7f50]/20 to-transparent',
            },
          ].map((feature) => (
            <div key={feature.title} className="glass-card p-8 text-center group">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mx-auto mb-4 text-3xl group-hover:scale-110 transition-transform`}>
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-[#6a6a82] leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="glass-card p-10 sm:p-16 text-center relative overflow-hidden animate-pulse-glow">
          <div className="absolute inset-0 bg-gradient-to-br from-[#6c5ce7]/10 to-transparent" />
          <div className="relative">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Start Selling Today</h2>
            <p className="text-[#9898b0] max-w-lg mx-auto mb-8">
              List your first item in under 60 seconds.
            </p>
            <Link href="/sell" className="btn-primary text-lg !py-4 !px-10">
              Create Your First Listing
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
