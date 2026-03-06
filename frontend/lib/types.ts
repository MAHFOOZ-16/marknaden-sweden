/* ═══════════════════════════════════════════
   API Types — matches backend Pydantic schemas
   ═══════════════════════════════════════════ */

export interface User {
  id: string;
  email: string;
  display_name: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  phone?: string;
  rating: number;
  rating_count: number;
  is_verified: boolean;
  role?: string; // 'user' | 'moderator' | 'admin'
  listings_count: number;
  sold_count: number;
  created_at: string;
}

export interface UserPublic {
  id: string;
  email?: string;
  display_name: string;
  avatar_url?: string;
  rating: number;
  rating_count: number;
  is_verified: boolean;
  location?: string;
  phone?: string;
  listings_count: number;
  sold_count: number;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  parent_id?: string;
}

export interface ListingMedia {
  id: string;
  url: string;
  thumbnail_url?: string;
  media_type: string;
  sort_order: number;
}

export type ListingStatus = 'draft' | 'active' | 'sold' | 'reserved' | 'expired' | 'removed';
export type ListingCondition = 'new' | 'like_new' | 'good' | 'fair' | 'poor';

export interface Listing {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  category_id: string;
  condition: ListingCondition;
  status: ListingStatus;
  location_city?: string;
  location_region?: string;
  shipping_available: boolean;
  shipping_cost?: number;
  view_count: number;
  favorite_count: number;
  created_at: string;
  updated_at: string;
  seller?: UserPublic;
  category?: Category;
  media: ListingMedia[];
}

export interface ListingListResponse {
  items: Listing[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface Conversation {
  id: string;
  listing_id?: string;
  buyer_id: string;
  seller_id: string;
  last_message_preview?: string;
  is_active: boolean;
  unread_count: number;
  created_at: string;
  updated_at: string;
  buyer?: UserPublic;
  seller?: UserPublic;
  listing?: Listing;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  attachment_url?: string;
  message_type: string;
  created_at: string;
  sender?: UserPublic;
}

export interface Order {
  id: string;
  buyer_id: string;
  seller_id: string;
  listing_id: string;
  status: string;
  amount: number;
  currency: string;
  platform_fee: number;
  shipping_cost: number;
  created_at: string;
  listing?: Listing;
}

export interface AdminStats {
  total_users: number;
  total_listings: number;
  active_listings: number;
  total_orders: number;
  pending_reports: number;
  recent_activity?: {
    type: string;
    text: string;
    time: string;
  }[];
}

export interface Favorite {
  id: string;
  listing_id: string;
  created_at: string;
  listing?: Listing;
}
