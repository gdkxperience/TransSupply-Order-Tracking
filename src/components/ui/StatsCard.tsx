import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'
import type { ElementType } from 'react'

interface StatsCardProps {
  title: string
  value: string | number
  change?: string
  changeType?: 'increase' | 'decrease' | 'neutral'
  icon: ElementType
  color?: 'blue' | 'amber' | 'emerald' | 'cyan' | 'rose' | 'slate'
  delay?: number
}

export function StatsCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  color = 'slate',
  delay = 0
}: StatsCardProps) {
  const colorClasses = {
    blue: 'bg-blue-500',
    amber: 'bg-amber-500',
    emerald: 'bg-emerald-500',
    cyan: 'bg-cyan-500',
    rose: 'bg-rose-500',
    slate: 'bg-slate-600',
  }

  return (
    <motion.div
      className="rounded-2xl bg-white/[0.04] border border-white/[0.08] p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      {/* Icon */}
      <div
        className={cn(
          'inline-flex items-center justify-center w-10 h-10 rounded-lg mb-4',
          colorClasses[color]
        )}
      >
        <Icon className="h-5 w-5 text-white" />
      </div>

      {/* Content */}
      <div>
        <p className="text-sm text-slate-400">{title}</p>
        <p className="text-2xl font-semibold mt-1">{value}</p>
        
        {change && (
          <p
            className={cn(
              'text-sm mt-2',
              changeType === 'increase' && 'text-emerald-400',
              changeType === 'decrease' && 'text-red-400',
              changeType === 'neutral' && 'text-slate-500'
            )}
          >
            {change}
          </p>
        )}
      </div>
    </motion.div>
  )
}
