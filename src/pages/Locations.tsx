import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Layout } from '../components/layout/Layout'
import { Card, Button, Input, Modal, Badge } from '../components/ui'
import { demoLocations, WAREHOUSE_COORDS, WAREHOUSE_ADDRESS } from '../lib/supabase'
import { cn } from '../lib/utils'
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

interface LocationItem {
  id: string
  name: string
  coords: { lat: number; lng: number }
}

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371 // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

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
  const [locations, setLocations] = useState<LocationItem[]>(demoLocations)
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

  // Selected location for map display (null = warehouse)
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null)

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

  // Get the currently selected location for the map
  const selectedLocation = useMemo(() => {
    if (!selectedLocationId) {
      return { 
        name: 'Main Warehouse', 
        lat: warehouse.lat, 
        lng: warehouse.lng,
        address: warehouse.address,
        isWarehouse: true 
      }
    }
    const loc = locations.find(l => l.id === selectedLocationId)
    if (loc) {
      return { 
        name: loc.name, 
        lat: loc.coords.lat, 
        lng: loc.coords.lng,
        address: loc.name,
        isWarehouse: false 
      }
    }
    return { 
      name: 'Main Warehouse', 
      lat: warehouse.lat, 
      lng: warehouse.lng,
      address: warehouse.address,
      isWarehouse: true 
    }
  }, [selectedLocationId, warehouse, locations])

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
    const lat = parseFloat(warehouseForm.lat)
    const lng = parseFloat(warehouseForm.lng)
    
    if (isNaN(lat) || isNaN(lng)) {
      setWarehouseLookupStatus('error')
      return
    }
    
    setWarehouse({
      address: warehouseForm.address,
      lat,
      lng,
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

  // Build Google Maps embed URL for selected location
  const mapEmbedUrl = useMemo(() => {
    if (!mapsApiKey || mapsApiKey === 'your-google-maps-api-key') {
      return null
    }
    
    const center = `${selectedLocation.lat},${selectedLocation.lng}`
    return `https://www.google.com/maps/embed/v1/place?key=${mapsApiKey}&q=${selectedLocation.lat},${selectedLocation.lng}&center=${center}&zoom=12`
  }, [mapsApiKey, selectedLocation])

  // Static map URL for selected location (fallback without API key)
  const staticMapUrl = `https://maps.google.com/maps?q=${selectedLocation.lat},${selectedLocation.lng}&t=&z=13&ie=UTF8&iwloc=&output=embed`

  return (
    <Layout>
      {/* Mobile Layout */}
      <div className="md:hidden flex flex-col" style={{ height: 'calc(100vh - 10rem)' }}>
        {/* Mobile Header */}
        <div className="flex items-center justify-between mb-2 flex-shrink-0">
          <h1 className="text-lg font-bold">Locations</h1>
          <Button onClick={() => setIsCreateModalOpen(true)} size="sm" className="px-2 h-8">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Mobile Map - Compact */}
        <div className="rounded-lg overflow-hidden mb-2 flex-shrink-0 relative h-28">
          <div className="absolute top-1.5 left-1.5 z-10 flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/70 text-[10px]">
            {selectedLocation.isWarehouse ? (
              <Warehouse className="h-2.5 w-2.5 text-blue-400" />
            ) : (
              <MapPin className="h-2.5 w-2.5 text-amber-400" />
            )}
            <span className="font-medium truncate max-w-20">{selectedLocation.name}</span>
          </div>
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
            <iframe
              src={staticMapUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              title="Location Map"
            />
          )}
        </div>

        {/* Mobile Warehouse Card */}
        <div
          className={cn(
            "flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all mb-2 flex-shrink-0",
            "bg-white/[0.02] border",
            selectedLocationId === null 
              ? "border-blue-500/50 bg-blue-500/5" 
              : "border-white/[0.08]"
          )}
          onClick={() => setSelectedLocationId(null)}
        >
          <div className="w-7 h-7 rounded-md bg-blue-500/20 flex items-center justify-center flex-shrink-0">
            <Warehouse className="h-3.5 w-3.5 text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-xs">Main Warehouse</p>
            <p className="text-[10px] text-muted-foreground truncate">{warehouse.address}</p>
          </div>
          <button
            className="p-1 rounded hover:bg-white/10 text-muted-foreground"
            onClick={(e) => {
              e.stopPropagation()
              openEditWarehouse()
            }}
          >
            <Edit className="h-3 w-3" />
          </button>
        </div>

        {/* Mobile Search */}
        <div className="relative mb-2 flex-shrink-0">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-8 pr-2 py-1.5 rounded-lg bg-white/5 border border-white/8 text-xs focus:outline-none focus:border-blue-500/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Mobile Locations List - Scrollable */}
        <div className="flex-1 overflow-y-auto overscroll-contain space-y-1 -mx-1 px-1 pb-2">
          {filteredLocations.map((location) => (
            <div
              key={location.id}
              className={cn(
                "flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all",
                "bg-white/[0.02]",
                selectedLocationId === location.id 
                  ? "border border-amber-500/50 bg-amber-500/5" 
                  : "active:bg-white/[0.08]"
              )}
              onClick={() => setSelectedLocationId(location.id)}
            >
              <div className={cn(
                "w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0",
                selectedLocationId === location.id ? "bg-amber-500/20" : "bg-white/10"
              )}>
                <MapPin className={cn(
                  "h-3.5 w-3.5",
                  selectedLocationId === location.id ? "text-amber-400" : "text-muted-foreground"
                )} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-xs">{location.name}</p>
                <p className="text-[10px] text-muted-foreground">
                  {Math.round(calculateDistance(location.coords.lat, location.coords.lng, warehouse.lat, warehouse.lng))} km
                </p>
              </div>
              <button
                className="p-1 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-400"
                onClick={(e) => {
                  e.stopPropagation()
                  setLocations(prev => prev.filter(l => l.id !== location.id))
                }}
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
          
          {filteredLocations.length === 0 && (
            <div className="text-center py-6">
              <MapPin className="h-6 w-6 mx-auto text-muted-foreground/50 mb-1" />
              <p className="text-xs text-muted-foreground">No locations</p>
            </div>
          )}
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block">
        {/* Desktop Header */}
        <motion.div
          className="flex items-center justify-between mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className="text-2xl font-bold">Locations</h1>
            <p className="text-muted-foreground text-sm">
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
            <Card variant="glass" className="h-80 overflow-hidden p-0 relative">
              {/* Location indicator overlay */}
              <div className="absolute top-3 left-3 z-10 flex items-center gap-2 px-3 py-2 rounded-lg bg-black/60 backdrop-blur-sm border border-white/10">
                {selectedLocation.isWarehouse ? (
                  <Warehouse className="h-4 w-4 text-blue-400" />
                ) : (
                  <MapPin className="h-4 w-4 text-amber-400" />
                )}
                <span className="text-sm font-medium">{selectedLocation.name}</span>
              </div>
              
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
                <iframe
                  src={staticMapUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  title="Location Map"
                />
              )}
            </Card>
          </motion.div>

        {/* Warehouse Info - Hidden on mobile, shown below locations grid */}
        <motion.div
          className="hidden lg:block"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div
            className={cn(
              "h-80 flex flex-col rounded-2xl p-6 cursor-pointer transition-all",
              "bg-white/[0.04] border-2",
              selectedLocationId === null 
                ? "border-blue-500/50 ring-2 ring-blue-500/20" 
                : "border-white/[0.08] hover:border-white/20"
            )}
            onClick={() => setSelectedLocationId(null)}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
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
                onClick={(e) => {
                  e.stopPropagation()
                  openEditWarehouse()
                }}
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
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                <ExternalLink className="h-3 w-3" />
                Open in Maps
              </a>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Desktop Search */}
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

      {/* Desktop Locations Grid */}
      <motion.div
        className="hidden md:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
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
              className={cn(
                "rounded-2xl p-6 cursor-pointer transition-all",
                "bg-white/[0.04] border-2",
                selectedLocationId === location.id 
                  ? "border-amber-500/50 ring-2 ring-amber-500/20" 
                  : "border-white/[0.08] hover:border-white/20"
              )}
              onClick={() => setSelectedLocationId(location.id)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="flex items-start justify-between mb-4">
                <motion.div
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center",
                    selectedLocationId === location.id 
                      ? "bg-amber-500/20" 
                      : "bg-white/8 border border-white/10"
                  )}
                >
                  <MapPin className={cn(
                    "h-6 w-6",
                    selectedLocationId === location.id ? "text-amber-400" : "text-neutral-400"
                  )} />
                </motion.div>
                
                <div className="flex gap-1">
                  <motion.button
                    className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </motion.button>
                  <motion.button
                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation()
                      if (selectedLocationId === location.id) {
                        setSelectedLocationId(null)
                      }
                      setLocations(prev => prev.filter(l => l.id !== location.id))
                    }}
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
                  onClick={(e) => e.stopPropagation()}
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
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
      </div>

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
            <Button 
              type="submit" 
              disabled={!warehouseForm.lat || !warehouseForm.lng}
              onClick={(e) => {
                e.preventDefault()
                handleSaveWarehouse()
              }}
            >
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </Layout>
  )
}
