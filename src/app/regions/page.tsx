'use client'

import { useState } from 'react'
import { 
  Globe,
  MapPin,
  Truck,
  ChevronDown,
  ChevronRight
} from 'lucide-react'

// Region and country data (matching your Android app)
const regionsData = [
  {
    id: 'europe',
    name: 'Europe',
    flag: '🌍',
    countries: [
      {
        code: 'GB',
        name: 'United Kingdom',
        flag: '🇬🇧',
        currency: 'GBP',
        currencySymbol: '£',
        defaultCity: 'London',
        platforms: ['Uber Eats', 'Deliveroo', 'Just Eat', 'Stuart']
      },
      {
        code: 'EU',
        name: 'Europe (EUR)',
        flag: '🇪🇺',
        currency: 'EUR',
        currencySymbol: '€',
        defaultCity: 'Paris',
        platforms: ['Uber Eats', 'Deliveroo', 'Just Eat', 'Glovo', 'Wolt']
      }
    ]
  },
  {
    id: 'americas',
    name: 'Americas',
    flag: '🌎',
    countries: [
      {
        code: 'US',
        name: 'United States',
        flag: '🇺🇸',
        currency: 'USD',
        currencySymbol: '$',
        defaultCity: 'New York',
        platforms: ['Uber Eats', 'DoorDash', 'Grubhub', 'Postmates']
      },
      {
        code: 'CA',
        name: 'Canada',
        flag: '🇨🇦',
        currency: 'CAD',
        currencySymbol: '$',
        defaultCity: 'Toronto',
        platforms: ['Uber Eats', 'DoorDash', 'SkipTheDishes']
      }
    ]
  },
  {
    id: 'asia_pacific',
    name: 'Asia Pacific',
    flag: '🌏',
    countries: [
      {
        code: 'AU',
        name: 'Australia',
        flag: '🇦🇺',
        currency: 'AUD',
        currencySymbol: '$',
        defaultCity: 'Sydney',
        platforms: ['Uber Eats', 'Deliveroo', 'Menulog', 'DoorDash']
      },
      {
        code: 'SG',
        name: 'Singapore',
        flag: '🇸🇬',
        currency: 'SGD',
        currencySymbol: '$',
        defaultCity: 'Singapore',
        platforms: ['Grab', 'Foodpanda', 'Deliveroo']
      },
      {
        code: 'JP',
        name: 'Japan',
        flag: '🇯🇵',
        currency: 'JPY',
        currencySymbol: '¥',
        defaultCity: 'Tokyo',
        platforms: ['Uber Eats', 'Demae-can', 'Wolt']
      }
    ]
  },
  {
    id: 'gcc',
    name: 'GCC / Middle East',
    flag: '🏜️',
    countries: [
      {
        code: 'AE',
        name: 'UAE',
        flag: '🇦🇪',
        currency: 'AED',
        currencySymbol: 'د.إ',
        defaultCity: 'Dubai',
        platforms: ['Talabat', 'Careem', 'Deliveroo', 'Noon']
      },
      {
        code: 'SA',
        name: 'Saudi Arabia',
        flag: '🇸🇦',
        currency: 'SAR',
        currencySymbol: 'ر.س',
        defaultCity: 'Riyadh',
        platforms: ['Talabat', 'Careem', 'HungerStation', 'Jahez', 'Noon']
      },
      {
        code: 'QA',
        name: 'Qatar',
        flag: '🇶🇦',
        currency: 'QAR',
        currencySymbol: 'ر.ق',
        defaultCity: 'Doha',
        platforms: ['Talabat', 'Careem', 'Snoonu', 'Deliveroo']
      },
      {
        code: 'KW',
        name: 'Kuwait',
        flag: '🇰🇼',
        currency: 'KWD',
        currencySymbol: 'د.ك',
        defaultCity: 'Kuwait City',
        platforms: ['Talabat', 'Careem', 'Deliveroo', 'Toters']
      },
      {
        code: 'BH',
        name: 'Bahrain',
        flag: '🇧🇭',
        currency: 'BHD',
        currencySymbol: 'د.ب',
        defaultCity: 'Manama',
        platforms: ['Talabat', 'Careem', 'Toters']
      },
      {
        code: 'OM',
        name: 'Oman',
        flag: '🇴🇲',
        currency: 'OMR',
        currencySymbol: 'ر.ع',
        defaultCity: 'Muscat',
        platforms: ['Talabat', 'Careem']
      }
    ]
  }
]

// Platform colors
const platformColors: Record<string, string> = {
  'Uber Eats': '#06C167',
  'Deliveroo': '#00CCBC',
  'Just Eat': '#FF8000',
  'Stuart': '#000000',
  'DoorDash': '#FF3008',
  'Grubhub': '#F63440',
  'Postmates': '#000000',
  'SkipTheDishes': '#FF6600',
  'Menulog': '#FF5A00',
  'Grab': '#00B14F',
  'Foodpanda': '#D70F64',
  'Glovo': '#FFC244',
  'Wolt': '#009DE0',
  'Demae-can': '#FF6B00',
  'Talabat': '#FF5A00',
  'Careem': '#4CD964',
  'Noon': '#FEEE00',
  'HungerStation': '#FF2D55',
  'Jahez': '#C9181E',
  'Toters': '#2C3E50',
  'Snoonu': '#FF5C00'
}

export default function RegionsPage() {
  const [expandedRegions, setExpandedRegions] = useState<string[]>(['europe'])

  const toggleRegion = (regionId: string) => {
    setExpandedRegions(prev => 
      prev.includes(regionId) 
        ? prev.filter(id => id !== regionId)
        : [...prev, regionId]
    )
  }

  // Count totals
  const totalCountries = regionsData.reduce((sum, r) => sum + r.countries.length, 0)
  const allPlatforms = new Set<string>()
  regionsData.forEach(r => r.countries.forEach(c => c.platforms.forEach(p => allPlatforms.add(p))))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Regions</h1>
        <p className="text-gray-500 mt-1">Supported regions, countries, and delivery platforms</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{regionsData.length}</p>
              <p className="text-gray-500 text-sm">Regions</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{totalCountries}</p>
              <p className="text-gray-500 text-sm">Countries</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Truck className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{allPlatforms.size}</p>
              <p className="text-gray-500 text-sm">Platforms</p>
            </div>
          </div>
        </div>
      </div>

      {/* Regions Accordion */}
      <div className="space-y-4">
        {regionsData.map(region => (
          <div key={region.id} className="card p-0 overflow-hidden">
            {/* Region Header */}
            <button
              onClick={() => toggleRegion(region.id)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-dark-600 transition-colors"
            >
              <div className="flex items-center gap-4">
                <span className="text-3xl">{region.flag}</span>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-white">{region.name}</h3>
                  <p className="text-gray-500 text-sm">{region.countries.length} countries</p>
                </div>
              </div>
              {expandedRegions.includes(region.id) ? (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {/* Countries */}
            {expandedRegions.includes(region.id) && (
              <div className="border-t border-dark-600">
                {region.countries.map((country, idx) => (
                  <div 
                    key={country.code}
                    className={`px-6 py-4 ${idx !== region.countries.length - 1 ? 'border-b border-dark-600' : ''}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{country.flag}</span>
                        <div>
                          <h4 className="text-white font-medium">{country.name}</h4>
                          <p className="text-gray-500 text-sm">
                            {country.currencySymbol} {country.currency} • {country.defaultCity}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500 bg-dark-600 px-2 py-1 rounded">
                        {country.code}
                      </span>
                    </div>
                    
                    {/* Platforms */}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {country.platforms.map(platform => (
                        <span
                          key={platform}
                          className="badge text-xs"
                          style={{
                            backgroundColor: `${platformColors[platform] || '#6B7280'}20`,
                            color: platformColors[platform] || '#6B7280'
                          }}
                        >
                          {platform}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* All Platforms Grid */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4">All Supported Platforms</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {Array.from(allPlatforms).sort().map(platform => (
            <div
              key={platform}
              className="flex items-center gap-2 p-3 bg-dark-600 rounded-lg"
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: platformColors[platform] || '#6B7280' }}
              />
              <span className="text-gray-300 text-sm">{platform}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
