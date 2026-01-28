import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Search, Moon, Sun, Command, Truck } from 'lucide-react'
import { cn } from '../../lib/utils'

export function Header() {
  const [isDark, setIsDark] = useState(true)
  const [hasNotifications] = useState(true)

  return (
    <header className="sticky top-0 z-30 backdrop-blur-xl bg-background/80 border-b border-white/10">
      <div className="flex items-center justify-between h-14 md:h-16 px-4 md:px-6">
        {/* Mobile Logo */}
        <div className="flex md:hidden items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <Truck className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-sm">TransSupply</span>
        </div>
        
        {/* Search - triggers command palette */}
        <div className="hidden md:block flex-1 max-w-xl">
          <motion.button
            className={cn(
              'relative w-full flex items-center gap-3 pl-4 pr-3 py-2.5 rounded-xl',
              'bg-white/5 border border-white/10',
              'text-sm text-muted-foreground',
              'hover:bg-white/10 hover:text-foreground hover:border-white/20',
              'transition-all duration-300 cursor-pointer'
            )}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => {
              window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, ctrlKey: true }))
            }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <Search className="h-4 w-4" />
            <span className="flex-1 text-left">Search orders, clients...</span>
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/10 text-xs">
              <Command className="h-3 w-3" />
              <span>K</span>
            </div>
          </motion.button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 md:ml-6">
          {/* Mobile Search Button */}
          <motion.button
            className="md:hidden relative w-9 h-9 rounded-xl bg-white/5 border border-white/10 text-muted-foreground hover:text-foreground hover:bg-white/10 transition-all flex items-center justify-center"
            onClick={() => {
              window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, ctrlKey: true }))
            }}
            whileTap={{ scale: 0.95 }}
          >
            <Search className="h-4 w-4" />
          </motion.button>
          
          {/* Theme toggle - hidden on mobile */}
          <motion.button
            className="hidden md:flex relative w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-muted-foreground hover:text-foreground hover:bg-white/10 transition-all items-center justify-center"
            onClick={() => setIsDark(!isDark)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <AnimatePresence mode="wait">
              {isDark ? (
                <motion.div
                  key="moon"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Moon className="h-4 w-4" />
                </motion.div>
              ) : (
                <motion.div
                  key="sun"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Sun className="h-4 w-4" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Notifications */}
          <motion.button
            className="relative w-9 h-9 md:w-10 md:h-10 rounded-xl bg-white/5 border border-white/10 text-muted-foreground hover:text-foreground hover:bg-white/10 transition-all flex items-center justify-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Bell className="h-4 w-4" />
            {hasNotifications && (
              <motion.span
                className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
          </motion.button>
        </div>
      </div>
    </header>
  )
}
