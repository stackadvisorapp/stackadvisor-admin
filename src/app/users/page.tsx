'use client'

import { useState, useEffect } from 'react'
import { 
  Search, 
  Filter, 
  UserX, 
  Mail, 
  Calendar,
  CreditCard,
  Loader2,
  ChevronDown,
  Ban,
  CheckCircle
} from 'lucide-react'
import { supabase, User, formatDate, formatDateTime, getStatusColor, getTrialDaysLeft } from '@/lib/supabase'

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showBanModal, setShowBanModal] = useState(false)
  const [banReason, setBanReason] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [users, search, statusFilter])

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

  function filterUsers() {
    let filtered = [...users]

    // Search filter
    if (search) {
      filtered = filtered.filter(user => 
        user.email?.toLowerCase().includes(search.toLowerCase()) ||
        user.id?.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.subscription_status === statusFilter)
    }

    setFilteredUsers(filtered)
  }

  async function handleBanUser() {
    if (!selectedUser || !banReason) return

    try {
      // Insert into banned_users table
      const { error } = await supabase
        .from('banned_users')
        .insert({
          user_id: selectedUser.id,
          email: selectedUser.email,
          reason: banReason,
          banned_by: 'admin'
        })

      if (error) throw error

      // Update user status
      await supabase
        .from('users')
        .update({ subscription_status: 'cancelled' })
        .eq('id', selectedUser.id)

      // Refresh users
      fetchUsers()
      setShowBanModal(false)
      setSelectedUser(null)
      setBanReason('')
    } catch (error) {
      console.error('Error banning user:', error)
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Users</h1>
          <p className="text-gray-500 mt-1">{users.length} total users</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search by email or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input appearance-none pr-10 min-w-[160px]"
          >
            <option value="all">All Status</option>
            <option value="trial">Trial</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-dark-700 rounded-lg p-4 border border-dark-500">
          <p className="text-gray-500 text-sm">Total</p>
          <p className="text-2xl font-bold text-white">{users.length}</p>
        </div>
        <div className="bg-dark-700 rounded-lg p-4 border border-dark-500">
          <p className="text-gray-500 text-sm">Trial</p>
          <p className="text-2xl font-bold text-amber-400">
            {users.filter(u => u.subscription_status === 'trial').length}
          </p>
        </div>
        <div className="bg-dark-700 rounded-lg p-4 border border-dark-500">
          <p className="text-gray-500 text-sm">Active</p>
          <p className="text-2xl font-bold text-emerald-400">
            {users.filter(u => u.subscription_status === 'active').length}
          </p>
        </div>
        <div className="bg-dark-700 rounded-lg p-4 border border-dark-500">
          <p className="text-gray-500 text-sm">Expired</p>
          <p className="text-2xl font-bold text-red-400">
            {users.filter(u => u.subscription_status === 'expired' || u.subscription_status === 'cancelled').length}
          </p>
        </div>
      </div>

      {/* Users Table */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Status</th>
                <th>Trial End</th>
                <th>Days Left</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-dark-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium">
                            {user.email?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-white font-medium">{user.email}</p>
                          <p className="text-gray-500 text-xs">{user.id.slice(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span 
                        className="badge"
                        style={{ 
                          backgroundColor: `${getStatusColor(user.subscription_status)}20`,
                          color: getStatusColor(user.subscription_status)
                        }}
                      >
                        {user.subscription_status}
                      </span>
                    </td>
                    <td className="text-gray-400">
                      {formatDate(user.trial_end_date)}
                    </td>
                    <td>
                      {user.subscription_status === 'trial' ? (
                        <span className={`font-medium ${
                          getTrialDaysLeft(user.trial_end_date) <= 7 
                            ? 'text-red-400' 
                            : 'text-amber-400'
                        }`}>
                          {getTrialDaysLeft(user.trial_end_date)} days
                        </span>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="text-gray-400">
                      {formatDate(user.created_at)}
                    </td>
                    <td>
                      <button
                        onClick={() => {
                          setSelectedUser(user)
                          setShowBanModal(true)
                        }}
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Ban user"
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ban Modal */}
      {showBanModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 rounded-xl border border-dark-600 p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold text-white mb-4">Ban User</h3>
            <p className="text-gray-400 mb-4">
              Are you sure you want to ban <span className="text-white">{selectedUser.email}</span>?
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Reason for ban
              </label>
              <textarea
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                className="input min-h-[100px]"
                placeholder="Enter reason..."
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowBanModal(false)
                  setSelectedUser(null)
                  setBanReason('')
                }}
                className="btn btn-secondary flex-1 justify-center"
              >
                Cancel
              </button>
              <button
                onClick={handleBanUser}
                disabled={!banReason}
                className="btn btn-danger flex-1 justify-center disabled:opacity-50"
              >
                Ban User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
