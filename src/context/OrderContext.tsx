import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { Order, OrderBox, ClientRecord, OrderStatus } from '../lib/supabase'
import { supabase, demoOrders, demoClients } from '../lib/supabase'
import { useAuth } from './AuthContext'

// Set to true to use Supabase, false for demo data
const USE_SUPABASE = import.meta.env.VITE_SUPABASE_URL !== 'https://your-project.supabase.co'

interface OrderContextType {
  orders: Order[]
  clients: ClientRecord[]
  loading: boolean
  error: string | null
  getOrderById: (id: string) => Order | undefined
  getOrdersByClient: (clientId: string) => Order[]
  getOrdersByStatus: (status: OrderStatus) => Order[]
  createOrder: (order: Omit<Order, 'id' | 'created_at' | 'updated_at'> & { internal_ref?: string }) => Promise<Order>
  updateOrder: (id: string, updates: Partial<Order>) => Promise<void>
  deleteOrder: (id: string) => Promise<void>
  addBoxToOrder: (orderId: string, box: Omit<OrderBox, 'id' | 'order_id'>) => Promise<void>
  createClient: (client: Omit<ClientRecord, 'id' | 'created_at'>) => Promise<ClientRecord>
  refreshData: () => Promise<void>
  getStats: () => {
    totalOrders: number
    pendingPickups: number
    inWarehouse: number
    delivered: number
    totalWeight: number
    totalRevenue: number
  }
}

const OrderContext = createContext<OrderContextType | undefined>(undefined)

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([])
  const [clients, setClients] = useState<ClientRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  // Fetch data on mount
  useEffect(() => {
    refreshData()
  }, [])

  const refreshData = async () => {
    setLoading(true)
    setError(null)

    if (!USE_SUPABASE) {
      // Use demo data
      setOrders(demoOrders)
      setClients(demoClients)
      setLoading(false)
      return
    }

    try {
      // Fetch clients
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('*')
        .order('name')

      if (clientsError) throw clientsError
      
      // Fetch orders with boxes
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_boxes (*)
        `)
        .order('created_at', { ascending: false })

      if (ordersError) throw ordersError

      // Transform data to match our types
      const transformedOrders: Order[] = (ordersData || []).map(order => ({
        id: order.id,
        client_id: order.client_id,
        internal_ref: order.internal_ref,
        status: order.status as OrderStatus,
        pickup_address: {
          city: order.pickup_city,
          country: order.pickup_country,
          street: order.pickup_street,
        },
        collection_date: order.collection_date,
        receiver_name: order.receiver_name,
        receiver_phone: order.receiver_phone,
        receiver_address: {
          city: order.receiver_city,
          country: order.receiver_country,
        },
        total_weight_kg: parseFloat(order.total_weight_kg) || 0,
        total_price: parseFloat(order.total_price) || 0,
        photos: [],
        created_at: order.created_at,
        updated_at: order.updated_at,
        order_boxes: (order.order_boxes || []).map((box: any) => ({
          id: box.id,
          order_id: box.order_id,
          client_ref: box.client_ref,
          weight_kg: parseFloat(box.weight_kg) || 0,
          dimensions: box.dimensions,
          packages: box.packages || 1,
        })),
      }))

      const transformedClients: ClientRecord[] = (clientsData || []).map(client => ({
        id: client.id,
        email: client.email,
        name: client.name,
        created_at: client.created_at,
      }))

      setOrders(transformedOrders)
      setClients(transformedClients)
    } catch (err: any) {
      console.error('Error fetching data:', err)
      setError(err.message)
      // Fallback to demo data on error
      setOrders(demoOrders)
      setClients(demoClients)
    } finally {
      setLoading(false)
    }
  }

  const getOrderById = (id: string) => {
    return orders.find(o => o.id === id)
  }

  const getOrdersByClient = (clientId: string) => {
    return orders.filter(o => o.client_id === clientId)
  }

  const getOrdersByStatus = (status: OrderStatus) => {
    return orders.filter(o => o.status === status)
  }

  const generateInternalRef = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = (now.getMonth() + 1).toString().padStart(2, '0')
    const prefix = `${year}-${month}-`
    const existingRefs = orders.filter(o => o.internal_ref.startsWith(prefix))
    const sequence = existingRefs.length + 1
    return `${prefix}${sequence.toString().padStart(4, '0')}`
  }

  const createOrder = async (orderData: Omit<Order, 'id' | 'created_at' | 'updated_at'> & { internal_ref?: string }): Promise<Order> => {
    const internal_ref = orderData.internal_ref || generateInternalRef()

    if (!USE_SUPABASE) {
      const newOrder: Order = {
        ...orderData,
        id: `order-${Date.now()}`,
        internal_ref,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      setOrders(prev => [...prev, newOrder])
      return newOrder
    }

    const { data, error } = await supabase
      .from('orders')
      .insert({
        client_id: orderData.client_id,
        internal_ref,
        status: orderData.status,
        pickup_city: orderData.pickup_address?.city,
        pickup_country: orderData.pickup_address?.country,
        pickup_street: orderData.pickup_address?.street,
        collection_date: orderData.collection_date,
        receiver_name: orderData.receiver_name,
        receiver_phone: orderData.receiver_phone,
        receiver_city: orderData.receiver_address?.city,
        receiver_country: orderData.receiver_address?.country,
        total_weight_kg: orderData.total_weight_kg,
        total_price: orderData.total_price,
      })
      .select()
      .single()

    if (error) throw error

    // Insert boxes if any
    if (orderData.order_boxes?.length) {
      const { error: boxError } = await supabase
        .from('order_boxes')
        .insert(orderData.order_boxes.map(box => ({
          order_id: data.id,
          client_ref: box.client_ref,
          weight_kg: box.weight_kg,
          dimensions: box.dimensions,
          packages: box.packages,
        })))

      if (boxError) console.error('Error inserting boxes:', boxError)
    }

    await refreshData()
    return getOrderById(data.id)!
  }

  const updateOrder = async (id: string, updates: Partial<Order>) => {
    if (!USE_SUPABASE) {
      setOrders(prev => prev.map(o => 
        o.id === id 
          ? { ...o, ...updates, updated_at: new Date().toISOString() }
          : o
      ))
      return
    }

    const { error } = await supabase
      .from('orders')
      .update({
        status: updates.status,
        pickup_city: updates.pickup_address?.city,
        pickup_country: updates.pickup_address?.country,
        pickup_street: updates.pickup_address?.street,
        collection_date: updates.collection_date,
        receiver_name: updates.receiver_name,
        receiver_phone: updates.receiver_phone,
        receiver_city: updates.receiver_address?.city,
        receiver_country: updates.receiver_address?.country,
        total_weight_kg: updates.total_weight_kg,
        total_price: updates.total_price,
      })
      .eq('id', id)

    if (error) throw error
    await refreshData()
  }

  const deleteOrder = async (id: string) => {
    if (!USE_SUPABASE) {
      setOrders(prev => prev.filter(o => o.id !== id))
      return
    }

    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id)

    if (error) throw error
    await refreshData()
  }

  const addBoxToOrder = async (orderId: string, boxData: Omit<OrderBox, 'id' | 'order_id'>) => {
    if (!USE_SUPABASE) {
      const newBox: OrderBox = {
        ...boxData,
        id: `box-${Date.now()}`,
        order_id: orderId,
      }
      setOrders(prev => prev.map(o => {
        if (o.id === orderId) {
          const boxes = [...(o.order_boxes || []), newBox]
          const totalWeight = boxes.reduce((sum, b) => sum + b.weight_kg, 0)
          return { ...o, order_boxes: boxes, total_weight_kg: totalWeight }
        }
        return o
      }))
      return
    }

    const { error } = await supabase
      .from('order_boxes')
      .insert({
        order_id: orderId,
        client_ref: boxData.client_ref,
        weight_kg: boxData.weight_kg,
        dimensions: boxData.dimensions,
        packages: boxData.packages,
      })

    if (error) throw error

    // Update total weight
    const order = orders.find(o => o.id === orderId)
    if (order) {
      const newTotalWeight = (order.order_boxes?.reduce((sum, b) => sum + b.weight_kg, 0) || 0) + boxData.weight_kg
      await supabase
        .from('orders')
        .update({ total_weight_kg: newTotalWeight })
        .eq('id', orderId)
    }

    await refreshData()
  }

  const createClient = async (clientData: Omit<ClientRecord, 'id' | 'created_at'>): Promise<ClientRecord> => {
    if (!USE_SUPABASE) {
      const newClient: ClientRecord = {
        ...clientData,
        id: `client-${Date.now()}`,
        created_at: new Date().toISOString(),
      }
      setClients(prev => [...prev, newClient])
      return newClient
    }

    const { data, error } = await supabase
      .from('clients')
      .insert({
        email: clientData.email,
        name: clientData.name,
      })
      .select()
      .single()

    if (error) throw error
    await refreshData()
    return {
      id: data.id,
      email: data.email,
      name: data.name,
      created_at: data.created_at,
    }
  }

  const getStats = () => {
    const filteredOrders = user?.role === 'admin' 
      ? orders 
      : orders.filter(o => o.client_id === user?.clientId)

    return {
      totalOrders: filteredOrders.length,
      pendingPickups: filteredOrders.filter(o => o.status === 'pickup').length,
      inWarehouse: filteredOrders.filter(o => o.status === 'warehouse').length,
      delivered: filteredOrders.filter(o => o.status === 'delivered').length,
      totalWeight: filteredOrders.reduce((sum, o) => sum + o.total_weight_kg, 0),
      totalRevenue: filteredOrders.reduce((sum, o) => sum + o.total_price, 0),
    }
  }

  return (
    <OrderContext.Provider value={{
      orders: user?.role === 'admin' ? orders : orders.filter(o => o.client_id === user?.clientId),
      clients,
      loading,
      error,
      getOrderById,
      getOrdersByClient,
      getOrdersByStatus,
      createOrder,
      updateOrder,
      deleteOrder,
      addBoxToOrder,
      createClient,
      refreshData,
      getStats,
    }}>
      {children}
    </OrderContext.Provider>
  )
}

export function useOrders() {
  const context = useContext(OrderContext)
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrderProvider')
  }
  return context
}
