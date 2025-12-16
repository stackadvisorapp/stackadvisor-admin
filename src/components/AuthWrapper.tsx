'use client'

import { useState, useEffect } from 'react'
import { Layers, Eye, EyeOff } from 'lucide-react'

interface AuthWrapperProps {
  children: React.ReactNode
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  // Check if already logged in
  useEffect(() => {
    const auth = localStorage.getItem('stackadvisor_admin_auth')
    if (auth === 'authenticated') {
      setIsAuthenticated(true)
    }
    setIsLoading(false)
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Simple admin check - you can change these credentials
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@stackadvisor.com'
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'StackAdmin2025!'

    if (email === adminEmail && password === adminPassword) {
      localStorage.setItem('stackadvisor_admin_auth', 'authenticated')
      setIsAuthenticated(true)
    } else {
      setError('Invalid credentials')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="spinner border-emerald-500"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Layers className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">StackAdvisor</h1>
            <p className="text-gray-500 mt-1">Admin Panel</p>
          </div>

          {/* Login Card */}
          <div className="bg-dark-800 rounded-2xl border border-dark-600 p-8">
            <h2 className="text-xl font-semibold text-white mb-6">Sign In</h2>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                  placeholder="admin@stackadvisor.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input pr-12"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-red-400 text-sm">{error}</p>
              )}

              <button
                type="submit"
                className="w-full btn btn-primary py-3 justify-center"
              >
                Sign In
              </button>
            </form>
          </div>

          <p className="text-center text-gray-600 text-sm mt-6">
            Secure admin access only
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
