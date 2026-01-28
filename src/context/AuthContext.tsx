import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { importedClients } from '../lib/importedData'

interface User {
  id: string
  email: string
  role: 'admin' | 'client'
  clientId?: string
  name: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  updateProfile: (name: string) => Promise<boolean>
  updatePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for saved session
    const savedUser = localStorage.getItem('transsupply_user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Demo login logic
    if (email === 'admin@transsupply.eu' && password === 'admin123') {
      const adminUser: User = {
        id: 'admin-1',
        email: 'admin@transsupply.eu',
        role: 'admin',
        name: 'TransSupply Admin'
      }
      setUser(adminUser)
      localStorage.setItem('transsupply_user', JSON.stringify(adminUser))
      setIsLoading(false)
      return true
    }

    // Check client logins
    const client = importedClients.find(c => c.email === email)
    if (client && password === 'client123') {
      const clientUser: User = {
        id: client.id,
        email: client.email,
        role: 'client',
        clientId: client.id,
        name: client.name
      }
      setUser(clientUser)
      localStorage.setItem('transsupply_user', JSON.stringify(clientUser))
      setIsLoading(false)
      return true
    }

    setIsLoading(false)
    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('transsupply_user')
  }

  const updateProfile = async (name: string): Promise<boolean> => {
    if (!user) return false
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const updatedUser = { ...user, name }
    setUser(updatedUser)
    localStorage.setItem('transsupply_user', JSON.stringify(updatedUser))
    return true
  }

  const updatePassword = async (currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'Not logged in' }
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Check current password (demo: admin123 for admin, client123 for clients)
    const expectedPassword = user.role === 'admin' ? 'admin123' : 'client123'
    
    if (currentPassword !== expectedPassword) {
      return { success: false, error: 'Current password is incorrect' }
    }
    
    if (newPassword.length < 6) {
      return { success: false, error: 'New password must be at least 6 characters' }
    }
    
    // In a real app, this would update the password in the database
    // For demo purposes, we just return success
    return { success: true }
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, updateProfile, updatePassword, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
