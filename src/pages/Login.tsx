import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { Button, Input, Card } from '../components/ui'
import { Truck, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    const success = await login(email, password)
    
    if (success) {
      navigate('/')
    } else {
      setError('Invalid email or password')
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      {/* Login card */}
      <motion.div
        className="relative z-10 w-full max-w-md px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card variant="glass" className="p-8">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="flex items-center justify-center w-14 h-14 bg-blue-500 rounded-xl mb-4">
              <Truck className="h-7 w-7 text-white" />
            </div>
            
            <h1 className="text-2xl font-bold text-foreground">TransSupply</h1>
            <p className="text-muted-foreground mt-1">Logistics Management Hub</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              type="email"
              label="Email Address"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="h-4 w-4" />}
              error={error && !email ? 'Email is required' : undefined}
            />

            <Input
              type="password"
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="h-4 w-4" />}
              error={error && !password ? 'Password is required' : undefined}
            />

            {error && email && password && (
              <p className="text-sm text-red-400 text-center">
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isLoading}
            >
              Sign In
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          {/* Demo credentials */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="flex items-center gap-2 text-sm text-neutral-400 mb-3">
              <Sparkles className="h-4 w-4 text-blue-400" />
              <span>Demo Credentials</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <motion.div
                className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 cursor-pointer hover:bg-blue-500/20 transition-colors"
                onClick={() => {
                  setEmail('admin@transsupply.eu')
                  setPassword('admin123')
                }}
                whileTap={{ scale: 0.98 }}
              >
                <p className="font-medium text-blue-400">Admin</p>
                <p className="text-neutral-400 mt-1">admin@transsupply.eu</p>
              </motion.div>
              <motion.div
                className="p-3 rounded-xl bg-white/5 border border-white/8 cursor-pointer hover:bg-white/8 transition-colors"
                onClick={() => {
                  setEmail('ops@aioc.az')
                  setPassword('client123')
                }}
                whileTap={{ scale: 0.98 }}
              >
                <p className="font-medium text-white">Client (AIOC)</p>
                <p className="text-neutral-400 mt-1">ops@aioc.az</p>
              </motion.div>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          © 2026 TransSupply. Secure EU Data Residency.
        </p>
      </motion.div>
    </div>
  )
}
