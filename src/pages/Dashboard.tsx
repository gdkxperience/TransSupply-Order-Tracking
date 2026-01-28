import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useOrders } from '../context/OrderContext'
import { Layout } from '../components/layout/Layout'
import { Card, Badge, StatsCard } from '../components/ui'
import { formatDate, formatCurrency } from '../lib/utils'
import {
  Package,
  Truck,
  Warehouse,
  CheckCircle2,
  Weight,
  Euro,
  ArrowRight,
  TrendingUp,
  MapPin,
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
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold">
          Welcome back, <span className="text-blue-400">{user?.name.split(' ')[0]}</span>
        </h1>
        <p className="text-muted-foreground mt-1">
          Here's what's happening with your logistics today.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <StatsCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={Package}
          accent
          change="+12% from last month"
          changeType="increase"
          delay={0}
        />
        <StatsCard
          title="Pending Pickups"
          value={stats.pendingPickups}
          icon={Truck}
          delay={0.05}
        />
        <StatsCard
          title="In Warehouse"
          value={stats.inWarehouse}
          icon={Warehouse}
          delay={0.1}
        />
        <StatsCard
          title="Delivered"
          value={stats.delivered}
          icon={CheckCircle2}
          delay={0.15}
        />
        <StatsCard
          title="Total Weight"
          value={`${stats.totalWeight.toLocaleString()} kg`}
          icon={Weight}
          delay={0.2}
        />
        <StatsCard
          title="Revenue"
          value={formatCurrency(stats.totalRevenue)}
          icon={Euro}
          accent
          change="+8% growth"
          changeType="increase"
          delay={0.25}
        />
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card variant="glass">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold">Recent Orders</h2>
                <p className="text-sm text-muted-foreground">Track your latest shipments</p>
              </div>
              <motion.button
                className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                onClick={() => navigate('/orders')}
                whileHover={{ x: 4 }}
              >
                View All
                <ArrowRight className="h-4 w-4" />
              </motion.button>
            </div>

            <div className="space-y-3">
              {recentOrders.map((order, index) => (
                <motion.div
                  key={order.id}
                  className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 cursor-pointer transition-all"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                  whileHover={{ x: 4 }}
                  onClick={() => navigate(`/orders/${order.id}`)}
                >
                  <div className="flex-shrink-0">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      order.status === 'warehouse' ? 'bg-blue-500' : 'bg-neutral-700'
                    }`}>
                      {order.status === 'pickup' && <Truck className="h-5 w-5 text-white" />}
                      {order.status === 'warehouse' && <Warehouse className="h-5 w-5 text-white" />}
                      {order.status === 'delivered' && <CheckCircle2 className="h-5 w-5 text-white" />}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{order.internal_ref}</p>
                      <Badge variant={order.status} pulse={order.status !== 'delivered'}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {order.pickup_address.city}, {order.pickup_address.country}
                      </span>
                      <span>•</span>
                      <span>{order.total_weight_kg} kg</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(order.total_price)}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(order.collection_date)}</p>
                  </div>
                </motion.div>
              ))}

              {recentOrders.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No orders yet</p>
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
                  { label: 'Pending Pickup', value: stats.pendingPickups, total: stats.totalOrders, color: 'bg-neutral-500' },
                  { label: 'In Warehouse', value: stats.inWarehouse, total: stats.totalOrders, color: 'bg-blue-500' },
                  { label: 'Delivered', value: stats.delivered, total: stats.totalOrders, color: 'bg-neutral-600' },
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
                className="mt-8 p-4 rounded-xl bg-white/5 border border-white/8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Great progress!</p>
                    <p className="text-xs text-neutral-400">
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
