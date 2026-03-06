'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { api } from '@/lib/api';
import { useAuthTokenReady } from '@/components/AuthTokenProvider';

interface FavoritesContextType {
    favorites: Set<string>;
    toggleFavorite: (listingId: string) => Promise<void>;
    isLoading: boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
    const [favorites, setFavorites] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useUser();
    const isTokenReady = useAuthTokenReady();

    useEffect(() => {
        // Wait until token validation/fetching is completely finished
        if (!isTokenReady) return;

        // Only load favorites when a user is authenticated
        if (!user) {
            setFavorites(new Set());
            setIsLoading(false);
            return;
        }

        const loadFavorites = async () => {
            try {
                const favs = await api.getFavorites();
                setFavorites(new Set(favs.map(f => f.listing_id)));
            } catch (error) {
                console.error("Failed to load favorites", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadFavorites();
    }, [user, isTokenReady]);

    const toggleFavorite = async (listingId: string) => {
        if (!user) return; // Don't allow toggling when not logged in

        // Optimistic UI update
        const newFavs = new Set(favorites);
        const isFavorited = newFavs.has(listingId);

        if (isFavorited) {
            newFavs.delete(listingId);
        } else {
            newFavs.add(listingId);
        }
        setFavorites(newFavs);

        // API Call
        try {
            if (isFavorited) {
                await api.removeFavorite(listingId);
            } else {
                await api.addFavorite(listingId);
            }
        } catch (error) {
            // Revert on failure
            console.error("Failed to toggle favorite", error);
            const revertedFavs = new Set(favorites);
            if (isFavorited) revertedFavs.add(listingId);
            else revertedFavs.delete(listingId);
            setFavorites(revertedFavs);
        }
    };

    return (
        <FavoritesContext.Provider value={{ favorites, toggleFavorite, isLoading }}>
            {children}
        </FavoritesContext.Provider>
    );
}

export function useFavorites() {
    const context = useContext(FavoritesContext);
    if (context === undefined) {
        throw new Error('useFavorites must be used within a FavoritesProvider');
    }
    return context;
}
