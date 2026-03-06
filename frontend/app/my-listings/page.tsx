'use client';

import { useEffect, useState } from 'react';
import { ListingCard } from '@/components/ListingCard';
import { api } from '@/lib/api';
import type { Listing } from '@/lib/types';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useAuthTokenReady } from '@/components/AuthTokenProvider';

export default function MyListingsPage() {
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const { user, isLoading } = useUser();
    const isTokenReady = useAuthTokenReady();

    useEffect(() => {
        if (isLoading || !isTokenReady) return;
        if (!user) {
            setLoading(false);
            return;
        }
        api.getMyListings().then(res => setListings(res.items)).catch(() => { }).finally(() => setLoading(false));
    }, [user, isLoading, isTokenReady]);

    if (!isLoading && !user) {
        return (
            <div className="text-center py-20 px-4">
                <h1 className="text-2xl font-bold text-white mb-4">Sign in to view your listings</h1>
                <a href="/auth/login?returnTo=/my-listings" className="btn-primary inline-flex">Sign In</a>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white">My Listings</h1>
                <p className="text-[#6a6a82] mt-1">{listings.length} item{listings.length === 1 ? '' : 's'}</p>
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
            ) : listings.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {listings.map((listing, i) => (
                        <ListingCard key={listing.id} listing={listing} index={i} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20">
                    <div className="text-6xl mb-4">📦</div>
                    <h3 className="text-xl font-semibold text-white mb-2">You haven't listed anything yet</h3>
                    <p className="text-[#6a6a82] mb-6">List your first item to start selling on Marknaden</p>
                    <a href="/sell" className="btn-primary inline-flex">Sell an Item</a>
                </div>
            )}
        </div>
    );
}
