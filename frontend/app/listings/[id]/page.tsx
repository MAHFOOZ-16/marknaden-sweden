'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { Listing, User } from '@/lib/types';
import { formatPrice, formatDate, conditionLabel, conditionColor } from '@/lib/utils';
import { useAuthTokenReady } from '@/components/AuthTokenProvider';
import { useFavorites } from '@/context/FavoritesContext';
import SellerRating from '@/components/SellerRating';
import { motion, AnimatePresence } from 'framer-motion';

export default function ListingDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [listing, setListing] = useState<Listing | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);
    const [showContact, setShowContact] = useState(false);
    const [messageText, setMessageText] = useState('');
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isDeletingAdmin, setIsDeletingAdmin] = useState(false);
    const [showPhone, setShowPhone] = useState(false);
    const isTokenReady = useAuthTokenReady();

    // Favorites & Share State
    const { favorites, toggleFavorite } = useFavorites();
    const isFavorited = listing ? favorites.has(listing.id) : false;
    const [loadingFav, setLoadingFav] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);

    const handleFavorite = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (loadingFav || !listing) return;

        const wasFavorited = isFavorited;
        setLoadingFav(true);
        try {
            await toggleFavorite(listing.id);
            setListing((prev) => {
                if (!prev) return prev;
                return {
                    ...prev,
                    favorite_count: Math.max(0, (prev.favorite_count || 0) + (wasFavorited ? -1 : 1))
                };
            });
        } finally {
            setLoadingFav(false);
        }
    };

    useEffect(() => {
        if (isTokenReady) {
            api.getMe().then(setCurrentUser).catch(() => { });
        }
    }, [isTokenReady]);

    useEffect(() => {
        const loadListing = async () => {
            try {
                const data = await api.getListing(params.id as string);
                setListing(data);
            } catch {
                // Handle error
            } finally {
                setLoading(false);
            }
        };
        if (params.id) loadListing();
    }, [params.id]);

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    <div className="lg:col-span-3 aspect-[4/3] skeleton rounded-2xl" />
                    <div className="lg:col-span-2 space-y-4">
                        <div className="h-8 skeleton w-3/4" />
                        <div className="h-6 skeleton w-1/3" />
                        <div className="h-20 skeleton" />
                    </div>
                </div>
            </div>
        );
    }

    if (!listing) {
        return (
            <div className="max-w-6xl mx-auto px-4 py-20 text-center">
                <div className="text-5xl mb-4">😕</div>
                <h2 className="text-2xl font-bold text-white mb-2">Listing not found</h2>
                <p className="text-[#6a6a82] mb-6">This listing may have been removed or doesn&apos;t exist.</p>
                <Link href="/listings" className="btn-primary">Browse Listings</Link>
            </div>
        );
    }

    const images = listing.media.length > 0
        ? listing.media.map(m => m.url)
        : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'];

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-[#6a6a82] mb-6">
                <Link href="/" className="hover:text-white transition-colors">Home</Link>
                <span>/</span>
                <Link href="/listings" className="hover:text-white transition-colors">Listings</Link>
                <span>/</span>
                {listing.category && (
                    <>
                        <Link href={`/listings?category=${listing.category.slug}`} className="hover:text-white transition-colors">{listing.category.name}</Link>
                        <span>/</span>
                    </>
                )}
                <span className="text-[#9898b0] truncate">{listing.title}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Image Gallery */}
                <div className="lg:col-span-3">
                    <div className="glass-card overflow-hidden hover:!transform-none">
                        {/* Main image */}
                        <div className="aspect-[4/3] relative overflow-hidden">
                            <img
                                src={images[selectedImage]}
                                alt={listing.title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute bottom-4 right-4 flex gap-2">
                                <span className="badge bg-black/50 text-white backdrop-blur-sm">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" /><circle cx="12" cy="12" r="3" /></svg>
                                    {listing.view_count}
                                </span>
                                <span className="badge bg-black/50 text-white backdrop-blur-sm">
                                    ❤️ {listing.favorite_count}
                                </span>
                            </div>
                        </div>

                        {/* Thumbnails */}
                        {images.length > 1 && (
                            <div className="flex gap-2 p-3 overflow-x-auto">
                                {images.map((img, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setSelectedImage(i)}
                                        className={`w-20 h-20 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${i === selectedImage ? 'border-[#6c5ce7]' : 'border-transparent opacity-60 hover:opacity-100'
                                            }`}
                                    >
                                        <img src={img} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Details */}
                <div className="lg:col-span-2 space-y-5">
                    {/* Title & Price */}
                    <div className="glass-card p-6 hover:!transform-none">
                        <div className="flex items-start justify-between gap-3">
                            <h1 className="text-2xl font-bold text-white pr-8">{listing.title}</h1>
                            <div className="flex items-center gap-2 shrink-0">
                                <button
                                    onClick={handleFavorite}
                                    disabled={loadingFav}
                                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors border ${isFavorited ? 'bg-[#ff4757]/10 border-[#ff4757]/20 hover:bg-[#ff4757]/20 text-[#ff4757]' : 'bg-white/[0.05] border-transparent hover:bg-white/[0.1] text-[#9898b0]'}`}
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill={isFavorited ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={loadingFav ? 'opacity-50' : ''}>
                                        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                                    </svg>
                                    <span className="text-sm font-medium">{listing.favorite_count || 0}</span>
                                </button>
                                <button
                                    onClick={() => setShowShareModal(true)}
                                    className="p-2 rounded-lg bg-white/[0.05] border border-transparent hover:bg-white/[0.1] text-[#9898b0] transition-colors"
                                    title="Share product link"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="15 14 20 9 15 4"></polyline>
                                        <path d="M4 20v-7a4 4 0 0 1 4-4h12"></path>
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="text-3xl font-bold gradient-text mt-2">
                            {formatPrice(listing.price, listing.currency)}
                        </div>

                        <div className="flex flex-wrap gap-2 mt-4">
                            <span className={`badge ${conditionColor(listing.condition)}`}>
                                {conditionLabel(listing.condition)}
                            </span>
                            {listing.shipping_available && (
                                <span className="badge bg-[#00d2a0]/20 text-[#00d2a0]">
                                    📦 Shipping: {listing.shipping_cost ? formatPrice(listing.shipping_cost) : 'Free'}
                                </span>
                            )}
                            <span className="badge bg-white/[0.05] text-[#9898b0]">
                                📍 {listing.location_city || 'Sweden'}
                            </span>
                        </div>

                        <div className="text-xs text-[#6a6a82] mt-3">
                            Listed {formatDate(listing.created_at)}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="glass-card p-6 border-white/[0.06] hover:!transform-none space-y-3">
                        {currentUser?.id === listing.seller_id ? (
                            <div className="space-y-3">
                                <div className="p-4 mb-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center">
                                    <span className="text-[#a29bfe] font-medium">✨ This is your listing</span>
                                </div>

                                {listing.status !== 'sold' && listing.status !== 'removed' && (
                                    <button
                                        onClick={async () => {
                                            try {
                                                await api.updateListing(listing.id, { status: 'sold' });
                                                setListing({ ...listing, status: 'sold' });
                                            } catch (e: any) {
                                                console.error('API Error Update:', e);
                                                alert(e.message || 'Failed to update listing');
                                            }
                                        }}
                                        className="btn-primary w-full justify-center text-base bg-[#00d2a0] hover:bg-[#00b890] border-transparent"
                                    >
                                        ✅ Mark as Sold
                                    </button>
                                )}

                                {listing.status !== 'removed' && (
                                    <button
                                        onClick={async () => {
                                            try {
                                                await api.deleteListing(listing.id);
                                                setListing({ ...listing, status: 'removed' });
                                                alert('Listing moved to bin. It will be permanently deleted after 30 days.');
                                                router.push('/profile');
                                            } catch (e: any) {
                                                console.error('API Error Delete:', e);
                                                alert(e.message || 'Failed to delete listing');
                                            }
                                        }}
                                        className="btn-secondary w-full justify-center text-base !text-red-400 !border-red-500/30 hover:!bg-red-500/10"
                                    >
                                        🗑️ Delete Listing
                                    </button>
                                )}

                                <p className="text-xs text-[#6a6a82] text-center mt-2 px-2">
                                    Deleted listings are stored securely for 30 days before being permanently removed from our databases.
                                </p>
                            </div>
                        ) : (
                            <>
                                {!showContact ? (
                                    <button onClick={() => setShowContact(true)} className="btn-primary w-full justify-center text-base">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                                            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                                        </svg>
                                        Contact Seller
                                    </button>
                                ) : (
                                    <div className="space-y-3 animate-fade-in">
                                        <textarea
                                            className="input-field w-full min-h-[100px] resize-none"
                                            placeholder="Type your message to the seller..."
                                            value={messageText}
                                            onChange={(e) => setMessageText(e.target.value)}
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                onClick={async () => {
                                                    if (!messageText.trim()) return;
                                                    if (!currentUser) {
                                                        router.push(`/auth/login?returnTo=/listings/${listing.id}`);
                                                        return;
                                                    }
                                                    try {
                                                        await api.createConversation({
                                                            listing_id: listing.id,
                                                            seller_id: listing.seller_id,
                                                            initial_message: messageText
                                                        });
                                                        router.push('/chat');
                                                    } catch (e: any) {
                                                        alert(e.message || 'Failed to send message');
                                                    }
                                                }}
                                                disabled={!messageText.trim()}
                                                className="btn-primary flex-1 justify-center disabled:opacity-50"
                                            >
                                                Send
                                            </button>
                                            <button
                                                onClick={() => setShowContact(false)}
                                                className="btn-secondary"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}

                            </>
                        )}
                    </div>

                    {currentUser?.role === 'admin' && currentUser?.id !== listing.seller_id && (
                        <div className="glass-card p-6 mt-6 hover:!transform-none border-red-500/20 bg-[#ff4757]/5">
                            <h3 className="text-sm font-semibold text-red-400 uppercase tracking-wider mb-3">Admin Controls</h3>
                            {!isDeletingAdmin ? (
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setIsDeletingAdmin(true);
                                    }}
                                    className="btn-secondary w-full justify-center text-base !text-red-400 !border-red-500/30 hover:!bg-red-500/10"
                                >
                                    🗑️ Delete Listing
                                </button>
                            ) : (
                                <div className="space-y-3 animate-fade-in bg-red-500/10 p-4 rounded-xl border border-red-500/30">
                                    <p className="text-sm text-center text-red-400 font-medium">Are you sure you want to permanently delete this listing?</p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={async (e) => {
                                                e.preventDefault();
                                                try {
                                                    await api.deleteListing(listing.id);
                                                    router.push('/admin');
                                                } catch (err: any) {
                                                    console.error('API Error Delete (Admin):', err);
                                                    alert(err.message || 'Failed to delete listing');
                                                    setIsDeletingAdmin(false);
                                                }
                                            }}
                                            className="btn-primary flex-1 justify-center bg-red-500 hover:bg-red-600 border-transparent transition-colors"
                                        >
                                            Yes, Delete
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setIsDeletingAdmin(false);
                                            }}
                                            className="btn-secondary flex-1 justify-center transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Seller */}
                    {listing.seller && (
                        <div className="glass-card p-6 hover:!transform-none">
                            <div className="flex items-center gap-3">
                                <img
                                    src={listing.seller.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${listing.seller.display_name}`}
                                    alt={listing.seller.display_name}
                                    className="w-12 h-12 rounded-full"
                                />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-white">{listing.seller.display_name}</span>
                                        {listing.seller.is_verified && (
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="#6c5ce7" stroke="white" strokeWidth="2">
                                                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                                            </svg>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-[#6a6a82]">
                                        <SellerRating
                                            sellerId={listing.seller.id}
                                            currentRating={listing.seller.rating}
                                            ratingCount={listing.seller.rating_count}
                                        />
                                        {listing.seller.location && (
                                            <span>· 📍 {listing.seller.location}</span>
                                        )}
                                    </div>
                                    {listing.seller.phone && (
                                        <div className="mt-3">
                                            <AnimatePresence mode="wait">
                                                {!showPhone ? (
                                                    <motion.button
                                                        key="show-btn"
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        exit={{ opacity: 0, y: 10 }}
                                                        onClick={() => setShowPhone(true)}
                                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-xs font-bold text-white hover:bg-white/10 hover:border-white/20 transition-all active:scale-95 group shadow-lg"
                                                    >
                                                        <span className="group-hover:rotate-12 transition-transform">📞</span>
                                                        Mobile Number
                                                    </motion.button>
                                                ) : (
                                                    <motion.div
                                                        key="phone-val"
                                                        initial={{ y: -30, opacity: 0, rotateX: -60 }}
                                                        animate={{ y: 0, opacity: 1, rotateX: 0 }}
                                                        transition={{
                                                            type: "spring",
                                                            stiffness: 500,
                                                            damping: 15
                                                        }}
                                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#6c5ce7]/10 border border-[#6c5ce7]/30 text-sm font-bold text-[#a29bfe] shadow-[0_8px_20px_rgba(108,92,231,0.3)] border-b-2 border-b-[#6c5ce7]/50"
                                                    >
                                                        <span>📱</span>
                                                        {listing.seller.phone}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Description */}
                    <div className="glass-card p-6 hover:!transform-none">
                        <h3 className="text-sm font-semibold text-[#9898b0] uppercase tracking-wider mb-3">Description</h3>
                        <p className="text-[#d0d0e0] text-sm leading-relaxed whitespace-pre-line">
                            {listing.description}
                        </p>
                    </div>
                </div>
            </div>

            {/* Share Modal */}
            {showShareModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f0f13]/80 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setShowShareModal(false)}>
                    <div className="bg-[#1a1a24] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl relative" onClick={e => e.stopPropagation()}>
                        <button
                            className="absolute top-4 right-4 text-[#9898b0] hover:text-white transition-colors p-1"
                            onClick={() => setShowShareModal(false)}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                        <h2 className="text-xl font-bold text-white mb-6">Share link</h2>

                        <div className="bg-[#0f0f13] rounded-lg p-3 text-sm text-[#d0d0e0] flex items-center mb-6 break-all border border-white/5 font-mono select-all">
                            {typeof window !== 'undefined' ? window.location.href : `https://marknaden.se/listings/${listing.id}`}
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <button className="w-10 h-10 rounded-full bg-white/[0.05] flex items-center justify-center hover:bg-white/[0.1] text-white transition-colors" title="Email" onClick={() => window.open(`mailto:?subject=Check out this listing on Marknaden: ${listing.title}&body=${window.location.href}`)}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                                </button>
                                <button className="w-10 h-10 rounded-full bg-white/[0.05] flex items-center justify-center hover:bg-[#1877f2] text-white transition-colors" title="Facebook" onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`)}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"></path></svg>
                                </button>
                                <button className="w-10 h-10 rounded-full bg-white/[0.05] flex items-center justify-center hover:bg-[#1da1f2] text-white transition-colors" title="X (Twitter)" onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=Check out this listing: ${listing.title}`)}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>
                                </button>
                            </div>

                            <button
                                className="btn-primary py-2 px-5 !text-sm whitespace-nowrap"
                                onClick={() => {
                                    navigator.clipboard.writeText(window.location.href);
                                    alert('Link copied to clipboard!');
                                }}
                            >
                                Copy link
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
