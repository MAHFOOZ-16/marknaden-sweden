'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { api } from '@/lib/api';
import type { Conversation, Message } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { useAuthTokenReady } from '@/components/AuthTokenProvider';

export default function ChatPage() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const { user: auth0User } = useUser();
    const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null);
    const isTokenReady = useAuthTokenReady();

    // On mobile, this controls which panel is visible. On desktop, both are always visible.
    const [showConversationList, setShowConversationList] = useState(true);

    useEffect(() => {
        if (isTokenReady) {
            api.getMe().then(setCurrentUser).catch(() => { });
        }
    }, [isTokenReady]);

    useEffect(() => {
        if (!isTokenReady) return;
        api.getConversations().then(convs => {
            setConversations(convs);
            if (convs.length > 0) setSelectedConv(convs[0]);
        }).catch(() => { }).finally(() => setLoading(false));
    }, [isTokenReady]);

    useEffect(() => {
        if (selectedConv) {
            api.getMessages(selectedConv.id)
                .then(msgs => {
                    setMessages(msgs);
                    setConversations(prev =>
                        prev.map(c => c.id === selectedConv.id ? { ...c, unread_count: 0 } : c)
                    );
                })
                .catch(() => { });
        }
    }, [selectedConv]);

    const handleSelectConversation = (conv: Conversation) => {
        setSelectedConv(conv);
        // Switch to message view on mobile
        setShowConversationList(false);
    };

    const handleBackToList = () => {
        setShowConversationList(true);
    };

    const handleSend = async () => {
        if (!newMessage.trim() || !selectedConv) return;
        try {
            const msg = await api.sendMessage(selectedConv.id, newMessage);
            setMessages(prev => [...prev, msg]);
            setNewMessage('');
        } catch { /* */ }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6">Messages</h1>

            <div className="glass-card overflow-hidden hover:!transform-none" style={{ height: 'calc(100vh - 180px)' }}>
                <div className="flex h-full">
                    {/* Conversation List */}
                    <div className={`
                        w-full md:w-80 border-r border-white/[0.06] overflow-y-auto flex-shrink-0
                        ${showConversationList ? 'block' : 'hidden md:block'}
                    `}>
                        {loading ? (
                            <div className="p-4 space-y-3">
                                {[...Array(5)].map((_, i) => <div key={i} className="h-16 skeleton" />)}
                            </div>
                        ) : conversations.length > 0 ? (
                            conversations.map(conv => (
                                <button
                                    key={conv.id}
                                    onClick={() => handleSelectConversation(conv)}
                                    className={`w-full p-4 text-left transition-colors border-b border-white/[0.04] ${selectedConv?.id === conv.id ? 'bg-[#6c5ce7]/10' : 'hover:bg-white/[0.03]'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={conv.seller?.avatar_url || conv.buyer?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'}
                                            alt=""
                                            className="w-10 h-10 rounded-full shrink-0"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium text-white truncate pr-2">
                                                    {conv.seller?.display_name || conv.buyer?.display_name || 'User'}
                                                </span>
                                                <div className="flex items-center gap-2 shrink-0">
                                                    {(conv.unread_count || 0) > 0 && (
                                                        <span className="flex items-center justify-center min-w-[18px] h-[18px] text-[10px] font-bold text-white bg-red-500 rounded-full px-1">
                                                            {conv.unread_count > 99 ? '99+' : conv.unread_count}
                                                        </span>
                                                    )}
                                                    <span className="text-xs text-[#6a6a82]">{formatDate(conv.updated_at)}</span>
                                                </div>
                                            </div>
                                            <p className="text-xs text-[#6a6a82] truncate mt-0.5">{conv.last_message_preview || 'Start chatting...'}</p>
                                            {conv.listing && (
                                                <p className="text-xs text-[#6c5ce7] truncate mt-0.5">📦 {conv.listing.title}</p>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            ))
                        ) : (
                            <div className="p-8 text-center">
                                <div className="text-4xl mb-3">💬</div>
                                <p className="text-sm text-[#6a6a82]">No conversations yet</p>
                            </div>
                        )}
                    </div>

                    {/* Messages Panel */}
                    <div className={`
                        flex-1 flex-col min-w-0
                        ${!showConversationList ? 'flex' : 'hidden md:flex'}
                    `}>
                        {selectedConv ? (
                            <>
                                {/* Chat header with back button on mobile */}
                                <div className="p-3 sm:p-4 border-b border-white/[0.06] flex items-center gap-3">
                                    <button
                                        onClick={handleBackToList}
                                        className="md:hidden p-1 rounded-lg hover:bg-white/10 transition-colors"
                                        aria-label="Back to conversations"
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                                            <polyline points="15 18 9 12 15 6" />
                                        </svg>
                                    </button>
                                    <img
                                        src={selectedConv.seller?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'}
                                        alt=""
                                        className="w-8 h-8 sm:w-9 sm:h-9 rounded-full"
                                    />
                                    <div className="min-w-0">
                                        <div className="text-sm font-medium text-white truncate">{selectedConv.seller?.display_name || 'User'}</div>
                                        {selectedConv.listing && (
                                            <div className="text-xs text-[#6a6a82] truncate">Re: {selectedConv.listing.title}</div>
                                        )}
                                    </div>
                                </div>

                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
                                    {messages.map(msg => {
                                        const isOwn = msg.sender_id === currentUser?.id;
                                        return (
                                            <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 ${isOwn ? 'bg-[#6c5ce7] text-white' : 'bg-white/[0.05] text-[#d0d0e0]'
                                                    }`}>
                                                    {!isOwn && msg.sender && (
                                                        <div className="text-xs font-medium text-[#a29bfe] mb-1">{msg.sender.display_name}</div>
                                                    )}
                                                    <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">{msg.content}</p>
                                                    <div className={`text-[10px] mt-1 ${isOwn ? 'text-white/60' : 'text-[#6a6a82]'}`}>
                                                        {formatDate(msg.created_at)}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Input */}
                                <div className="p-3 sm:p-4 border-t border-white/[0.06]">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={e => setNewMessage(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && handleSend()}
                                            placeholder="Type a message..."
                                            className="input-field flex-1 text-sm sm:text-base"
                                        />
                                        <button onClick={handleSend} className="btn-primary !px-4 sm:!px-5">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-center">
                                <div>
                                    <div className="text-5xl mb-4">💬</div>
                                    <p className="text-[#6a6a82]">Select a conversation to start chatting</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
