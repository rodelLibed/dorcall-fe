import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Phone, Headphones, Shield } from 'lucide-react'

const Login: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-900 via-dark-800 to-primary-900">
      <div className="card p-8 w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <Phone className="w-12 h-12 text-primary-500" />
          <h1 className="text-3xl font-bold ml-3 bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
            DorCall
          </h1>
        </div>
        
        <h2 className="text-2xl font-semibold text-center mb-2 text-gray-100">
          Welcome Back
        </h2>
        
        <p className="text-center text-gray-400 mb-8">
          Select your login type to continue
        </p>
        
        <div className="space-y-4">
          <button
            onClick={() => navigate('/agent-login')}
            className="w-full p-6 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 rounded-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-blue-500/50"
          >
            <div className="flex items-center justify-center mb-3">
              <Headphones className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-1">Agent Login</h3>
            <p className="text-blue-100 text-sm">Access agent dashboard and tools</p>
          </button>
          
          <button
            onClick={() => navigate('/admin-login')}
            className="w-full p-6 bg-gradient-to-br from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 rounded-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-primary-500/50"
          >
            <div className="flex items-center justify-center mb-3">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-1">Admin Login</h3>
            <p className="text-primary-100 text-sm">Manage system and monitor operations</p>
          </button>
        </div>
        
        <p className="text-center text-sm text-gray-400 mt-8">
          Secure call center platform by DorCall
        </p>
      </div>
    </div>
  )
}

export default Login
