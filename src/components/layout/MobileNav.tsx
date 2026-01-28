import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard,
  Package,
  Users,
  MapPin,
  Settings,
} from 'lucide-react'

const adminNavItems = [
  { icon: LayoutDashboard, label: 'Home', path: '/' },
  { icon: Package, label: 'Orders', path: '/orders' },
  { icon: Users, label: 'Clients', path: '/clients' },
  { icon: MapPin, label: 'Locations', path: '/locations' },
  { icon: Settings, label: 'Settings', path: '/settings' },
]

const clientNavItems = [
  { icon: LayoutDashboard, label: 'Home', path: '/' },
  { icon: Package, label: 'Orders', path: '/orders' },
  { icon: Settings, label: 'Settings', path: '/settings' },
]

export function MobileNav() {
  const { user } = useAuth()
  const location = useLocation()

  const navItems = user?.role === 'admin' ? adminNavItems : clientNavItems

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden">
      {/* Gradient fade effect */}
      <div className="absolute bottom-full left-0 right-0 h-8 bg-gradient-to-t from-background to-transparent pointer-events-none" />
      
      {/* Nav bar */}
      <div className="bg-[#1a1d24]/95 backdrop-blur-xl border-t border-white/10 px-2 pb-safe">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className="relative flex flex-col items-center py-2 px-3"
              >
                <motion.div
                  className={cn(
                    'relative p-2 rounded-xl transition-colors',
                    isActive ? 'bg-blue-500/20' : ''
                  )}
                  whileTap={{ scale: 0.9 }}
                >
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 bg-blue-500/20 rounded-xl"
                      layoutId="mobileNavIndicator"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                  <item.icon className={cn(
                    'h-5 w-5 relative z-10',
                    isActive ? 'text-blue-400' : 'text-muted-foreground'
                  )} />
                </motion.div>
                <span className={cn(
                  'text-[10px] mt-1 font-medium',
                  isActive ? 'text-blue-400' : 'text-muted-foreground'
                )}>
                  {item.label}
                </span>
              </NavLink>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
