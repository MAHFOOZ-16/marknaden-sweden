'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { api } from '@/lib/api';
import type { AdminStats, User, Listing } from '@/lib/types';
import { formatPrice, formatDate, conditionLabel, conditionColor } from '@/lib/utils';
import { useAuthTokenReady } from '@/components/AuthTokenProvider';

export default function AdminPage() {
    const { user, isLoading: authLoading } = useUser();
    const isTokenReady = useAuthTokenReady();
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null); // null = still checking
    const [usersList, setUsersList] = useState<User[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [confirmingDeleteUser, setConfirmingDeleteUser] = useState<string | null>(null);

    // Listings Data
    const [listingsList, setListingsList] = useState<Listing[]>([]);
    const [loadingListings, setLoadingListings] = useState(false);
    const [listingsStatusFilter, setListingsStatusFilter] = useState<string>('');
    const [confirmingDeleteListing, setConfirmingDeleteListing] = useState<string | null>(null);

    useEffect(() => {
        if (activeTab === 'users' && isAdmin && usersList.length === 0) {
            setLoadingUsers(true);
            api.getAdminUsers()
                .then(setUsersList)
                .catch(() => { })
                .finally(() => setLoadingUsers(false));
        }
    }, [activeTab, isAdmin, usersList.length]);

    useEffect(() => {
        if (activeTab === 'listings' && isAdmin) {
            setLoadingListings(true);
            api.getAdminListings(listingsStatusFilter || undefined)
                .then(setListingsList)
                .catch(() => { })
                .finally(() => setLoadingListings(false));
        }
    }, [activeTab, isAdmin, listingsStatusFilter]);

    const handleDeleteUser = async (userId: string) => {
        try {
            await api.deleteUser(userId);
            setUsersList(prev => prev.filter(u => u.id !== userId));
            setConfirmingDeleteUser(null);
        } catch (e: any) {
            alert(e.message || 'Failed to delete user');
            setConfirmingDeleteUser(null);
        }
    };

    const handleDeleteListing = async (listingId: string) => {
        try {
            await api.deleteListing(listingId);
            setListingsList(prev => prev.map(l => l.id === listingId ? { ...l, status: 'removed' as any } : l));
            setConfirmingDeleteListing(null);
        } catch (e: any) {
            alert(e.message || 'Failed to delete listing');
            setConfirmingDeleteListing(null);
        }
    };

    useEffect(() => {
        if (authLoading || !isTokenReady) return;

        if (!user) {
            setIsAdmin(false);
            setLoading(false);
            return;
        }

        // Check admin role
        api.getMe()
            .then(me => {
                if (me.role === 'admin') {
                    setIsAdmin(true);
                    return api.getAdminStats();
                } else {
                    setIsAdmin(false);
                    return null;
                }
            })
            .then(statsData => {
                if (statsData) setStats(statsData);
            })
            .catch(() => setIsAdmin(false))
            .finally(() => setLoading(false));
    }, [user, authLoading, isTokenReady]);

    // Loading state
    if (authLoading || isAdmin === null) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <div className="w-12 h-12 rounded-xl bg-[#6c5ce7]/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
                            <span className="text-2xl">🔒</span>
                        </div>
                        <p className="text-[#6a6a82]">Verifying access...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Not authenticated
    if (!user) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center glass-card p-12 max-w-md">
                        <div className="w-16 h-16 rounded-2xl bg-[#ff4757]/20 flex items-center justify-center mx-auto mb-6">
                            <span className="text-3xl">🔐</span>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-3">Sign In Required</h2>
                        <p className="text-[#6a6a82] mb-6">You need to sign in to access the admin dashboard.</p>
                        <a href="/auth/login" className="btn-primary inline-block">
                            Sign In
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    // Not admin
    if (!isAdmin) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center glass-card p-12 max-w-md">
                        <div className="w-16 h-16 rounded-2xl bg-[#ff4757]/20 flex items-center justify-center mx-auto mb-6">
                            <span className="text-3xl">⛔</span>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-3">Access Denied</h2>
                        <p className="text-[#6a6a82] mb-6">You don&apos;t have permission to access the admin dashboard. This area is restricted to administrators.</p>
                        <a href="/" className="btn-primary inline-block">
                            Go Home
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    const statCards = stats ? [
        { label: 'Total Users', value: stats.total_users, icon: '👥', color: 'from-[#6c5ce7]/20', trend: '+12%' },
        { label: 'Active Listings', value: stats.active_listings, icon: '📦', color: 'from-[#00d2a0]/20', trend: '+8%' },
        { label: 'Total Orders', value: stats.total_orders, icon: '🛒', color: 'from-[#ff7f50]/20', trend: '+15%' },
        { label: 'Pending Reports', value: stats.pending_reports, icon: '🚩', color: 'from-[#ff4757]/20', trend: stats.pending_reports > 0 ? 'Action needed' : 'All clear' },
    ] : [];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
                    <p className="text-[#6a6a82] mt-1">Platform overview and moderation</p>
                </div>
                <span className="badge bg-[#6c5ce7]/20 text-[#a29bfe]">🔒 Admin</span>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-8 p-1 glass-card !rounded-xl w-fit hover:!transform-none overflow-x-auto max-w-full">
                {['overview', 'users', 'listings', 'reports', 'analytics'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all capitalize ${activeTab === tab ? 'bg-[#6c5ce7] text-white' : 'text-[#6a6a82] hover:text-white hover:bg-white/[0.05]'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {activeTab === 'overview' && (
                <>
                    {/* Stats Grid */}
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            {[...Array(4)].map((_, i) => <div key={i} className="h-32 skeleton rounded-2xl" />)}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            {statCards.map(card => (
                                <div key={card.label} className="glass-card p-6 hover:!transform-none">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} to-transparent flex items-center justify-center text-2xl`}>
                                            {card.icon}
                                        </span>
                                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${card.trend === 'Action needed' ? 'bg-[#ff4757]/20 text-[#ff4757]' : 'bg-[#00d2a0]/20 text-[#00d2a0]'
                                            }`}>
                                            {card.trend}
                                        </span>
                                    </div>
                                    <div className="text-3xl font-bold text-white">{card.value.toLocaleString()}</div>
                                    <div className="text-sm text-[#6a6a82] mt-1">{card.label}</div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Recent Activity */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="glass-card p-6 hover:!transform-none">
                            <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
                            <div className="space-y-3">
                                {stats?.recent_activity && stats.recent_activity.length > 0 ? (
                                    stats.recent_activity.map((item, i) => (
                                        <div key={i} className="flex items-center gap-3 py-2 border-b border-white/[0.04] last:border-0">
                                            <span className="text-lg">{item.type}</span>
                                            <div className="flex-1">
                                                <p className="text-sm text-[#d0d0e0]">{item.text}</p>
                                                <p className="text-xs text-[#6a6a82]">{formatDate(item.time)}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <p className="text-[#6a6a82]">No recent activity found.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="glass-card p-6 hover:!transform-none">
                            <h3 className="text-lg font-semibold text-white mb-4">Platform Health</h3>
                            <div className="space-y-4">
                                {[
                                    { label: 'API Response Time', value: '45ms', status: 'good' },
                                    { label: 'Database', value: 'Connected', status: 'good' },
                                    { label: 'Search Engine', value: 'PostgreSQL FTS', status: 'info' },
                                    { label: 'Payment Gateway', value: 'Mock Mode', status: 'warning' },
                                    { label: 'Media Storage', value: 'Local / Mock', status: 'warning' },
                                ].map(item => (
                                    <div key={item.label} className="flex items-center justify-between">
                                        <span className="text-sm text-[#9898b0]">{item.label}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-white">{item.value}</span>
                                            <span className={`w-2 h-2 rounded-full ${item.status === 'good' ? 'bg-[#00d2a0]' : item.status === 'warning' ? 'bg-yellow-400' : 'bg-[#6c5ce7]'
                                                }`} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            )}

            {activeTab === 'reports' && (
                <div className="glass-card p-6 hover:!transform-none">
                    <h3 className="text-lg font-semibold text-white mb-4">Reports</h3>
                    <p className="text-[#6a6a82] text-sm">Reports will appear here when the backend is running with seed data.</p>
                </div>
            )}

            {activeTab === 'users' && (
                <div className="glass-card p-6 overflow-hidden">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-xl font-bold text-white">User Management</h3>
                            <p className="text-sm text-[#9898b0] mt-1">Manage platform members and their roles</p>
                        </div>
                        <button
                            onClick={async () => {
                                try {
                                    setLoadingUsers(true);
                                    const res = await api.syncAuth0Users();
                                    alert(`Successfully synced ${res.synced} users from Auth0!`);
                                    const updated = await api.getAdminUsers();
                                    setUsersList(updated);
                                } catch (e: any) {
                                    alert(e.message || 'Failed to sync users');
                                } finally {
                                    setLoadingUsers(false);
                                }
                            }}
                            className="btn-primary"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                                <polyline points="23 4 23 10 17 10" />
                                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                            </svg>
                            Sync Auth0 Users
                        </button>
                    </div>
                    {loadingUsers ? (
                        <div className="space-y-4">
                            {[...Array(5)].map((_, i) => <div key={i} className="h-16 skeleton rounded-xl" />)}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/[0.06] text-[#9898b0] text-sm">
                                        <th className="pb-3 px-4 font-medium">User</th>
                                        <th className="pb-3 px-4 font-medium">Email</th>
                                        <th className="pb-3 px-4 font-medium">Role</th>
                                        <th className="pb-3 px-4 font-medium text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {usersList.map((u) => (
                                        <tr key={u.id} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors">
                                            <td className="py-4 px-4 flex items-center gap-3">
                                                <img src={u.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.display_name}`} className="w-8 h-8 rounded-full" alt="" />
                                                <span className="text-white text-sm font-medium">{u.display_name}</span>
                                            </td>
                                            <td className="py-4 px-4 text-[#d0d0e0] text-sm">{u.email}</td>
                                            <td className="py-4 px-4">
                                                <span className={`text-xs px-2.5 py-1 rounded-full ${u.role === 'admin' ? 'bg-[#ff4757]/20 text-[#ff4757]' : 'bg-white/[0.05] text-[#9898b0]'}`}>
                                                    {(u.role || 'user').toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-right">
                                                {confirmingDeleteUser === u.id ? (
                                                    <div className="flex items-center justify-end gap-2 animate-fade-in">
                                                        <span className="text-xs text-red-400 font-medium mr-2">Are you sure?</span>
                                                        <button
                                                            onClick={() => handleDeleteUser(u.id)}
                                                            className="text-xs px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition-colors"
                                                        >
                                                            Yes
                                                        </button>
                                                        <button
                                                            onClick={() => setConfirmingDeleteUser(null)}
                                                            className="text-xs px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-white transition-colors"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => setConfirmingDeleteUser(u.id)}
                                                        disabled={u.role === 'admin'}
                                                        className="text-xs px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-red-500/20 hover:border-transparent"
                                                    >
                                                        Delete User
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'listings' && (
                <div className="glass-card p-6 overflow-hidden">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                        <div>
                            <h3 className="text-xl font-bold text-white">Listings Management</h3>
                            <p className="text-sm text-[#9898b0] mt-1">View and moderate all products</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-[#9898b0]">Filter Status:</span>
                            <select
                                value={listingsStatusFilter}
                                onChange={(e) => setListingsStatusFilter(e.target.value)}
                                className="bg-[#0f0f13] border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#6c5ce7] transition-colors"
                            >
                                <option value="">All Statuses</option>
                                <option value="active">Active</option>
                                <option value="sold">Sold</option>
                                <option value="removed">Removed</option>
                            </select>
                        </div>
                    </div>

                    {loadingListings ? (
                        <div className="space-y-4">
                            {[...Array(5)].map((_, i) => <div key={i} className="h-20 skeleton rounded-xl" />)}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[800px]">
                                <thead>
                                    <tr className="border-b border-white/[0.06] text-[#9898b0] text-sm">
                                        <th className="pb-3 px-4 font-medium">Product</th>
                                        <th className="pb-3 px-4 font-medium">Seller Email</th>
                                        <th className="pb-3 px-4 font-medium">Price</th>
                                        <th className="pb-3 px-4 font-medium">Status</th>
                                        <th className="pb-3 px-4 font-medium text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {listingsList.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="py-8 text-center text-[#9898b0]">No listings found matching this criteria.</td>
                                        </tr>
                                    ) : listingsList.map((listing) => (
                                        <tr key={listing.id} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors">
                                            <td className="py-4 px-4 flex items-center gap-3 w-max max-w-xs">
                                                <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-white/5">
                                                    {listing.media?.[0]?.url ? (
                                                        <img src={listing.media[0].url} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-xl">📦</div>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="text-white text-sm font-medium truncate">{listing.title}</div>
                                                    <div className="text-xs text-[#6a6a82] mt-0.5">{formatDate(listing.created_at)}</div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="text-[#d0d0e0] text-sm break-all">
                                                    {listing.seller?.email || 'Unknown'}
                                                </div>
                                                <div className="text-xs text-[#6a6a82] mt-0.5">{listing.seller?.display_name}</div>
                                            </td>
                                            <td className="py-4 px-4 text-white text-sm whitespace-nowrap">
                                                {formatPrice(listing.price, listing.currency)}
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className={`text-xs px-2.5 py-1 rounded-full uppercase tracking-wider
                                                    ${listing.status === 'active' ? 'bg-[#00d2a0]/20 text-[#00d2a0]' :
                                                        listing.status === 'sold' ? 'bg-blue-500/20 text-blue-400' :
                                                            listing.status === 'removed' ? 'bg-red-500/20 text-red-500' :
                                                                'bg-white/[0.05] text-[#9898b0]'}`}>
                                                    {listing.status}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-right">
                                                {confirmingDeleteListing === listing.id ? (
                                                    <div className="flex items-center justify-end gap-2 animate-fade-in">
                                                        <span className="text-xs text-red-400 font-medium mr-2">Sure?</span>
                                                        <button
                                                            onClick={() => handleDeleteListing(listing.id)}
                                                            className="text-xs px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition-colors"
                                                        >
                                                            Yes
                                                        </button>
                                                        <button
                                                            onClick={() => setConfirmingDeleteListing(null)}
                                                            className="text-xs px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-white transition-colors"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => setConfirmingDeleteListing(listing.id)}
                                                        disabled={listing.status === 'removed'}
                                                        className="text-xs px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-red-500/20 hover:border-transparent"
                                                    >
                                                        Remove
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'analytics' && (
                <div className="glass-card p-6 hover:!transform-none">
                    <h3 className="text-lg font-semibold text-white mb-4">Analytics</h3>
                    <p className="text-[#6a6a82] text-sm">Conversion funnels, revenue metrics, and user engagement data will appear here.</p>
                </div>
            )}
        </div>
    );
}
