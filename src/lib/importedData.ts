import type { Order, OrderBox, ClientRecord } from './supabase'

// Imported clients from CSV data
export const importedClients: ClientRecord[] = [
  { id: 'client-aioc', email: 'ops@aioc.az', name: 'AIOC', created_at: '2025-01-01' },
  { id: 'client-bpsd', email: 'logistics@bpsd.az', name: 'BPSD', created_at: '2025-01-01' },
  { id: 'client-btc', email: 'shipping@btc.az', name: 'BTC', created_at: '2025-01-01' },
  { id: 'client-bpcs', email: 'ops@bpcs.az', name: 'BPCS', created_at: '2025-01-01' },
  { id: 'client-scpc', email: 'logistics@scpc.az', name: 'SCPC', created_at: '2025-01-01' },
  { id: 'client-gpc', email: 'shipping@gpc.ge', name: 'GPC', created_at: '2025-01-01' },
]

// Helper to get client ID by receiver code
const getClientId = (receiver: string): string => {
  const mapping: Record<string, string> = {
    'AIOC': 'client-aioc',
    'BPSD': 'client-bpsd',
    'BTC': 'client-btc',
    'BPCS': 'client-bpcs',
    'SCPC': 'client-scpc',
    'GPC': 'client-gpc',
  }
  return mapping[receiver] || 'client-aioc'
}

// Parse price from string like "115,00" or "310.00" or "400 USD AIR"
const parsePrice = (priceStr: string): number => {
  if (!priceStr) return 0
  const cleaned = priceStr.replace(/[^0-9.,]/g, '').replace(',', '.')
  return parseFloat(cleaned) || 0
}

// Parse weight from string
const parseWeight = (weightStr: string): number => {
  if (!weightStr) return 0
  const cleaned = weightStr.replace(',', '.')
  return parseFloat(cleaned) || 0
}

// Imported orders from CSV data - parsed and structured
export const importedOrders: Order[] = [
  {
    id: 'ord-2025-04-0090',
    client_id: 'client-bpsd',
    internal_ref: '2025Q2-090',
    status: 'delivered',
    pickup_address: { city: 'Eibergen', country: 'Netherlands' },
    collection_date: '2025-04-15',
    receiver_name: 'BPSD Logistics',
    receiver_phone: '+994 12 345 6789',
    receiver_address: { city: 'Baku', country: 'Azerbaijan' },
    total_weight_kg: 120,
    total_price: 115,
    photos: [],
    created_at: '2025-04-14',
    updated_at: '2025-04-20',
    order_boxes: [
      { id: 'box-090-1', order_id: 'ord-2025-04-0090', client_ref: 'N3178987', weight_kg: 120, dimensions: '120x85x69', packages: 1 }
    ]
  },
  {
    id: 'ord-2025-04-0091',
    client_id: 'client-aioc',
    internal_ref: '2025Q2-091',
    status: 'delivered',
    pickup_address: { city: 'Vienna', country: 'Austria' },
    collection_date: '2025-04-16',
    receiver_name: 'AIOC Operations',
    receiver_phone: '+994 12 345 6780',
    receiver_address: { city: 'Baku', country: 'Azerbaijan' },
    total_weight_kg: 36.6,
    total_price: 310,
    photos: [],
    created_at: '2025-04-15',
    updated_at: '2025-04-22',
    order_boxes: [
      { id: 'box-091-1', order_id: 'ord-2025-04-0091', client_ref: 'N3180282', weight_kg: 9.94, dimensions: '32x32x32', packages: 2 },
      { id: 'box-091-2', order_id: 'ord-2025-04-0091', client_ref: 'N3180297', weight_kg: 0.75, dimensions: '32x32x12', packages: 1 },
      { id: 'box-091-3', order_id: 'ord-2025-04-0091', client_ref: 'N3180411', weight_kg: 10.04, dimensions: '36x30x15', packages: 3 },
      { id: 'box-091-4', order_id: 'ord-2025-04-0091', client_ref: 'N3180463', weight_kg: 2.6, dimensions: '60x16x15', packages: 1 },
      { id: 'box-091-5', order_id: 'ord-2025-04-0091', client_ref: 'N3180526', weight_kg: 4.1, dimensions: '30x30x24', packages: 1 },
      { id: 'box-091-6', order_id: 'ord-2025-04-0091', client_ref: 'N3180545', weight_kg: 10, dimensions: '28x26x20', packages: 1 },
    ]
  },
  {
    id: 'ord-2025-04-0092',
    client_id: 'client-aioc',
    internal_ref: '2025Q2-092',
    status: 'delivered',
    pickup_address: { city: 'Norderstedt', country: 'Germany' },
    collection_date: '2025-04-18',
    receiver_name: 'AIOC Hamburg Branch',
    receiver_phone: '+994 12 345 6781',
    receiver_address: { city: 'Baku', country: 'Azerbaijan' },
    total_weight_kg: 29,
    total_price: 185,
    photos: [],
    created_at: '2025-04-17',
    updated_at: '2025-04-24',
    order_boxes: [
      { id: 'box-092-1', order_id: 'ord-2025-04-0092', client_ref: 'N3183169', weight_kg: 29, dimensions: '60x40x58', packages: 1 }
    ]
  },
  {
    id: 'ord-2025-04-0094',
    client_id: 'client-btc',
    internal_ref: '2025Q2-094',
    status: 'delivered',
    pickup_address: { city: 'Pavlov', country: 'Czech Republic' },
    collection_date: '2025-04-20',
    receiver_name: 'BTC Tbilisi',
    receiver_phone: '+995 32 123 4567',
    receiver_address: { city: 'Tbilisi', country: 'Georgia' },
    total_weight_kg: 315.97,
    total_price: 320,
    photos: [],
    created_at: '2025-04-19',
    updated_at: '2025-04-26',
    order_boxes: [
      { id: 'box-094-1', order_id: 'ord-2025-04-0094', client_ref: 'N3162150', weight_kg: 150, dimensions: '74x108x99', packages: 1 },
      { id: 'box-094-2', order_id: 'ord-2025-04-0094', client_ref: 'N3162150-2', weight_kg: 15.97, dimensions: '66x44x37', packages: 1 },
      { id: 'box-094-3', order_id: 'ord-2025-04-0094', client_ref: 'N3162150-3', weight_kg: 150, dimensions: '74x108x99', packages: 1 },
    ]
  },
  {
    id: 'ord-2025-04-0096',
    client_id: 'client-bpsd',
    internal_ref: '2025Q2-096',
    status: 'delivered',
    pickup_address: { city: 'Agotnes', country: 'Norway' },
    collection_date: '2025-04-22',
    receiver_name: 'BPSD Norway Ops',
    receiver_phone: '+994 12 345 6782',
    receiver_address: { city: 'Baku', country: 'Azerbaijan' },
    total_weight_kg: 102,
    total_price: 300,
    photos: [],
    created_at: '2025-04-21',
    updated_at: '2025-04-28',
    order_boxes: [
      { id: 'box-096-1', order_id: 'ord-2025-04-0096', client_ref: 'N3185880', weight_kg: 102, dimensions: '120x80x55', packages: 1 }
    ]
  },
  {
    id: 'ord-2026-01-0001',
    client_id: 'client-scpc',
    internal_ref: '2026Q1-001',
    status: 'warehouse',
    pickup_address: { city: 'Vienna', country: 'Austria' },
    collection_date: '2026-01-10',
    receiver_name: 'SCPC Baku Office',
    receiver_phone: '+994 12 345 6790',
    receiver_address: { city: 'Baku', country: 'Azerbaijan' },
    total_weight_kg: 52.47,
    total_price: 310,
    photos: [],
    created_at: '2026-01-09',
    updated_at: '2026-01-15',
    order_boxes: [
      { id: 'box-01-1', order_id: 'ord-2026-01-0001', client_ref: 'N3255445', weight_kg: 1, dimensions: '51x30x23', packages: 1 },
      { id: 'box-01-2', order_id: 'ord-2026-01-0001', client_ref: 'N3255460', weight_kg: 7.84, dimensions: '36x30x25', packages: 1 },
      { id: 'box-01-3', order_id: 'ord-2026-01-0001', client_ref: 'N3255504', weight_kg: 0.4, dimensions: '29x13x24', packages: 1 },
      { id: 'box-01-4', order_id: 'ord-2026-01-0001', client_ref: 'N3255513', weight_kg: 20.7, dimensions: '28x26x20', packages: 3 },
      { id: 'box-01-5', order_id: 'ord-2026-01-0001', client_ref: 'N3255546', weight_kg: 9.82, dimensions: '36x30x25', packages: 1 },
      { id: 'box-01-6', order_id: 'ord-2026-01-0001', client_ref: 'N3255553', weight_kg: 11, dimensions: '47x42x38', packages: 1 },
      { id: 'box-01-7', order_id: 'ord-2026-01-0001', client_ref: 'N3255435', weight_kg: 2.41, dimensions: '51x30x23', packages: 1 },
    ]
  },
  {
    id: 'ord-2026-01-0002',
    client_id: 'client-btc',
    internal_ref: '2026Q1-002',
    status: 'warehouse',
    pickup_address: { city: 'Oskarshamn', country: 'Sweden' },
    collection_date: '2026-01-12',
    receiver_name: 'BTC Tbilisi HQ',
    receiver_phone: '+995 32 123 4568',
    receiver_address: { city: 'Tbilisi', country: 'Georgia' },
    total_weight_kg: 1861,
    total_price: 850,
    photos: [],
    created_at: '2026-01-11',
    updated_at: '2026-01-18',
    order_boxes: [
      { id: 'box-02-1', order_id: 'ord-2026-01-0002', client_ref: 'N3255131-1', weight_kg: 355, dimensions: '120x80x65', packages: 1 },
      { id: 'box-02-2', order_id: 'ord-2026-01-0002', client_ref: 'N3255131-2', weight_kg: 357, dimensions: '120x80x65', packages: 1 },
      { id: 'box-02-3', order_id: 'ord-2026-01-0002', client_ref: 'N3255131-3', weight_kg: 214, dimensions: '120x80x65', packages: 1 },
      { id: 'box-02-4', order_id: 'ord-2026-01-0002', client_ref: 'N3255211-1', weight_kg: 358, dimensions: '120x80x65', packages: 1 },
      { id: 'box-02-5', order_id: 'ord-2026-01-0002', client_ref: 'N3255211-2', weight_kg: 359, dimensions: '120x80x65', packages: 1 },
      { id: 'box-02-6', order_id: 'ord-2026-01-0002', client_ref: 'N3255211-3', weight_kg: 218, dimensions: '120x80x65', packages: 1 },
    ]
  },
  {
    id: 'ord-2026-01-0003',
    client_id: 'client-btc',
    internal_ref: '2026Q1-003',
    status: 'delivered',
    pickup_address: { city: 'Llanera', country: 'Spain' },
    collection_date: '2026-01-14',
    receiver_name: 'BTC Tbilisi Branch',
    receiver_phone: '+995 32 123 4569',
    receiver_address: { city: 'Tbilisi', country: 'Georgia' },
    total_weight_kg: 933,
    total_price: 450,
    photos: [],
    created_at: '2026-01-13',
    updated_at: '2026-01-20',
    order_boxes: [
      { id: 'box-03-1', order_id: 'ord-2026-01-0003', client_ref: 'N3254720-1', weight_kg: 358, dimensions: '120x80x65', packages: 1 },
      { id: 'box-03-2', order_id: 'ord-2026-01-0003', client_ref: 'N3254720-2', weight_kg: 358, dimensions: '120x80x65', packages: 1 },
      { id: 'box-03-3', order_id: 'ord-2026-01-0003', client_ref: 'N3254720-3', weight_kg: 217, dimensions: '120x80x65', packages: 1 },
    ]
  },
  {
    id: 'ord-2026-01-0011',
    client_id: 'client-bpsd',
    internal_ref: '2026Q1-011',
    status: 'warehouse',
    pickup_address: { city: 'Norderstedt', country: 'Germany' },
    collection_date: '2026-01-16',
    receiver_name: 'BPSD Baku',
    receiver_phone: '+994 12 345 6783',
    receiver_address: { city: 'Baku', country: 'Azerbaijan' },
    total_weight_kg: 67,
    total_price: 185,
    photos: [],
    created_at: '2026-01-15',
    updated_at: '2026-01-22',
    order_boxes: [
      { id: 'box-11-1', order_id: 'ord-2026-01-0011', client_ref: 'N3254748', weight_kg: 67, dimensions: '80x60x90', packages: 1 }
    ]
  },
  {
    id: 'ord-2026-01-0012',
    client_id: 'client-aioc',
    internal_ref: '2026Q1-012',
    status: 'warehouse',
    pickup_address: { city: 'Campina', country: 'Romania' },
    collection_date: '2026-01-17',
    receiver_name: 'AIOC Romania',
    receiver_phone: '+994 12 345 6784',
    receiver_address: { city: 'Baku', country: 'Azerbaijan' },
    total_weight_kg: 50,
    total_price: 260,
    photos: [],
    created_at: '2026-01-16',
    updated_at: '2026-01-23',
    order_boxes: [
      { id: 'box-12-1', order_id: 'ord-2026-01-0012', client_ref: 'N3271437', weight_kg: 50, dimensions: '55x55x50', packages: 1 }
    ]
  },
  {
    id: 'ord-2026-01-0021',
    client_id: 'client-bpsd',
    internal_ref: '2026Q1-021',
    status: 'pickup',
    pickup_address: { city: 'Arras', country: 'France' },
    collection_date: '2026-01-28',
    receiver_name: 'BPSD France Ops',
    receiver_phone: '+994 12 345 6785',
    receiver_address: { city: 'Baku', country: 'Azerbaijan' },
    total_weight_kg: 5741.47,
    total_price: 650,
    photos: [],
    created_at: '2026-01-25',
    updated_at: '2026-01-25',
    order_boxes: [
      { id: 'box-21-1', order_id: 'ord-2026-01-0021', client_ref: 'N3287785-1', weight_kg: 814.6, dimensions: '120x80x100', packages: 1 },
      { id: 'box-21-2', order_id: 'ord-2026-01-0021', client_ref: 'N3287785-2', weight_kg: 814.6, dimensions: '120x80x100', packages: 1 },
      { id: 'box-21-3', order_id: 'ord-2026-01-0021', client_ref: 'N3287785-3', weight_kg: 814.6, dimensions: '120x80x100', packages: 1 },
      { id: 'box-21-4', order_id: 'ord-2026-01-0021', client_ref: 'N3287785-4', weight_kg: 814.6, dimensions: '120x80x100', packages: 1 },
      { id: 'box-21-5', order_id: 'ord-2026-01-0021', client_ref: 'N3287785-5', weight_kg: 814.6, dimensions: '120x80x100', packages: 1 },
      { id: 'box-21-6', order_id: 'ord-2026-01-0021', client_ref: 'N3287785-6', weight_kg: 814.6, dimensions: '120x80x100', packages: 1 },
      { id: 'box-21-7', order_id: 'ord-2026-01-0021', client_ref: 'N3287785-7', weight_kg: 853.87, dimensions: '120x80x100', packages: 1 },
    ]
  },
  {
    id: 'ord-2026-01-0022',
    client_id: 'client-aioc',
    internal_ref: '2026Q1-022',
    status: 'pickup',
    pickup_address: { city: 'Zurich', country: 'Switzerland' },
    collection_date: '2026-01-29',
    receiver_name: 'AIOC Zurich',
    receiver_phone: '+994 12 345 6786',
    receiver_address: { city: 'Baku', country: 'Azerbaijan' },
    total_weight_kg: 850,
    total_price: 320,
    photos: [],
    created_at: '2026-01-26',
    updated_at: '2026-01-26',
    order_boxes: [
      { id: 'box-22-1', order_id: 'ord-2026-01-0022', client_ref: 'N3287161', weight_kg: 850, dimensions: '148x98x102', packages: 1 }
    ]
  },
  {
    id: 'ord-2026-01-0035',
    client_id: 'client-btc',
    internal_ref: '2026Q1-035',
    status: 'pickup',
    pickup_address: { city: 'Arras', country: 'France' },
    collection_date: '2026-01-30',
    receiver_name: 'BTC Baku',
    receiver_phone: '+994 12 345 6787',
    receiver_address: { city: 'Baku', country: 'Azerbaijan' },
    total_weight_kg: 2463.24,
    total_price: 350,
    photos: [],
    created_at: '2026-01-27',
    updated_at: '2026-01-27',
    order_boxes: [
      { id: 'box-35-1', order_id: 'ord-2026-01-0035', client_ref: 'N3293133-1', weight_kg: 477.24, dimensions: '60x80x80', packages: 1 },
      { id: 'box-35-2', order_id: 'ord-2026-01-0035', client_ref: 'N3293133-2', weight_kg: 993, dimensions: '120x80x100', packages: 1 },
      { id: 'box-35-3', order_id: 'ord-2026-01-0035', client_ref: 'N3293133-3', weight_kg: 993, dimensions: '120x80x100', packages: 1 },
    ]
  },
  {
    id: 'ord-2026-01-0036',
    client_id: 'client-aioc',
    internal_ref: '2026Q1-036',
    status: 'warehouse',
    pickup_address: { city: 'Vienna', country: 'Austria' },
    collection_date: '2026-01-24',
    receiver_name: 'AIOC Vienna Hub',
    receiver_phone: '+994 12 345 6788',
    receiver_address: { city: 'Baku', country: 'Azerbaijan' },
    total_weight_kg: 51.08,
    total_price: 310,
    photos: [],
    created_at: '2026-01-23',
    updated_at: '2026-01-26',
    order_boxes: [
      { id: 'box-36-1', order_id: 'ord-2026-01-0036', client_ref: 'N3296451', weight_kg: 4.38, dimensions: '30x30x24', packages: 3 },
      { id: 'box-36-2', order_id: 'ord-2026-01-0036', client_ref: 'N3296463', weight_kg: 5.11, dimensions: '33x23x12', packages: 3 },
      { id: 'box-36-3', order_id: 'ord-2026-01-0036', client_ref: 'N3296423', weight_kg: 10.1, dimensions: '28x26x20', packages: 1 },
      { id: 'box-36-4', order_id: 'ord-2026-01-0036', client_ref: 'N3296491', weight_kg: 22.29, dimensions: '120x80x40', packages: 2 },
      { id: 'box-36-5', order_id: 'ord-2026-01-0036', client_ref: 'N3296515', weight_kg: 6, dimensions: '44x33x31', packages: 1 },
      { id: 'box-36-6', order_id: 'ord-2026-01-0036', client_ref: 'N3296395', weight_kg: 1.1, dimensions: '23x22x23', packages: 1 },
    ]
  },
  {
    id: 'ord-2026-01-0039',
    client_id: 'client-aioc',
    internal_ref: '2026Q1-039',
    status: 'pickup',
    pickup_address: { city: 'Pavlov', country: 'Czech Republic' },
    collection_date: '2026-01-31',
    receiver_name: 'AIOC Prague',
    receiver_phone: '+994 12 345 6789',
    receiver_address: { city: 'Baku', country: 'Azerbaijan' },
    total_weight_kg: 402.4,
    total_price: 560,
    photos: [],
    created_at: '2026-01-28',
    updated_at: '2026-01-28',
    order_boxes: [
      { id: 'box-39-1', order_id: 'ord-2026-01-0039', client_ref: 'N3305056-1', weight_kg: 125, dimensions: '62x131x199', packages: 1 },
      { id: 'box-39-2', order_id: 'ord-2026-01-0039', client_ref: 'N3305056-2', weight_kg: 89.6, dimensions: '120x80x142', packages: 1 },
      { id: 'box-39-3', order_id: 'ord-2026-01-0039', client_ref: 'N3305056-3', weight_kg: 96, dimensions: '120x80x140', packages: 1 },
      { id: 'box-39-4', order_id: 'ord-2026-01-0039', client_ref: 'N3305056-4', weight_kg: 91.8, dimensions: '120x80x142', packages: 1 },
    ]
  },
  {
    id: 'ord-2026-01-0040',
    client_id: 'client-aioc',
    internal_ref: '2026Q1-040',
    status: 'delivered',
    pickup_address: { city: 'Milan', country: 'Italy' },
    collection_date: '2026-01-20',
    receiver_name: 'AIOC Italy',
    receiver_phone: '+994 12 345 6791',
    receiver_address: { city: 'Baku', country: 'Azerbaijan' },
    total_weight_kg: 530,
    total_price: 20,
    photos: [],
    created_at: '2026-01-19',
    updated_at: '2026-01-25',
    order_boxes: [
      { id: 'box-40-1', order_id: 'ord-2026-01-0040', client_ref: 'N3264009', weight_kg: 530, dimensions: '115x115x145', packages: 1 }
    ]
  },
  {
    id: 'ord-2026-01-0043',
    client_id: 'client-aioc',
    internal_ref: '2026Q1-043',
    status: 'warehouse',
    pickup_address: { city: 'Vienna', country: 'Austria' },
    collection_date: '2026-01-26',
    receiver_name: 'AIOC Austria',
    receiver_phone: '+994 12 345 6792',
    receiver_address: { city: 'Baku', country: 'Azerbaijan' },
    total_weight_kg: 12,
    total_price: 250,
    photos: [],
    created_at: '2026-01-25',
    updated_at: '2026-01-27',
    order_boxes: [
      { id: 'box-43-1', order_id: 'ord-2026-01-0043', client_ref: 'N3315761', weight_kg: 2.6, dimensions: '80x16x15', packages: 1 },
      { id: 'box-43-2', order_id: 'ord-2026-01-0043', client_ref: 'N3315782', weight_kg: 8.4, dimensions: '36x30x25', packages: 1 },
      { id: 'box-43-3', order_id: 'ord-2026-01-0043', client_ref: 'N3315821', weight_kg: 1, dimensions: '35x25x15', packages: 1 },
    ]
  },
  {
    id: 'ord-2026-01-0044',
    client_id: 'client-bpsd',
    internal_ref: '2026Q1-044',
    status: 'pickup',
    pickup_address: { city: 'Zurich', country: 'Switzerland' },
    collection_date: '2026-01-30',
    receiver_name: 'Combined Shipment - Zurich',
    receiver_phone: '+994 12 345 6793',
    receiver_address: { city: 'Baku', country: 'Azerbaijan' },
    total_weight_kg: 153.7,
    total_price: 360,
    photos: [],
    created_at: '2026-01-27',
    updated_at: '2026-01-27',
    order_boxes: [
      { id: 'box-44-1', order_id: 'ord-2026-01-0044', client_ref: 'N3317533', weight_kg: 115, dimensions: '80x60x50', packages: 1 },
      { id: 'box-44-2', order_id: 'ord-2026-01-0044', client_ref: 'N3316023', weight_kg: 5.7, dimensions: '40x40x20', packages: 1 },
      { id: 'box-44-3', order_id: 'ord-2026-01-0044', client_ref: 'N3308983', weight_kg: 33, dimensions: '63x44x46', packages: 1 },
    ]
  },
  {
    id: 'ord-2026-01-0048',
    client_id: 'client-aioc',
    internal_ref: '2026Q1-048',
    status: 'pickup',
    pickup_address: { city: 'Cologne', country: 'Germany' },
    collection_date: '2026-01-31',
    receiver_name: 'AIOC Cologne',
    receiver_phone: '+994 12 345 6794',
    receiver_address: { city: 'Baku', country: 'Azerbaijan' },
    total_weight_kg: 10,
    total_price: 185,
    photos: [],
    created_at: '2026-01-28',
    updated_at: '2026-01-28',
    order_boxes: [
      { id: 'box-48-1', order_id: 'ord-2026-01-0048', client_ref: 'N3321036', weight_kg: 10, dimensions: '80x54x39', packages: 1 }
    ]
  },
]
