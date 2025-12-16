'use client'

import { useState, useEffect } from 'react'
import { 
  Settings,
  Save,
  Loader2,
  Clock,
  DollarSign,
  MapPin,
  Shield,
  RefreshCw,
  Info
} from 'lucide-react'
import { supabase, AppSetting, formatDateTime } from '@/lib/supabase'

const defaultSettings = [
  { key: 'trial_days', value: '30', description: 'Number of days for free trial', icon: Clock, type: 'number' },
  { key: 'subscription_price_gbp', value: '5.00', description: 'Monthly subscription price in GBP', icon: DollarSign, type: 'number' },
  { key: 'subscription_price_usd', value: '6.00', description: 'Monthly subscription price in USD', icon: DollarSign, type: 'number' },
  { key: 'max_stacking_distance_miles', value: '2.0', description: 'Maximum distance (miles) to consider for stacking', icon: MapPin, type: 'number' },
  { key: 'min_app_version', value: '1.0.0', description: 'Minimum required app version', icon: Shield, type: 'text' },
  { key: 'maintenance_mode', value: 'false', description: 'Enable maintenance mode (disables app)', icon: Shield, type: 'boolean' },
  { key: 'force_update', value: 'false', description: 'Force users to update to min_app_version', icon: RefreshCw, type: 'boolean' },
  { key: 'auto_delivery_radius_miles', value: '0.1', description: 'Radius for auto-marking orders as delivered', icon: MapPin, type: 'number' },
  { key: 'order_flash_reminder_minutes', value: '2', description: 'Minutes before order flashes reminder', icon: Clock, type: 'number' }
]

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)

  useEffect(() => {
    fetchSettings()
  }, [])

  async function fetchSettings() {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')

      if (error) {
        console.log('Settings table may not exist:', error)
        const defaults: Record<string, string> = {}
        defaultSettings.forEach(s => { defaults[s.key] = s.value })
        setSettings(defaults)
      } else if (data && data.length > 0) {
        const settingsMap: Record<string, string> = {}
        data.forEach((s: any) => { settingsMap[s.key] = s.value })
        defaultSettings.forEach(def => {
          if (!settingsMap[def.key]) { settingsMap[def.key] = def.value }
        })
        setSettings(settingsMap)
        
        if (data.length > 0) {
          const latest = data.reduce((prev: any, curr: any) => 
            new Date(curr.updated_at) > new Date(prev.updated_at) ? curr : prev
          )
          setLastUpdated(latest.updated_at)
        }
      } else {
        const defaults: Record<string, string> = {}
        defaultSettings.forEach(s => { defaults[s.key] = s.value })
        setSettings(defaults)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  function updateSetting(key: string, value: string) {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  async function saveSettings() {
    setSaving(true)
    try {
      for (const setting of defaultSettings) {
        await supabase
          .from('app_settings')
          .upsert({
            key: setting.key,
            value: settings[setting.key] || setting.value,
            description: setting.description,
            updated_at: new Date().toISOString()
          }, { onConflict: 'key' })
      }
      setLastUpdated(new Date().toISOString())
      alert('Settings saved successfully!')
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Error saving settings. Make sure the table exists.')
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
          <div>
            <p className="text-white font-medium">Remote Configuration</p>
            <p className="text-gray-400 text-sm mt-1">
              These settings are synced to the app without requiring an update.
              {lastUpdated && <span className="block mt-1 text-gray-500">Last updated: {formatDateTime(lastUpdated)}</span>}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            Trial & Subscription
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {defaultSettings.filter(s => ['trial_days', 'subscription_price_gbp', 'subscription_price_usd'].includes(s.key)).map(setting => (
              <div key={setting.key}>
                <label className="block text-sm font-medium text-gray-400 mb-2">{setting.description}</label>
