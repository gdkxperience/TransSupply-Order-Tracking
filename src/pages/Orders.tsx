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
  BottomSheet,
  BottomSheetAction,
} from '../components/ui'
import type { Order } from '../lib/supabase'
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
  ChevronDown,
  ChevronRight,
  Hash,
  FileText,
  Copy,
  Check,
} from 'lucide-react'

export function Orders() {
  const { user } = useAuth()
  const { orders, clients, createOrder, deleteOrder, loading } = useOrders()
  const navigate = useNavigate()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set())
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false)
  
  const copyToClipboard = (text: string, orderId: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(orderId)
    setTimeout(() => setCopiedId(null), 2000)
  }
  
  const openActionSheet = (order: Order) => {
    setSelectedOrder(order)
    setIsActionSheetOpen(true)
  }
  
  const closeActionSheet = () => {
    setIsActionSheetOpen(false)
    setTimeout(() => setSelectedOrder(null), 300)
  }

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
    packages: [{ client_ref: '', weight_kg: '', dimensions: '', colli: 1 }],
  })

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.internal_ref.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.receiver_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.pickup_address.city.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const ordersWithPackages = filteredOrders.filter(o => o.order_packages && o.order_packages.length > 0)
  const allExpanded = ordersWithPackages.length > 0 && ordersWithPackages.every(o => expandedOrders.has(o.id))

  const toggleExpandAll = () => {
    if (allExpanded) {
      setExpandedOrders(new Set())
    } else {
      setExpandedOrders(new Set(ordersWithPackages.map(o => o.id)))
    }
  }

  // Export orders to CSV
  const handleExportCSV = () => {
    const headers = [
      'Internal Ref',
      'Status',
      'Pickup City',
      'Pickup Country',
      'Collection Date',
      'Receiver Name',
      'Receiver Phone',
      'Total Weight (kg)',
      'Total Price (€)',
      'Packages Count',
      'Created At',
    ]
    
    const rows = filteredOrders.map(order => [
      order.internal_ref,
      order.status,
      order.pickup_address.city,
      order.pickup_address.country,
      order.collection_date,
      order.receiver_name,
      order.receiver_phone,
      order.total_weight_kg.toString(),
      order.total_price.toString(),
      (order.order_packages?.length || 0).toString(),
      formatDate(order.created_at),
    ])
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `orders-export-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
  
  // Export orders with packages to CSV (detailed)
  const handleExportDetailedCSV = () => {
    const headers = [
      'Internal Ref',
      'Status',
      'Pickup City',
      'Pickup Country',
      'Collection Date',
      'Receiver Name',
      'Receiver Phone',
      'Package Client Ref',
      'Package Dimensions',
      'Package Weight (kg)',
      'Package Colli',
      'Order Total Weight (kg)',
      'Order Total Price (€)',
    ]
    
    const rows: string[][] = []
    
    filteredOrders.forEach(order => {
      if (order.order_packages && order.order_packages.length > 0) {
        order.order_packages.forEach(pkg => {
          rows.push([
            order.internal_ref,
            order.status,
            order.pickup_address.city,
            order.pickup_address.country,
            order.collection_date,
            order.receiver_name,
            order.receiver_phone,
            pkg.client_ref,
            pkg.dimensions,
            pkg.weight_kg.toString(),
            pkg.colli.toString(),
            order.total_weight_kg.toString(),
            order.total_price.toString(),
          ])
        })
      } else {
        rows.push([
          order.internal_ref,
          order.status,
          order.pickup_address.city,
          order.pickup_address.country,
          order.collection_date,
          order.receiver_name,
          order.receiver_phone,
          '',
          '',
          '',
          '',
          order.total_weight_kg.toString(),
          order.total_price.toString(),
        ])
      }
    })
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `orders-detailed-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Export orders to PDF
  const handleExportPDF = () => {
    const totalWeight = filteredOrders.reduce((sum, o) => sum + o.total_weight_kg, 0)
    const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.total_price, 0)
    const totalPackages = filteredOrders.reduce((sum, o) => sum + (o.order_packages?.length || 0), 0)
    
    const statusCounts = {
      pickup: filteredOrders.filter(o => o.status === 'pickup').length,
      warehouse: filteredOrders.filter(o => o.status === 'warehouse').length,
      delivered: filteredOrders.filter(o => o.status === 'delivered').length,
    }
    
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Orders Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; color: #333; font-size: 12px; }
          h1 { color: #1a1a2e; border-bottom: 2px solid #4f46e5; padding-bottom: 10px; margin-bottom: 20px; }
          .header { display: flex; justify-content: space-between; margin-bottom: 20px; }
          .stats { display: flex; gap: 20px; margin-bottom: 20px; }
          .stat { padding: 10px 15px; background: #f5f5f5; border-radius: 8px; }
          .stat-value { font-size: 18px; font-weight: bold; color: #4f46e5; }
          .stat-label { font-size: 10px; color: #666; text-transform: uppercase; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { padding: 8px 10px; text-align: left; border-bottom: 1px solid #eee; }
          th { background: #f5f5f5; font-size: 10px; text-transform: uppercase; color: #666; }
          .status { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: 600; }
          .status.pickup { background: #fef3c7; color: #d97706; }
          .status.warehouse { background: #dbeafe; color: #2563eb; }
          .status.delivered { background: #d1fae5; color: #059669; }
          .footer { margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd; font-size: 10px; color: #888; }
          .text-right { text-align: right; }
          .font-medium { font-weight: 500; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1>Orders Report</h1>
            <p>Generated on ${new Date().toLocaleString()}</p>
            ${statusFilter !== 'all' ? `<p>Filtered by: ${statusFilter}</p>` : ''}
            ${searchQuery ? `<p>Search: "${searchQuery}"</p>` : ''}
          </div>
        </div>
        
        <div class="stats">
          <div class="stat">
            <div class="stat-value">${filteredOrders.length}</div>
            <div class="stat-label">Total Orders</div>
          </div>
          <div class="stat">
            <div class="stat-value">${statusCounts.pickup}</div>
            <div class="stat-label">Pending Pickup</div>
          </div>
          <div class="stat">
            <div class="stat-value">${statusCounts.warehouse}</div>
            <div class="stat-label">In Warehouse</div>
          </div>
          <div class="stat">
            <div class="stat-value">${statusCounts.delivered}</div>
            <div class="stat-label">Delivered</div>
          </div>
          <div class="stat">
            <div class="stat-value">${totalWeight.toLocaleString()} kg</div>
            <div class="stat-label">Total Weight</div>
          </div>
          <div class="stat">
            <div class="stat-value">€${totalRevenue.toLocaleString()}</div>
            <div class="stat-label">Total Revenue</div>
          </div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Reference</th>
              <th>Status</th>
              <th>Pickup</th>
              <th>Collection</th>
              <th>Receiver</th>
              <th class="text-right">Packages</th>
              <th class="text-right">Weight</th>
              <th class="text-right">Price</th>
            </tr>
          </thead>
          <tbody>
            ${filteredOrders.map(order => `
              <tr>
                <td class="font-medium">${order.internal_ref}</td>
                <td><span class="status ${order.status}">${order.status}</span></td>
                <td>${order.pickup_address.city}, ${order.pickup_address.country}</td>
                <td>${formatDate(order.collection_date)}</td>
                <td>${order.receiver_name}</td>
                <td class="text-right">${order.order_packages?.length || 0}</td>
                <td class="text-right">${order.total_weight_kg} kg</td>
                <td class="text-right">€${order.total_price.toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr style="font-weight: bold; border-top: 2px solid #333;">
              <td colspan="5">Total</td>
              <td class="text-right">${totalPackages}</td>
              <td class="text-right">${totalWeight.toLocaleString()} kg</td>
              <td class="text-right">€${totalRevenue.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>
        
        <div class="footer">
          <p>TransSupply Order Management System</p>
          <p>${filteredOrders.length} orders • ${totalPackages} packages • ${totalWeight.toLocaleString()} kg total weight</p>
        </div>
      </body>
      </html>
    `
    
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(printContent)
      printWindow.document.close()
      printWindow.focus()
      setTimeout(() => {
        printWindow.print()
        printWindow.close()
      }, 250)
    }
  }

  const handleCreateOrder = async () => {
    const totalWeight = formData.packages.reduce((sum, pkg) => sum + Number(pkg.weight_kg), 0)
    
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
      order_packages: formData.packages.map((pkg, i) => ({
        id: `new-pkg-${i}`,
        order_id: '',
        client_ref: pkg.client_ref,
        weight_kg: Number(pkg.weight_kg),
        dimensions: pkg.dimensions,
        colli: pkg.colli,
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
      packages: [{ client_ref: '', weight_kg: '', dimensions: '', colli: 1 }],
    })
  }

  const addPackage = () => {
    setFormData(prev => ({
      ...prev,
      packages: [...prev.packages, { client_ref: '', weight_kg: '', dimensions: '', colli: 1 }],
    }))
  }

  const removePackage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      packages: prev.packages.filter((_, i) => i !== index),
    }))
  }

  const updatePackage = (index: number, field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      packages: prev.packages.map((pkg, i) => i === index ? { ...pkg, [field]: value } : pkg),
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
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
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
        className="flex items-center justify-between mb-4 md:mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Orders</h1>
          <p className="text-muted-foreground text-sm hidden md:block">
            Manage and track all your shipments
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Export Dropdown */}
          <div className="relative group hidden md:block">
            <Button variant="secondary">
              <Download className="h-4 w-4" />
              Export
              <ChevronDown className="h-3 w-3 ml-1" />
            </Button>
            <div className="absolute right-0 mt-1 w-48 rounded-xl bg-[#1a1d24] border border-white/15 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              <div className="p-1">
                <button
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left rounded-lg hover:bg-white/10 transition-colors"
                  onClick={handleExportCSV}
                >
                  <Download className="h-4 w-4" />
                  Export Summary (CSV)
                </button>
                <button
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left rounded-lg hover:bg-white/10 transition-colors"
                  onClick={handleExportDetailedCSV}
                >
                  <Package className="h-4 w-4" />
                  Export with Packages (CSV)
                </button>
                <div className="border-t border-white/10 my-1" />
                <button
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left rounded-lg hover:bg-white/10 transition-colors"
                  onClick={handleExportPDF}
                >
                  <FileText className="h-4 w-4" />
                  Export Report (PDF)
                </button>
              </div>
            </div>
          </div>
          
          {user?.role === 'admin' && (
            <Button 
              onClick={() => {
                setFormData(prev => ({ ...prev, internal_ref: generateDefaultRef() }))
                setIsCreateModalOpen(true)
              }}
              className="px-3 md:px-4"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden md:inline">New Order</span>
            </Button>
          )}
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        className="flex flex-col md:flex-row gap-3 md:gap-4 mb-4 md:mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search orders..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/8 text-sm focus:outline-none focus:border-blue-500/50 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0 md:overflow-visible scrollbar-hide">
          {['all', 'pickup', 'warehouse', 'delivered'].map((status) => (
            <motion.button
              key={status}
              className={cn(
                'px-3 md:px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap flex-shrink-0',
                statusFilter === status
                  ? 'bg-blue-500/15 text-blue-400 border border-blue-500/25'
                  : 'bg-white/5 text-neutral-400 border border-white/8 hover:bg-white/8'
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
          disabled={ordersWithPackages.length === 0}
          className="hidden md:flex"
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
      </motion.div>

      {/* Mobile Order Cards */}
      <div className="md:hidden space-y-3">
        {filteredOrders.map((order, index) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4 active:bg-white/[0.08] transition-colors"
            onClick={() => openActionSheet(order)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center',
                  order.status === 'pickup' && 'bg-amber-500/20 text-amber-400',
                  order.status === 'warehouse' && 'bg-blue-500/20 text-blue-400',
                  order.status === 'delivered' && 'bg-emerald-500/20 text-emerald-400',
                )}>
                  {getStatusIcon(order.status)}
                </div>
                <div>
                  <button
                    className="font-semibold text-blue-400"
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(`/orders/${order.id}`)
                    }}
                  >
                    {order.internal_ref}
                  </button>
                  <p className="text-xs text-muted-foreground">{formatDate(order.collection_date)}</p>
                </div>
              </div>
              <Badge variant={order.status} pulse={order.status !== 'delivered'}>
                {order.status}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">Pickup</p>
                <p className="font-medium truncate">{order.pickup_address.city}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Receiver</p>
                <p className="font-medium truncate">{order.receiver_name}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
              <div className="flex items-center gap-4 text-sm">
                <span className="text-muted-foreground">{order.total_weight_kg} kg</span>
                <span className="text-muted-foreground">{order.order_packages?.length || 0} pkg</span>
              </div>
              <span className="font-semibold text-blue-400">{formatCurrency(order.total_price)}</span>
            </div>
          </motion.div>
        ))}
        
        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">No orders found</p>
          </div>
        )}
      </div>

      {/* Desktop Orders Table */}
      <motion.div
        className="hidden md:block"
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
                    const hasPackages = order.order_packages && order.order_packages.length > 0
                    
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
                            {hasPackages && (
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
                                order.status === 'pickup' && 'bg-amber-500/20 text-amber-400',
                                order.status === 'warehouse' && 'bg-blue-500/20 text-blue-400',
                                order.status === 'delivered' && 'bg-emerald-500/20 text-emerald-400',
                              )}>
                                {getStatusIcon(order.status)}
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  className="font-medium text-blue-400 hover:text-blue-300 hover:underline transition-colors text-left"
                                  onClick={() => navigate(`/orders/${order.id}`)}
                                >
                                  {order.internal_ref}
                                </button>
                                <button
                                  className="p-1 rounded hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
                                  onClick={() => copyToClipboard(order.internal_ref, order.id)}
                                  title="Copy reference"
                                >
                                  {copiedId === order.id ? (
                                    <Check className="h-3 w-3 text-emerald-400" />
                                  ) : (
                                    <Copy className="h-3 w-3" />
                                  )}
                                </button>
                                {hasPackages && (
                                  <span className="text-xs text-muted-foreground ml-1">
                                    ({order.order_packages?.length} pkg)
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
                          {isExpanded && hasPackages && (
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
                                    <Package className="h-4 w-4 text-blue-400" />
                                    <span className="text-sm font-medium">Order Packages</span>
                                  </div>
                                  <div className="grid gap-2">
                                    {order.order_packages?.map((pkg, pkgIndex) => (
                                      <motion.div
                                        key={pkg.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: pkgIndex * 0.05 }}
                                        className="flex items-center gap-6 py-2 px-4 rounded-lg bg-white/5 border border-white/10"
                                      >
                                        <div className="flex items-center gap-2">
                                          <div className="w-6 h-6 rounded bg-blue-500/20 flex items-center justify-center text-xs font-medium text-blue-400">
                                            {pkgIndex + 1}
                                          </div>
                                          <span className="font-mono text-sm">{pkg.client_ref}</span>
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                          <span className="text-foreground font-medium">{pkg.weight_kg}</span> kg
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                          <span className="text-foreground">{pkg.dimensions}</span> cm
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                          <span className="text-foreground font-medium">{pkg.colli}</span> colli
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

          {/* Packages */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Package className="h-4 w-4" />
                Order Packages
              </h3>
              <Button type="button" variant="ghost" size="sm" onClick={addPackage}>
                <Plus className="h-4 w-4" />
                Add Package
              </Button>
            </div>
            
            <div className="space-y-3">
              {formData.packages.map((pkg, index) => (
                <motion.div
                  key={index}
                  className="grid grid-cols-5 gap-3 p-3 rounded-xl bg-white/5 border border-white/10"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Input
                    placeholder="Client Ref"
                    value={pkg.client_ref}
                    onChange={(e) => updatePackage(index, 'client_ref', e.target.value)}
                  />
                  <Input
                    placeholder="Weight (kg)"
                    type="number"
                    value={pkg.weight_kg}
                    onChange={(e) => updatePackage(index, 'weight_kg', e.target.value)}
                  />
                  <Input
                    placeholder="LxWxH cm"
                    value={pkg.dimensions}
                    onChange={(e) => updatePackage(index, 'dimensions', e.target.value)}
                  />
                  <Input
                    placeholder="Colli"
                    type="number"
                    value={pkg.colli}
                    onChange={(e) => updatePackage(index, 'colli', parseInt(e.target.value) || 1)}
                  />
                  {formData.packages.length > 1 && (
                    <motion.button
                      type="button"
                      className="p-2 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors self-center justify-self-center"
                      onClick={() => removePackage(index)}
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
      
      {/* Mobile Action Sheet */}
      <BottomSheet
        isOpen={isActionSheetOpen}
        onClose={closeActionSheet}
        title={selectedOrder?.internal_ref}
      >
        {selectedOrder && (
          <div className="space-y-2">
            {/* Order Summary */}
            <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl mb-4">
              <div className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center',
                selectedOrder.status === 'pickup' && 'bg-amber-500/20 text-amber-400',
                selectedOrder.status === 'warehouse' && 'bg-blue-500/20 text-blue-400',
                selectedOrder.status === 'delivered' && 'bg-emerald-500/20 text-emerald-400',
              )}>
                {getStatusIcon(selectedOrder.status)}
              </div>
              <div className="flex-1">
                <p className="font-semibold">{selectedOrder.pickup_address.city} → Baku</p>
                <p className="text-sm text-muted-foreground">{selectedOrder.receiver_name}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-blue-400">{formatCurrency(selectedOrder.total_price)}</p>
                <p className="text-xs text-muted-foreground">{selectedOrder.total_weight_kg} kg</p>
              </div>
            </div>
            
            <BottomSheetAction
              icon={<Eye className="h-5 w-5" />}
              label="View Details"
              onClick={() => {
                closeActionSheet()
                navigate(`/orders/${selectedOrder.id}`)
              }}
            />
            
            <BottomSheetAction
              icon={<Copy className="h-5 w-5" />}
              label="Copy Reference"
              onClick={() => {
                navigator.clipboard.writeText(selectedOrder.internal_ref)
                closeActionSheet()
              }}
            />
            
            {user?.role === 'admin' && (
              <>
                <BottomSheetAction
                  icon={<Edit className="h-5 w-5" />}
                  label="Edit Order"
                  onClick={() => {
                    closeActionSheet()
                    navigate(`/orders/${selectedOrder.id}`)
                  }}
                />
                
                <BottomSheetAction
                  icon={<Trash2 className="h-5 w-5" />}
                  label="Delete Order"
                  variant="danger"
                  onClick={() => {
                    deleteOrder(selectedOrder.id)
                    closeActionSheet()
                  }}
                />
              </>
            )}
          </div>
        )}
      </BottomSheet>
    </Layout>
  )
}
