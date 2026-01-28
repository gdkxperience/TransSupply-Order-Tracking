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
  accent?: boolean
  delay?: number
}

export function StatsCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  accent = false,
  delay = 0
}: StatsCardProps) {
  return (
    <motion.div
      className="rounded-2xl bg-white/3 border border-white/8 p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      {/* Icon */}
      <div
        className={cn(
          'inline-flex items-center justify-center w-10 h-10 rounded-lg mb-4',
          accent ? 'bg-blue-500' : 'bg-neutral-700'
        )}
      >
        <Icon className="h-5 w-5 text-white" />
      </div>

      {/* Content */}
      <div>
        <p className="text-sm text-neutral-400">{title}</p>
        <p className="text-2xl font-semibold mt-1">{value}</p>
        
        {change && (
          <p
            className={cn(
              'text-sm mt-2',
              changeType === 'increase' && 'text-blue-400',
              changeType === 'decrease' && 'text-neutral-500',
              changeType === 'neutral' && 'text-neutral-500'
            )}
          >
            {change}
          </p>
        )}
      </div>
    </motion.div>
  )
}
