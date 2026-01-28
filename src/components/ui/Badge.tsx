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
      default: 'bg-white/8 text-neutral-300 border-white/10',
      pickup: 'bg-white/8 text-neutral-300 border-white/10',
      warehouse: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
      delivered: 'bg-white/8 text-neutral-400 border-white/10',
      success: 'bg-white/8 text-neutral-400 border-white/10',
      warning: 'bg-white/8 text-neutral-300 border-white/10',
      danger: 'bg-white/8 text-neutral-400 border-white/10',
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
              variant === 'warehouse' ? 'bg-blue-400' : 'bg-neutral-400',
            )} />
            <span className={cn(
              'relative inline-flex rounded-full h-2 w-2',
              variant === 'warehouse' ? 'bg-blue-400' : 'bg-neutral-400',
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
