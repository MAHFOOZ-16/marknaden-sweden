'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ListingCard } from '@/components/ListingCard';
import { api } from '@/lib/api';
import type { Listing, Category } from '@/lib/types';

const SORT_OPTIONS = [
    { value: 'newest', label: 'Newest' },
    { value: 'oldest', label: 'Oldest' },
    { value: 'price_asc', label: 'Price: Low → High' },
    { value: 'price_desc', label: 'Price: High → Low' },
    { value: 'popular', label: 'Most Popular' },
];

function ListingsContent() {
    const searchParams = useSearchParams();
    const [listings, setListings] = useState<Listing[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    // Filters
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [category, setCategory] = useState(searchParams.get('category') || '');
    const [sortBy, setSortBy] = useState('newest');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');

    const fetchListings = useCallback(async () => {
        setLoading(true);
        try {
            const params: Record<string, string | number | undefined> = {
                page,
                page_size: 12,
                sort_by: sortBy,
            };
            if (search) params.search = search;
            if (category) params.category = category;
            if (minPrice) params.min_price = Number(minPrice);
            if (maxPrice) params.max_price = Number(maxPrice);

            const res = await api.getListings(params);
            setListings(res.items);
            setTotal(res.total);
            setTotalPages(res.total_pages);
        } catch {
            // API not available
        } finally {
            setLoading(false);
        }
    }, [page, search, category, sortBy, minPrice, maxPrice]);

    useEffect(() => {
        api.getCategories().then(setCategories).catch(() => { });
    }, []);

    // Keep local state in sync with URL searchParams (e.g., when clicking footer links)
    useEffect(() => {
        const urlCategory = searchParams.get('category') || '';
        const urlSearch = searchParams.get('search') || '';

        let changed = false;

        if (urlCategory !== category) {
            setCategory(urlCategory);
            changed = true;
        }
        if (urlSearch !== search) {
            setSearch(urlSearch);
            changed = true;
        }

        if (changed) {
            setPage(1);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    useEffect(() => {
        fetchListings();
    }, [fetchListings]);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white">Browse Listings</h1>
                <p className="text-[#6a6a82] mt-1">{total} items found</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Filters Sidebar */}
                <div className="lg:w-64 shrink-0">
                    <div className="glass-card p-5 space-y-5 hover:!transform-none">
                        {/* Search */}
                        <div>
                            <label className="text-xs font-semibold text-[#9898b0] uppercase tracking-wider mb-2 block">Search</label>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                placeholder="Search items..."
                                className="input-field text-sm"
                            />
                        </div>

                        {/* Category */}
                        <div>
                            <label className="text-xs font-semibold text-[#9898b0] uppercase tracking-wider mb-2 block">Category</label>
                            <select
                                value={category}
                                onChange={(e) => { setCategory(e.target.value); setPage(1); }}
                                className="input-field text-sm"
                            >
                                <option value="">All categories</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.slug}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Price */}
                        <div>
                            <label className="text-xs font-semibold text-[#9898b0] uppercase tracking-wider mb-2 block">Price (SEK)</label>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    value={minPrice}
                                    onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
                                    placeholder="Min"
                                    className="input-field text-sm w-1/2"
                                />
                                <input
                                    type="number"
                                    value={maxPrice}
                                    onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
                                    placeholder="Max"
                                    className="input-field text-sm w-1/2"
                                />
                            </div>
                        </div>

                        {/* Sort */}
                        <div>
                            <label className="text-xs font-semibold text-[#9898b0] uppercase tracking-wider mb-2 block">Sort By</label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="input-field text-sm"
                            >
                                {SORT_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Clear */}
                        <button
                            onClick={() => { setSearch(''); setCategory(''); setMinPrice(''); setMaxPrice(''); setSortBy('newest'); setPage(1); }}
                            className="btn-secondary w-full text-sm justify-center"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>

                {/* Listings Grid */}
                <div className="flex-1">
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, i) => (
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
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                {listings.map((listing, i) => (
                                    <ListingCard key={listing.id} listing={listing} index={i} />
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-center gap-2 mt-10">
                                    <button
                                        onClick={() => setPage(Math.max(1, page - 1))}
                                        disabled={page <= 1}
                                        className="btn-secondary text-sm !px-4 disabled:opacity-30"
                                    >
                                        ← Prev
                                    </button>
                                    <span className="text-sm text-[#9898b0] px-4">
                                        Page {page} of {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setPage(Math.min(totalPages, page + 1))}
                                        disabled={page >= totalPages}
                                        className="btn-secondary text-sm !px-4 disabled:opacity-30"
                                    >
                                        Next →
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-20">
                            <div className="text-5xl mb-4">🔍</div>
                            <h3 className="text-xl font-semibold text-white mb-2">No listings found</h3>
                            <p className="text-[#6a6a82]">Try adjusting your filters or search terms</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function ListingsPage() {
    return (
        <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-8"><div className="h-8 skeleton w-48 mb-4" /><div className="grid grid-cols-3 gap-6">{[...Array(6)].map((_, i) => <div key={i} className="aspect-[4/3] skeleton" />)}</div></div>}>
            <ListingsContent />
        </Suspense>
    );
}
