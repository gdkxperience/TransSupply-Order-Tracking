import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { Layout } from '../components/layout/Layout'
import { Card, Button, Input, Badge } from '../components/ui'
import {
  User,
  Mail,
  Lock,
  Bell,
  Shield,
  Globe,
  Palette,
  Download,
  Upload,
  Save,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'

export function Settings() {
  const { user, updateProfile, updatePassword } = useAuth()
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    name: user?.name || '',
    notifications: true,
    emailAlerts: true,
    darkMode: true,
    language: 'en',
  })
  
  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    const success = await updateProfile(settings.name)
    setSaving(false)
    
    if (success) {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
  }
  
  const handlePasswordChange = async () => {
    setPasswordError('')
    setPasswordSuccess(false)
    
    if (!passwordData.currentPassword) {
      setPasswordError('Please enter your current password')
      return
    }
    
    if (!passwordData.newPassword) {
      setPasswordError('Please enter a new password')
      return
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match')
      return
    }
    
    setChangingPassword(true)
    const result = await updatePassword(passwordData.currentPassword, passwordData.newPassword)
    setChangingPassword(false)
    
    if (result.success) {
      setPasswordSuccess(true)
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setTimeout(() => setPasswordSuccess(false), 3000)
    } else {
      setPasswordError(result.error || 'Failed to update password')
    }
  }

  return (
    <Layout>
      {/* Header */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and preferences
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card variant="glass">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <User className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <h2 className="font-semibold">Profile Information</h2>
                  <p className="text-sm text-muted-foreground">Update your account details</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-6">
                  <motion.div
                    className="relative"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="w-20 h-20 rounded-2xl bg-slate-700 flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">
                        {user?.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-card border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
                      <Upload className="h-3.5 w-3.5" />
                    </button>
                  </motion.div>
                  <div>
                    <p className="font-medium">{user?.name}</p>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                    <Badge className="mt-2" variant={user?.role === 'admin' ? 'default' : 'success'}>
                      {user?.role === 'admin' ? 'Administrator' : 'Client'}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <Input
                    label="Full Name"
                    value={settings.name}
                    onChange={(e) => setSettings(prev => ({ ...prev, name: e.target.value }))}
                    icon={<User className="h-4 w-4" />}
                  />
                  <div>
                    <Input
                      label="Email Address"
                      type="email"
                      value={user?.email || ''}
                      disabled
                      icon={<Mail className="h-4 w-4" />}
                      className="opacity-60 cursor-not-allowed"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Security Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card variant="glass">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <h2 className="font-semibold">Security</h2>
                  <p className="text-sm text-muted-foreground">Manage your password and security</p>
                </div>
              </div>

              <div className="space-y-4">
                <Input
                  label="Current Password"
                  type="password"
                  placeholder="••••••••"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  icon={<Lock className="h-4 w-4" />}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="New Password"
                    type="password"
                    placeholder="••••••••"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  />
                  <Input
                    label="Confirm Password"
                    type="password"
                    placeholder="••••••••"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  />
                </div>

                {passwordError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-red-400 text-sm"
                  >
                    <AlertCircle className="h-4 w-4" />
                    {passwordError}
                  </motion.div>
                )}
                
                {passwordSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-emerald-400 text-sm"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Password updated successfully
                  </motion.div>
                )}

                <Button 
                  variant="secondary" 
                  className="mt-2"
                  onClick={handlePasswordChange}
                  disabled={changingPassword}
                >
                  <Lock className="h-4 w-4" />
                  {changingPassword ? 'Updating...' : 'Update Password'}
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Notification Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card variant="glass">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                  <Bell className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <h2 className="font-semibold">Notifications</h2>
                  <p className="text-sm text-muted-foreground">Configure how you receive alerts</p>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { label: 'Push Notifications', description: 'Receive in-app notifications', key: 'notifications' },
                  { label: 'Email Alerts', description: 'Get order updates via email', key: 'emailAlerts' },
                ].map((item) => (
                  <motion.div
                    key={item.key}
                    className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10"
                    whileHover={{ x: 4 }}
                  >
                    <div>
                      <p className="font-medium">{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <motion.button
                      className={`w-12 h-7 rounded-full transition-colors ${
                        settings[item.key as keyof typeof settings]
                          ? 'bg-blue-500'
                          : 'bg-white/20'
                      }`}
                      onClick={() => setSettings(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof settings] }))}
                      whileTap={{ scale: 0.95 }}
                    >
                      <motion.div
                        className="w-5 h-5 bg-white rounded-full shadow-lg"
                        animate={{
                          x: settings[item.key as keyof typeof settings] ? 24 : 2,
                        }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    </motion.button>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Preferences */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card variant="glass">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                  <Palette className="h-5 w-5 text-cyan-400" />
                </div>
                <div>
                  <h2 className="font-semibold">Preferences</h2>
                  <p className="text-sm text-muted-foreground">Customize your experience</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2">
                    <Palette className="h-4 w-4 text-muted-foreground" />
                    <span>Dark Mode</span>
                  </div>
                  <Badge variant="success">Active</Badge>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span>Language</span>
                  </div>
                  <span className="text-sm text-muted-foreground">English</span>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Data Export */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card variant="glass">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Download className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <h2 className="font-semibold">Data Export</h2>
                  <p className="text-sm text-muted-foreground">Download your data</p>
                </div>
              </div>

              <div className="space-y-3">
                <Button variant="secondary" className="w-full">
                  <Download className="h-4 w-4" />
                  Export All Orders
                </Button>
                <Button variant="secondary" className="w-full">
                  <Download className="h-4 w-4" />
                  Export Account Data
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Save Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Button className="w-full" size="lg" onClick={handleSave} disabled={saving}>
              {saved ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Saved Successfully
                </>
              ) : saving ? (
                <>
                  <Save className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </motion.div>
        </div>
      </div>
    </Layout>
  )
}
