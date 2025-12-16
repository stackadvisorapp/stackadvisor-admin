'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  CreditCard, 
  Globe, 
  Megaphone,
  Settings,
  LogOut,
  Layers
} from 'lucide-react'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/users', label: 'Users', icon: Users },
  { href: '/orders', label: 'Orders', icon: Package },
  { href: '/subscriptions', label: 'Subscriptions', icon: CreditCard },
  { href: '/regions', label: 'Regions', icon: Globe },
  { href: '/announcements', label: 'Announcements', icon: Megaphone },
  { href: '/settings', label: 'App Settings', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()

  const handleLogout = () => {
    localStorage.removeItem('stackadvisor_admin_auth')
    window.location.reload()
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-dark-800 border-r border-dark-600 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-dark-600">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center">
            <Layers className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">StackAdvisor</h1>
            <p className="text-xs text-gray-500">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                  : 'text-gray-400 hover:bg-dark-600 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-dark-600">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-gray-400 hover:bg-red-500/20 hover:text-red-400 transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
        <p className="text-xs text-gray-600 text-center mt-4">
          v1.0.0 • Nixflex Enterprises
        </p>
      </div>
    </aside>
  )
}
