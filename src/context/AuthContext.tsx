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

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
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
