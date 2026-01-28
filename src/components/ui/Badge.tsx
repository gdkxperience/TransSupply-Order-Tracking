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
      default: 'bg-slate-500/15 text-slate-300 border-slate-500/25',
      pickup: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
      warehouse: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
      delivered: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
      success: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
      warning: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
      danger: 'bg-red-500/15 text-red-400 border-red-500/25',
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
              !['pickup', 'warehouse', 'delivered'].includes(variant) && 'bg-slate-400',
            )} />
            <span className={cn(
              'relative inline-flex rounded-full h-2 w-2',
              variant === 'pickup' && 'bg-amber-400',
              variant === 'warehouse' && 'bg-blue-400',
              variant === 'delivered' && 'bg-emerald-400',
              !['pickup', 'warehouse', 'delivered'].includes(variant) && 'bg-slate-400',
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
