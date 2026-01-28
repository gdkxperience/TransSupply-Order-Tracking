import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for database
export type OrderStatus = 'pickup' | 'warehouse' | 'delivered'

export type ClientRecord = {
  id: string
  email: string
  name: string
  created_at: string
}

export type Order = {
  id: string
  client_id: string
  internal_ref: string
  status: OrderStatus
  pickup_address: {
    street?: string
    city: string
    country: string
  }
  collection_date: string
  receiver_name: string
  receiver_phone: string
  receiver_address: {
    street?: string
    city: string
    country: string
  }
  total_weight_kg: number
  total_price: number
  photos: string[]
  created_at: string
  updated_at: string
  order_packages?: OrderPackage[]
  client?: ClientRecord
}

export type OrderPackage = {
  id: string
  order_id: string
  client_ref: string
  weight_kg: number
  dimensions: string
  colli: number
}

export type Location = {
  id: string
  name: string
  coords: { lat: number; lng: number }
}

// Import real data from CSV
import { importedClients, importedOrders } from './importedData'

// Export the imported data as demo data
export const demoClients: ClientRecord[] = importedClients

export const demoOrders: Order[] = importedOrders

export const demoLocations: Location[] = [
  { id: '1', name: 'Vienna, Austria', coords: { lat: 48.2082, lng: 16.3738 } },
  { id: '2', name: 'Zurich, Switzerland', coords: { lat: 47.3769, lng: 8.5417 } },
  { id: '3', name: 'Norderstedt, Germany', coords: { lat: 53.6859, lng: 9.9867 } },
  { id: '4', name: 'Pavlov, Czech Republic', coords: { lat: 48.8686, lng: 16.6728 } },
  { id: '5', name: 'Arras, France', coords: { lat: 50.2910, lng: 2.7775 } },
  { id: '6', name: 'Campina, Romania', coords: { lat: 45.0833, lng: 25.7333 } },
  { id: '7', name: 'Oskarshamn, Sweden', coords: { lat: 57.2656, lng: 16.4500 } },
  { id: '8', name: 'Llanera, Spain', coords: { lat: 43.4500, lng: -5.9167 } },
  { id: '9', name: 'Cologne, Germany', coords: { lat: 50.9375, lng: 6.9603 } },
  { id: '10', name: 'Milan, Italy', coords: { lat: 45.4642, lng: 9.1900 } },
  { id: '11', name: 'Eibergen, Netherlands', coords: { lat: 52.0983, lng: 6.6500 } },
  { id: '12', name: 'Agotnes, Norway', coords: { lat: 60.4000, lng: 5.0333 } },
]

// Baku destination coordinates (main delivery hub)
export const WAREHOUSE_COORDS = { lat: 40.4093, lng: 49.8671 }
export const WAREHOUSE_ADDRESS = 'Baku Logistics Hub, Azerbaijan'
