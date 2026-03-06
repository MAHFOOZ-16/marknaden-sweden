'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { api } from '@/lib/api';
import { useAuthTokenReady } from '@/components/AuthTokenProvider';

export function Navbar() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const { user, isLoading } = useUser();
    const isTokenReady = useAuthTokenReady();
    const [isAdmin, setIsAdmin] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    // Check if user is admin and fetch unread msgs
    useEffect(() => {
        if (user && isTokenReady) {
            api.getMe()
                .then(me => setIsAdmin(me.role === 'admin'))
                .catch(() => setIsAdmin(false));

            const fetchUnread = () => {
                api.getUnreadMessageCount()
                    .then(res => setUnreadCount(res.count))
                    .catch(() => { });
            };
            fetchUnread();
            const interval = setInterval(fetchUnread, 5000);
            return () => clearInterval(interval);
        } else if (!user && !isLoading) {
            setIsAdmin(false);
            setUnreadCount(0);
        }
    }, [user, isTokenReady, isLoading]);

    return (
        <nav className="sticky top-0 z-50 border-b border-white/[0.06]" style={{ background: 'rgba(10,10,15,0.85)', backdropFilter: 'blur(20px)' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6c5ce7] to-[#a29bfe] flex items-center justify-center transition-transform group-hover:scale-110">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                                <line x1="3" y1="6" x2="21" y2="6" />
                                <path d="M16 10a4 4 0 01-8 0" />
                            </svg>
                        </div>
                        <span className="text-xl font-bold gradient-text">Marknaden</span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-1">
                        <Link href="/listings" className="px-4 py-2 text-sm text-[#9898b0] hover:text-white rounded-lg transition-colors hover:bg-white/[0.05]">
                            Browse
                        </Link>
                        {user && (
                            <>
                                <Link href="/my-listings" className="px-4 py-2 text-sm text-[#9898b0] hover:text-white rounded-lg transition-colors hover:bg-white/[0.05]">
                                    My Listings
                                </Link>
                                <Link href="/favorites" className="px-4 py-2 text-sm text-[#9898b0] hover:text-white rounded-lg transition-colors hover:bg-white/[0.05]">
                                    Favorites
                                </Link>
                                <Link href="/chat" className="relative px-4 py-2 text-sm text-[#9898b0] hover:text-white rounded-lg transition-colors hover:bg-white/[0.05]">
                                    Messages
                                    {unreadCount > 0 && (
                                        <span className="absolute top-0 right-1 flex items-center justify-center min-w-[16px] h-[16px] text-[10px] font-bold text-white bg-red-500 rounded-full px-1">
                                            {unreadCount > 99 ? '99+' : unreadCount}
                                        </span>
                                    )}
                                </Link>
                            </>
                        )}
                        {isAdmin && (
                            <Link href="/admin" className="px-4 py-2 text-sm text-[#a29bfe] hover:text-white rounded-lg transition-colors hover:bg-[#6c5ce7]/10">
                                Admin
                            </Link>
                        )}
                    </div>

                    {/* Right side */}
                    <div className="hidden md:flex items-center gap-3">
                        {isLoading ? (
                            <div className="w-9 h-9 rounded-full skeleton" />
                        ) : user ? (
                            <>
                                <Link href="/sell" className="btn-primary text-sm !py-2.5 !px-5">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                                    </svg>
                                    Sell Item
                                </Link>
                                <div className="relative group">
                                    <button className="w-9 h-9 rounded-full bg-gradient-to-br from-[#6c5ce7] to-[#a29bfe] flex items-center justify-center text-white text-sm font-bold hover:scale-105 transition-transform overflow-hidden">
                                        {user.picture ? (
                                            <img src={user.picture} alt={user.name || ''} className="w-full h-full object-cover" />
                                        ) : (
                                            (user.name?.[0] || user.email?.[0] || 'U').toUpperCase()
                                        )}
                                    </button>
                                    {/* Dropdown */}
                                    <div className="absolute right-0 mt-2 w-56 py-2 glass-card !rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                        <div className="px-4 py-2 border-b border-white/[0.06]">
                                            <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                                            <p className="text-xs text-[#6a6a82] truncate">{user.email}</p>
                                        </div>
                                        <Link href="/profile" className="block px-4 py-2 text-sm text-[#9898b0] hover:text-white hover:bg-white/[0.05] transition-colors">
                                            👤 Profile
                                        </Link>
                                        <Link href="/my-listings" className="block px-4 py-2 text-sm text-[#9898b0] hover:text-white hover:bg-white/[0.05] transition-colors">
                                            📦 My Listings
                                        </Link>
                                        <Link href="/favorites" className="block px-4 py-2 text-sm text-[#9898b0] hover:text-white hover:bg-white/[0.05] transition-colors">
                                            ❤️ Favorites
                                        </Link>
                                        {isAdmin && (
                                            <Link href="/admin" className="block px-4 py-2 text-sm text-[#a29bfe] hover:text-white hover:bg-[#6c5ce7]/10 transition-colors">
                                                🔒 Admin Dashboard
                                            </Link>
                                        )}
                                        <a href="/auth/logout" className="block px-4 py-2 text-sm text-[#ff4757] hover:bg-white/[0.05] transition-colors">
                                            🚪 Sign Out
                                        </a>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <a href="/auth/login?returnTo=/profile" className="btn-primary text-sm !py-2.5 !px-5">
                                Sign In
                            </a>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-[#9898b0] hover:text-white">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            {mobileOpen ? <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></> : <><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></>}
                        </svg>
                    </button>
                </div>

                {/* Mobile menu */}
                {mobileOpen && (
                    <div className="md:hidden pb-4 animate-fade-in">
                        <div className="flex flex-col gap-1">
                            <Link href="/listings" onClick={() => setMobileOpen(false)} className="px-4 py-3 text-sm text-[#9898b0] hover:text-white rounded-lg transition-colors hover:bg-white/[0.05]">Browse</Link>
                            {user && (
                                <>
                                    <Link href="/my-listings" onClick={() => setMobileOpen(false)} className="px-4 py-3 text-sm text-[#9898b0] hover:text-white rounded-lg transition-colors hover:bg-white/[0.05]">My Listings</Link>
                                    <Link href="/favorites" onClick={() => setMobileOpen(false)} className="px-4 py-3 text-sm text-[#9898b0] hover:text-white rounded-lg transition-colors hover:bg-white/[0.05]">Favorites</Link>
                                    <Link href="/chat" onClick={() => setMobileOpen(false)} className="px-4 py-3 text-sm text-[#9898b0] hover:text-white rounded-lg transition-colors hover:bg-white/[0.05] flex justify-between items-center">
                                        <span>Messages</span>
                                        {unreadCount > 0 && (
                                            <span className="flex items-center justify-center min-w-[20px] h-[20px] text-xs font-bold text-white bg-red-500 rounded-full px-1.5">
                                                {unreadCount > 99 ? '99+' : unreadCount}
                                            </span>
                                        )}
                                    </Link>
                                    <Link href="/sell" onClick={() => setMobileOpen(false)} className="btn-primary text-sm mt-2 justify-center">Sell Item</Link>
                                </>
                            )}
                            {isAdmin && (
                                <Link href="/admin" onClick={() => setMobileOpen(false)} className="px-4 py-3 text-sm text-[#a29bfe] hover:text-white rounded-lg transition-colors hover:bg-[#6c5ce7]/10">Admin Dashboard</Link>
                            )}
                            {!user && !isLoading && (
                                <a href="/auth/login?returnTo=/profile" className="btn-primary text-sm mt-2 justify-center">Sign In</a>
                            )}
                            {user && (
                                <a href="/auth/logout" className="px-4 py-3 text-sm text-[#ff4757] rounded-lg hover:bg-white/[0.05]">Sign Out</a>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
