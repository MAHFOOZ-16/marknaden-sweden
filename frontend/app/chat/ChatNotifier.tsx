'use client';

import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useAuthTokenReady } from '@/components/AuthTokenProvider';
import { api } from '@/lib/api';

export function ChatNotifier() {
    const { user: auth0User } = useUser();
    const isTokenReady = useAuthTokenReady();
    const lastPolledRef = useRef<Date>(new Date());
    const seenMessageIds = useRef<Set<string>>(new Set());
    const [dbUser, setDbUser] = useState<{ id: string } | null>(null);

    useEffect(() => {
        if (isTokenReady) {
            api.getMe().then(setDbUser).catch(() => { });
        }
    }, [isTokenReady]);

    useEffect(() => {
        if (!auth0User || !isTokenReady || !dbUser) return;

        const pollConversations = async () => {
            try {
                const convs = await api.getConversations();
                let hasNew = false;
                for (const conv of convs) {
                    if (conv.last_message_preview && new Date(conv.updated_at) > lastPolledRef.current) {
                        try {
                            const msgs = await api.getMessages(conv.id, false);
                            if (msgs.length === 0) continue;
                            const lastMsg = msgs[msgs.length - 1];
                            const isOwnMessage = lastMsg.sender_id === dbUser.id;

                            // Prevent identical notifications in a short span
                            const key = `${conv.id}-${conv.updated_at}`;
                            if (!seenMessageIds.current.has(key)) {
                                seenMessageIds.current.add(key);

                                if (!isOwnMessage) {
                                    const otherUser = conv.listing?.seller_id === dbUser.id ? conv.buyer : conv.listing?.seller;
                                    const title = conv.listing?.title || 'a product';

                                    toast.success(
                                        (t) => (
                                            <div className="flex items-center gap-3 w-full pr-2">
                                                <span>You have a new message from {otherUser?.display_name || 'someone'} for "{title}"!</span>
                                                <button
                                                    onClick={() => toast.dismiss(t.id)}
                                                    className="shrink-0 p-1.5 hover:bg-black/5 rounded-md transition-colors ml-auto text-gray-500 hover:text-black"
                                                >
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                                    </svg>
                                                </button>
                                            </div>
                                        ),
                                        {
                                            duration: Infinity,
                                            position: 'top-right',
                                            icon: '💬',
                                        }
                                    );
                                }
                                hasNew = true;
                            }
                        } catch (err) {
                            console.error('Failed to parse messages', err);
                        }
                    }
                }
                if (hasNew) {
                    lastPolledRef.current = new Date();
                }
            } catch (e) {
                // skip polling errors quietly
            }
        };

        // Initial set
        lastPolledRef.current = new Date();

        // Poll every 5 seconds
        const interval = setInterval(pollConversations, 5000);
        return () => clearInterval(interval);
    }, [auth0User, isTokenReady, dbUser]);

    return null;
}
