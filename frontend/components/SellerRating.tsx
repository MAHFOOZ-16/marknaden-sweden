'use client';

import { useState } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { api } from '@/lib/api';

interface SellerRatingProps {
    sellerId: string;
    currentRating: number;
    ratingCount: number;
    onRatingSubmit?: (newRating: number, newCount: number) => void;
}

export default function SellerRating({ sellerId, currentRating, ratingCount, onRatingSubmit }: SellerRatingProps) {
    const { user } = useUser();
    const [hoveredStar, setHoveredStar] = useState<number>(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasRated, setHasRated] = useState(false);
    const [localRating, setLocalRating] = useState(currentRating);
    const [localCount, setLocalCount] = useState(ratingCount);

    const handleRate = async (score: number) => {
        if (!user) {
            alert('Please sign in to rate this seller.');
            return;
        }
        if (hasRated) return;

        try {
            setIsSubmitting(true);
            const updatedSeller = await api.rateUser(sellerId, score);
            setHasRated(true);
            setLocalRating(updatedSeller.rating);
            setLocalCount(updatedSeller.rating_count);
            if (onRatingSubmit) {
                onRatingSubmit(updatedSeller.rating, updatedSeller.rating_count);
            }
        } catch (error: any) {
            alert(error.message || 'Failed to submit rating. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col items-start gap-1">
            <div className="flex items-center gap-1 group">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        disabled={isSubmitting || hasRated}
                        onMouseEnter={() => setHoveredStar(star)}
                        onMouseLeave={() => setHoveredStar(0)}
                        onClick={() => handleRate(star)}
                        className={`transition-all duration-200 focus:outline-none ${(isSubmitting || hasRated) ? 'cursor-default' : 'cursor-pointer hover:scale-110'
                            }`}
                    >
                        <svg
                            className={`w-5 h-5 transition-colors ${star <= (hoveredStar || localRating)
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-400/30 fill-transparent'
                                }`}
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="1.5"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                            />
                        </svg>
                    </button>
                ))}
                <span className="text-sm text-[#9898b0] ml-2 font-medium">
                    {localRating.toFixed(1)} ({localCount})
                </span>
            </div>
            {hasRated && (
                <span className="text-xs text-[#00d2a0] animate-fade-in font-medium">
                    Thanks for your rating! ⭐
                </span>
            )}
        </div>
    );
}
