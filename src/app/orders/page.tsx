'use client'

import { useState, useEffect } from 'react'
import { 
  Search, 
  Package,
  MapPin,
  Clock,
  Loader2,
  ChevronDown,
  CheckCircle,
  XCircle,
  Truck
} from 'lucide-react'
import { supabase, Order, CompletedOrder, formatDateTime, formatTimestamp, getStatusColor, getPlatformColor } from '@/lib/supabase'

type CombinedOrder = (Order | CompletedOrder) & { source: 'active' | 'completed' }

export default function OrdersPage() {
  const [orders, setOrders] = useState<CombinedOrder[]>([])
  const [filteredOrders, setFilteredOrders] = useState<CombinedOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [platformFilter, setPlatformFilter] = useState<string>('all')
  const [sourceFilter, setSourceFilter] = useState<string>('all')

  const platforms = ['Uber Eats', 'Deliveroo', 'Just Eat', 'Stuart', 'DoorDash', 'Grubhub', 'Talabat', 'Careem']

  useEffect(() => {
    fetchOrders()
  }, [])

  useEffect(() => {
    filterOrders()
  }, [orders, search, statusFilter, platformFilter, sourceFilter])

  async function fetchOrders() {
    try {
      // Fetch active orders
      const { data: activeOrders, error: activeError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

      if (activeError) throw activeError

      // Fetch completed orders
      const { data: completedOrders, error: completedError } = await supabase
        .from('completed_orders')
        .select('*')
        .order('created_at', { ascending: false })

      if (completedError) throw completedError

      // Combine and tag orders
      const active = (activeOrders || []).map(o => ({ ...o, source: 'active' as const }))
      const completed = (completedOrders || []).map(o => ({ ...o, source: 'completed' as const }))
      
      const allOrders = [...active, ...completed].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )

      setOrders(allOrders)
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  function filterOrders() {
    let filtered = [...orders]

    // Search filter
    if (search) {
      filtered = filtered.filter(order => 
        order.restaurant_name?.toLowerCase().includes(search.toLowerCase()) ||
        order.pickup_address?.toLowerCase().includes(search.toLowerCase()) ||
        order.delivery_address?.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter)
    }

    // Platform filter
    if (platformFilter !== 'all') {
      filtered = filtered.filter(order => 
        order.platform?.toLowerCase() === platformFilter.toLowerCase()
      )
    }

    // Source filter
    if (sourceFilter !== 'all') {
      filtered = filtered.filter(order => order.source === sourceFilter)
    }

    setFilteredOrders(filtered)
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case 'DELIVERED':
        return <CheckCircle className="w-4 h-4" />
      case 'CANCELLED':
        return <XCircle className="w-4 h-4" />
      case 'PICKED_UP':
        return <Truck className="w-4 h-4" />
      default:
        return <Package className="w-4 h-4" />
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
      <div>
        <h1 className="text-3xl font-bold text-white">Orders</h1>
        <p className="text-gray-500 mt-1">{orders.length} total orders</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search restaurant or address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>

        {/* Source Filter */}
        <div className="relative">
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="input appearance-none pr-10 min-w-[140px]"
          >
            <option value="all">All Orders</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input appearance-none pr-10 min-w-[140px]"
          >
            <option value="all">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="PICKED_UP">Picked Up</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
        </div>

        {/* Platform Filter */}
        <div className="relative">
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="input appearance-none pr-10 min-w-[140px]"
          >
            <option value="all">All Platforms</option>
            {platforms.map(p => (
              <option key={p} value={p.toLowerCase()}>{p}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-dark-700 rounded-lg p-4 border border-dark-500">
          <p className="text-gray-500 text-sm">Total</p>
          <p className="text-2xl font-bold text-white">{orders.length}</p>
        </div>
        <div className="bg-dark-700 rounded-lg p-4 border border-dark-500">
          <p className="text-gray-500 text-sm">Active</p>
          <p className="text-2xl font-bold text-blue-400">
            {orders.filter(o => o.source === 'active').length}
          </p>
        </div>
        <div className="bg-dark-700 rounded-lg p-4 border border-dark-500">
          <p className="text-gray-500 text-sm">Delivered</p>
          <p className="text-2xl font-bold text-emerald-400">
            {orders.filter(o => o.status === 'DELIVERED').length}
          </p>
        </div>
        <div className="bg-dark-700 rounded-lg p-4 border border-dark-500">
          <p className="text-gray-500 text-sm">Cancelled</p>
          <p className="text-2xl font-bold text-red-400">
            {orders.filter(o => o.status === 'CANCELLED').length}
          </p>
        </div>
        <div className="bg-dark-700 rounded-lg p-4 border border-dark-500">
          <p className="text-gray-500 text-sm">Total Value</p>
          <p className="text-2xl font-bold text-amber-400">
            £{orders.reduce((sum, o) => sum + (o.price || 0), 0).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Orders Table */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Restaurant</th>
                <th>Platform</th>
                <th>Price</th>
                <th>Status</th>
                <th>Pickup</th>
                <th>Delivery</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">
                    No orders found
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${getStatusColor(order.status)}20` }}
                        >
                          {getStatusIcon(order.status)}
                        </div>
                        <div>
                          <p className="text-white font-medium">{order.restaurant_name}</p>
                          <p className="text-gray-500 text-xs">
                            {order.source === 'active' ? '🟢 Active' : '✓ Completed'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span 
                        className="badge"
                        style={{ 
                          backgroundColor: `${getPlatformColor(order.platform)}20`,
                          color: getPlatformColor(order.platform)
                        }}
                      >
                        {order.platform}
                      </span>
                    </td>
                    <td className="text-white font-medium">
                      £{order.price?.toFixed(2)}
                    </td>
                    <td>
                      <span 
                        className="badge flex items-center gap-1 w-fit"
                        style={{ 
                          backgroundColor: `${getStatusColor(order.status)}20`,
                          color: getStatusColor(order.status)
                        }}
                      >
                        {getStatusIcon(order.status)}
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-start gap-2 max-w-[200px]">
                        <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-400 text-sm truncate">{order.pickup_address}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-start gap-2 max-w-[200px]">
                        <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-400 text-sm truncate">{order.delivery_address}</span>
                      </div>
                    </td>
                    <td className="text-gray-400 text-sm">
                      {formatDateTime(order.created_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
