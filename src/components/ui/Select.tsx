import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../../lib/utils'
import { ChevronDown, Check } from 'lucide-react'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  label?: string
  error?: string
  options: SelectOption[]
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function Select({ 
  label, 
  error, 
  options, 
  value, 
  onChange, 
  placeholder = 'Select...', 
  className,
  disabled 
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  
  const selectedOption = options.find(opt => opt.value === value)

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Close on outside click (desktop)
  useEffect(() => {
    if (!isMobile && isOpen) {
      const handleClick = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setIsOpen(false)
        }
      }
      document.addEventListener('mousedown', handleClick)
      return () => document.removeEventListener('mousedown', handleClick)
    }
  }, [isOpen, isMobile])

  // Prevent body scroll when mobile sheet is open
  useEffect(() => {
    if (isMobile && isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen, isMobile])

  const handleSelect = (optionValue: string) => {
    onChange?.(optionValue)
    setIsOpen(false)
  }

  return (
    <div className="space-y-2" ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-muted-foreground">
          {label}
        </label>
      )}
      
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(true)}
        className={cn(
          'w-full flex items-center justify-between',
          'px-3 md:px-4 py-2.5 md:py-3 rounded-xl text-sm md:text-base',
          'bg-white/5 border border-white/8',
          'text-foreground text-left',
          'transition-all duration-300',
          isOpen && 'border-blue-500/50',
          error && 'border-red-500/50',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
      >
        <span className={cn(!selectedOption && 'text-neutral-500')}>
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown className={cn(
          'h-4 w-4 text-muted-foreground transition-transform',
          isOpen && 'rotate-180'
        )} />
      </button>

      {/* Desktop Dropdown */}
      <AnimatePresence>
        {isOpen && !isMobile && (
          <motion.div
            className="absolute z-50 w-full mt-1 py-1 rounded-xl bg-[#1a1d24] border border-white/15 shadow-xl max-h-60 overflow-y-auto"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            style={{ position: 'absolute', left: 0, right: 0 }}
          >
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={cn(
                  'w-full flex items-center justify-between px-4 py-2.5 text-sm text-left',
                  'hover:bg-white/10 transition-colors',
                  option.value === value && 'bg-blue-500/10 text-blue-400'
                )}
              >
                <span>{option.label}</span>
                {option.value === value && <Check className="h-4 w-4" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Sheet */}
      <AnimatePresence>
        {isOpen && isMobile && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Sheet */}
            <motion.div
              className="fixed bottom-0 left-0 right-0 z-50 bg-[#1a1d24] rounded-t-3xl border-t border-white/10 max-h-[70vh] flex flex-col"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-2 flex-shrink-0">
                <div className="w-10 h-1 rounded-full bg-white/20" />
              </div>

              {/* Title */}
              {label && (
                <div className="px-4 pb-3 border-b border-white/10 flex-shrink-0">
                  <h3 className="text-lg font-semibold">{label}</h3>
                </div>
              )}

              {/* Options */}
              <div className="flex-1 overflow-y-auto overscroll-contain py-2">
                {options.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className={cn(
                      'w-full flex items-center justify-between px-4 py-4 text-left',
                      'active:bg-white/10 transition-colors',
                      option.value === value && 'bg-blue-500/10'
                    )}
                  >
                    <span className={cn(
                      'text-base',
                      option.value === value && 'text-blue-400 font-medium'
                    )}>
                      {option.label}
                    </span>
                    {option.value === value && (
                      <Check className="h-5 w-5 text-blue-400" />
                    )}
                  </button>
                ))}
              </div>

              {/* Cancel Button */}
              <div className="p-4 border-t border-white/10 flex-shrink-0 pb-safe">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-full py-3 rounded-xl bg-white/10 text-center font-medium active:bg-white/15 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
    </div>
  )
}
