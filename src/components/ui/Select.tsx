import { forwardRef, useState, type SelectHTMLAttributes } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../../lib/utils'
import { ChevronDown } from 'lucide-react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false)

    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-muted-foreground">
            {label}
          </label>
        )}
        
        <div className="relative">
          <AnimatePresence>
            {isFocused && (
              <motion.div
                className="absolute -inset-[2px] bg-gradient-to-r from-indigo-500/50 to-purple-500/50 rounded-xl blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            )}
          </AnimatePresence>

          <div className="relative">
            <select
              className={cn(
                'w-full px-4 py-3 pr-10 rounded-xl appearance-none',
                'bg-white/5 border border-white/10',
                'text-foreground',
                'focus:outline-none focus:border-indigo-500/50',
                'transition-all duration-300',
                error && 'border-red-500/50',
                className
              )}
              ref={ref}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              {...props}
            >
              {options.map((option) => (
                <option key={option.value} value={option.value} className="bg-card">
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'

export { Select }
