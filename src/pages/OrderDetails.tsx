import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useOrders } from '../context/OrderContext'
import { Layout } from '../components/layout/Layout'
import { Card, Badge, Button, Modal, Input, Select } from '../components/ui'
import { formatDate, formatCurrency, cn } from '../lib/utils'
import { WAREHOUSE_ADDRESS } from '../lib/supabase'
import type { OrderStatus } from '../lib/supabase'
import {
  ArrowLeft,
  MapPin,
  Calendar,
  User,
  Phone,
  Package,
  Truck,
  Warehouse,
  CheckCircle2,
  Edit,
  Image,
  Navigation,
  Clock,
  Save,
  Plus,
  Hash,
  Ruler,
  Scale,
  Upload,
  X,
  ZoomIn,
  ChevronLeft,
  ChevronRight,
  Trash2,
  FileText,
} from 'lucide-react'

export function OrderDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { getOrderById, updateOrder, addPackageToOrder } = useOrders()

  const order = getOrderById(id || '')
  
  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editForm, setEditForm] = useState({
    status: '' as OrderStatus,
    receiver_name: '',
    receiver_phone: '',
    pickup_city: '',
    pickup_country: '',
    collection_date: '',
    total_price: '',
  })
  
  // Add package modal state
  const [isAddPackageOpen, setIsAddPackageOpen] = useState(false)
  const [packageForm, setPackageForm] = useState({
    client_ref: '',
    dimensions: '',
    weight_kg: '',
    colli: '1',
  })
  const [isAddingPackage, setIsAddingPackage] = useState(false)
  
  // Photo state - sync with order
  const [photos, setPhotos] = useState<string[]>([])
  const [previewPhoto, setPreviewPhoto] = useState<{ url: string; index: number } | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  
  // Sync photos when order loads/changes
  useEffect(() => {
    if (order?.photos) {
      setPhotos(order.photos)
    }
  }, [order?.photos])
  
  // Initialize edit form when opening modal
  const openEditModal = () => {
    if (!order) return
    setEditForm({
      status: order.status,
      receiver_name: order.receiver_name,
      receiver_phone: order.receiver_phone,
      pickup_city: order.pickup_address.city,
      pickup_country: order.pickup_address.country,
      collection_date: order.collection_date,
      total_price: order.total_price.toString(),
    })
    setIsEditModalOpen(true)
  }
  
  const handleSaveEdit = async () => {
    if (!order) return
    await updateOrder(order.id, {
      status: editForm.status,
      receiver_name: editForm.receiver_name,
      receiver_phone: editForm.receiver_phone,
      pickup_address: {
        city: editForm.pickup_city,
        country: editForm.pickup_country,
      },
      collection_date: editForm.collection_date,
      total_price: parseFloat(editForm.total_price),
    })
    setIsEditModalOpen(false)
  }
  
  // Add package function
  const handleAddPackage = async () => {
    if (!order) return
    
    setIsAddingPackage(true)
    try {
      await addPackageToOrder(order.id, {
        client_ref: packageForm.client_ref,
        dimensions: packageForm.dimensions,
        weight_kg: parseFloat(packageForm.weight_kg),
        colli: parseInt(packageForm.colli),
      })
      
      // Also update total weight
      const newTotalWeight = order.total_weight_kg + parseFloat(packageForm.weight_kg)
      await updateOrder(order.id, { total_weight_kg: newTotalWeight })
      
      setIsAddPackageOpen(false)
      setPackageForm({ client_ref: '', dimensions: '', weight_kg: '', colli: '1' })
    } catch (error) {
      console.error('Error adding package:', error)
    } finally {
      setIsAddingPackage(false)
    }
  }
  
  // Photo upload handler
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0 || !order) return
    
    setIsUploading(true)
    
    try {
      const newPhotos: string[] = []
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        // Convert to base64 for demo (in production, upload to storage)
        const reader = new FileReader()
        const base64 = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string)
          reader.readAsDataURL(file)
        })
        newPhotos.push(base64)
      }
      
      const updatedPhotos = [...photos, ...newPhotos]
      setPhotos(updatedPhotos)
      
      // Update order with new photos
      await updateOrder(order.id, { photos: updatedPhotos })
    } catch (error) {
      console.error('Error uploading photos:', error)
    } finally {
      setIsUploading(false)
    }
  }
  
  // Delete photo
  const handleDeletePhoto = async (index: number) => {
    if (!order) return
    
    const updatedPhotos = photos.filter((_, i) => i !== index)
    setPhotos(updatedPhotos)
    await updateOrder(order.id, { photos: updatedPhotos })
    
    // Close preview if viewing deleted photo
    if (previewPhoto?.index === index) {
      setPreviewPhoto(null)
    }
  }
  
  // Navigate preview
  const navigatePreview = (direction: 'prev' | 'next') => {
    if (!previewPhoto) return
    
    let newIndex = direction === 'next' 
      ? previewPhoto.index + 1 
      : previewPhoto.index - 1
    
    if (newIndex < 0) newIndex = photos.length - 1
    if (newIndex >= photos.length) newIndex = 0
    
    setPreviewPhoto({ url: photos[newIndex], index: newIndex })
  }
  
  // PDF Export function
  const handleExportPDF = () => {
    if (!order) return
    
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Order ${order.internal_ref}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
          h1 { color: #1a1a2e; border-bottom: 2px solid #4f46e5; padding-bottom: 10px; }
          .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .section { margin-bottom: 25px; }
          .section h2 { font-size: 16px; color: #666; margin-bottom: 10px; text-transform: uppercase; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
          .field { margin-bottom: 10px; }
          .label { font-size: 12px; color: #888; }
          .value { font-size: 14px; font-weight: 500; }
          .packages { border: 1px solid #ddd; border-radius: 8px; overflow: hidden; }
          .packages th, .packages td { padding: 10px; text-align: left; border-bottom: 1px solid #eee; }
          .packages th { background: #f5f5f5; font-size: 12px; text-transform: uppercase; }
          .status { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
          .status.pickup { background: #fef3c7; color: #d97706; }
          .status.warehouse { background: #dbeafe; color: #2563eb; }
          .status.delivered { background: #d1fae5; color: #059669; }
          .total { font-size: 24px; font-weight: bold; color: #4f46e5; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #888; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1>Order ${order.internal_ref}</h1>
            <p>Created: ${formatDate(order.created_at)}</p>
          </div>
          <div style="text-align: right;">
            <span class="status ${order.status}">${order.status.toUpperCase()}</span>
          </div>
        </div>
        
        <div class="grid">
          <div class="section">
            <h2>Pickup Location</h2>
            <div class="field">
              <div class="label">City</div>
              <div class="value">${order.pickup_address.city}, ${order.pickup_address.country}</div>
            </div>
            <div class="field">
              <div class="label">Collection Date</div>
              <div class="value">${formatDate(order.collection_date)}</div>
            </div>
          </div>
          
          <div class="section">
            <h2>Receiver</h2>
            <div class="field">
              <div class="label">Name</div>
              <div class="value">${order.receiver_name}</div>
            </div>
            <div class="field">
              <div class="label">Phone</div>
              <div class="value">${order.receiver_phone}</div>
            </div>
            <div class="field">
              <div class="label">Destination</div>
              <div class="value">${WAREHOUSE_ADDRESS}</div>
            </div>
          </div>
        </div>
        
        <div class="section">
          <h2>Packages (${order.order_packages?.length || 0})</h2>
          <table class="packages" width="100%">
            <thead>
              <tr>
                <th>#</th>
                <th>Client Ref</th>
                <th>Dimensions</th>
                <th>Weight</th>
                <th>Colli</th>
              </tr>
            </thead>
            <tbody>
              ${order.order_packages?.map((pkg, i) => `
                <tr>
                  <td>${i + 1}</td>
                  <td>${pkg.client_ref}</td>
                  <td>${pkg.dimensions}</td>
                  <td>${pkg.weight_kg} kg</td>
                  <td>${pkg.colli}</td>
                </tr>
              `).join('') || '<tr><td colspan="5">No packages</td></tr>'}
            </tbody>
          </table>
        </div>
        
        <div class="section">
          <h2>Summary</h2>
          <div class="grid">
            <div>
              <div class="field">
                <div class="label">Total Weight</div>
                <div class="value">${order.total_weight_kg} kg</div>
              </div>
              <div class="field">
                <div class="label">Total Packages</div>
                <div class="value">${order.order_packages?.length || 0}</div>
              </div>
            </div>
            <div style="text-align: right;">
              <div class="label">Total Price</div>
              <div class="total">${formatCurrency(order.total_price)}</div>
            </div>
          </div>
        </div>
        
        <div class="footer">
          <p>TransSupply Order Management System</p>
          <p>Generated on ${new Date().toLocaleString()}</p>
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

          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={handleExportPDF}>
              <FileText className="h-4 w-4" />
              Export PDF
            </Button>
            {user?.role === 'admin' && (
              <Button variant="secondary" onClick={openEditModal}>
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

            {/* Route Map */}
            <div className="mt-6">
              {(() => {
                const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
                const origin = encodeURIComponent(`${order.pickup_address.city}, ${order.pickup_address.country}`)
                const destination = encodeURIComponent(`Baku, Azerbaijan`)
                
                if (apiKey && apiKey !== 'your-google-maps-api-key') {
                  // Use Directions embed for route visualization
                  const directionsUrl = `https://www.google.com/maps/embed/v1/directions?key=${apiKey}&origin=${origin}&destination=${destination}&mode=driving`
                  
                  return (
                    <div className="relative">
                      <iframe
                        src={directionsUrl}
                        className="w-full h-72 rounded-xl border border-white/10"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Route Map"
                      />
                      <a
                        href={`https://www.google.com/maps/dir/${origin}/${destination}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg bg-white/90 text-gray-800 text-sm font-medium hover:bg-white transition-colors flex items-center gap-1.5"
                      >
                        <Navigation className="h-3.5 w-3.5" />
                        Open in Maps
                      </a>
                    </div>
                  )
                }
                
                // Fallback when no API key - show static map link
                return (
                  <div className="h-72 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center justify-center">
                    <MapPin className="h-12 w-12 text-muted-foreground/50 mb-3" />
                    <p className="text-muted-foreground text-sm mb-3">Add Google Maps API key to view route</p>
                    <a
                      href={`https://www.google.com/maps/dir/${origin}/${destination}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors flex items-center gap-2"
                    >
                      <Navigation className="h-4 w-4" />
                      View Route in Google Maps
                    </a>
                  </div>
                )
              })()}
            </div>
          </Card>

          {/* Order Packages */}
          <Card variant="glass">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-400" />
                Order Packages ({order.order_packages?.length || 0})
              </h2>
              {user?.role === 'admin' && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setIsAddPackageOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                  Add Package
                </Button>
              )}
            </div>

            <div className="space-y-3">
              {order.order_packages?.map((pkg, index) => (
                <motion.div
                  key={pkg.id}
                  className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <Package className="h-5 w-5 text-blue-400" />
                  </div>
                  
                  <div className="flex-1">
                    <p className="font-medium">{pkg.client_ref}</p>
                    <p className="text-sm text-muted-foreground">
                      {pkg.dimensions} • {pkg.colli} colli
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-medium">{pkg.weight_kg} kg</p>
                  </div>
                </motion.div>
              ))}

              {(!order.order_packages || order.order_packages.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p>No packages added yet</p>
                  {user?.role === 'admin' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="mt-3"
                      onClick={() => setIsAddPackageOpen(true)}
                    >
                      <Plus className="h-4 w-4" />
                      Add First Package
                    </Button>
                  )}
                </div>
              )}
            </div>
          </Card>

          {/* Photos */}
          <Card variant="glass">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Image className="h-5 w-5 text-indigo-400" />
                Photos ({photos.length})
              </h2>
              {user?.role === 'admin' && (
                <label className={cn(
                "cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg",
                "bg-white/10 border border-white/10 text-foreground",
                "hover:bg-white/15 transition-colors",
                isUploading && "opacity-50 cursor-not-allowed"
              )}>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handlePhotoUpload}
                    disabled={isUploading}
                  />
                  {isUploading ? (
                    <>Uploading...</>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Upload
                    </>
                  )}
                </label>
              )}
            </div>

            <div className="grid grid-cols-4 gap-4">
              {photos.length > 0 ? (
                photos.map((photo, index) => (
                  <motion.div
                    key={index}
                    className="relative group aspect-square rounded-xl bg-white/5 border border-white/10 overflow-hidden cursor-pointer"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.03 }}
                    onClick={() => setPreviewPhoto({ url: photo, index })}
                  >
                    <img src={photo} alt={`Order photo ${index + 1}`} className="w-full h-full object-cover" />
                    
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <motion.button
                        className="p-2 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation()
                          setPreviewPhoto({ url: photo, index })
                        }}
                      >
                        <ZoomIn className="h-4 w-4" />
                      </motion.button>
                      {user?.role === 'admin' && (
                        <motion.button
                          className="p-2 rounded-lg bg-red-500/50 text-white hover:bg-red-500/70 transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeletePhoto(index)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-4 text-center py-8 text-muted-foreground">
                  <Image className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p>No photos uploaded</p>
                  {user?.role === 'admin' && (
                    <label className={cn(
                      "cursor-pointer inline-flex items-center gap-2 mt-3 px-3 py-1.5 text-sm rounded-lg",
                      "hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground"
                    )}>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handlePhotoUpload}
                        disabled={isUploading}
                      />
                      <Upload className="h-4 w-4" />
                      Upload Photos
                    </label>
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
                <span className="text-muted-foreground">Packages</span>
                <span className="font-medium">{order.order_packages?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total Colli</span>
                <span className="font-medium">
                  {order.order_packages?.reduce((sum, pkg) => sum + pkg.colli, 0) || 0}
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
      
      {/* Edit Order Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Order"
        description={`Editing order ${order.internal_ref}`}
        size="lg"
      >
        <form onSubmit={(e) => { e.preventDefault(); handleSaveEdit(); }} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Status"
              value={editForm.status}
              onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value as OrderStatus }))}
              options={[
                { value: 'pickup', label: 'Pending Pickup' },
                { value: 'warehouse', label: 'In Warehouse' },
                { value: 'delivered', label: 'Delivered' },
              ]}
            />
            <Input
              label="Collection Date"
              type="date"
              value={editForm.collection_date}
              onChange={(e) => setEditForm(prev => ({ ...prev, collection_date: e.target.value }))}
              icon={<Calendar className="h-4 w-4" />}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Pickup City"
              value={editForm.pickup_city}
              onChange={(e) => setEditForm(prev => ({ ...prev, pickup_city: e.target.value }))}
              icon={<MapPin className="h-4 w-4" />}
            />
            <Input
              label="Pickup Country"
              value={editForm.pickup_country}
              onChange={(e) => setEditForm(prev => ({ ...prev, pickup_country: e.target.value }))}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Receiver Name"
              value={editForm.receiver_name}
              onChange={(e) => setEditForm(prev => ({ ...prev, receiver_name: e.target.value }))}
              icon={<User className="h-4 w-4" />}
            />
            <Input
              label="Receiver Phone"
              value={editForm.receiver_phone}
              onChange={(e) => setEditForm(prev => ({ ...prev, receiver_phone: e.target.value }))}
              icon={<Phone className="h-4 w-4" />}
            />
          </div>
          
          <Input
            label="Total Price (€)"
            type="number"
            step="0.01"
            value={editForm.total_price}
            onChange={(e) => setEditForm(prev => ({ ...prev, total_price: e.target.value }))}
          />
          
          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <Button type="button" variant="ghost" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
      
      {/* Add Package Modal */}
      <Modal
        isOpen={isAddPackageOpen}
        onClose={() => setIsAddPackageOpen(false)}
        title="Add Package"
        description={`Add a new package to order ${order.internal_ref}`}
        size="md"
      >
        <form onSubmit={(e) => { e.preventDefault(); handleAddPackage(); }} className="space-y-4">
          <Input
            label="Client Reference"
            placeholder="e.g., N3180425"
            value={packageForm.client_ref}
            onChange={(e) => setPackageForm(prev => ({ ...prev, client_ref: e.target.value }))}
            icon={<Hash className="h-4 w-4" />}
          />
          
          <Input
            label="Dimensions"
            placeholder="e.g., 120x80x100 cm"
            value={packageForm.dimensions}
            onChange={(e) => setPackageForm(prev => ({ ...prev, dimensions: e.target.value }))}
            icon={<Ruler className="h-4 w-4" />}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Weight (kg)"
              type="number"
              step="0.1"
              placeholder="e.g., 45.5"
              value={packageForm.weight_kg}
              onChange={(e) => setPackageForm(prev => ({ ...prev, weight_kg: e.target.value }))}
              icon={<Scale className="h-4 w-4" />}
            />
            <Input
              label="Number of Colli"
              type="number"
              min="1"
              placeholder="1"
              value={packageForm.colli}
              onChange={(e) => setPackageForm(prev => ({ ...prev, colli: e.target.value }))}
              icon={<Package className="h-4 w-4" />}
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <Button type="button" variant="ghost" onClick={() => setIsAddPackageOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!packageForm.client_ref || !packageForm.dimensions || !packageForm.weight_kg || isAddingPackage}
            >
              {isAddingPackage ? (
                <>Adding...</>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Add Package
                </>
              )}
            </Button>
          </div>
        </form>
      </Modal>
      
      {/* Photo Preview Lightbox */}
      <AnimatePresence>
        {previewPhoto && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/90 backdrop-blur-sm"
              onClick={() => setPreviewPhoto(null)}
            />
            
            {/* Close button */}
            <motion.button
              className="absolute top-4 right-4 z-10 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              onClick={() => setPreviewPhoto(null)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="h-6 w-6" />
            </motion.button>
            
            {/* Navigation - Previous */}
            {photos.length > 1 && (
              <motion.button
                className="absolute left-4 z-10 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                onClick={() => navigatePreview('prev')}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ChevronLeft className="h-6 w-6" />
              </motion.button>
            )}
            
            {/* Navigation - Next */}
            {photos.length > 1 && (
              <motion.button
                className="absolute right-4 z-10 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                onClick={() => navigatePreview('next')}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ChevronRight className="h-6 w-6" />
              </motion.button>
            )}
            
            {/* Image */}
            <motion.img
              key={previewPhoto.index}
              src={previewPhoto.url}
              alt={`Photo ${previewPhoto.index + 1}`}
              className="relative z-10 max-w-[90vw] max-h-[85vh] rounded-xl shadow-2xl object-contain"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
            
            {/* Photo counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 px-4 py-2 rounded-full bg-black/50 text-white text-sm">
              {previewPhoto.index + 1} / {photos.length}
            </div>
            
            {/* Delete button (admin only) */}
            {user?.role === 'admin' && (
              <motion.button
                className="absolute bottom-4 right-4 z-10 flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/80 text-white hover:bg-red-500 transition-colors"
                onClick={() => handleDeletePhoto(previewPhoto.index)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  )
}
