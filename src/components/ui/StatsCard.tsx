import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'
import type { ElementType } from 'react'

interface StatsCardProps {
  title: string
  value: string | number
  change?: string
  changeType?: 'increase' | 'decrease' | 'neutral'
  icon: ElementType
  color?: string
  delay?: number
}

export function StatsCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  color = 'bg-indigo-500',
  delay = 0
}: StatsCardProps) {
  return (
    <motion.div
      className="rounded-2xl bg-white/5 border border-white/10 p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      {/* Icon */}
      <div
        className={cn(
          'inline-flex items-center justify-center w-10 h-10 rounded-lg mb-4',
          color
        )}
      >
        <Icon className="h-5 w-5 text-white" />
      </div>

      {/* Content */}
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-2xl font-semibold mt-1">{value}</p>
        
        {change && (
          <p
            className={cn(
              'text-sm mt-2',
              changeType === 'increase' && 'text-emerald-400',
              changeType === 'decrease' && 'text-red-400',
              changeType === 'neutral' && 'text-muted-foreground'
            )}
          >
            {change}
          </p>
        )}
      </div>
    </motion.div>
  )
}
