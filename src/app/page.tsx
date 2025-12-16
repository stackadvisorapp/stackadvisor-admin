'use client'

import { useState, useEffect } from 'react'
import { 
  Users, 
  Package, 
  CreditCard, 
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react'
import { supabase, User, Order, CompletedOrder, formatDate, getStatusColor } from '@/lib/supabase'

interface Stats {
  totalUsers: number
  activeTrials: number
  paidSubscribers: number
  expiredUsers: number
  totalOrders: number
  completedOrders: number
  activeOrders: number
  todayOrders: number
}

interface RecentUser {
  id: string
  email: string
  subscription_status: string
  created_at: string
}

interface RecentOrder {
  id: string
  platform: string
  restaurant_name: string
  price: number
  status: string
  created_at: string
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([])
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  async function fetchDashboardData() {
    try {
      // Fetch users stats
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('*')

      if (usersError) throw usersError

      // Fetch orders stats
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*')

      // Fetch completed orders
      const { data: completed, error: completedError } = await supabase
        .from('completed_orders')
        .select('*')

      // Calculate stats
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const stats: Stats = {
        totalUsers: users?.length || 0,
        activeTrials: users?.filter(u => u.subscription_status === 'trial').length || 0,
        paidSubscribers: users?.filter(u => u.subscription_status === 'active').length || 0,
        expiredUsers: users?.filter(u => u.subscription_status === 'expired' || u.subscription_status === 'cancelled').length || 0,
        totalOrders: (orders?.length || 0) + (completed?.length || 0),
        completedOrders: completed?.length || 0,
        activeOrders: orders?.filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED').length || 0,
        todayOrders: orders?.filter(o => new Date(o.created_at) >= today).length || 0,
      }

      setStats(stats)

      // Get recent users (last 5)
      const sortedUsers = users?.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ).slice(0, 5) || []
      setRecentUsers(sortedUsers)

      // Get recent orders (last 5)
      const allOrders = [...(orders || []), ...(completed || [])]
      const sortedOrders = allOrders.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ).slice(0, 5)
      setRecentOrders(sortedOrders)

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back! Here's what's happening with StackAdvisor.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <div className="card animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Users</p>
              <p className="text-3xl font-bold text-white mt-1">{stats?.totalUsers || 0}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
          </div>
          <div className="flex items-center gap-4 mt-4 text-sm">
            <span className="text-amber-400">{stats?.activeTrials} trials</span>
            <span className="text-emerald-400">{stats?.paidSubscribers} paid</span>
          </div>
        </div>

        {/* Active Subscribers */}
        <div className="card animate-fade-in animate-delay-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Paid Subscribers</p>
              <p className="text-3xl font-bold text-white mt-1">{stats?.paidSubscribers || 0}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4 text-sm text-emerald-400">
            <TrendingUp className="w-4 h-4" />
            <span>£{(stats?.paidSubscribers || 0) * 5}/month revenue</span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="card animate-fade-in animate-delay-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Orders</p>
              <p className="text-3xl font-bold text-white mt-1">{stats?.totalOrders || 0}</p>
            </div>
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-purple-400" />
            </div>
          </div>
          <div className="flex items-center gap-4 mt-4 text-sm">
            <span className="text-emerald-400">{stats?.completedOrders} completed</span>
            <span className="text-blue-400">{stats?.activeOrders} active</span>
          </div>
        </div>

        {/* Today's Orders */}
        <div className="card animate-fade-in animate-delay-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Today's Orders</p>
              <p className="text-3xl font-bold text-white mt-1">{stats?.todayOrders || 0}</p>
            </div>
            <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-400" />
            </div>
          </div>
          <div className="text-sm text-gray-500 mt-4">
            Live tracking active
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Recent Users</h2>
            <a href="/users" className="text-emerald-400 text-sm hover:underline">View all</a>
          </div>
          <div className="space-y-4">
            {recentUsers.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No users yet</p>
            ) : (
              recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-dark-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">
                        {user.email?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{user.email}</p>
                      <p className="text-gray-500 text-xs">{formatDate(user.created_at)}</p>
                    </div>
                  </div>
                  <span 
                    className="badge"
                    style={{ 
                      backgroundColor: `${getStatusColor(user.subscription_status)}20`,
                      color: getStatusColor(user.subscription_status)
                    }}
                  >
                    {user.subscription_status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Recent Orders</h2>
            <a href="/orders" className="text-emerald-400 text-sm hover:underline">View all</a>
          </div>
          <div className="space-y-4">
            {recentOrders.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No orders yet</p>
            ) : (
              recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${getStatusColor(order.status)}20` }}
                    >
                      {order.status === 'DELIVERED' ? (
                        <CheckCircle className="w-5 h-5" style={{ color: getStatusColor(order.status) }} />
                      ) : order.status === 'CANCELLED' ? (
                        <XCircle className="w-5 h-5" style={{ color: getStatusColor(order.status) }} />
                      ) : (
                        <Package className="w-5 h-5" style={{ color: getStatusColor(order.status) }} />
                      )}
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{order.restaurant_name}</p>
                      <p className="text-gray-500 text-xs">{order.platform} • £{order.price?.toFixed(2)}</p>
                    </div>
                  </div>
                  <span 
                    className="badge"
                    style={{ 
                      backgroundColor: `${getStatusColor(order.status)}20`,
                      color: getStatusColor(order.status)
                    }}
                  >
                    {order.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
