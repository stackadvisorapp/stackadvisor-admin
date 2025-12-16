import { createClient } from '@supabase/supabase-js'

// ═══════════════════════════════════════════════════════════════
// SUPABASE CLIENT - Connects to your existing database
// ═══════════════════════════════════════════════════════════════

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

// ═══════════════════════════════════════════════════════════════
// TYPE DEFINITIONS - Match your Android app models
// ═══════════════════════════════════════════════════════════════

export interface User {
  id: string
  email: string
  created_at: string
  trial_start_date: string | null
  trial_end_date: string | null
  subscription_status: 'trial' | 'active' | 'expired' | 'cancelled'
  subscription_id: string | null
  subscription_expires_at: string | null
}

export interface Order {
  id: string
  created_at: string
  user_id: string | null
  platform: string
  package_name: string
  restaurant_name: string
  pickup_address: string
  delivery_address: string
  price: number
  pickup_lat: number
  pickup_lng: number
  delivery_lat: number
  delivery_lng: number
  status: 'PENDING' | 'ACCEPTED' | 'PICKED_UP' | 'DELIVERED' | 'CANCELLED'
  is_stacked: boolean
  is_uber_stacked: boolean
  stack_count: number
  slot_number: number
  multi_stop_group_id: string | null
  estimated_minutes: number
  estimated_miles: number
  accepted_at: number | null
  picked_up_at: number | null
  delivered_at: number | null
}

export interface CompletedOrder {
  id: string
  user_id: string | null
  rider_id: string | null
  platform: string
  restaurant_name: string
  pickup_address: string
  delivery_address: string
  price: number
  pickup_lat: number
  pickup_lng: number
  delivery_lat: number
  delivery_lng: number
  status: string
  accepted_at: number | null
  delivered_at: number | null
  created_at: string
}

export interface Announcement {
  id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'update' | 'promo'
  target_region: string | null  // null = all regions
  target_country: string | null // null = all countries
  is_active: boolean
  starts_at: string
  ends_at: string | null
  created_at: string
}

export interface AppSetting {
  id: string
  key: string
  value: string
  description: string
  updated_at: string
}

export interface BannedUser {
  id: string
  user_id: string
  email: string
  reason: string
  banned_at: string
  banned_by: string
}

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

export function formatDate(dateString: string | null): string {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

export function formatDateTime(dateString: string | null): string {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function formatTimestamp(timestamp: number | null): string {
  if (!timestamp) return 'N/A'
  return new Date(timestamp).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function getTrialDaysLeft(trialEndDate: string | null): number {
  if (!trialEndDate) return 0
  const end = new Date(trialEndDate)
  const now = new Date()
  const diff = end.getTime() - now.getTime()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

export function getPlatformColor(platform: string): string {
  const colors: Record<string, string> = {
    'uber_eats': '#06C167',
    'Uber Eats': '#06C167',
    'deliveroo': '#00CCBC',
    'Deliveroo': '#00CCBC',
    'just_eat': '#FF8000',
    'Just Eat': '#FF8000',
    'stuart': '#000000',
    'Stuart': '#000000',
    'doordash': '#FF3008',
    'DoorDash': '#FF3008',
    'grubhub': '#F63440',
    'Grubhub': '#F63440',
    'talabat': '#FF5A00',
    'Talabat': '#FF5A00',
    'careem': '#4CD964',
    'Careem': '#4CD964',
  }
  return colors[platform] || '#6B7280'
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    'trial': '#F59E0B',
    'active': '#10B981',
    'expired': '#EF4444',
    'cancelled': '#6B7280',
    'PENDING': '#F59E0B',
    'ACCEPTED': '#3B82F6',
    'PICKED_UP': '#8B5CF6',
    'DELIVERED': '#10B981',
    'CANCELLED': '#EF4444',
  }
  return colors[status] || '#6B7280'
}
