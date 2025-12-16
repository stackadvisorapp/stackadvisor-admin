'use client'

import { useState, useEffect } from 'react'
import { 
  Megaphone,
  Plus,
  Trash2,
  Edit,
  Loader2,
  Info,
  AlertTriangle,
  Gift,
  Bell,
  Globe,
  X
} from 'lucide-react'
import { supabase, Announcement, formatDateTime } from '@/lib/supabase'

const typeIcons = {
  info: Info,
  warning: AlertTriangle,
  update: Bell,
  promo: Gift
}

const typeColors = {
  info: '#3B82F6',
  warning: '#F59E0B',
  update: '#10B981',
  promo: '#EC4899'
}

const regions = [
  { id: null, name: 'All Regions', flag: '🌍' },
  { id: 'europe', name: 'Europe', flag: '🇪🇺' },
  { id: 'americas', name: 'Americas', flag: '🌎' },
  { id: 'asia_pacific', name: 'Asia Pacific', flag: '🌏' },
  { id: 'gcc', name: 'GCC', flag: '🏜️' }
]

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null)
  
  // Form state
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [type, setType] = useState<'info' | 'warning' | 'update' | 'promo'>('info')
  const [targetRegion, setTargetRegion] = useState<string | null>(null)
  const [isActive, setIsActive] = useState(true)
  const [startsAt, setStartsAt] = useState('')
  const [endsAt, setEndsAt] = useState('')

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  async function fetchAnnouncements() {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        // Table might not exist yet
        console.log('Announcements table may not exist:', error)
        setAnnouncements([])
      } else {
        setAnnouncements(data || [])
      }
    } catch (error) {
      console.error('Error fetching announcements:', error)
    } finally {
      setLoading(false)
    }
  }

  function resetForm() {
    setTitle('')
    setMessage('')
    setType('info')
    setTargetRegion(null)
    setIsActive(true)
    setStartsAt('')
    setEndsAt('')
    setEditingAnnouncement(null)
  }

  function openCreateModal() {
    resetForm()
    // Set default start time to now
    const now = new Date()
    setStartsAt(now.toISOString().slice(0, 16))
    setShowModal(true)
  }

  function openEditModal(announcement: Announcement) {
    setEditingAnnouncement(announcement)
    setTitle(announcement.title)
    setMessage(announcement.message)
    setType(announcement.type)
    setTargetRegion(announcement.target_region)
    setIsActive(announcement.is_active)
    setStartsAt(announcement.starts_at?.slice(0, 16) || '')
    setEndsAt(announcement.ends_at?.slice(0, 16) || '')
    setShowModal(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    const announcementData = {
      title,
      message,
      type,
      target_region: targetRegion,
      is_active: isActive,
      starts_at: startsAt ? new Date(startsAt).toISOString() : new Date().toISOString(),
      ends_at: endsAt ? new Date(endsAt).toISOString() : null
    }

    try {
      if (editingAnnouncement) {
        // Update existing
        const { error } = await supabase
          .from('announcements')
          .update(announcementData)
          .eq('id', editingAnnouncement.id)

        if (error) throw error
      } else {
        // Create new
        const { error } = await supabase
          .from('announcements')
          .insert(announcementData)

        if (error) throw error
      }

      fetchAnnouncements()
      setShowModal(false)
      resetForm()
    } catch (error) {
      console.error('Error saving announcement:', error)
      alert('Error saving announcement. Make sure the table exists.')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this announcement?')) return

    try {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id)

      if (error) throw error
      fetchAnnouncements()
    } catch (error) {
      console.error('Error deleting announcement:', error)
    }
  }

  async function toggleActive(announcement: Announcement) {
    try {
      const { error } = await supabase
        .from('announcements')
        .update({ is_active: !announcement.is_active })
        .eq('id', announcement.id)

      if (error) throw error
      fetchAnnouncements()
    } catch (error) {
      console.error('Error toggling announcement:', error)
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
          <h1 className="text-3xl font-bold text-white">Announcements</h1>
          <p className="text-gray-500 mt-1">Send messages to app users</p>
        </div>
        <button onClick={openCreateModal} className="btn btn-primary">
          <Plus className="w-5 h-5" />
          New Announcement
        </button>
      </div>

      {/* Info Banner */}
      <div className="card border-blue-500/30 bg-blue-500/5">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-white font-medium">How Announcements Work</p>
            <p className="text-gray-400 text-sm mt-1">
              Active announcements appear as a banner when users open the app. 
              You can target specific regions or show to everyone. 
              Set an end date for time-limited announcements.
            </p>
          </div>
        </div>
      </div>

      {/* Announcements List */}
      {announcements.length === 0 ? (
        <div className="card text-center py-12">
          <Megaphone className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No Announcements</h3>
          <p className="text-gray-500 mb-4">Create your first announcement to communicate with users.</p>
          <button onClick={openCreateModal} className="btn btn-primary mx-auto">
            <Plus className="w-5 h-5" />
            Create Announcement
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map(announcement => {
            const TypeIcon = typeIcons[announcement.type] || Info
            const color = typeColors[announcement.type] || '#6B7280'
            const regionInfo = regions.find(r => r.id === announcement.target_region) || regions[0]

            return (
              <div 
                key={announcement.id} 
                className={`card ${!announcement.is_active ? 'opacity-60' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${color}20` }}
                    >
                      <TypeIcon className="w-6 h-6" style={{ color }} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-semibold text-white">{announcement.title}</h3>
                        <span 
                          className="badge"
                          style={{ backgroundColor: `${color}20`, color }}
                        >
                          {announcement.type}
                        </span>
                        {announcement.is_active ? (
                          <span className="badge bg-emerald-500/20 text-emerald-400">Active</span>
                        ) : (
                          <span className="badge bg-gray-500/20 text-gray-400">Inactive</span>
                        )}
                      </div>
                      <p className="text-gray-400 mb-3">{announcement.message}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Globe className="w-4 h-4" />
                          {regionInfo.flag} {regionInfo.name}
                        </span>
                        <span>Starts: {formatDateTime(announcement.starts_at)}</span>
                        {announcement.ends_at && (
                          <span>Ends: {formatDateTime(announcement.ends_at)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleActive(announcement)}
                      className={`p-2 rounded-lg transition-colors ${
                        announcement.is_active 
                          ? 'text-amber-400 hover:bg-amber-500/10' 
                          : 'text-emerald-400 hover:bg-emerald-500/10'
                      }`}
                      title={announcement.is_active ? 'Deactivate' : 'Activate'}
                    >
                      {announcement.is_active ? 'Pause' : 'Start'}
                    </button>
                    <button
                      onClick={() => openEditModal(announcement)}
                      className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(announcement.id)}
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 rounded-xl border border-dark-600 p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">
                {editingAnnouncement ? 'Edit Announcement' : 'New Announcement'}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false)
                  resetForm()
                }}
                className="p-2 text-gray-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input"
                  placeholder="Announcement title..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="input min-h-[100px]"
                  placeholder="Your message to users..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="input"
                  >
                    <option value="info">ℹ️ Info</option>
                    <option value="warning">⚠️ Warning</option>
                    <option value="update">🔔 Update</option>
                    <option value="promo">🎁 Promo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Target Region</label>
                  <select
                    value={targetRegion || ''}
                    onChange={(e) => setTargetRegion(e.target.value || null)}
                    className="input"
                  >
                    {regions.map(r => (
                      <option key={r.id || 'all'} value={r.id || ''}>
                        {r.flag} {r.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Start Date</label>
                  <input
                    type="datetime-local"
                    value={startsAt}
                    onChange={(e) => setStartsAt(e.target.value)}
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">End Date (optional)</label>
                  <input
                    type="datetime-local"
                    value={endsAt}
                    onChange={(e) => setEndsAt(e.target.value)}
                    className="input"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded border-dark-500 bg-dark-600 text-emerald-500 focus:ring-emerald-500"
                />
                <label htmlFor="isActive" className="text-gray-300">
                  Active (show to users immediately)
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    resetForm()
                  }}
                  className="btn btn-secondary flex-1 justify-center"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary flex-1 justify-center">
                  {editingAnnouncement ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
