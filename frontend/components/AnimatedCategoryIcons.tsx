'use client';

import { motion } from 'framer-motion';

interface IconProps {
    isHovered: boolean;
    className?: string;
}

/* ─── Electronics: Laptop opens its lid smoothly ─── */
export function LaptopIcon({ isHovered, className = 'w-full h-full' }: IconProps) {
    return (
        <svg viewBox="0 0 120 100" className={className} fill="none">
            {/* Base / keyboard */}
            <rect x="25" y="62" width="70" height="6" rx="2" fill="#334155" />
            <rect x="30" y="56" width="60" height="10" rx="3" fill="#475569" />
            {/* Keyboard dots */}
            {[0, 1, 2, 3, 4].map(i => (
                <rect key={i} x={38 + i * 10} y={59} width={6} height={2} rx={1} fill="#64748b" />
            ))}
            {/* Trackpad */}
            <rect x="50" y="63" width="20" height="3" rx="1" fill="#64748b" />

            {/* Screen – pivots from bottom edge */}
            <motion.g
                style={{ originX: '60px', originY: '56px' }}
                animate={{
                    rotateX: isHovered ? -55 : 0,
                }}
                transition={{ type: 'spring', stiffness: 120, damping: 14 }}
            >
                <rect x="30" y="18" width="60" height="38" rx="3" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
                {/* Screen glow */}
                <motion.rect
                    x="34" y="22" width="52" height="30" rx="2"
                    animate={{
                        fill: isHovered ? '#38bdf8' : '#1e293b',
                        opacity: isHovered ? 1 : 0.3,
                    }}
                    transition={{ delay: isHovered ? 0.25 : 0, duration: 0.4 }}
                />
                {/* Apple-style logo dot */}
                <motion.circle
                    cx="60" cy="37" r="3"
                    fill="#fff"
                    animate={{ opacity: isHovered ? 0.9 : 0.15 }}
                    transition={{ delay: isHovered ? 0.35 : 0 }}
                />
                {/* Screen content lines */}
                {isHovered && [0, 1, 2].map(i => (
                    <motion.rect
                        key={i} x={40} y={26 + i * 6} width={32 - i * 6} height={2} rx={1}
                        fill="#fff" initial={{ opacity: 0, scaleX: 0 }}
                        animate={{ opacity: 0.6, scaleX: 1 }}
                        transition={{ delay: 0.4 + i * 0.1 }}
                    />
                ))}
            </motion.g>

            {/* Screen reflection glow beneath */}
            <motion.ellipse
                cx="60" cy="72" rx="35" ry="6"
                fill="#38bdf8"
                animate={{ opacity: isHovered ? 0.15 : 0 }}
                transition={{ duration: 0.4 }}
            />
        </svg>
    );
}

/* ─── Furniture: Upright floor lamp illuminates a sofa ─── */
export function FurnitureIcon({ isHovered, className = 'w-full h-full' }: IconProps) {
    return (
        <svg viewBox="0 0 120 100" className={className} fill="none">
            {/* Floor */}
            <line x1="10" y1="85" x2="110" y2="85" stroke="#334155" strokeWidth="1" />

            {/* Sofa */}
            <rect x="10" y="60" width="55" height="22" rx="6" fill="#7c3aed" />
            <rect x="14" y="52" width="20" height="14" rx="4" fill="#6d28d9" />
            <rect x="38" y="52" width="20" height="14" rx="4" fill="#6d28d9" />
            {/* Armrests */}
            <rect x="5" y="55" width="10" height="22" rx="5" fill="#5b21b6" />
            <rect x="60" y="55" width="10" height="22" rx="5" fill="#5b21b6" />
            {/* Sofa legs */}
            <rect x="14" y="82" width="4" height="4" rx="1" fill="#475569" />
            <rect x="56" y="82" width="4" height="4" rx="1" fill="#475569" />

            {/* Lamp pole */}
            <line x1="92" y1="84" x2="92" y2="30" stroke="#94a3b8" strokeWidth="2.5" />
            {/* Lamp base */}
            <ellipse cx="92" cy="84" rx="10" ry="3" fill="#64748b" />

            {/* Lamp shade (faces DOWN — wide end at bottom) */}
            <path d="M82 22 L102 22 L106 36 L78 36Z" fill="#f59e0b" />
            <rect x="82" y="20" width="20" height="4" rx="2" fill="#d97706" />

            {/* Light cone (shines DOWNWARD from shade) */}
            <motion.path
                d="M78 36 L60 80 L124 80 L106 36Z"
                fill="url(#lampLight)"
                animate={{ opacity: isHovered ? 1 : 0 }}
                transition={{ duration: 0.5 }}
            />

            {/* Warm glow on floor */}
            <motion.ellipse
                cx="92" cy="82" rx="28" ry="5"
                fill="#fbbf24"
                animate={{ opacity: isHovered ? 0.25 : 0 }}
                transition={{ duration: 0.5 }}
            />

            <defs>
                <linearGradient id="lampLight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
                </linearGradient>
            </defs>
        </svg>
    );
}

/* ─── Vehicles: Car cruises with tyre smoke ─── */
export function CarIcon({ isHovered, className = 'w-full h-full' }: IconProps) {
    return (
        <svg viewBox="0 0 130 100" className={className} fill="none">
            {/* Road */}
            <motion.g
                animate={isHovered ? { x: [0, -30] } : { x: 0 }}
                transition={isHovered ? { duration: 0.8, repeat: Infinity, ease: 'linear' } : {}}
            >
                {[0, 1, 2, 3, 4, 5, 6].map(i => (
                    <rect key={i} x={-10 + i * 25} y={78} width={14} height={2} rx={1} fill="#475569" />
                ))}
            </motion.g>
            <line x1="0" y1="76" x2="130" y2="76" stroke="#334155" strokeWidth="1" />

            {/* Exhaust smoke puffs */}
            {[0, 1, 2, 3].map(i => (
                <motion.circle
                    key={i}
                    cx="18" cy="68" r={3 + i}
                    fill="#94a3b8"
                    initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
                    animate={isHovered ? {
                        opacity: [0, 0.5, 0],
                        x: -(12 + i * 14),
                        y: -(4 + i * 8),
                        scale: [0.3, 1, 1.8],
                    } : { opacity: 0, scale: 0 }}
                    transition={isHovered ? {
                        duration: 1.6,
                        repeat: Infinity,
                        delay: i * 0.35,
                        ease: 'easeOut',
                    } : { duration: 0 }}
                />
            ))}

            {/* Car body */}
            <motion.g
                animate={isHovered ? {
                    y: [0, -1.5, 0, -1, 0],
                } : { y: 0 }}
                transition={isHovered ? { duration: 0.5, repeat: Infinity } : {}}
            >
                {/* Cabin / windshield */}
                <path d="M50 42 L62 28 L88 28 L98 42Z" fill="#0ea5e9" />
                <path d="M54 42 L64 30 L86 30 L94 42Z" fill="#0c4a6e" opacity="0.7" />
                {/* Body */}
                <path d="M25 42 L105 42 L108 58 Q108 66 100 66 L30 66 Q22 66 22 58Z" fill="#0ea5e9" />
                {/* Lower trim */}
                <rect x="28" y="60" width="74" height="4" rx="2" fill="#0284c7" />
                {/* Headlight */}
                <motion.rect
                    x="102" y="48" width="6" height="8" rx="2"
                    fill="#fbbf24"
                    animate={{ opacity: isHovered ? [0.6, 1, 0.6] : 0.4 }}
                    transition={isHovered ? { duration: 0.8, repeat: Infinity } : {}}
                />
                {/* Tail light */}
                <rect x="22" y="48" width="4" height="6" rx="1" fill="#ef4444" />
                {/* Wheels */}
                <circle cx="42" cy="68" r="9" fill="#1e293b" stroke="#64748b" strokeWidth="2" />
                <circle cx="42" cy="68" r="4" fill="#475569" />
                <circle cx="88" cy="68" r="9" fill="#1e293b" stroke="#64748b" strokeWidth="2" />
                <circle cx="88" cy="68" r="4" fill="#475569" />
                {/* Spinning wheel spokes */}
                <motion.g
                    style={{ originX: '42px', originY: '68px' }}
                    animate={isHovered ? { rotate: 360 } : { rotate: 0 }}
                    transition={isHovered ? { duration: 0.5, repeat: Infinity, ease: 'linear' } : {}}
                >
                    <line x1="42" y1="62" x2="42" y2="74" stroke="#94a3b8" strokeWidth="1" />
                    <line x1="36" y1="68" x2="48" y2="68" stroke="#94a3b8" strokeWidth="1" />
                </motion.g>
                <motion.g
                    style={{ originX: '88px', originY: '68px' }}
                    animate={isHovered ? { rotate: 360 } : { rotate: 0 }}
                    transition={isHovered ? { duration: 0.5, repeat: Infinity, ease: 'linear' } : {}}
                >
                    <line x1="88" y1="62" x2="88" y2="74" stroke="#94a3b8" strokeWidth="1" />
                    <line x1="82" y1="68" x2="94" y2="68" stroke="#94a3b8" strokeWidth="1" />
                </motion.g>

                {/* Headlight beam */}
                <motion.path
                    d="M108 48 L130 38 L130 62 L108 56Z"
                    fill="#fbbf24"
                    animate={{ opacity: isHovered ? 0.2 : 0 }}
                    transition={{ duration: 0.3 }}
                />
            </motion.g>
        </svg>
    );
}

/* ─── Fashion: Elegant dress with sparkle reveal ─── */
export function FashionIcon({ isHovered, className = 'w-full h-full' }: IconProps) {
    return (
        <svg viewBox="0 0 120 100" className={className} fill="none">
            {/* Dress form */}
            <motion.g
                animate={isHovered ? { y: [0, -3, 0] } : { y: 0 }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
            >
                {/* Neckline */}
                <path d="M52 18 Q60 24 68 18" stroke="#c084fc" strokeWidth="2" fill="none" />
                {/* Bodice */}
                <path d="M44 22 L52 18 Q60 24 68 18 L76 22 L74 48 L46 48Z" fill="#a855f7" />
                {/* Waist sash */}
                <rect x="44" y="46" width="32" height="4" rx="2" fill="#7c3aed" />
                {/* Skirt – flared A-line */}
                <path d="M44 50 L32 82 Q60 88 88 82 L76 50Z" fill="#a855f7" />
                {/* Skirt flow lines */}
                <path d="M50 50 L42 80" stroke="#c084fc" strokeWidth="1" opacity="0.4" />
                <path d="M60 50 L60 84" stroke="#c084fc" strokeWidth="1" opacity="0.4" />
                <path d="M70 50 L78 80" stroke="#c084fc" strokeWidth="1" opacity="0.4" />
                {/* Collar detail */}
                <circle cx="60" cy="18" r="2" fill="#e9d5ff" />
            </motion.g>

            {/* Sparkles on hover */}
            {[
                { x: 38, y: 30, delay: 0 },
                { x: 82, y: 40, delay: 0.2 },
                { x: 30, y: 65, delay: 0.4 },
                { x: 90, y: 60, delay: 0.6 },
                { x: 50, y: 12, delay: 0.3 },
                { x: 70, y: 85, delay: 0.5 },
            ].map((s, i) => (
                <motion.g key={i}>
                    <motion.path
                        d={`M${s.x} ${s.y - 4} L${s.x + 1.5} ${s.y} L${s.x} ${s.y + 4} L${s.x - 1.5} ${s.y}Z`}
                        fill="#fbbf24"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={isHovered ? {
                            opacity: [0, 1, 0],
                            scale: [0, 1.5, 0],
                        } : { opacity: 0, scale: 0 }}
                        transition={isHovered ? {
                            duration: 1.2,
                            repeat: Infinity,
                            delay: s.delay,
                        } : { duration: 0 }}
                    />
                </motion.g>
            ))}

            {/* Hanger */}
            <path d="M48 14 Q60 4 72 14" stroke="#94a3b8" strokeWidth="2" fill="none" />
            <circle cx="60" cy="6" r="3" stroke="#94a3b8" strokeWidth="1.5" fill="none" />
        </svg>
    );
}

/* ─── Sports: Footballer kicking a ball ─── */
export function SportIcon({ isHovered, className = 'w-full h-full' }: IconProps) {
    return (
        <svg viewBox="0 0 120 100" className={className} fill="none">
            {/* Ground */}
            <line x1="10" y1="88" x2="110" y2="88" stroke="#334155" strokeWidth="1" />

            {/* Person body */}
            {/* Head */}
            <circle cx="52" cy="22" r="8" fill="#f59e0b" />
            {/* Body */}
            <line x1="52" y1="30" x2="52" y2="56" stroke="#f59e0b" strokeWidth="3" />
            {/* Arms – one back, one forward for momentum */}
            <motion.line
                x1="52" y1="38" x2="38" y2="48"
                stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round"
                animate={isHovered ? { x2: [38, 34, 38], y2: [48, 42, 48] } : {}}
                transition={{ duration: 0.6, repeat: Infinity }}
            />
            <motion.line
                x1="52" y1="38" x2="66" y2="44"
                stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round"
                animate={isHovered ? { x2: [66, 70, 66], y2: [44, 38, 44] } : {}}
                transition={{ duration: 0.6, repeat: Infinity }}
            />
            {/* Standing leg */}
            <line x1="52" y1="56" x2="46" y2="86" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
            {/* Kicking leg */}
            <motion.g>
                <motion.line
                    x1="52" y1="56" x2="68" y2="72"
                    stroke="#f59e0b" strokeWidth="3" strokeLinecap="round"
                    animate={isHovered ? { x2: [58, 74, 58], y2: [76, 64, 76] } : {}}
                    transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut' }}
                />
                {/* Foot */}
                <motion.line
                    x1="68" y1="72" x2="74" y2="74"
                    stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round"
                    animate={isHovered ? {
                        x1: [58, 74, 58], y1: [76, 64, 76],
                        x2: [64, 82, 64], y2: [78, 66, 78],
                    } : {}}
                    transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut' }}
                />
            </motion.g>

            {/* Football */}
            <motion.g
                animate={isHovered ? {
                    x: [0, 30, 40],
                    y: [0, -35, 5],
                    rotate: [0, 360, 720],
                } : { x: 0, y: 0, rotate: 0 }}
                transition={isHovered ? { duration: 1.2, repeat: Infinity, ease: 'easeOut' } : { duration: 0.4 }}
            >
                <circle cx="78" cy="74" r="7" fill="#fff" stroke="#1e293b" strokeWidth="1.5" />
                {/* Pentagon pattern */}
                <path d="M78 68 L81 71 L80 75 L76 75 L75 71Z" fill="#1e293b" />
            </motion.g>

            {/* Impact lines on kick */}
            {[0, 1, 2].map(i => (
                <motion.line
                    key={i}
                    x1={82 + i * 4} y1={70 - i * 3} x2={86 + i * 4} y2={68 - i * 3}
                    stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round"
                    initial={{ opacity: 0, pathLength: 0 }}
                    animate={isHovered ? {
                        opacity: [0, 1, 0],
                        pathLength: [0, 1, 0],
                    } : { opacity: 0 }}
                    transition={isHovered ? {
                        duration: 0.6,
                        repeat: Infinity,
                        delay: i * 0.1,
                    } : {}}
                />
            ))}
        </svg>
    );
}

/* ─── Home & Garden: Cozy house with chimney smoke & lit windows ─── */
export function HomeIcon({ isHovered, className = 'w-full h-full' }: IconProps) {
    return (
        <svg viewBox="0 0 120 100" className={className} fill="none">
            {/* House body */}
            <rect x="30" y="48" width="60" height="38" rx="2" fill="#334155" />
            {/* Roof */}
            <path d="M24 50 L60 20 L96 50Z" fill="#ef4444" />
            {/* Chimney */}
            <rect x="76" y="26" width="10" height="18" fill="#475569" />

            {/* Chimney smoke */}
            {[0, 1, 2].map(i => (
                <motion.circle
                    key={i}
                    cx="81" cy="24" r={2 + i}
                    fill="#94a3b8"
                    initial={{ opacity: 0, y: 0, scale: 0 }}
                    animate={isHovered ? {
                        opacity: [0, 0.5, 0],
                        y: [0, -(12 + i * 12)],
                        x: [0, 4 + i * 2],
                        scale: [0.3, 1 + i * 0.4],
                    } : { opacity: 0 }}
                    transition={isHovered ? {
                        duration: 2.5,
                        repeat: Infinity,
                        delay: i * 0.8,
                    } : {}}
                />
            ))}

            {/* Door */}
            <rect x="52" y="64" width="16" height="22" rx="8" fill="#1e293b" />
            <circle cx="64" cy="76" r="1.5" fill="#fbbf24" />

            {/* Windows */}
            <motion.rect
                x="36" y="56" width="12" height="10" rx="1"
                animate={{ fill: isHovered ? '#fbbf24' : '#0ea5e9' }}
                transition={{ duration: 0.5 }}
            />
            <motion.rect
                x="72" y="56" width="12" height="10" rx="1"
                animate={{ fill: isHovered ? '#fbbf24' : '#0ea5e9' }}
                transition={{ duration: 0.5, delay: 0.2 }}
            />
            {/* Window cross bars */}
            <line x1="42" y1="56" x2="42" y2="66" stroke="#334155" strokeWidth="1" />
            <line x1="36" y1="61" x2="48" y2="61" stroke="#334155" strokeWidth="1" />
            <line x1="78" y1="56" x2="78" y2="66" stroke="#334155" strokeWidth="1" />
            <line x1="72" y1="61" x2="84" y2="61" stroke="#334155" strokeWidth="1" />

            {/* Window glow on ground */}
            <motion.rect
                x="34" y="66" width="16" height="8" rx="1"
                fill="#fbbf24"
                animate={{ opacity: isHovered ? 0.15 : 0 }}
                transition={{ duration: 0.5 }}
            />
        </svg>
    );
}

/* ─── Books & Media: Open book with turning pages + headphones with sound ─── */
export function BookIcon({ isHovered, className = 'w-full h-full' }: IconProps) {

    return (
        <svg viewBox="0 0 140 100" className={className} fill="none">
            {/* Book shadow */}
            <ellipse cx="48" cy="84" rx="36" ry="5" fill="#1e293b" opacity="0.4" />

            {/* Left cover (dark navy) */}
            <path d="M48 20 L12 26 L12 78 L48 84Z" fill="#1e3a5f" stroke="#2563eb" strokeWidth="1" />
            {/* Left page (cream) */}
            <path d="M48 22 L16 27 L16 76 L48 82Z" fill="#fef3c7" />
            {/* Left page text lines */}
            {[0, 1, 2, 3, 4].map(i => (
                <line key={`lt${i}`} x1="22" y1={34 + i * 9} x2="42" y2={32 + i * 9} stroke="#d97706" strokeWidth="1" opacity="0.35" />
            ))}

            {/* Right cover (dark navy) */}
            <path d="M48 20 L84 26 L84 78 L48 84Z" fill="#1e3a5f" stroke="#2563eb" strokeWidth="1" />
            {/* Right page (cream) */}
            <path d="M48 22 L80 27 L80 76 L48 82Z" fill="#fefce8" />
            {/* Right page text lines */}
            {[0, 1, 2, 3, 4].map(i => (
                <line key={`rt${i}`} x1="54" y1={32 + i * 9} x2="74" y2={34 + i * 9} stroke="#d97706" strokeWidth="1" opacity="0.3" />
            ))}

            {/* Spine */}
            <line x1="48" y1="20" x2="48" y2="84" stroke="#1d4ed8" strokeWidth="2.5" />

            {/* Animated turning pages — vivid gold/orange/red arcing right to left */}
            {[0, 1, 2].map(i => (
                <motion.rect
                    key={`turnpage${i}`}
                    rx="1"
                    fill={i === 0 ? '#fbbf24' : i === 1 ? '#fb923c' : '#f87171'}
                    stroke={i === 0 ? '#f59e0b' : i === 1 ? '#ea580c' : '#ef4444'}
                    strokeWidth="1"
                    initial={{ x: 49, y: 24, width: 30, height: 56, opacity: 0 }}
                    animate={isHovered ? {
                        x: [49, 49, 40, 18, 18, 49],
                        y: [24, 10, 4, 10, 24, 24],
                        width: [30, 16, 4, 16, 30, 30],
                        height: [56, 48, 40, 48, 56, 56],
                        opacity: [0.9, 0.9, 0.7, 0.9, 0.9, 0],
                    } : { x: 49, y: 24, width: 30, height: 56, opacity: 0 }}
                    transition={isHovered ? {
                        duration: 1.6,
                        repeat: Infinity,
                        delay: i * 0.45,
                        ease: 'easeInOut',
                        times: [0, 0.2, 0.4, 0.6, 0.8, 1],
                    } : { duration: 0.2 }}
                />
            ))}

            {/* Headphones */}
            <path d="M100 58 Q100 36 112 36 Q124 36 124 58" stroke="#64748b" strokeWidth="3" fill="none" strokeLinecap="round" />
            <rect x="96" y="56" width="10" height="16" rx="4" fill="#475569" />
            <rect x="94" y="58" width="6" height="12" rx="3" fill="#334155" />
            <rect x="118" y="56" width="10" height="16" rx="4" fill="#475569" />
            <rect x="124" y="58" width="6" height="12" rx="3" fill="#334155" />

            {/* Sound waves */}
            {[0, 1, 2].map(i => (
                <motion.path
                    key={`lw${i}`}
                    d={`M92 ${64 - i * 4} Q${86 - i * 4} ${64} ${92} ${64 + i * 4}`}
                    stroke="#38bdf8" strokeWidth="1.5" fill="none" strokeLinecap="round"
                    initial={{ opacity: 0, pathLength: 0 }}
                    animate={isHovered ? { opacity: [0, 0.8, 0], pathLength: [0, 1, 1] } : { opacity: 0 }}
                    transition={isHovered ? { duration: 1.5, repeat: Infinity, delay: i * 0.3 } : {}}
                />
            ))}
            {[0, 1, 2].map(i => (
                <motion.path
                    key={`rw${i}`}
                    d={`M132 ${64 - i * 4} Q${138 + i * 4} ${64} ${132} ${64 + i * 4}`}
                    stroke="#38bdf8" strokeWidth="1.5" fill="none" strokeLinecap="round"
                    initial={{ opacity: 0, pathLength: 0 }}
                    animate={isHovered ? { opacity: [0, 0.8, 0], pathLength: [0, 1, 1] } : { opacity: 0 }}
                    transition={isHovered ? { duration: 1.5, repeat: Infinity, delay: i * 0.3 } : {}}
                />
            ))}

            {/* Music notes */}
            {[{ x: 108, delay: 0 }, { x: 116, delay: 0.6 }].map((n, i) => (
                <motion.text
                    key={i} x={n.x} y="52" fontSize="10" fill="#a78bfa"
                    initial={{ opacity: 0, y: 0 }}
                    animate={isHovered ? { opacity: [0, 1, 0], y: [0, -18, -28], x: [0, (i % 2 === 0 ? 5 : -5)] } : { opacity: 0 }}
                    transition={isHovered ? { duration: 2, repeat: Infinity, delay: n.delay } : {}}
                >♪</motion.text>
            ))}

            <motion.ellipse cx="70" cy="90" rx="50" ry="4" fill="#38bdf8" animate={{ opacity: isHovered ? 0.1 : 0 }} />
        </svg>
    );
}

/* ─── Garden & Plants: Flower grows and blooms from pot ─── */
export function GardenIcon({ isHovered, className = 'w-full h-full' }: IconProps) {
    return (
        <svg viewBox="0 0 120 100" className={className} fill="none">
            {/* Pot */}
            <path d="M40 62 L80 62 L74 88 L46 88Z" fill="#dc2626" />
            <rect x="36" y="56" width="48" height="8" rx="3" fill="#ef4444" />

            {/* Stem */}
            <motion.line
                x1="60" y1="56" x2="60" y2="24"
                stroke="#22c55e" strokeWidth="3" strokeLinecap="round"
                initial={{ pathLength: isHovered ? 0 : 1 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.6 }}
            />

            {/* Leaves */}
            <motion.path
                d="M60 44 Q48 36 52 28"
                stroke="#22c55e" strokeWidth="2.5" fill="none" strokeLinecap="round"
                animate={isHovered ? { pathLength: [0, 1] } : { pathLength: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
            />
            <motion.path
                d="M60 38 Q72 30 68 22"
                stroke="#22c55e" strokeWidth="2.5" fill="none" strokeLinecap="round"
                animate={isHovered ? { pathLength: [0, 1] } : { pathLength: 1 }}
                transition={{ duration: 0.5, delay: 0.45 }}
            />

            {/* Flower head */}
            <motion.g
                animate={isHovered ? {
                    scale: [0, 1.2, 1],
                    rotate: [0, 20, 0],
                } : { scale: 1, rotate: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                style={{ originX: '60px', originY: '20px' }}
            >
                {[0, 60, 120, 180, 240, 300].map(angle => (
                    <ellipse
                        key={angle}
                        cx="60" cy="12" rx="5" ry="9"
                        fill="#fbbf24"
                        transform={`rotate(${angle} 60 20)`}
                    />
                ))}
                <circle cx="60" cy="20" r="5" fill="#f59e0b" />
            </motion.g>

            {/* Sparkle particles */}
            {[
                { x: 42, y: 20, delay: 0.5 },
                { x: 78, y: 28, delay: 0.7 },
                { x: 46, y: 42, delay: 0.6 },
            ].map((s, i) => (
                <motion.circle
                    key={i} cx={s.x} cy={s.y} r="2" fill="#86efac"
                    animate={isHovered ? { opacity: [0, 1, 0], scale: [0, 1, 0] } : { opacity: 0 }}
                    transition={isHovered ? { duration: 1, repeat: Infinity, delay: s.delay } : {}}
                />
            ))}
        </svg>
    );
}

/* ─── Kids & Baby: Rocking horse toy ─── */
export function KidsIcon({ isHovered, className = 'w-full h-full' }: IconProps) {
    return (
        <svg viewBox="0 0 120 100" className={className} fill="none">
            {/* Rocker base */}
            <motion.g
                animate={isHovered ? { rotate: [-6, 6, -6] } : { rotate: 0 }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                style={{ originX: '60px', originY: '82px' }}
            >
                {/* Curved rocker */}
                <path d="M20 82 Q60 92 100 82" stroke="#94a3b8" strokeWidth="3" fill="none" />
                {/* Legs */}
                <line x1="40" y1="78" x2="40" y2="62" stroke="#d97706" strokeWidth="3" />
                <line x1="80" y1="78" x2="80" y2="62" stroke="#d97706" strokeWidth="3" />
                {/* Seat */}
                <rect x="34" y="56" width="52" height="8" rx="3" fill="#f59e0b" />
                {/* Horse body */}
                <ellipse cx="60" cy="48" rx="22" ry="12" fill="#f59e0b" />
                {/* Horse neck */}
                <path d="M78 44 L88 28 L84 26 L76 40" fill="#d97706" />
                {/* Horse head */}
                <circle cx="88" cy="24" r="8" fill="#f59e0b" />
                <circle cx="91" cy="22" r="1.5" fill="#1e293b" />
                {/* Ears */}
                <path d="M84 18 L86 12 L88 18" fill="#d97706" />
                {/* Mane */}
                <path d="M82 20 Q78 26 80 34" stroke="#d97706" strokeWidth="2" fill="none" />
                {/* Tail */}
                <motion.path
                    d="M38 44 Q28 40 24 50"
                    stroke="#d97706" strokeWidth="2.5" fill="none" strokeLinecap="round"
                    animate={isHovered ? { d: ['M38 44 Q28 40 24 50', 'M38 44 Q28 48 24 40', 'M38 44 Q28 40 24 50'] } : {}}
                    transition={{ duration: 0.8, repeat: Infinity }}
                />
            </motion.g>
        </svg>
    );
}

/* ─── Services: Wrench tightens a gear ─── */
export function ServicesIcon({ isHovered, className = 'w-full h-full' }: IconProps) {
    return (
        <svg viewBox="0 0 120 100" className={className} fill="none">
            {/* Main gear */}
            <motion.g
                style={{ originX: '54px', originY: '54px' }}
                animate={isHovered ? { rotate: 360 } : { rotate: 0 }}
                transition={isHovered ? { duration: 3, repeat: Infinity, ease: 'linear' } : { duration: 0.5 }}
            >
                <circle cx="54" cy="54" r="18" fill="#475569" stroke="#64748b" strokeWidth="2" />
                <circle cx="54" cy="54" r="7" fill="#1e293b" />
                {/* Gear teeth */}
                {[0, 45, 90, 135, 180, 225, 270, 315].map(angle => (
                    <rect
                        key={angle}
                        x="49" y="33" width="10" height="8" rx="2"
                        fill="#64748b"
                        transform={`rotate(${angle} 54 54)`}
                    />
                ))}
            </motion.g>

            {/* Wrench */}
            <motion.g
                style={{ originX: '54px', originY: '54px' }}
                animate={isHovered ? { rotate: [0, -30, 15, -30, 0] } : { rotate: 0 }}
                transition={isHovered ? { duration: 1.5, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.4 }}
            >
                {/* Handle */}
                <rect x="68" y="22" width="8" height="40" rx="3" fill="#fbbf24" transform="rotate(35 68 22)" />
                {/* Wrench head */}
                <path
                    d="M58 30 Q50 22 58 14 L64 14 Q56 22 64 30Z"
                    fill="#d97706"
                    transform="rotate(35 60 30)"
                />
            </motion.g>

            {/* Small secondary gear */}
            <motion.g
                style={{ originX: '86px', originY: '72px' }}
                animate={isHovered ? { rotate: -360 } : { rotate: 0 }}
                transition={isHovered ? { duration: 2, repeat: Infinity, ease: 'linear' } : { duration: 0.5 }}
            >
                <circle cx="86" cy="72" r="10" fill="#475569" />
                <circle cx="86" cy="72" r="4" fill="#1e293b" />
                {[0, 60, 120, 180, 240, 300].map(angle => (
                    <rect
                        key={angle}
                        x="83" y="60" width="6" height="5" rx="1.5"
                        fill="#64748b"
                        transform={`rotate(${angle} 86 72)`}
                    />
                ))}
            </motion.g>
        </svg>
    );
}
