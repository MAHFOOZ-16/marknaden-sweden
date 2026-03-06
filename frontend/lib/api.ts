/* ═══════════════════════════════════════════
   API Client — typed wrapper for backend
   ═══════════════════════════════════════════ */

import type {
    Listing, ListingListResponse, Category, User, UserPublic,
    Conversation, Message, Favorite, Order, AdminStats,
} from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

class ApiClient {
    private baseUrl: string;
    private token: string | null = null;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    setToken(token: string | null) {
        this.token = token;
    }

    private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(options.headers as Record<string, string> || {}),
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        const res = await fetch(`${this.baseUrl}${path}`, {
            ...options,
            headers,
        });

        if (!res.ok) {
            const error = await res.json().catch(() => ({ detail: 'Unknown error' }));
            let errorMessage = error.detail;
            if (typeof errorMessage !== 'string') {
                errorMessage = JSON.stringify(errorMessage);
            }
            throw new Error(errorMessage || `API Error: ${res.status}`);
        }

        if (res.status === 204) return null as T;
        return res.json();
    }

    // ─── Listings ────────────────────────────────
    async getListings(params?: {
        page?: number;
        page_size?: number;
        category?: string;
        search?: string;
        min_price?: number;
        max_price?: number;
        sort_by?: string;
        city?: string;
    }): Promise<ListingListResponse> {
        const searchParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    searchParams.set(key, String(value));
                }
            });
        }
        const query = searchParams.toString();
        return this.request<ListingListResponse>(`/listings${query ? `?${query}` : ''}`);
    }

    async getListing(id: string): Promise<Listing> {
        return this.request<Listing>(`/listings/${id}`);
    }

    async createListing(data: Partial<Listing> & { media_urls?: string[] }): Promise<Listing> {
        return this.request<Listing>('/listings', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateListing(id: string, data: Partial<Listing>): Promise<Listing> {
        return this.request<Listing>(`/listings/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }

    async deleteListing(id: string): Promise<void> {
        return this.request<void>(`/listings/${id}`, {
            method: 'DELETE',
        });
    }

    // ─── Categories ──────────────────────────────
    async getCategories(): Promise<Category[]> {
        return this.request<Category[]>('/categories');
    }

    // ─── Users ───────────────────────────────────
    async getMe(): Promise<User> {
        return this.request<User>('/users/me');
    }

    async updateMe(data: Partial<User>): Promise<User> {
        return this.request<User>('/users/me', {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }

    async getMyListings(): Promise<ListingListResponse> {
        return this.request<ListingListResponse>('/users/me/listings');
    }

    async rateUser(userId: string, score: number): Promise<UserPublic> {
        return this.request<UserPublic>(`/users/${userId}/rate`, {
            method: 'POST',
            body: JSON.stringify({ score }),
        });
    }

    // ─── Favorites ───────────────────────────────
    async getFavorites(): Promise<Favorite[]> {
        return this.request<Favorite[]>('/favorites');
    }

    async addFavorite(listingId: string): Promise<Favorite> {
        return this.request<Favorite>(`/favorites/${listingId}`, { method: 'POST' });
    }

    async removeFavorite(listingId: string): Promise<void> {
        return this.request<void>(`/favorites/${listingId}`, { method: 'DELETE' });
    }

    // ─── Chat ────────────────────────────────────
    async getConversations(): Promise<Conversation[]> {
        return this.request<Conversation[]>('/chat/conversations');
    }

    async createConversation(data: {
        listing_id: string;
        seller_id: string;
        initial_message: string;
    }): Promise<Conversation> {
        return this.request<Conversation>('/chat/conversations', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async getMessages(conversationId: string, markRead = true): Promise<Message[]> {
        return this.request<Message[]>(`/chat/conversations/${conversationId}/messages?mark_read=${markRead}`);
    }

    async sendMessage(conversationId: string, content: string): Promise<Message> {
        return this.request<Message>(`/chat/conversations/${conversationId}/messages`, {
            method: 'POST',
            body: JSON.stringify({ content }),
        });
    }

    async getUnreadMessageCount(): Promise<{ count: number }> {
        return this.request<{ count: number }>('/chat/unread-count');
    }

    // ─── Orders ──────────────────────────────────
    async checkout(listingId: string, paymentProvider = 'stripe'): Promise<{
        order_id: string;
        client_secret: string;
        payment_provider: string;
        amount: number;
        currency: string;
    }> {
        return this.request('/orders/checkout', {
            method: 'POST',
            body: JSON.stringify({ listing_id: listingId, payment_provider: paymentProvider }),
        });
    }

    async getOrders(): Promise<Order[]> {
        return this.request<Order[]>('/orders');
    }

    // ─── Admin ───────────────────────────────────
    async getAdminStats(): Promise<AdminStats> {
        return this.request<AdminStats>('/admin/stats');
    }

    async getAdminListings(status?: string, page: number = 1): Promise<Listing[]> {
        const query = new URLSearchParams({ page: page.toString() });
        if (status) query.append('status', status);
        return this.request<Listing[]>(`/admin/listings?${query.toString()}`);
    }

    async getAdminUsers(): Promise<User[]> {
        return this.request<User[]>('/users');
    }

    async deleteUser(userId: string): Promise<void> {
        return this.request<void>(`/users/${userId}`, { method: 'DELETE' });
    }

    async syncAuth0Users(): Promise<{ synced: number }> {
        return this.request<{ synced: number }>('/admin/sync-users', { method: 'POST' });
    }

    // ─── Health ──────────────────────────────────
    async health(): Promise<{ status: string; version: string }> {
        const res = await fetch(`${this.baseUrl.replace('/api/v1', '')}/health`);
        return res.json();
    }
}

export const api = new ApiClient(API_BASE);
export default api;
