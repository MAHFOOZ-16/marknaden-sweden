'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { Listing } from '@/lib/types';
import { formatPrice, formatDate, conditionLabel, conditionColor } from '@/lib/utils';
import { useFavorites } from '@/context/FavoritesContext';
import { motion } from 'framer-motion';

interface ListingCardProps {
    listing: Listing;
    index?: number;
}

export function ListingCard({ listing, index = 0 }: ListingCardProps) {
    const imageUrl = listing.media?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400';

    // Global favorites state
    const { favorites, toggleFavorite, isLoading: favLoading } = useFavorites();
    const isFavorited = favorites.has(listing.id);
    const [loadingFav, setLoadingFav] = useState(false);

    const handleFavorite = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (loadingFav) return;

        setLoadingFav(true);
        try {
            await toggleFavorite(listing.id);
        } finally {
            setLoadingFav(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: index * 0.1, type: "spring", stiffness: 100 }}
            whileHover={{ y: -8, scale: 1.02, transition: { type: "spring", stiffness: 300 } }}
            className="h-full"
        >
            <Link
                href={`/listings/${listing.id}`}
                className="relative block glass-card overflow-hidden group h-full flex flex-col border border-white/5 hover:border-[#6c5ce7]/50 transition-colors duration-300"
            >
                {/* Futuristic background glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#6c5ce7]/10 via-transparent to-[#00d2a0]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                {/* Animated bottom border glow line */}
                <div className="absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-[#6c5ce7] to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0 shadow-[0_0_15px_rgba(108,92,231,0.8)] z-20" />

                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                        src={imageUrl}
                        alt={listing.title}
                        className={`w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 ${listing.status === 'sold' ? 'grayscale' : ''}`}
                    />
                    {/* Darker gradient overlay on hover for better text contrast */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f13]/90 via-[#0f0f13]/20 to-transparent transition-opacity duration-500" />

                    {/* Scanline overlay over image */}
                    <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.2)_50%)] bg-[length:100%_4px] opacity-0 group-hover:opacity-100 mix-blend-overlay transition-opacity duration-500 pointer-events-none" />

                    {/* Top badges */}
                    <div className="absolute top-3 left-3 flex gap-2 z-10">
                        <span className={`badge ${conditionColor(listing.condition)} shadow-lg backdrop-blur-md`}>
                            {conditionLabel(listing.condition)}
                        </span>
                    </div>

                    {/* Favorite button */}
                    <button
                        onClick={handleFavorite}
                        disabled={loadingFav}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center hover:bg-[#ff4757]/20 transition-all z-20 hover:scale-110 border border-white/10 hover:border-[#ff4757]/50"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill={isFavorited ? '#ff4757' : 'none'} stroke={isFavorited ? '#ff4757' : 'white'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={loadingFav ? 'opacity-50' : 'transition-colors'}>
                            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                        </svg>
                    </button>

                    {/* Price tag */}
                    <div className="absolute bottom-3 left-3 z-10 transform transition-transform duration-300 group-hover:translate-x-1 flex flex-col gap-1">
                        {listing.status === 'sold' && (
                            <span className="bg-red-500/90 text-white text-xs font-black uppercase tracking-widest py-1 px-2 rounded backdrop-blur-md shadow-lg w-max mb-1">
                                Sold
                            </span>
                        )}
                        <span className={`text-xl font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] transition-colors duration-300 ${listing.status === 'sold' ? 'opacity-70' : 'group-hover:text-[#00d2a0]'}`}>
                            {formatPrice(listing.price, listing.currency)}
                        </span>
                    </div>

                    {/* Shipping badge */}
                    {listing.shipping_available && (
                        <div className="absolute bottom-3 right-3 z-10">
                            <span className="badge bg-[#00d2a0]/20 text-[#00d2a0] border border-[#00d2a0]/30 backdrop-blur-md">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
                                </svg>
                                Ships
                            </span>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className={`p-4 flex flex-col flex-1 relative z-10 bg-[#0f0f13]/80 backdrop-blur-xl ${listing.status === 'sold' ? 'opacity-60 grayscale' : ''}`}>
                    <h3 className="font-semibold text-white/90 text-sm leading-snug line-clamp-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-[#a29bfe] transition-all duration-300">
                        {listing.title}
                    </h3>

                    <div className="flex items-center gap-2 mt-2">
                        {listing.location_city && (
                            <span className="text-xs text-[#6a6a82] flex items-center gap-1 group-hover:text-[#6a6a82]/80 transition-colors">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
                                </svg>
                                {listing.location_city}
                            </span>
                        )}
                        <span className="text-xs text-[#3a3a4a]">·</span>
                        <span className="text-xs text-[#6a6a82]">{formatDate(listing.created_at)}</span>
                    </div>

                    <div className="mt-auto hidden" /> {/* Flex spacer */}

                    {/* Seller info */}
                    {listing.seller && (
                        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/[0.04] group-hover:border-[#6c5ce7]/30 transition-colors duration-300">
                            <div className="relative">
                                <img
                                    src={listing.seller.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${listing.seller.display_name}`}
                                    alt={listing.seller.display_name}
                                    className="w-7 h-7 rounded-full border border-white/10 group-hover:border-[#6c5ce7] transition-colors"
                                />
                                {listing.seller.is_verified && (
                                    <div className="absolute -bottom-1 -right-1 bg-[#0f0f13] rounded-full p-[2px]">
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="#6c5ce7" stroke="white" strokeWidth="2">
                                            <path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                            <span className="text-xs font-medium text-[#9898b0] truncate group-hover:text-white/80 transition-colors">{listing.seller.display_name}</span>

                            <div className="flex items-center gap-1 ml-auto bg-white/5 py-1 px-2 rounded-full border border-white/5 group-hover:border-[#fbbf24]/30 transition-colors">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="#fbbf24" stroke="#fbbf24" strokeWidth="1">
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                </svg>
                                <span className="text-[10px] font-bold text-[#fbbf24]">{listing.seller.rating.toFixed(1)}</span>
                            </div>
                        </div>
                    )}
                </div>
            </Link>
        </motion.div>
    );
}
