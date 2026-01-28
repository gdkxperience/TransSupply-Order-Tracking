import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useOrders } from '../context/OrderContext'
import { Layout } from '../components/layout/Layout'
import { Card, Badge, Button } from '../components/ui'
import { formatDate, formatCurrency, cn } from '../lib/utils'
import { WAREHOUSE_ADDRESS } from '../lib/supabase'
import {
  ArrowLeft,
  MapPin,
  Calendar,
  User,
  Phone,
  Package,
  Box,
  Truck,
  Warehouse,
  CheckCircle2,
  Download,
  Edit,
  Image,
  Navigation,
  Clock,
} from 'lucide-react'

export function OrderDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { getOrderById, updateOrder } = useOrders()

  const order = getOrderById(id || '')

  if (!order) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Package className="h-16 w-16 text-muted-foreground/50 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Order not found</h2>
          <p className="text-muted-foreground mb-6">The order you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/orders')}>
            <ArrowLeft className="h-4 w-4" />
            Back to Orders
          </Button>
        </div>
      </Layout>
    )
  }

  const statusSteps = [
    { key: 'pickup', label: 'Pickup', icon: Truck, description: 'Scheduled for collection' },
    { key: 'warehouse', label: 'Warehouse', icon: Warehouse, description: 'Received at hub' },
    { key: 'delivered', label: 'Delivered', icon: CheckCircle2, description: 'Successfully delivered' },
  ]

  const currentStepIndex = statusSteps.findIndex(s => s.key === order.status)

  const handleStatusChange = (newStatus: 'pickup' | 'warehouse' | 'delivered') => {
    updateOrder(order.id, { status: newStatus })
  }

  return (
    <Layout>
      {/* Back button & Header */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <motion.button
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
          onClick={() => navigate('/orders')}
          whileHover={{ x: -4 }}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </motion.button>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold">{order.internal_ref}</h1>
              <Badge variant={order.status} pulse={order.status !== 'delivered'}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Created on {formatDate(order.created_at)}
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="secondary">
              <Download className="h-4 w-4" />
              Export PDF
            </Button>
            {user?.role === 'admin' && (
              <Button variant="secondary">
                <Edit className="h-4 w-4" />
                Edit
              </Button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Status Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card variant="glass" className="mb-6">
          <h2 className="text-lg font-semibold mb-6">Order Status</h2>
          
          <div className="relative">
            {/* Progress line */}
            <div className="absolute top-6 left-0 right-0 h-1 bg-white/10 rounded-full">
              <motion.div
                className="h-full bg-indigo-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((currentStepIndex + 1) / statusSteps.length) * 100}%` }}
                transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
              />
            </div>

            <div className="relative flex justify-between">
              {statusSteps.map((step, index) => {
                const isCompleted = index <= currentStepIndex
                const isCurrent = index === currentStepIndex
                const Icon = step.icon

                return (
                  <motion.div
                    key={step.key}
                    className="flex flex-col items-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                  >
                    <motion.button
                      className={cn(
                        'relative w-12 h-12 rounded-full flex items-center justify-center transition-all',
                        isCompleted
                          ? 'bg-indigo-500 text-white'
                          : 'bg-white/10 text-muted-foreground',
                        isCurrent && 'ring-4 ring-indigo-500/30',
                        user?.role === 'admin' && 'cursor-pointer hover:scale-110'
                      )}
                      onClick={() => user?.role === 'admin' && handleStatusChange(step.key as any)}
                      whileHover={user?.role === 'admin' ? { scale: 1.1 } : undefined}
                      whileTap={user?.role === 'admin' ? { scale: 0.95 } : undefined}
                    >
                      <Icon className="h-5 w-5" />
                      {isCurrent && (
                        <motion.div
                          className="absolute -inset-1 bg-indigo-500/30 rounded-full"
                          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      )}
                    </motion.button>
                    <p className={cn(
                      'mt-3 text-sm font-medium',
                      isCompleted ? 'text-foreground' : 'text-muted-foreground'
                    )}>
                      {step.label}
                    </p>
                    <p className="text-xs text-muted-foreground">{step.description}</p>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Details */}
        <motion.div
          className="lg:col-span-2 space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Route Info */}
          <Card variant="glass">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Navigation className="h-5 w-5 text-indigo-400" />
              Route Information
            </h2>
            
            <div className="flex items-start gap-6">
              {/* Pickup */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <span className="text-sm text-muted-foreground">Pickup</span>
                </div>
                <p className="font-medium">{order.pickup_address.city}, {order.pickup_address.country}</p>
                {order.pickup_address.street && (
                  <p className="text-sm text-muted-foreground">{order.pickup_address.street}</p>
                )}
              </div>

              {/* Arrow */}
              <div className="flex-shrink-0 mt-6">
                <motion.div
                  animate={{ x: [0, 10, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowLeft className="h-5 w-5 text-muted-foreground rotate-180" />
                </motion.div>
              </div>

              {/* Destination */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-sm text-muted-foreground">Destination</span>
                </div>
                <p className="font-medium">{WAREHOUSE_ADDRESS}</p>
              </div>
            </div>

            {/* Map placeholder */}
            <div className="mt-6 h-64 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-12 w-12 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-muted-foreground text-sm">Map integration ready</p>
                <p className="text-xs text-muted-foreground/70">Google Maps API will display route here</p>
              </div>
            </div>
          </Card>

          {/* Order Boxes */}
          <Card variant="glass">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Box className="h-5 w-5 text-indigo-400" />
              Order Boxes ({order.order_boxes?.length || 0})
            </h2>

            <div className="space-y-3">
              {order.order_boxes?.map((box, index) => (
                <motion.div
                  key={box.id}
                  className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                >
                  <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                    <Package className="h-5 w-5 text-indigo-400" />
                  </div>
                  
                  <div className="flex-1">
                    <p className="font-medium">{box.client_ref}</p>
                    <p className="text-sm text-muted-foreground">
                      {box.dimensions} • {box.packages} package{box.packages > 1 ? 's' : ''}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-medium">{box.weight_kg} kg</p>
                  </div>
                </motion.div>
              ))}

              {(!order.order_boxes || order.order_boxes.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  <Box className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p>No boxes added yet</p>
                </div>
              )}
            </div>
          </Card>

          {/* Photos */}
          <Card variant="glass">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Image className="h-5 w-5 text-indigo-400" />
              Photos
            </h2>

            <div className="grid grid-cols-4 gap-4">
              {order.photos.length > 0 ? (
                order.photos.map((photo, index) => (
                  <motion.div
                    key={index}
                    className="aspect-square rounded-xl bg-white/5 border border-white/10 overflow-hidden"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <img src={photo} alt={`Order photo ${index + 1}`} className="w-full h-full object-cover" />
                  </motion.div>
                ))
              ) : (
                <div className="col-span-4 text-center py-8 text-muted-foreground">
                  <Image className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p>No photos uploaded</p>
                  {user?.role === 'admin' && (
                    <Button variant="ghost" size="sm" className="mt-2">
                      Upload Photos
                    </Button>
                  )}
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Sidebar */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {/* Summary */}
          <Card variant="glass">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total Weight</span>
                <span className="font-medium">{order.total_weight_kg} kg</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Boxes</span>
                <span className="font-medium">{order.order_boxes?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Packages</span>
                <span className="font-medium">
                  {order.order_boxes?.reduce((sum, box) => sum + box.packages, 0) || 0}
                </span>
              </div>
              <div className="border-t border-white/10 pt-4 flex items-center justify-between">
                <span className="font-medium">Total Price</span>
                <span className="text-xl font-bold text-indigo-400">{formatCurrency(order.total_price)}</span>
              </div>
            </div>
          </Card>

          {/* Collection Info */}
          <Card variant="glass">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-indigo-400" />
              Collection Details
            </h2>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Collection Date</p>
                  <p className="font-medium">{formatDate(order.collection_date)}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Receiver Info */}
          <Card variant="glass">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-indigo-400" />
              Receiver
            </h2>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{order.receiver_name}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{order.receiver_phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium">{WAREHOUSE_ADDRESS}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Activity Timeline */}
          <Card variant="glass">
            <h2 className="text-lg font-semibold mb-4">Activity</h2>

            <div className="space-y-4">
              {[
                { date: order.updated_at, action: 'Order updated', icon: Edit },
                { date: order.created_at, action: 'Order created', icon: Package },
              ].map((activity, index) => (
                <motion.div
                  key={index}
                  className="flex gap-3"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                    <activity.icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(activity.date)}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </Layout>
  )
}
