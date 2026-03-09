export interface ChatMessage {
  id: string;
  text: string;
  isUserMessage: boolean;
  timestamp: number;
}

export interface Driver {
  id: string;
  name: string;
  rating: number;
  ratingCount: number;
  phone?: string;
  username?: string;
  password?: string;
  currentLocation?: { lat: number; lng: number };
}

export interface Restaurant {
  id: string;
  name: string;
  image?: string;
}

export interface Region {
  id: string;
  name: string;
  drivers: Driver[];
  restaurants?: Restaurant[];
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone?: string;
  price: number;
  status: 'pending' | 'accepted' | 'preparing' | 'delivering' | 'arriving' | 'completed';
  regionName: string;
  regionId?: string;
  eta?: string;
  etaTimestamp?: number;
  rating?: number;
  timestamp: number;
  discountApplied?: boolean;
  driverLocation?: { lat: number; lng: number };
  customerLocation?: { lat: number; lng: number };
}

export interface ChatRoom {
  id: string;
  customerId: string;
  customerName: string;
  driverId: string;
  lastMessage?: string;
  lastMessageTime?: number;
  unreadCount: number;
}

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  points: number;
  ordersCount: number;
  isDarkTheme: boolean;
  language: 'ar' | 'en';
  isGuest: boolean;
  isAuthenticated: boolean;
  referralCode: string;
  isPremium: boolean;
  referredBy?: string;
  dailyAdsWatched: number;
  lastAdWatchDate?: string;
  refreshRate?: '60Hz' | '90Hz' | '120Hz' | '144Hz';
}

export interface LogEntry {
  id: string;
  type: 'order_received' | 'payment_verified' | 'order_completed' | 'commission_received' | 'rating_received' | 'points_redeemed' | 'ad_reward';
  message: string;
  amount?: number;
  timestamp: number;
  details?: any;
}

export interface JobApplication {
  id: string;
  name: string;
  age: string;
  dob: string;
  email: string;
  city: string;
  experience: string;
  idPhoto?: string; // Base64 string
  timestamp: number;
}

export type ViewState = 'regions' | 'drivers' | 'chat' | 'orders' | 'admin_logs' | 'customer_view' | 'settings' | 'job_applications' | 'chat_list' | 'map_tracking';
