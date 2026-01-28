import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useOrders } from '../context/OrderContext'
import { Layout } from '../components/layout/Layout'
import {
  Card,
  Button,
  Input,
  Modal,
  Badge,
} from '../components/ui'
import { formatDate, formatCurrency, cn } from '../lib/utils'
import type { ClientRecord } from '../lib/supabase'
import {
  Plus,
  Search,
  Users,
  Mail,
  Building2,
  Package,
  Calendar,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  Save,
  Lock,
  ArrowRight,
  X,
  ChevronRight,
} from 'lucide-react'

export function Clients() {
  const navigate = useNavigate()
  const { clients, orders, createClient, updateClient } = useOrders()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  })
  
  // View orders modal state
  const [viewOrdersClient, setViewOrdersClient] = useState<ClientRecord | null>(null)
  
  // Edit client modal state
  const [editClient, setEditClient] = useState<ClientRecord | null>(null)
  const [editForm, setEditForm] = useState({
    name: '',
    password: '',
    confirmPassword: '',
  })
  const [editError, setEditError] = useState('')
  const [editSuccess, setEditSuccess] = useState(false)

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getClientOrderCount = (clientId: string) => {
    return orders.filter(o => o.client_id === clientId).length
  }
  
  const getClientOrders = (clientId: string) => {
    return orders.filter(o => o.client_id === clientId)
  }

  const handleCreateClient = () => {
    createClient({
      name: formData.name,
      email: formData.email,
    })
    setIsCreateModalOpen(false)
    setFormData({ name: '', email: '', password: '' })
  }
  
  const openViewOrders = (client: ClientRecord) => {
    setViewOrdersClient(client)
  }
  
  const openEditClient = (client: ClientRecord) => {
    setEditClient(client)
    setEditForm({
      name: client.name,
      password: '',
      confirmPassword: '',
    })
    setEditError('')
    setEditSuccess(false)
  }
  
  const handleEditClient = async () => {
    if (!editClient) return
    
    // Validate passwords match if provided
    if (editForm.password && editForm.password !== editForm.confirmPassword) {
      setEditError('Passwords do not match')
      return
    }
    
    // Update client
    await updateClient(editClient.id, {
      name: editForm.name,
    })
    
    setEditSuccess(true)
    setTimeout(() => {
      setEditClient(null)
      setEditSuccess(false)
    }, 1500)
  }
  
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'pickup': return 'pickup'
      case 'warehouse': return 'warehouse'
      case 'delivered': return 'delivered'
      default: return 'default'
    }
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
          <h1 className="text-xl md:text-2xl font-bold">Clients</h1>
          <p className="text-muted-foreground text-sm hidden md:block">
            Manage your client accounts and access
          </p>
        </div>
        
        <Button onClick={() => setIsCreateModalOpen(true)} className="px-3 md:px-4">
          <Plus className="h-4 w-4" />
          <span className="hidden md:inline">New Client</span>
        </Button>
      </motion.div>

      {/* Stats - Hidden on mobile */}
      <motion.div
        className="hidden md:grid grid-cols-4 gap-4 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {[
          { label: 'Total Clients', value: clients.length, icon: Users, color: 'bg-blue-500' },
          { label: 'Active This Month', value: clients.length, icon: UserPlus, color: 'bg-emerald-500' },
          { label: 'Total Orders', value: orders.length, icon: Package, color: 'bg-cyan-500' },
          { label: 'Avg. Orders/Client', value: (orders.length / Math.max(clients.length, 1)).toFixed(1), icon: Building2, color: 'bg-amber-500' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            className="relative overflow-hidden rounded-xl bg-white/[0.04] border border-white/[0.08] p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.05 }}
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center',
                stat.color
              )}>
                <stat.icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-slate-400">{stat.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Search */}
      <motion.div
        className="mb-4 md:mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="relative md:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search clients..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/8 text-sm focus:outline-none focus:border-blue-500/50 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </motion.div>

      {/* Mobile Client List */}
      <div className="md:hidden space-y-1 mb-4">
        {filteredClients.map((client, index) => (
          <motion.div
            key={client.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.02 }}
            className="flex items-center gap-3 p-3 bg-white/[0.02] hover:bg-white/[0.06] active:bg-white/[0.08] rounded-xl transition-colors"
            onClick={() => openViewOrders(client)}
          >
            {/* Avatar */}
            <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center flex-shrink-0">
              <span className="text-base font-bold text-white">
                {client.name.charAt(0).toUpperCase()}
              </span>
            </div>
            
            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{client.name}</p>
              <p className="text-xs text-muted-foreground truncate">{client.email}</p>
            </div>
            
            {/* Order count */}
            <div className="text-right flex-shrink-0">
              <p className="font-semibold text-sm">{getClientOrderCount(client.id)}</p>
              <p className="text-xs text-muted-foreground">orders</p>
            </div>
            
            <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </motion.div>
        ))}
        
        {filteredClients.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">No clients found</p>
          </div>
        )}
      </div>

      {/* Desktop Clients Grid */}
      <motion.div
        className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <AnimatePresence>
          {filteredClients.map((client, index) => (
            <motion.div
              key={client.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.03 }}
            >
              <Card variant="glass" hover className="h-full">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <motion.div
                    className="relative flex-shrink-0"
                    whileHover={{ scale: 1.1 }}
                  >
                    <div className="w-14 h-14 rounded-xl bg-slate-700 flex items-center justify-center">
                      <span className="text-xl font-bold text-white">
                        {client.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-card rounded-full" />
                  </motion.div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{client.name}</h3>
                    <p className="text-sm text-muted-foreground truncate flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {client.email}
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="mt-6 pt-4 border-t border-white/10">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                        <Package className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-lg font-semibold">{getClientOrderCount(client.id)}</p>
                        <p className="text-xs text-muted-foreground">Orders</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{formatDate(client.created_at)}</p>
                        <p className="text-xs text-muted-foreground">Joined</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 flex gap-2">
                  <motion.button
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-blue-500/10 text-sm text-blue-400 hover:bg-blue-500/20 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => openViewOrders(client)}
                  >
                    <Eye className="h-4 w-4" />
                    View Orders
                  </motion.button>
                  <motion.button
                    className="flex items-center justify-center p-2 rounded-lg bg-white/5 text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => openEditClient(client)}
                  >
                    <Edit className="h-4 w-4" />
                  </motion.button>
                  <motion.button
                    className="flex items-center justify-center p-2 rounded-lg bg-white/5 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </motion.button>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {filteredClients.length === 0 && (
        <div className="text-center py-16">
          <Users className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium mb-1">No clients found</h3>
          <p className="text-muted-foreground text-sm mb-6">
            {searchQuery ? 'Try adjusting your search criteria' : 'Add your first client to get started'}
          </p>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Client
          </Button>
        </div>
      )}

      {/* Create Client Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add New Client"
        description="Create a new client account"
        size="md"
      >
        <form onSubmit={(e) => { e.preventDefault(); handleCreateClient(); }} className="space-y-4">
          <Input
            label="Company Name"
            placeholder="Enter company name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            icon={<Building2 className="h-4 w-4" />}
          />
          
          <Input
            label="Email Address"
            type="email"
            placeholder="Enter email address"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            icon={<Mail className="h-4 w-4" />}
          />

          <Input
            label="Password"
            type="password"
            placeholder="Create a password"
            value={formData.password}
            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <Button type="button" variant="ghost" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Create Client
            </Button>
          </div>
        </form>
      </Modal>
      
      {/* View Orders Modal */}
      <Modal
        isOpen={!!viewOrdersClient}
        onClose={() => setViewOrdersClient(null)}
        title={`Orders - ${viewOrdersClient?.name || ''}`}
        description={`${getClientOrders(viewOrdersClient?.id || '').length} orders found`}
        size="lg"
      >
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {viewOrdersClient && getClientOrders(viewOrdersClient.id).length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">No orders found for this client</p>
            </div>
          ) : (
            viewOrdersClient && getClientOrders(viewOrdersClient.id).map((order) => (
              <motion.div
                key={order.id}
                className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
                onClick={() => {
                  setViewOrdersClient(null)
                  navigate(`/orders/${order.id}`)
                }}
                whileHover={{ x: 4 }}
              >
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Package className="h-5 w-5 text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{order.internal_ref}</p>
                    <Badge variant={getStatusVariant(order.status) as 'pickup' | 'warehouse' | 'delivered' | 'default'}>
                      {order.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {order.pickup_address.city} → Baku • {formatDate(order.collection_date)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-blue-400">{formatCurrency(order.total_price)}</p>
                  <p className="text-xs text-muted-foreground">{order.total_weight_kg} kg</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </motion.div>
            ))
          )}
        </div>
        
        <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-white/10">
          <Button variant="ghost" onClick={() => setViewOrdersClient(null)}>
            Close
          </Button>
          <Button onClick={() => {
            setViewOrdersClient(null)
            navigate('/orders')
          }}>
            <Package className="h-4 w-4" />
            View All Orders
          </Button>
        </div>
      </Modal>
      
      {/* Edit Client Modal */}
      <Modal
        isOpen={!!editClient}
        onClose={() => setEditClient(null)}
        title="Edit Client"
        description={`Update details for ${editClient?.name || ''}`}
        size="md"
      >
        <form onSubmit={(e) => { e.preventDefault(); handleEditClient(); }} className="space-y-4">
          {/* Email (read-only) */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Email Address
            </label>
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{editClient?.email}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
          </div>
          
          <Input
            label="Company Name"
            placeholder="Enter company name"
            value={editForm.name}
            onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
            icon={<Building2 className="h-4 w-4" />}
          />
          
          <div className="pt-2 border-t border-white/10">
            <p className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Change Password (optional)
            </p>
            
            <div className="space-y-3">
              <Input
                label="New Password"
                type="password"
                placeholder="Leave blank to keep current"
                value={editForm.password}
                onChange={(e) => {
                  setEditForm(prev => ({ ...prev, password: e.target.value }))
                  setEditError('')
                }}
              />
              
              {editForm.password && (
                <Input
                  label="Confirm New Password"
                  type="password"
                  placeholder="Confirm new password"
                  value={editForm.confirmPassword}
                  onChange={(e) => {
                    setEditForm(prev => ({ ...prev, confirmPassword: e.target.value }))
                    setEditError('')
                  }}
                />
              )}
            </div>
          </div>
          
          {editError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 text-red-400 text-sm"
            >
              <X className="h-4 w-4" />
              {editError}
            </motion.div>
          )}
          
          {editSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 text-sm"
            >
              <Save className="h-4 w-4" />
              Client updated successfully!
            </motion.div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <Button type="button" variant="ghost" onClick={() => setEditClient(null)}>
              Cancel
            </Button>
            <Button type="submit" disabled={editSuccess}>
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </Layout>
  )
}
