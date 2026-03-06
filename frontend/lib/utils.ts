/* ═══════════════════════════════════════════
   Format utilities
   ═══════════════════════════════════════════ */

export function formatPrice(price: number, currency = 'SEK'): string {
    return new Intl.NumberFormat('sv-SE', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(price);
}

export function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('sv-SE');
}

export function conditionLabel(condition: string): string {
    const labels: Record<string, string> = {
        new: 'New',
        like_new: 'Like New',
        good: 'Good',
        fair: 'Fair',
        poor: 'Poor',
    };
    return labels[condition] || condition;
}

export function conditionColor(condition: string): string {
    const colors: Record<string, string> = {
        new: 'bg-emerald-500/20 text-emerald-400',
        like_new: 'bg-green-500/20 text-green-400',
        good: 'bg-blue-500/20 text-blue-400',
        fair: 'bg-yellow-500/20 text-yellow-400',
        poor: 'bg-red-500/20 text-red-400',
    };
    return colors[condition] || 'bg-gray-500/20 text-gray-400';
}

export function truncate(str: string, maxLen: number): string {
    if (str.length <= maxLen) return str;
    return str.slice(0, maxLen) + '…';
}
