import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Phone, Lock, User, Shield } from 'lucide-react'
import axiosInstance from '../helpers/axios'
import { setToken } from '../helpers/token'

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data } = await axiosInstance().post('/api/auth/login', { email, password })

      if (data.success && data.user.role === 'admin') {
        localStorage.setItem('user', JSON.stringify(data.user))
        setToken(data.token)
        navigate('/admin')
      } else if (data.success && data.user.role !== 'admin') {
        setError('Access denied. This login is for admins only.')
      } else {
        setError(data.message || 'Login failed.')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-900 via-dark-800 to-primary-900">
      <div className="card p-8 w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <Phone className="w-12 h-12 text-primary-500" />
          <h1 className="text-3xl font-bold ml-3 bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
            DorCall
          </h1>
        </div>
        
        <div className="flex items-center justify-center mb-6">
          <Shield className="w-8 h-8 text-primary-500 mr-2" />
          <h2 className="text-2xl font-semibold text-gray-100">
            Admin Login
          </h2>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500 rounded-lg text-red-500 text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Admin Email
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field pl-10"
                placeholder="admin@dorcall.com"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pl-10"
                placeholder="••••••••"
                required
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            className="btn-primary w-full mt-6"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In as Admin'}
          </button>
        </form>
        
        <p className="text-center text-sm text-gray-400 mt-6">
          Secure call center platform by DorCall
        </p>
      </div>
    </div>
  )
}

export default AdminLogin
