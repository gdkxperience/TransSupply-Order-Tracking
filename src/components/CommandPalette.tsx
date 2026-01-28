import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useOrders } from '../context/OrderContext'
import {
  Search,
  Package,
  Users,
  MapPin,
  Settings,
  LayoutDashboard,
  ArrowRight,
  Command,
  Hash,
  Building2,
} from 'lucide-react'

interface SearchResult {
  id: string
  type: 'order' | 'client' | 'page'
  title: string
  subtitle: string
  icon: React.ReactNode
  action: () => void
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const navigate = useNavigate()
  const { orders, clients } = useOrders()

  // Open with Cmd+K or Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(prev => !prev)
        setQuery('')
        setSelectedIndex(0)
      }
      
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Static pages
  const pages: SearchResult[] = useMemo(() => [
    {
      id: 'dashboard',
      type: 'page' as const,
      title: 'Dashboard',
      subtitle: 'Overview and statistics',
      icon: <LayoutDashboard className="h-4 w-4" />,
      action: () => navigate('/dashboard'),
    },
    {
      id: 'orders',
      type: 'page' as const,
      title: 'Orders',
      subtitle: 'Manage all orders',
      icon: <Package className="h-4 w-4" />,
      action: () => navigate('/orders'),
    },
    {
      id: 'clients',
      type: 'page' as const,
      title: 'Clients',
      subtitle: 'View client list',
      icon: <Users className="h-4 w-4" />,
      action: () => navigate('/clients'),
    },
    {
      id: 'locations',
      type: 'page' as const,
      title: 'Locations',
      subtitle: 'Pickup locations',
      icon: <MapPin className="h-4 w-4" />,
      action: () => navigate('/locations'),
    },
    {
      id: 'settings',
      type: 'page' as const,
      title: 'Settings',
      subtitle: 'Account settings',
      icon: <Settings className="h-4 w-4" />,
      action: () => navigate('/settings'),
    },
  ], [navigate])

  // Search results
  const results = useMemo(() => {
    if (!query.trim()) {
      return pages
    }

    const lowerQuery = query.toLowerCase()
    const results: SearchResult[] = []

    // Search orders
    orders.forEach(order => {
      if (
        order.internal_ref.toLowerCase().includes(lowerQuery) ||
        order.receiver_name.toLowerCase().includes(lowerQuery) ||
        order.pickup_address.city.toLowerCase().includes(lowerQuery)
      ) {
        results.push({
          id: order.id,
          type: 'order',
          title: order.internal_ref,
          subtitle: `${order.pickup_address.city} → ${order.receiver_name} • ${order.status}`,
          icon: <Hash className="h-4 w-4" />,
          action: () => navigate(`/orders/${order.id}`),
        })
      }
    })

    // Search clients
    clients.forEach(client => {
      if (
        client.name.toLowerCase().includes(lowerQuery) ||
        client.email.toLowerCase().includes(lowerQuery)
      ) {
        results.push({
          id: client.id,
          type: 'client',
          title: client.name,
          subtitle: client.email,
          icon: <Building2 className="h-4 w-4" />,
          action: () => navigate('/clients'),
        })
      }
    })

    // Search pages
    pages.forEach(page => {
      if (page.title.toLowerCase().includes(lowerQuery)) {
        results.push(page)
      }
    })

    return results.slice(0, 10) // Limit results
  }, [query, orders, clients, pages, navigate])

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(prev => Math.min(prev + 1, results.length - 1))
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(prev => Math.max(prev - 1, 0))
      }
      if (e.key === 'Enter' && results[selectedIndex]) {
        e.preventDefault()
        results[selectedIndex].action()
        setIsOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, results, selectedIndex])

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0)
  }, [results])

  const handleSelect = useCallback((result: SearchResult) => {
    result.action()
    setIsOpen(false)
  }, [])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          />

          {/* Command Palette */}
          <motion.div
            className="fixed top-[15%] md:top-[20%] left-0 right-0 md:left-1/2 md:right-auto w-full md:max-w-xl z-[100] px-3 md:px-0"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{ transform: 'translateX(0)' }}
          >
            <div className="md:relative md:left-1/2 md:-translate-x-1/2 bg-[#1a1d24] rounded-2xl border border-white/15 shadow-2xl shadow-black/50 overflow-hidden">
              {/* Search Input */}
              <div className="flex items-center gap-3 px-3 md:px-4 py-3 md:py-4 border-b border-white/10">
                <Search className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="flex-1 bg-transparent text-base md:text-lg outline-none placeholder:text-muted-foreground min-w-0"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  autoFocus
                />
                <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-md bg-white/10 text-xs text-muted-foreground flex-shrink-0">
                  <Command className="h-3 w-3" />K
                </kbd>
              </div>

              {/* Results */}
              <div className="max-h-80 overflow-y-auto py-2">
                {results.length === 0 ? (
                  <div className="px-4 py-8 text-center text-muted-foreground">
                    <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No results found for "{query}"</p>
                  </div>
                ) : (
                  <div className="px-2">
                    {query.trim() === '' && (
                      <p className="px-3 py-2 text-xs text-muted-foreground font-medium uppercase tracking-wide">
                        Quick Navigation
                      </p>
                    )}
                    {results.map((result, index) => (
                      <motion.button
                        key={result.id}
                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors ${
                          index === selectedIndex
                            ? 'bg-blue-500/20 text-white'
                            : 'hover:bg-white/5 text-foreground'
                        }`}
                        onClick={() => handleSelect(result)}
                        onMouseEnter={() => setSelectedIndex(index)}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.02 }}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          result.type === 'order' ? 'bg-amber-500/20 text-amber-400' :
                          result.type === 'client' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-white/10 text-muted-foreground'
                        }`}>
                          {result.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{result.title}</p>
                          <p className="text-sm text-muted-foreground truncate">{result.subtitle}</p>
                        </div>
                        <ArrowRight className={`h-4 w-4 transition-opacity ${
                          index === selectedIndex ? 'opacity-100' : 'opacity-0'
                        }`} />
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer - Hidden on mobile */}
              <div className="hidden md:flex px-4 py-3 border-t border-white/10 items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-white/10">↑↓</kbd>
                    Navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-white/10">↵</kbd>
                    Select
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-white/10">esc</kbd>
                    Close
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
