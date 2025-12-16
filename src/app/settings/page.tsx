'use client'

import { useState, useEffect } from 'react'
import { Save, Loader2, Info } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({
    trial_days: '30',
    subscription_price_gbp: '5.00',
    max_stacking_distance_miles: '2.0',
    min_app_version: '1.0.0',
    maintenance_mode: 'false'
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  async function fetchSettings() {
    try {
      const { data } = await supabase.from('app_settings').select('*')
      if (data && data.length > 0) {
        const settingsMap: Record<string, string> = {}
        data.forEach((s: any) => { settingsMap[s.key] = s.value })
        setSettings(prev => ({ ...prev, ...settingsMap }))
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  async function saveSettings() {
    setSaving(true)
    try {
      for (const [key, value] of Object.entries(settings)) {
        await supabase.from('app_settings').upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })
      }
      alert('Settings saved!')
    } catch (error) {
      alert('Error saving settings')
    } finally {
      setSaving(false)
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">App Settings</h1>
          <p className="text-gray-500 mt-1">Remote configuration for StackAdvisor app</p>
        </div>
        <button onClick={saveSettings} disabled={saving} className="btn btn-primary">
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          Save Changes
        </button>
      </div>

      <div className="card border-blue-500/30 bg-blue-500/5">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-gray-400 text-sm">Changes take effect when users restart the app.</p>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4">Trial & Subscription</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Trial Days</label>
            <input type="number" value={settings.trial_days} onChange={(e) => setSettings({...settings, trial_days: e.target.value})} className="input" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Price (GBP)</label>
            <input type="number" value={settings.subscription_price_gbp} onChange={(e) => setSettings({...settings, subscription_price_gbp: e.target.value})} className="input" step="0.01" />
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4">App Control</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Min App Version</label>
            <input type="text" value={settings.min_app_version} onChange={(e) => setSettings({...settings, min_app_version: e.target.value})} className="input" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Max Stacking Distance (miles)</label>
            <input type="number" value={settings.max_stacking_distance_miles} onChange={(e) => setSettings({...settings, max_stacking_distance_miles: e.target.value})} className="input" step="0.1" />
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between p-4 bg-dark-600 rounded-lg">
          <div>
            <p className="text-white font-medium">Maintenance Mode</p>
            <p className="text-gray-500 text-sm">Disable app for all users</p>
          </div>
          <button
            onClick={() => setSettings({...settings, maintenance_mode: settings.maintenance_mode === 'true' ? 'false' : 'true'})}
            className={`relative w-14 h-7 rounded-full transition-colors ${settings.maintenance_mode === 'true' ? 'bg-red-500' : 'bg-dark-500'}`}
          >
            <span className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${settings.maintenance_mode === 'true' ? 'translate-x-8' : 'translate-x-1'}`} />
          </button>
        </div>
      </div>
    </div>
  )
}
