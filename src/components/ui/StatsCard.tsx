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
      className="rounded-xl md:rounded-2xl bg-white/[0.04] border border-white/[0.08] p-3 md:p-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className={cn(
            'flex-shrink-0 flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-lg',
            colorClasses[color]
          )}
        >
          <Icon className="h-4 w-4 md:h-5 md:w-5 text-white" />
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <p className="text-xs md:text-sm text-slate-400 truncate">{title}</p>
          <p className="text-lg md:text-xl font-semibold mt-0.5 truncate">{value}</p>
          
          {change && (
            <p
              className={cn(
                'text-xs mt-1 hidden md:block',
                changeType === 'increase' && 'text-emerald-400',
                changeType === 'decrease' && 'text-red-400',
                changeType === 'neutral' && 'text-slate-500'
              )}
            >
              {change}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  )
}
