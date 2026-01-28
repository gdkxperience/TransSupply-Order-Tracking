import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, type = 'button', ...props }, ref) => {
    const variants = {
      primary: 'bg-indigo-500 text-white hover:bg-indigo-600',
      secondary: 'bg-white/10 text-white border border-white/20 hover:bg-white/20',
      ghost: 'text-muted-foreground hover:text-foreground hover:bg-white/5',
      danger: 'bg-red-500 text-white hover:bg-red-600',
      success: 'bg-emerald-500 text-white hover:bg-emerald-600',
    }

    const sizes = {
      sm: 'px-3 py-1.5 text-sm rounded-lg',
      md: 'px-5 py-2.5 text-sm rounded-xl',
      lg: 'px-8 py-3.5 text-base rounded-xl',
    }

    return (
      <motion.button
        ref={ref}
        type={type}
        className={cn(
          'relative inline-flex items-center justify-center gap-2 font-medium',
          'transition-all duration-300 ease-out',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'overflow-hidden',
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || isLoading}
        whileHover={{ scale: disabled ? 1 : 1.02 }}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading...</span>
          </>
        ) : (
          children
        )}
      </motion.button>
    )
  }
)

Button.displayName = 'Button'

export { Button }
