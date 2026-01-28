import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../../lib/utils'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard,
  Package,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Truck,
  MapPin,
} from 'lucide-react'

const adminNavItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Package, label: 'Orders', path: '/orders' },
  { icon: Users, label: 'Clients', path: '/clients' },
  { icon: MapPin, label: 'Locations', path: '/locations' },
  { icon: Settings, label: 'Settings', path: '/settings' },
]

const clientNavItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Package, label: 'My Orders', path: '/orders' },
  { icon: Settings, label: 'Settings', path: '/settings' },
]

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { user, logout } = useAuth()
  const location = useLocation()

  const navItems = user?.role === 'admin' ? adminNavItems : clientNavItems

  return (
    <motion.aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen',
        'backdrop-blur-2xl bg-card/80 border-r border-white/10',
        'flex flex-col'
      )}
      initial={{ width: 280 }}
      animate={{ width: isCollapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      {/* Logo */}
      <div className="flex items-center justify-between p-6 border-b border-white/10">
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div
              className="flex items-center gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex items-center justify-center w-10 h-10 bg-indigo-500 rounded-lg">
                <Truck className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-foreground">TransSupply</h1>
                <p className="text-xs text-muted-foreground">Logistics Hub</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {isCollapsed && (
          <div className="flex items-center justify-center w-full">
            <div className="flex items-center justify-center w-10 h-10 bg-indigo-500 rounded-lg">
              <Truck className="h-5 w-5 text-white" />
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {navItems.map((item, index) => {
          const isActive = location.pathname === item.path
          return (
            <NavLink key={item.path} to={item.path}>
              <motion.div
                className={cn(
                  'relative flex items-center gap-3 px-4 py-3 rounded-xl',
                  'transition-all duration-300',
                  isActive
                    ? 'bg-indigo-500/15 text-white'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                )}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ x: 4 }}
              >
                {isActive && (
                  <motion.div
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-500 rounded-full"
                    layoutId="activeIndicator"
                  />
                )}
                <item.icon className={cn('h-5 w-5 flex-shrink-0', isActive && 'text-indigo-400')} />
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      className="font-medium whitespace-nowrap"
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </NavLink>
          )
        })}
      </nav>

      {/* User info & Logout */}
      <div className="p-4 border-t border-white/10">
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-white/5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center">
                  <span className="text-sm font-bold text-white">
                    {user?.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-card rounded-full" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          className={cn(
            'flex items-center gap-3 w-full px-4 py-3 rounded-xl',
            'text-muted-foreground hover:text-red-400 hover:bg-red-500/10',
            'transition-all duration-300'
          )}
          onClick={logout}
          whileHover={{ x: 4 }}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                className="font-medium"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Collapse button */}
      <motion.button
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-card border border-white/10 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-indigo-500/50 transition-colors"
        onClick={() => setIsCollapsed(!isCollapsed)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </motion.button>
    </motion.aside>
  )
}
