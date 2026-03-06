import Link from 'next/link';

export function Footer() {
    return (
        <footer className="border-t border-white/[0.06] mt-20" style={{ background: 'var(--bg-secondary)' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="col-span-2 md:col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6c5ce7] to-[#a29bfe] flex items-center justify-center">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                                    <line x1="3" y1="6" x2="21" y2="6" />
                                    <path d="M16 10a4 4 0 01-8 0" />
                                </svg>
                            </div>
                            <span className="text-lg font-bold gradient-text">Marknaden</span>
                        </div>
                        <p className="text-sm text-[#6a6a82] leading-relaxed">
                            Sweden&apos;s next-gen marketplace. Buy and sell with trust, speed, and delight.
                        </p>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="text-sm font-semibold text-white mb-3">Browse</h4>
                        <div className="flex flex-col gap-2">
                            <Link href="/listings?category=electronics" className="text-sm text-[#6a6a82] hover:text-white transition-colors">Electronics</Link>
                            <Link href="/listings?category=furniture" className="text-sm text-[#6a6a82] hover:text-white transition-colors">Furniture</Link>
                            <Link href="/listings?category=vehicles" className="text-sm text-[#6a6a82] hover:text-white transition-colors">Vehicles</Link>
                            <Link href="/listings?category=fashion" className="text-sm text-[#6a6a82] hover:text-white transition-colors">Fashion</Link>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-sm font-semibold text-white mb-3">Company</h4>
                        <div className="flex flex-col gap-2">
                            <Link href="#" className="text-sm text-[#6a6a82] hover:text-white transition-colors">About</Link>
                            <Link href="#" className="text-sm text-[#6a6a82] hover:text-white transition-colors">Safety</Link>
                            <Link href="#" className="text-sm text-[#6a6a82] hover:text-white transition-colors">Careers</Link>
                            <Link href="#" className="text-sm text-[#6a6a82] hover:text-white transition-colors">Contact</Link>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-sm font-semibold text-white mb-3">Legal</h4>
                        <div className="flex flex-col gap-2">
                            <Link href="#" className="text-sm text-[#6a6a82] hover:text-white transition-colors">Terms</Link>
                            <Link href="#" className="text-sm text-[#6a6a82] hover:text-white transition-colors">Privacy</Link>
                            <Link href="#" className="text-sm text-[#6a6a82] hover:text-white transition-colors">Cookies</Link>
                            <Link href="#" className="text-sm text-[#6a6a82] hover:text-white transition-colors">GDPR</Link>
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/[0.06] mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-[#6a6a82]">&copy; 2026 Marknaden. All rights reserved.</p>
                    <div className="flex items-center gap-4">
                        <span className="text-xs text-[#6a6a82]">Made with ❤️ in Sweden</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
