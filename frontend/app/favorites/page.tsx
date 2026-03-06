'use client';

import { useEffect, useState } from 'react';
import { ListingCard } from '@/components/ListingCard';
import { api } from '@/lib/api';
import type { Favorite } from '@/lib/types';

export default function FavoritesPage() {
    const [favorites, setFavorites] = useState<Favorite[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.getFavorites().then(setFavorites).catch(() => { }).finally(() => setLoading(false));
    }, []);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white">Favorites</h1>
                <p className="text-[#6a6a82] mt-1">{favorites.length} saved items</p>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="glass-card overflow-hidden">
                            <div className="aspect-[4/3] skeleton" />
                            <div className="p-4 space-y-3"><div className="h-4 skeleton w-3/4" /><div className="h-3 skeleton w-1/2" /></div>
                        </div>
                    ))}
                </div>
            ) : favorites.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {favorites.filter(f => f.listing).map((fav, i) => (
                        <ListingCard key={fav.id} listing={fav.listing!} index={i} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20">
                    <div className="text-6xl mb-4">❤️</div>
                    <h3 className="text-xl font-semibold text-white mb-2">No favorites yet</h3>
                    <p className="text-[#6a6a82] mb-6">Browse listings and tap the heart to save items</p>
                    <a href="/listings" className="btn-primary">Browse Listings</a>
                </div>
            )}
        </div>
    );
}
