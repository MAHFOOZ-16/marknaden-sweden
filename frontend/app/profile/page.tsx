'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { User } from '@/lib/types';
import { useAuthTokenReady } from '@/components/AuthTokenProvider';
import { useUser } from '@auth0/nextjs-auth0/client';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProfilePage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form state
    const [displayName, setDisplayName] = useState('');
    const [bio, setBio] = useState('');
    const [location, setLocation] = useState('');
    const [phone, setPhone] = useState('');
    const { user: authUser, isLoading: authLoading } = useUser();
    const isTokenReady = useAuthTokenReady();

    useEffect(() => {
        if (!isTokenReady || authLoading) return;
        api.getMe().then((u) => {
            // Merge backend data with Auth0 actual data to prevent stale display
            const mergedUser = {
                ...u,
                email: authUser?.email || u.email,
                avatar_url: authUser?.picture || u.avatar_url
            };
            setUser(mergedUser);
            setDisplayName(u.display_name || '');
            setBio(u.bio || '');
            setLocation(u.location || '');
            setPhone(u.phone || '');
        }).catch(() => { }).finally(() => setLoading(false));
    }, [isTokenReady, authUser, authLoading]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const updated = await api.updateMe({
                display_name: displayName,
                bio,
                location,
                phone
            });
            setUser({ ...updated, email: authUser?.email || updated.email });
            alert('Profile updated successfully!');
        } catch (error) {
            console.error(error);
            alert('Failed to update profile.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
                <div className="h-40 skeleton rounded-2xl" />
                <div className="h-60 skeleton rounded-2xl" />
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-white mb-8">Profile</h1>

            {/* Profile Card */}
            <div className="glass-card p-8 hover:!transform-none mb-6">
                <div className="flex items-start gap-6">
                    <div className="relative">
                        <img
                            src={user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.display_name || 'User'}`}
                            alt=""
                            className="w-24 h-24 rounded-2xl"
                        />
                        {user?.is_verified && (
                            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#6c5ce7] flex items-center justify-center">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            </div>
                        )}
                    </div>
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-white">{user?.display_name}</h2>
                        <p className="text-[#6a6a82] text-sm mt-1">{user?.email}</p>
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-3">
                            <span className="flex items-center gap-1 text-sm text-[#9898b0]">
                                ⭐ {(user?.rating || 0).toFixed(1)} ({user?.rating_count || 0} reviews)
                            </span>
                            <span className="flex items-center gap-1 text-sm text-[#9898b0]">
                                📍 {user?.location || 'Unknown location'}
                            </span>
                            {user?.phone && (
                                <motion.span
                                    initial={{ y: -50, opacity: 0, rotateX: -45 }}
                                    animate={{ y: 0, opacity: 1, rotateX: 0 }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 300,
                                        damping: 15,
                                        duration: 0.8
                                    }}
                                    className="flex items-center gap-1 text-sm text-[#9898b0] bg-white/[0.05] px-3 py-1 rounded-full border border-white/10 shadow-[0_4px_12px_rgba(0,0,0,0.3)]"
                                >
                                    📞 {user.phone}
                                </motion.span>
                            )}
                        </div>
                        {user?.bio && <p className="text-sm text-[#9898b0] mt-3 bg-white/[0.03] p-3 rounded-xl border border-white/[0.05]">{user.bio}</p>}
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {[
                    { label: 'Listings', value: (user?.listings_count || 0).toString(), icon: '📦' },
                    { label: 'Sold', value: (user?.sold_count || 0).toString(), icon: '✅' },
                    { label: 'Rating', value: (user?.rating || 0).toFixed(1), icon: '⭐' },
                    { label: 'Member Since', value: user?.created_at ? new Date(user.created_at).getFullYear().toString() : '2024', icon: '📅' },
                ].map(stat => (
                    <div key={stat.label} className="glass-card p-5 text-center hover:!transform-none">
                        <div className="text-2xl mb-2">{stat.icon}</div>
                        <div className="text-xl font-bold text-white">{stat.value}</div>
                        <div className="text-xs text-[#6a6a82] mt-1">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Edit Profile */}
            <div className="glass-card p-6 hover:!transform-none">
                <h3 className="text-lg font-semibold text-white mb-4">Edit Profile</h3>
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-[#9898b0] block mb-2">Display Name</label>
                        <input
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            className="input-field"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-[#9898b0] block mb-2">Bio</label>
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            className="input-field min-h-[80px] resize-y"
                            placeholder="Tell buyers about yourself..."
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-[#9898b0] block mb-2">Location</label>
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="input-field"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-[#9898b0] block mb-2">Phone</label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+46 70 123 4567"
                            className="input-field"
                        />
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="btn-primary"
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
}
