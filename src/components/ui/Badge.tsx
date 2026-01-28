import { forwardRef, type HTMLAttributes } from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

interface BadgeProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart'> {
  variant?: 'default' | 'pickup' | 'warehouse' | 'delivered' | 'success' | 'warning' | 'danger'
  pulse?: boolean
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', pulse = false, children, ...props }, ref) => {
    const variants = {
      default: 'bg-white/10 text-white border-white/20',
      pickup: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      warehouse: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      delivered: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      success: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      warning: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      danger: 'bg-red-500/20 text-red-400 border-red-500/30',
    }

    return (
      <motion.span
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border',
          variants[variant],
          className
        )}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        {...props}
      >
        {pulse && (
          <span className="relative flex h-2 w-2">
            <span className={cn(
              'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
              variant === 'pickup' && 'bg-amber-400',
              variant === 'warehouse' && 'bg-blue-400',
              variant === 'delivered' && 'bg-emerald-400',
            )} />
            <span className={cn(
              'relative inline-flex rounded-full h-2 w-2',
              variant === 'pickup' && 'bg-amber-400',
              variant === 'warehouse' && 'bg-blue-400',
              variant === 'delivered' && 'bg-emerald-400',
            )} />
          </span>
        )}
        {children}
      </motion.span>
    )
  }
)

Badge.displayName = 'Badge'

export { Badge }
