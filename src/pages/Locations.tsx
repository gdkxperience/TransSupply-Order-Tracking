import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Layout } from '../components/layout/Layout'
import { Card, Button, Input, Modal, Badge } from '../components/ui'
import { demoLocations, WAREHOUSE_COORDS, WAREHOUSE_ADDRESS } from '../lib/supabase'
import {
  Plus,
  Search,
  MapPin,
  Navigation,
  Edit,
  Trash2,
  Star,
  Warehouse,
  Save,
  ExternalLink,
  Loader2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'

// Geocoding function using Google Maps API
async function geocodeAddress(address: string, apiKey: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`
    )
    const data = await response.json()
    
    if (data.status === 'OK' && data.results.length > 0) {
      const { lat, lng } = data.results[0].geometry.location
      return { lat, lng }
    }
    return null
  } catch (error) {
    console.error('Geocoding error:', error)
    return null
  }
}

export function Locations() {
  const [searchQuery, setSearchQuery] = useState('')
  const [locations, setLocations] = useState(demoLocations)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditWarehouseOpen, setIsEditWarehouseOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    lat: '',
    lng: '',
  })
  const [isLookingUp, setIsLookingUp] = useState(false)
  const [lookupStatus, setLookupStatus] = useState<'idle' | 'success' | 'error'>('idle')

  // Editable warehouse state
  const [warehouse, setWarehouse] = useState({
    address: WAREHOUSE_ADDRESS,
    lat: WAREHOUSE_COORDS.lat,
    lng: WAREHOUSE_COORDS.lng,
  })

  const [warehouseForm, setWarehouseForm] = useState({
    address: WAREHOUSE_ADDRESS,
    lat: WAREHOUSE_COORDS.lat.toString(),
    lng: WAREHOUSE_COORDS.lng.toString(),
  })
  const [warehouseLookingUp, setWarehouseLookingUp] = useState(false)
  const [warehouseLookupStatus, setWarehouseLookupStatus] = useState<'idle' | 'success' | 'error'>('idle')

  // Get Google Maps API key from env
  const mapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

  const filteredLocations = locations.filter(location =>
    location.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Lookup address for new location
  const handleAddressLookup = async () => {
    if (!formData.address || !mapsApiKey || mapsApiKey === 'your-google-maps-api-key') {
      setLookupStatus('error')
      return
    }
    
    setIsLookingUp(true)
    setLookupStatus('idle')
    
    const coords = await geocodeAddress(formData.address, mapsApiKey)
    
    if (coords) {
      setFormData(prev => ({
        ...prev,
        name: prev.name || formData.address,
        lat: coords.lat.toString(),
        lng: coords.lng.toString(),
      }))
      setLookupStatus('success')
    } else {
      setLookupStatus('error')
    }
    
    setIsLookingUp(false)
  }

  // Lookup address for warehouse
  const handleWarehouseAddressLookup = async () => {
    if (!warehouseForm.address || !mapsApiKey || mapsApiKey === 'your-google-maps-api-key') {
      setWarehouseLookupStatus('error')
      return
    }
    
    setWarehouseLookingUp(true)
    setWarehouseLookupStatus('idle')
    
    const coords = await geocodeAddress(warehouseForm.address, mapsApiKey)
    
    if (coords) {
      setWarehouseForm(prev => ({
        ...prev,
        lat: coords.lat.toString(),
        lng: coords.lng.toString(),
      }))
      setWarehouseLookupStatus('success')
    } else {
      setWarehouseLookupStatus('error')
    }
    
    setWarehouseLookingUp(false)
  }

  const handleCreateLocation = () => {
    if (!formData.lat || !formData.lng) return
    
    const newLocation = {
      id: `loc-${Date.now()}`,
      name: formData.name || formData.address,
      coords: { lat: parseFloat(formData.lat), lng: parseFloat(formData.lng) },
    }
    setLocations(prev => [...prev, newLocation])
    setIsCreateModalOpen(false)
    setFormData({ name: '', address: '', lat: '', lng: '' })
    setLookupStatus('idle')
  }

  const handleSaveWarehouse = () => {
    setWarehouse({
      address: warehouseForm.address,
      lat: parseFloat(warehouseForm.lat),
      lng: parseFloat(warehouseForm.lng),
    })
    setIsEditWarehouseOpen(false)
    setWarehouseLookupStatus('idle')
  }

  const openEditWarehouse = () => {
    setWarehouseForm({
      address: warehouse.address,
      lat: warehouse.lat.toString(),
      lng: warehouse.lng.toString(),
    })
    setWarehouseLookupStatus('idle')
    setIsEditWarehouseOpen(true)
  }

  // Build Google Maps embed URL with all locations
  const mapEmbedUrl = useMemo(() => {
    if (!mapsApiKey || mapsApiKey === 'your-google-maps-api-key') {
      return null
    }
    
    // Center on Europe with warehouse marker
    const center = `${warehouse.lat},${warehouse.lng}`
    return `https://www.google.com/maps/embed/v1/place?key=${mapsApiKey}&q=${encodeURIComponent(warehouse.address)}&center=${center}&zoom=4`
  }, [mapsApiKey, warehouse])

  // Static map URL for warehouse preview (doesn't require API key for basic usage)
  const warehouseStaticMapUrl = `https://maps.google.com/maps?q=${warehouse.lat},${warehouse.lng}&t=&z=13&ie=UTF8&iwloc=&output=embed`

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

      {/* Map & Warehouse Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Map */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card variant="glass" className="h-80 overflow-hidden p-0">
            {mapEmbedUrl ? (
              <iframe
                src={mapEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Locations Map"
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-6">
                <iframe
                  src={warehouseStaticMapUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0, borderRadius: '0.75rem' }}
                  allowFullScreen
                  loading="lazy"
                  title="Warehouse Location"
                />
              </div>
            )}
          </Card>
        </motion.div>

        {/* Warehouse Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card variant="glass" className="h-80 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Warehouse className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold">Main Warehouse</h3>
                  <p className="text-sm text-muted-foreground">Destination hub</p>
                </div>
              </div>
              <motion.button
                className="p-2 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
                onClick={openEditWarehouse}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Edit className="h-4 w-4" />
              </motion.button>
            </div>

            <div className="space-y-4 flex-1">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium">{warehouse.address}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Navigation className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">Coordinates</p>
                  <p className="font-medium font-mono text-sm">
                    {warehouse.lat.toFixed(4)}, {warehouse.lng.toFixed(4)}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <Badge variant="warehouse">
                <Star className="h-3 w-3" />
                Primary Destination
              </Badge>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${warehouse.lat},${warehouse.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                <ExternalLink className="h-3 w-3" />
                Open in Maps
              </a>
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
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/8 text-sm focus:outline-none focus:border-blue-500/50 transition-all"
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
                    className="w-12 h-12 rounded-xl bg-white/8 border border-white/10 flex items-center justify-center"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <MapPin className="h-6 w-6 text-neutral-400" />
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

                <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    ~{Math.round(
                      Math.sqrt(
                        Math.pow((location.coords.lat - warehouse.lat) * 111, 2) +
                        Math.pow((location.coords.lng - warehouse.lng) * 85, 2)
                      )
                    )} km to warehouse
                  </p>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${location.coords.lat},${location.coords.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
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
        description="Enter an address and we'll find the coordinates automatically"
        size="md"
      >
        <form onSubmit={(e) => { e.preventDefault(); handleCreateLocation(); }} className="space-y-4">
          {/* Address Input with Lookup */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Address
            </label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="e.g., Vienna, Austria or full street address"
                  value={formData.address}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, address: e.target.value }))
                    setLookupStatus('idle')
                  }}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-foreground focus:outline-none focus:border-blue-500/50 transition-all"
                />
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={handleAddressLookup}
                disabled={isLookingUp || !formData.address}
              >
                {isLookingUp ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                {isLookingUp ? 'Looking up...' : 'Find'}
              </Button>
            </div>
            
            {/* Lookup Status */}
            {lookupStatus === 'success' && (
              <motion.p 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-sm text-emerald-400 flex items-center gap-1"
              >
                <CheckCircle className="h-3.5 w-3.5" />
                Location found! Coordinates filled in below.
              </motion.p>
            )}
            {lookupStatus === 'error' && (
              <motion.p 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-sm text-red-400 flex items-center gap-1"
              >
                <AlertCircle className="h-3.5 w-3.5" />
                Could not find location. Try a more specific address or enter coordinates manually.
              </motion.p>
            )}
          </div>

          <Input
            label="Display Name (optional)"
            placeholder="e.g., Vienna Office"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          />
          
          {/* Coordinates (auto-filled or manual) */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">
              Coordinates (auto-filled from address lookup, or enter manually)
            </p>
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
          </div>

          {/* Map Preview */}
          {formData.lat && formData.lng && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl overflow-hidden border border-white/10"
            >
              <iframe
                src={`https://maps.google.com/maps?q=${formData.lat},${formData.lng}&t=&z=10&ie=UTF8&iwloc=&output=embed`}
                width="100%"
                height="150"
                style={{ border: 0 }}
                loading="lazy"
                title="Location Preview"
              />
            </motion.div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <Button type="button" variant="ghost" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!formData.lat || !formData.lng}>
              Add Location
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Warehouse Modal */}
      <Modal
        isOpen={isEditWarehouseOpen}
        onClose={() => setIsEditWarehouseOpen(false)}
        title="Edit Main Warehouse"
        description="Enter an address to update the primary destination location"
        size="md"
      >
        <form onSubmit={(e) => { e.preventDefault(); handleSaveWarehouse(); }} className="space-y-4">
          {/* Address Input with Lookup */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Address
            </label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="e.g., Baku Logistics Hub, Azerbaijan"
                  value={warehouseForm.address}
                  onChange={(e) => {
                    setWarehouseForm(prev => ({ ...prev, address: e.target.value }))
                    setWarehouseLookupStatus('idle')
                  }}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-foreground focus:outline-none focus:border-blue-500/50 transition-all"
                />
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={handleWarehouseAddressLookup}
                disabled={warehouseLookingUp || !warehouseForm.address}
              >
                {warehouseLookingUp ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                {warehouseLookingUp ? 'Looking up...' : 'Find'}
              </Button>
            </div>
            
            {/* Lookup Status */}
            {warehouseLookupStatus === 'success' && (
              <motion.p 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-sm text-emerald-400 flex items-center gap-1"
              >
                <CheckCircle className="h-3.5 w-3.5" />
                Location found! Coordinates updated.
              </motion.p>
            )}
            {warehouseLookupStatus === 'error' && (
              <motion.p 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-sm text-red-400 flex items-center gap-1"
              >
                <AlertCircle className="h-3.5 w-3.5" />
                Could not find location. Try a more specific address or enter coordinates manually.
              </motion.p>
            )}
          </div>
          
          {/* Coordinates (auto-filled or manual) */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">
              Coordinates (auto-filled from address lookup, or enter manually)
            </p>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Latitude"
                type="number"
                step="any"
                placeholder="e.g., 40.4093"
                value={warehouseForm.lat}
                onChange={(e) => setWarehouseForm(prev => ({ ...prev, lat: e.target.value }))}
              />
              <Input
                label="Longitude"
                type="number"
                step="any"
                placeholder="e.g., 49.8671"
                value={warehouseForm.lng}
                onChange={(e) => setWarehouseForm(prev => ({ ...prev, lng: e.target.value }))}
              />
            </div>
          </div>

          {/* Map Preview */}
          {warehouseForm.lat && warehouseForm.lng && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl overflow-hidden border border-white/10"
            >
              <iframe
                src={`https://maps.google.com/maps?q=${warehouseForm.lat},${warehouseForm.lng}&t=&z=12&ie=UTF8&iwloc=&output=embed`}
                width="100%"
                height="180"
                style={{ border: 0 }}
                loading="lazy"
                title="Warehouse Preview"
              />
            </motion.div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <Button type="button" variant="ghost" onClick={() => setIsEditWarehouseOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!warehouseForm.lat || !warehouseForm.lng}>
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </Layout>
  )
}
