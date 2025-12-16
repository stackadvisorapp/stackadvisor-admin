'use client'

import { useState, useEffect } from 'react'
import { 
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  Loader2,
  Calendar
} from 'lucide-react'
import { supabase, User, formatDate, getStatusColor, getTrialDaysLeft } from '@/lib/supabase'

export default function SubscriptionsPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const trialUsers = users.filter(u => u.subscription_status === 'trial')
  const activeUsers = users.filter(u => u.subscription_status === 'active')
  const expiredUsers = users.filter(u => u.subscription_status === 'expired')
  const cancelledUsers = users.filter(u => u.subscription_status === 'cancelled')

  // Users whose trial ends within 7 days
  const expiringTrials = trialUsers.filter(u => {
    const daysLeft = getTrialDaysLeft(u.trial_end_date)
    return daysLeft > 0 && daysLeft <= 7
  })

  // Monthly revenue estimate
  const monthlyRevenue = activeUsers.length * 5

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Subscriptions</h1>
        <p className="text-gray-500 mt-1">Track revenue and subscription status</p>
      </div>

      {/* Revenue Card */}
      <div className="card bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border-emerald-500/30">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-emerald-400 text-sm font-medium">Monthly Revenue</p>
            <p className="text-4xl font-bold text-white mt-2">£{monthlyRevenue}</p>
            <p className="text-gray-400 text-sm mt-2">
              {activeUsers.length} active subscribers × £5/month
            </p>
          </div>
          <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center">
            <TrendingUp className="w-8 h-8 text-emerald-400" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <span className="text-gray-400 text-sm">On Trial</span>
          </div>
          <p className="text-3xl font-bold text-white">{trialUsers.length}</p>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-gray-400 text-sm">Active</span>
          </div>
          <p className="text-3xl font-bold text-white">{activeUsers.length}</p>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-400" />
            </div>
            <span className="text-gray-400 text-sm">Expired</span>
          </div>
          <p className="text-3xl font-bold text-white">{expiredUsers.length}</p>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gray-500/20 rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-gray-400" />
            </div>
            <span className="text-gray-400 text-sm">Cancelled</span>
          </div>
          <p className="text-3xl font-bold text-white">{cancelledUsers.length}</p>
        </div>
      </div>

      {/* Expiring Trials Alert */}
      {expiringTrials.length > 0 && (
        <div className="card border-amber-500/30 bg-amber-500/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Trials Expiring Soon</h3>
              <p className="text-gray-400 text-sm">{expiringTrials.length} users within 7 days</p>
            </div>
          </div>
          <div className="space-y-2">
            {expiringTrials.slice(0, 5).map(user => (
              <div key={user.id} className="flex items-center justify-between py-2 border-b border-dark-600 last:border-0">
                <span className="text-gray-300">{user.email}</span>
                <span className="text-amber-400 text-sm font-medium">
                  {getTrialDaysLeft(user.trial_end_date)} days left
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Subscribers List */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4">Active Subscribers</h3>
        {activeUsers.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No active subscribers yet</p>
        ) : (
          <div className="space-y-3">
            {activeUsers.map(user => (
              <div key={user.id} className="flex items-center justify-between py-3 border-b border-dark-600 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center">
                    <span className="text-emerald-400 font-medium">
                      {user.email?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-medium">{user.email}</p>
                    <p className="text-gray-500 text-xs">
                      Subscribed since {formatDate(user.created_at)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-emerald-400 font-medium">£5/month</p>
                  {user.subscription_expires_at && (
                    <p className="text-gray-500 text-xs">
                      Renews {formatDate(user.subscription_expires_at)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Trial Users List */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4">Trial Users</h3>
        {trialUsers.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No trial users</p>
        ) : (
          <div className="space-y-3">
            {trialUsers.map(user => {
              const daysLeft = getTrialDaysLeft(user.trial_end_date)
              return (
                <div key={user.id} className="flex items-center justify-between py-3 border-b border-dark-600 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center">
                      <span className="text-amber-400 font-medium">
                        {user.email?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-medium">{user.email}</p>
                      <p className="text-gray-500 text-xs">
                        Started {formatDate(user.trial_start_date)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${daysLeft <= 7 ? 'text-red-400' : 'text-amber-400'}`}>
                      {daysLeft} days left
                    </p>
                    <p className="text-gray-500 text-xs">
                      Ends {formatDate(user.trial_end_date)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
