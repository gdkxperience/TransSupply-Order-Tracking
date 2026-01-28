import { forwardRef, useState, type InputHTMLAttributes } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../../lib/utils'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, icon, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false)
    const [isFocused, setIsFocused] = useState(false)

    const isPassword = type === 'password'
    const inputType = isPassword && showPassword ? 'text' : type

    return (
      <div className="space-y-2">
        {label && (
          <motion.label
            className="block text-sm font-medium text-muted-foreground"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {label}
          </motion.label>
        )}
        
        <div className="relative">
          {/* Glow effect on focus */}
          <AnimatePresence>
            {isFocused && (
              <motion.div
                className="absolute -inset-[2px] bg-blue-500/30 rounded-xl blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            )}
          </AnimatePresence>

          <div className="relative flex items-center">
            {icon && (
              <div className="absolute left-4 text-muted-foreground">
                {icon}
              </div>
            )}
            
            <input
              type={inputType}
              className={cn(
                'w-full px-3 md:px-4 py-2.5 md:py-3 rounded-xl text-sm md:text-base',
                'bg-white/5 border border-white/8',
                'text-foreground placeholder:text-neutral-500',
                'focus:outline-none focus:border-blue-500/50',
                'transition-all duration-300',
                icon && 'pl-10 md:pl-11',
                isPassword && 'pr-10 md:pr-11',
                error && 'border-red-500/50',
                className
              )}
              ref={ref}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              {...props}
            />

            {isPassword && (
              <button
                type="button"
                className="absolute right-4 text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            )}
          </div>
        </div>

        <AnimatePresence>
          {error && (
            <motion.p
              className="flex items-center gap-1 text-sm text-red-400"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <AlertCircle className="h-3 w-3" />
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input }
