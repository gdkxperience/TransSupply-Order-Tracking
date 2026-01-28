import { createContext, useContext, useState, ReactNode } from 'react'
import type { Order, OrderBox, ClientRecord, OrderStatus } from '../lib/supabase'
import { demoOrders, demoClients } from '../lib/supabase'
import { useAuth } from './AuthContext'

interface OrderContextType {
  orders: Order[]
  clients: ClientRecord[]
  getOrderById: (id: string) => Order | undefined
  getOrdersByClient: (clientId: string) => Order[]
  getOrdersByStatus: (status: OrderStatus) => Order[]
  createOrder: (order: Omit<Order, 'id' | 'internal_ref' | 'created_at' | 'updated_at'>) => Order
  updateOrder: (id: string, updates: Partial<Order>) => void
  deleteOrder: (id: string) => void
  addBoxToOrder: (orderId: string, box: Omit<OrderBox, 'id' | 'order_id'>) => void
  createClient: (client: Omit<ClientRecord, 'id' | 'created_at'>) => ClientRecord
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
  const [orders, setOrders] = useState<Order[]>(demoOrders)
  const [clients, setClients] = useState<ClientRecord[]>(demoClients)
  const { user } = useAuth()

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
    const quarter = Math.ceil((now.getMonth() + 1) / 3)
    const sequence = orders.filter(o => o.internal_ref.startsWith(`${year}Q${quarter}`)).length + 1
    return `${year}Q${quarter}-${sequence.toString().padStart(3, '0')}`
  }

  const createOrder = (orderData: Omit<Order, 'id' | 'internal_ref' | 'created_at' | 'updated_at'>) => {
    const newOrder: Order = {
      ...orderData,
      id: `order-${Date.now()}`,
      internal_ref: generateInternalRef(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    setOrders(prev => [...prev, newOrder])
    return newOrder
  }

  const updateOrder = (id: string, updates: Partial<Order>) => {
    setOrders(prev => prev.map(o => 
      o.id === id 
        ? { ...o, ...updates, updated_at: new Date().toISOString() }
        : o
    ))
  }

  const deleteOrder = (id: string) => {
    setOrders(prev => prev.filter(o => o.id !== id))
  }

  const addBoxToOrder = (orderId: string, boxData: Omit<OrderBox, 'id' | 'order_id'>) => {
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
  }

  const createClient = (clientData: Omit<ClientRecord, 'id' | 'created_at'>) => {
    const newClient: ClientRecord = {
      ...clientData,
      id: `client-${Date.now()}`,
      created_at: new Date().toISOString(),
    }
    setClients(prev => [...prev, newClient])
    return newClient
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
      getOrderById,
      getOrdersByClient,
      getOrdersByStatus,
      createOrder,
      updateOrder,
      deleteOrder,
      addBoxToOrder,
      createClient,
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
