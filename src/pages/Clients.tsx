import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useOrders } from '../context/OrderContext'
import { Layout } from '../components/layout/Layout'
import {
  Card,
  Button,
  Input,
  Modal,
} from '../components/ui'
import { formatDate, cn } from '../lib/utils'
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
} from 'lucide-react'

export function Clients() {
  const { clients, orders, createClient } = useOrders()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  })

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getClientOrderCount = (clientId: string) => {
    return orders.filter(o => o.client_id === clientId).length
  }

  const handleCreateClient = () => {
    createClient({
      name: formData.name,
      email: formData.email,
    })
    setIsCreateModalOpen(false)
    setFormData({ name: '', email: '', password: '' })
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
          <h1 className="text-2xl font-bold">Clients</h1>
          <p className="text-muted-foreground">
            Manage your client accounts and access
          </p>
        </div>
        
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4" />
          New Client
        </Button>
      </motion.div>

      {/* Stats */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
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
        className="mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="relative max-w-md">
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

      {/* Clients Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
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
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-white/5 text-sm text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </motion.button>
                  <motion.button
                    className="flex items-center justify-center p-2 rounded-lg bg-white/5 text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
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
    </Layout>
  )
}
