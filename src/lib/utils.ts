import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-EU', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount)
}

export function generateInternalRef(year: number, quarter: number, sequence: number): string {
  return `${year}Q${quarter}-${sequence.toString().padStart(3, '0')}`
}

export function getStatusColor(status: 'pickup' | 'warehouse' | 'delivered'): string {
  const colors = {
    pickup: 'badge-pickup',
    warehouse: 'badge-warehouse',
    delivered: 'badge-delivered'
  }
  return colors[status]
}

export function getStatusGradient(status: 'pickup' | 'warehouse' | 'delivered'): string {
  const gradients = {
    pickup: 'from-amber-500 to-orange-600',
    warehouse: 'from-blue-500 to-cyan-600',
    delivered: 'from-emerald-500 to-green-600'
  }
  return gradients[status]
}
