import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Layout } from '../components/layout/Layout'
import { Card, Button, Input, Modal, Badge } from '../components/ui'
import { demoLocations, WAREHOUSE_COORDS, WAREHOUSE_ADDRESS } from '../lib/supabase'
import {
  Plus,
  Search,
  MapPin,
  Navigation,
  Globe,
  Edit,
  Trash2,
  Star,
  Warehouse,
} from 'lucide-react'

export function Locations() {
  const [searchQuery, setSearchQuery] = useState('')
  const [locations, setLocations] = useState(demoLocations)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    lat: '',
    lng: '',
  })

  const filteredLocations = locations.filter(location =>
    location.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCreateLocation = () => {
    const newLocation = {
      id: `loc-${Date.now()}`,
      name: formData.name,
      coords: { lat: parseFloat(formData.lat), lng: parseFloat(formData.lng) },
    }
    setLocations(prev => [...prev, newLocation])
    setIsCreateModalOpen(false)
    setFormData({ name: '', lat: '', lng: '' })
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
          <h1 className="text-2xl font-bold">Pickup Locations</h1>
          <p className="text-muted-foreground">
            Manage frequent pickup locations across Europe
          </p>
        </div>
        
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Location
        </Button>
      </motion.div>

      {/* Map & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Map placeholder */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card variant="glass" className="h-80 flex items-center justify-center">
            <div className="text-center">
              <Globe className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-1">Interactive Map</h3>
              <p className="text-muted-foreground text-sm">
                Google Maps integration will display all pickup locations
              </p>
            </div>
          </Card>
        </motion.div>

        {/* Warehouse Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card variant="glass" className="h-80">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <Warehouse className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-semibold">Main Warehouse</h3>
                <p className="text-sm text-muted-foreground">Destination hub</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium">{WAREHOUSE_ADDRESS}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Navigation className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Coordinates</p>
                  <p className="font-medium font-mono text-sm">
                    {WAREHOUSE_COORDS.lat}, {WAREHOUSE_COORDS.lng}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <Badge variant="success">
                  <Star className="h-3 w-3" />
                  Primary Destination
                </Badge>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Search */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search locations..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-indigo-500/50 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </motion.div>

      {/* Locations Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <AnimatePresence>
          {filteredLocations.map((location, index) => (
            <motion.div
              key={location.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.03 }}
            >
              <Card variant="glass" hover>
                <div className="flex items-start justify-between mb-4">
                  <motion.div
                    className="w-12 h-12 rounded-xl bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <MapPin className="h-6 w-6 text-indigo-400" />
                  </motion.div>
                  
                  <div className="flex gap-1">
                    <motion.button
                      className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </motion.button>
                    <motion.button
                      className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setLocations(prev => prev.filter(l => l.id !== location.id))}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </motion.button>
                  </div>
                </div>

                <h3 className="font-semibold mb-2">{location.name}</h3>
                
                <div className="flex items-center gap-1 text-sm text-muted-foreground font-mono">
                  <Navigation className="h-3 w-3" />
                  <span>{location.coords.lat.toFixed(4)}, {location.coords.lng.toFixed(4)}</span>
                </div>

                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-xs text-muted-foreground">
                    Distance to warehouse: ~{Math.round(Math.random() * 1500 + 200)} km
                  </p>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {filteredLocations.length === 0 && (
        <div className="text-center py-16">
          <MapPin className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium mb-1">No locations found</h3>
          <p className="text-muted-foreground text-sm mb-6">
            {searchQuery ? 'Try adjusting your search criteria' : 'Add your first pickup location'}
          </p>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Location
          </Button>
        </div>
      )}

      {/* Create Location Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add Pickup Location"
        description="Add a new frequent pickup location"
        size="md"
      >
        <form onSubmit={(e) => { e.preventDefault(); handleCreateLocation(); }} className="space-y-4">
          <Input
            label="Location Name"
            placeholder="e.g., Vienna, Austria"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            icon={<MapPin className="h-4 w-4" />}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Latitude"
              type="number"
              step="any"
              placeholder="e.g., 48.2082"
              value={formData.lat}
              onChange={(e) => setFormData(prev => ({ ...prev, lat: e.target.value }))}
            />
            <Input
              label="Longitude"
              type="number"
              step="any"
              placeholder="e.g., 16.3738"
              value={formData.lng}
              onChange={(e) => setFormData(prev => ({ ...prev, lng: e.target.value }))}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <Button type="button" variant="ghost" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Add Location
            </Button>
          </div>
        </form>
      </Modal>
    </Layout>
  )
}
