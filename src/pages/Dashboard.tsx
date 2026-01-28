import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useOrders } from '../context/OrderContext'
import { Layout } from '../components/layout/Layout'
import { Card, StatsCard } from '../components/ui'
import { formatCurrency, cn } from '../lib/utils'
import {
  Package,
  Truck,
  Warehouse,
  CheckCircle2,
  Weight,
  Euro,
  ArrowRight,
  TrendingUp,
} from 'lucide-react'

export function Dashboard() {
  const { user } = useAuth()
  const { orders, getStats, loading } = useOrders()
  const navigate = useNavigate()
  const stats = getStats()

  const recentOrders = orders.slice(0, 5)

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      {/* Welcome section */}
      <motion.div
        className="mb-6 md:mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold">
          Welcome back, <span className="text-blue-400">{user?.name.split(' ')[0]}</span>
        </h1>
        <p className="text-muted-foreground mt-1 text-sm md:text-base">
          Here's what's happening with your logistics today.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4 mb-6 md:mb-8">
        <StatsCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={Package}
          color="blue"
          change="+12% from last month"
          changeType="increase"
          delay={0}
        />
        <StatsCard
          title="Pending Pickups"
          value={stats.pendingPickups}
          icon={Truck}
          color="amber"
          delay={0.05}
        />
        <StatsCard
          title="In Warehouse"
          value={stats.inWarehouse}
          icon={Warehouse}
          color="blue"
          delay={0.1}
        />
        <StatsCard
          title="Delivered"
          value={stats.delivered}
          icon={CheckCircle2}
          color="emerald"
          delay={0.15}
        />
        <StatsCard
          title="Total Weight"
          value={`${stats.totalWeight.toLocaleString()} kg`}
          icon={Weight}
          color="cyan"
          delay={0.2}
        />
        <StatsCard
          title="Revenue"
          value={formatCurrency(stats.totalRevenue)}
          icon={Euro}
          color="rose"
          change="+8% growth"
          changeType="increase"
          delay={0.25}
        />
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Recent Orders */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card variant="glass">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div>
                <h2 className="text-base md:text-lg font-semibold">Recent Orders</h2>
                <p className="text-xs md:text-sm text-muted-foreground hidden md:block">Track your latest shipments</p>
              </div>
              <motion.button
                className="flex items-center gap-1 md:gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                onClick={() => navigate('/orders')}
                whileHover={{ x: 4 }}
              >
                View All
                <ArrowRight className="h-4 w-4" />
              </motion.button>
            </div>

            <div className="space-y-1 md:space-y-2">
              {recentOrders.map((order, index) => (
                <motion.div
                  key={order.id}
                  className="flex items-center gap-3 p-2.5 md:p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] active:bg-white/[0.08] cursor-pointer transition-all"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.03 }}
                  onClick={() => navigate(`/orders/${order.id}`)}
                >
                  {/* Status Icon */}
                  <div className={cn(
                    'w-8 h-8 md:w-9 md:h-9 rounded-lg flex items-center justify-center flex-shrink-0',
                    order.status === 'pickup' && 'bg-amber-500/20 text-amber-400',
                    order.status === 'warehouse' && 'bg-blue-500/20 text-blue-400',
                    order.status === 'delivered' && 'bg-emerald-500/20 text-emerald-400',
                  )}>
                    {order.status === 'pickup' && <Truck className="h-4 w-4" />}
                    {order.status === 'warehouse' && <Warehouse className="h-4 w-4" />}
                    {order.status === 'delivered' && <CheckCircle2 className="h-4 w-4" />}
                  </div>
                  
                  {/* Main Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{order.internal_ref}</span>
                      <span className="text-xs text-muted-foreground hidden md:inline">· {order.pickup_address.city}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      <span className="md:hidden">{order.pickup_address.city} · </span>
                      {order.receiver_name}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="text-right flex-shrink-0">
                    <p className="font-semibold text-sm text-blue-400">{formatCurrency(order.total_price)}</p>
                    <p className="text-xs text-muted-foreground">{order.total_weight_kg}kg</p>
                  </div>
                </motion.div>
              ))}

              {recentOrders.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-10 w-10 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No orders yet</p>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Status Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card variant="glass" className="h-full">
            <div className="mb-6">
              <h2 className="text-lg font-semibold">Order Status</h2>
              <p className="text-sm text-muted-foreground">Distribution overview</p>
            </div>

            <div className="space-y-6">
              {/* Status bars */}
              <div className="space-y-4">
                {[
                  { label: 'Pending Pickup', value: stats.pendingPickups, total: stats.totalOrders, color: 'bg-amber-500' },
                  { label: 'In Warehouse', value: stats.inWarehouse, total: stats.totalOrders, color: 'bg-blue-500' },
                  { label: 'Delivered', value: stats.delivered, total: stats.totalOrders, color: 'bg-emerald-500' },
                ].map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">{item.label}</span>
                      <span className="text-sm font-medium">{item.value}</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${item.color}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${item.total > 0 ? (item.value / item.total) * 100 : 0}%` }}
                        transition={{ delay: 0.4 + index * 0.1, duration: 0.6, ease: 'easeOut' }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Quick action */}
              <motion.div
                className="mt-8 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Great progress!</p>
                    <p className="text-xs text-slate-400">
                      {stats.delivered} orders delivered this quarter
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </Card>
        </motion.div>
      </div>
    </Layout>
  )
}
