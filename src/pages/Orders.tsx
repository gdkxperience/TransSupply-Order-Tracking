import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useOrders } from '../context/OrderContext'
import { Layout } from '../components/layout/Layout'
import {
  Card,
  Button,
  Badge,
  Input,
  Select,
  Modal,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../components/ui'
import { formatDate, formatCurrency, cn } from '../lib/utils'
import type { OrderStatus } from '../lib/supabase'
import {
  Plus,
  Search,
  Download,
  Eye,
  Edit,
  Trash2,
  MapPin,
  Package,
  Truck,
  Warehouse,
  CheckCircle2,
  X,
  Calendar,
  User,
  Phone,
  Euro,
  Box,
  ChevronDown,
  ChevronRight,
  Hash,
} from 'lucide-react'

export function Orders() {
  const { user } = useAuth()
  const { orders, clients, createOrder, deleteOrder, loading } = useOrders()
  const navigate = useNavigate()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set())

  const toggleExpanded = (orderId: string) => {
    setExpandedOrders(prev => {
      const next = new Set(prev)
      if (next.has(orderId)) {
        next.delete(orderId)
      } else {
        next.add(orderId)
      }
      return next
    })
  }
  
  // Generate default internal ref
  const generateDefaultRef = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = (now.getMonth() + 1).toString().padStart(2, '0')
    const prefix = `${year}-${month}-`
    const existingRefs = orders.filter(o => o.internal_ref.startsWith(prefix))
    const sequence = existingRefs.length + 1
    return `${prefix}${sequence.toString().padStart(4, '0')}`
  }

  // Form state
  const [formData, setFormData] = useState({
    internal_ref: '',
    client_id: '',
    pickup_city: '',
    pickup_country: '',
    pickup_street: '',
    collection_date: '',
    receiver_name: '',
    receiver_phone: '',
    total_price: '',
    status: 'pickup' as OrderStatus,
    boxes: [{ client_ref: '', weight_kg: '', dimensions: '', packages: 1 }],
  })

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.internal_ref.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.receiver_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.pickup_address.city.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const ordersWithBoxes = filteredOrders.filter(o => o.order_boxes && o.order_boxes.length > 0)
  const allExpanded = ordersWithBoxes.length > 0 && ordersWithBoxes.every(o => expandedOrders.has(o.id))

  const toggleExpandAll = () => {
    if (allExpanded) {
      setExpandedOrders(new Set())
    } else {
      setExpandedOrders(new Set(ordersWithBoxes.map(o => o.id)))
    }
  }

  const handleCreateOrder = async () => {
    const totalWeight = formData.boxes.reduce((sum, box) => sum + Number(box.weight_kg), 0)
    
    await createOrder({
      internal_ref: formData.internal_ref,
      client_id: formData.client_id || user?.clientId || '',
      status: formData.status,
      pickup_address: {
        street: formData.pickup_street,
        city: formData.pickup_city,
        country: formData.pickup_country,
      },
      collection_date: formData.collection_date,
      receiver_name: formData.receiver_name,
      receiver_phone: formData.receiver_phone,
      receiver_address: { city: 'Baku', country: 'Azerbaijan' },
      total_weight_kg: totalWeight,
      total_price: Number(formData.total_price),
      photos: [],
      order_boxes: formData.boxes.map((box, i) => ({
        id: `new-box-${i}`,
        order_id: '',
        client_ref: box.client_ref,
        weight_kg: Number(box.weight_kg),
        dimensions: box.dimensions,
        packages: box.packages,
      })),
    })

    setIsCreateModalOpen(false)
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      internal_ref: generateDefaultRef(),
      client_id: '',
      pickup_city: '',
      pickup_country: '',
      pickup_street: '',
      collection_date: '',
      receiver_name: '',
      receiver_phone: '',
      total_price: '',
      status: 'pickup',
      boxes: [{ client_ref: '', weight_kg: '', dimensions: '', packages: 1 }],
    })
  }

  const addBox = () => {
    setFormData(prev => ({
      ...prev,
      boxes: [...prev.boxes, { client_ref: '', weight_kg: '', dimensions: '', packages: 1 }],
    }))
  }

  const removeBox = (index: number) => {
    setFormData(prev => ({
      ...prev,
      boxes: prev.boxes.filter((_, i) => i !== index),
    }))
  }

  const updateBox = (index: number, field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      boxes: prev.boxes.map((box, i) => i === index ? { ...box, [field]: value } : box),
    }))
  }

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'pickup': return <Truck className="h-4 w-4" />
      case 'warehouse': return <Warehouse className="h-4 w-4" />
      case 'delivered': return <CheckCircle2 className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-muted-foreground">Loading orders...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      {/* Header */}
      <motion.div
        className="flex items-center justify-between mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-2xl font-bold">Orders</h1>
          <p className="text-muted-foreground">
            Manage and track all your shipments
          </p>
        </div>
        
        {user?.role === 'admin' && (
          <Button onClick={() => {
            setFormData(prev => ({ ...prev, internal_ref: generateDefaultRef() }))
            setIsCreateModalOpen(true)
          }}>
            <Plus className="h-4 w-4" />
            New Order
          </Button>
        )}
      </motion.div>

      {/* Filters */}
      <motion.div
        className="flex flex-wrap gap-4 mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex-1 min-w-[300px]">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by reference, receiver, or location..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-indigo-500/50 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          {['all', 'pickup', 'warehouse', 'delivered'].map((status) => (
            <motion.button
              key={status}
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-medium transition-all',
                statusFilter === status
                  ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                  : 'bg-white/5 text-muted-foreground border border-white/10 hover:bg-white/10'
              )}
              onClick={() => setStatusFilter(status)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
            </motion.button>
          ))}
        </div>

        <Button 
          variant="ghost" 
          onClick={toggleExpandAll}
          disabled={ordersWithBoxes.length === 0}
        >
          {allExpanded ? (
            <>
              <ChevronDown className="h-4 w-4" />
              Collapse All
            </>
          ) : (
            <>
              <ChevronRight className="h-4 w-4" />
              Expand All
            </>
          )}
        </Button>

        <Button variant="secondary">
          <Download className="h-4 w-4" />
          Export PDF
        </Button>
      </motion.div>

      {/* Orders Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card variant="glass" className="overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10">
                  <TableHead className="w-10"></TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Pickup Location</TableHead>
                  <TableHead>Collection Date</TableHead>
                  <TableHead>Receiver</TableHead>
                  <TableHead>Weight</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {filteredOrders.map((order, index) => {
                    const isExpanded = expandedOrders.has(order.id)
                    const hasBoxes = order.order_boxes && order.order_boxes.length > 0
                    
                    return (
                      <>
                        <motion.tr
                          key={order.id}
                          className="border-white/5 hover:bg-white/5 transition-colors"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ delay: index * 0.03 }}
                        >
                          <TableCell className="w-10">
                            {hasBoxes && (
                              <motion.button
                                className="p-1 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggleExpanded(order.id)
                                }}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                {isExpanded ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </motion.button>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className={cn(
                                'w-8 h-8 rounded-lg flex items-center justify-center',
                                order.status === 'pickup' && 'bg-amber-500/20',
                                order.status === 'warehouse' && 'bg-blue-500/20',
                                order.status === 'delivered' && 'bg-emerald-500/20',
                              )}>
                                {getStatusIcon(order.status)}
                              </div>
                              <div>
                                <span className="font-medium">{order.internal_ref}</span>
                                {hasBoxes && (
                                  <span className="text-xs text-muted-foreground ml-2">
                                    ({order.order_boxes?.length} boxes)
                                  </span>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={order.status} pulse={order.status !== 'delivered'}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm">
                              <MapPin className="h-3 w-3 text-muted-foreground" />
                              {order.pickup_address.city}, {order.pickup_address.country}
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDate(order.collection_date)}
                          </TableCell>
                          <TableCell>{order.receiver_name}</TableCell>
                          <TableCell>{order.total_weight_kg} kg</TableCell>
                          <TableCell className="font-medium">{formatCurrency(order.total_price)}</TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                              <motion.button
                                className="p-2 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => navigate(`/orders/${order.id}`)}
                              >
                                <Eye className="h-4 w-4" />
                              </motion.button>
                              {user?.role === 'admin' && (
                                <>
                                  <motion.button
                                    className="p-2 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </motion.button>
                                  <motion.button
                                    className="p-2 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => deleteOrder(order.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </motion.button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </motion.tr>
                        
                        {/* Expanded boxes row */}
                        <AnimatePresence>
                          {isExpanded && hasBoxes && (
                            <motion.tr
                              key={`${order.id}-boxes`}
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="bg-white/[0.02]"
                            >
                              <TableCell colSpan={9} className="py-0">
                                <motion.div
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -10 }}
                                  className="py-4 pl-12"
                                >
                                  <div className="flex items-center gap-2 mb-3">
                                    <Box className="h-4 w-4 text-indigo-400" />
                                    <span className="text-sm font-medium">Order Boxes</span>
                                  </div>
                                  <div className="grid gap-2">
                                    {order.order_boxes?.map((box, boxIndex) => (
                                      <motion.div
                                        key={box.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: boxIndex * 0.05 }}
                                        className="flex items-center gap-6 py-2 px-4 rounded-lg bg-white/5 border border-white/10"
                                      >
                                        <div className="flex items-center gap-2">
                                          <div className="w-6 h-6 rounded bg-indigo-500/20 flex items-center justify-center text-xs font-medium text-indigo-400">
                                            {boxIndex + 1}
                                          </div>
                                          <span className="font-mono text-sm">{box.client_ref}</span>
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                          <span className="text-foreground font-medium">{box.weight_kg}</span> kg
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                          <span className="text-foreground">{box.dimensions}</span> cm
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                          <span className="text-foreground font-medium">{box.packages}</span> pkg
                                        </div>
                                      </motion.div>
                                    ))}
                                  </div>
                                </motion.div>
                              </TableCell>
                            </motion.tr>
                          )}
                        </AnimatePresence>
                      </>
                    )
                  })}
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>

          {filteredOrders.length === 0 && (
            <div className="text-center py-16">
              <Package className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-1">No orders found</h3>
              <p className="text-muted-foreground text-sm">
                {searchQuery ? 'Try adjusting your search criteria' : 'Create your first order to get started'}
              </p>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Create Order Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false)
          resetForm()
        }}
        title="Create New Order"
        description="Fill in the order details below"
        size="xl"
      >
        <form onSubmit={(e) => { e.preventDefault(); handleCreateOrder(); }} className="space-y-6">
          {/* Internal Reference */}
          <Input
            label="Internal Reference"
            placeholder="2026-01-0001"
            value={formData.internal_ref}
            onChange={(e) => setFormData(prev => ({ ...prev, internal_ref: e.target.value }))}
            icon={<Hash className="h-4 w-4" />}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Client"
              options={[
                { value: '', label: 'Select client...' },
                ...clients.map(c => ({ value: c.id, label: c.name }))
              ]}
              value={formData.client_id}
              onChange={(e) => setFormData(prev => ({ ...prev, client_id: e.target.value }))}
            />
            <Select
              label="Status"
              options={[
                { value: 'pickup', label: 'Pending Pickup' },
                { value: 'warehouse', label: 'In Warehouse' },
                { value: 'delivered', label: 'Delivered' },
              ]}
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as OrderStatus }))}
            />
          </div>

          {/* Pickup Address */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Pickup Location
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <Input
                placeholder="Street"
                value={formData.pickup_street}
                onChange={(e) => setFormData(prev => ({ ...prev, pickup_street: e.target.value }))}
              />
              <Input
                placeholder="City"
                value={formData.pickup_city}
                onChange={(e) => setFormData(prev => ({ ...prev, pickup_city: e.target.value }))}
              />
              <Input
                placeholder="Country"
                value={formData.pickup_country}
                onChange={(e) => setFormData(prev => ({ ...prev, pickup_country: e.target.value }))}
              />
            </div>
          </div>

          {/* Collection & Receiver */}
          <div className="grid grid-cols-3 gap-4">
            <Input
              type="date"
              label="Collection Date"
              value={formData.collection_date}
              onChange={(e) => setFormData(prev => ({ ...prev, collection_date: e.target.value }))}
              icon={<Calendar className="h-4 w-4" />}
            />
            <Input
              label="Receiver Name"
              placeholder="Full name"
              value={formData.receiver_name}
              onChange={(e) => setFormData(prev => ({ ...prev, receiver_name: e.target.value }))}
              icon={<User className="h-4 w-4" />}
            />
            <Input
              label="Receiver Phone"
              placeholder="+31 ..."
              value={formData.receiver_phone}
              onChange={(e) => setFormData(prev => ({ ...prev, receiver_phone: e.target.value }))}
              icon={<Phone className="h-4 w-4" />}
            />
          </div>

          {/* Price */}
          <Input
            label="Total Price (EUR)"
            type="number"
            placeholder="0.00"
            value={formData.total_price}
            onChange={(e) => setFormData(prev => ({ ...prev, total_price: e.target.value }))}
            icon={<Euro className="h-4 w-4" />}
          />

          {/* Boxes */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Box className="h-4 w-4" />
                Order Boxes
              </h3>
              <Button type="button" variant="ghost" size="sm" onClick={addBox}>
                <Plus className="h-4 w-4" />
                Add Box
              </Button>
            </div>
            
            <div className="space-y-3">
              {formData.boxes.map((box, index) => (
                <motion.div
                  key={index}
                  className="grid grid-cols-5 gap-3 p-3 rounded-xl bg-white/5 border border-white/10"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Input
                    placeholder="Client Ref"
                    value={box.client_ref}
                    onChange={(e) => updateBox(index, 'client_ref', e.target.value)}
                  />
                  <Input
                    placeholder="Weight (kg)"
                    type="number"
                    value={box.weight_kg}
                    onChange={(e) => updateBox(index, 'weight_kg', e.target.value)}
                  />
                  <Input
                    placeholder="LxWxH cm"
                    value={box.dimensions}
                    onChange={(e) => updateBox(index, 'dimensions', e.target.value)}
                  />
                  <Input
                    placeholder="Packages"
                    type="number"
                    value={box.packages}
                    onChange={(e) => updateBox(index, 'packages', parseInt(e.target.value) || 1)}
                  />
                  {formData.boxes.length > 1 && (
                    <motion.button
                      type="button"
                      className="p-2 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors self-center justify-self-center"
                      onClick={() => removeBox(index)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <X className="h-4 w-4" />
                    </motion.button>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <Button type="button" variant="ghost" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Create Order
            </Button>
          </div>
        </form>
      </Modal>
    </Layout>
  )
}
