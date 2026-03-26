import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Phone, Shield, Users, BarChart3, MessageSquare, Activity } from 'lucide-react'

const DashboardSelector: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-900 via-dark-800 to-primary-900">
      <div className="max-w-4xl w-full mx-4">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Phone className="w-16 h-16 text-primary-500" />
          </div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
            Welcome to DorCall
          </h1>
          <p className="text-gray-400 text-lg">Choose your workspace</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Agent Dashboard Card */}
          <button
            onClick={() => navigate('/agent')}
            className="card p-8 hover:scale-105 transition-transform duration-200 text-left group"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="p-3 bg-primary-500/20 rounded-xl group-hover:bg-primary-500/30 transition-colors">
                <Users className="w-8 h-8 text-primary-400" />
              </div>
              <div className="text-primary-400 group-hover:translate-x-1 transition-transform">→</div>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-100 mb-3">Agent Dashboard</h2>
            <p className="text-gray-400 mb-6">
              Access your daily tools for handling customer interactions
            </p>
            
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-300">
                <Phone className="w-4 h-4 mr-2 text-primary-400" />
                Phone Dialer
              </div>
              <div className="flex items-center text-sm text-gray-300">
                <MessageSquare className="w-4 h-4 mr-2 text-primary-400" />
                SMS Chat
              </div>
              <div className="flex items-center text-sm text-gray-300">
                <Activity className="w-4 h-4 mr-2 text-primary-400" />
                Call History
              </div>
            </div>
          </button>

          {/* Admin Dashboard Card */}
          <button
            onClick={() => navigate('/admin')}
            className="card p-8 hover:scale-105 transition-transform duration-200 text-left group"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="p-3 bg-primary-500/20 rounded-xl group-hover:bg-primary-500/30 transition-colors">
                <Shield className="w-8 h-8 text-primary-400" />
              </div>
              <div className="text-primary-400 group-hover:translate-x-1 transition-transform">→</div>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-100 mb-3">Admin Dashboard</h2>
            <p className="text-gray-400 mb-6">
              Manage agents, monitor calls, and view analytics
            </p>
            
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-300">
                <Users className="w-4 h-4 mr-2 text-primary-400" />
                Agent Management
              </div>
              <div className="flex items-center text-sm text-gray-300">
                <Activity className="w-4 h-4 mr-2 text-primary-400" />
                Call Monitoring
              </div>
              <div className="flex items-center text-sm text-gray-300">
                <BarChart3 className="w-4 h-4 mr-2 text-primary-400" />
                Analytics & Reports
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

export default DashboardSelector
