import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Phone, Users, Activity, MessageSquare, BarChart3, Settings, LogOut, Shield } from 'lucide-react'
import AgentManagement from '../components/AgentManagement'
import CallMonitoring from '../components/CallMonitoring'
import Analytics from '../components/Analytics'
import { removeToken } from '../helpers/token'

type TabType = 'agents' | 'monitoring' | 'analytics' | 'sms-logs'

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('agents')
  const navigate = useNavigate()

  const handleLogout = () => {
    removeToken()
    localStorage.removeItem('user')
    navigate('/admin-login')
  }

  // Stats data
  const stats = [
    { label: 'Active Agents', value: '12', icon: Users, color: 'text-green-400' },
    { label: 'Active Calls', value: '8', icon: Phone, color: 'text-blue-400' },
    { label: 'Total Calls Today', value: '245', icon: Activity, color: 'text-purple-400' },
    { label: 'Messages Sent', value: '389', icon: MessageSquare, color: 'text-yellow-400' },
  ]

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Top Navigation */}
      <nav className="bg-dark-800 border-b border-dark-700">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8 text-primary-500" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
              DorCall Admin
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-dark-700 rounded-lg transition-colors">
              <Settings className="w-5 h-5 text-gray-400" />
            </button>
            
            <div className="flex items-center space-x-2 bg-dark-700 px-3 py-2 rounded-lg">
              <Shield className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-300">Administrator</span>
            </div>
            
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>
      </nav>

      {/* Stats Overview */}
      <div className="px-6 py-6 bg-dark-800 border-b border-dark-700">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-100">{stat.value}</p>
                </div>
                <stat.icon className={`w-10 h-10 ${stat.color}`} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-217px)]">
        {/* Sidebar */}
        <aside className="w-64 bg-dark-800 border-r border-dark-700 p-4">
          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('agents')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'agents'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-300 hover:bg-dark-700'
              }`}
            >
              <Users className="w-5 h-5" />
              <span className="font-medium">Agent Management</span>
            </button>
            
            <button
              onClick={() => setActiveTab('monitoring')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'monitoring'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-300 hover:bg-dark-700'
              }`}
            >
              <Activity className="w-5 h-5" />
              <span className="font-medium">Call Monitoring</span>
            </button>
            
            <button
              onClick={() => setActiveTab('analytics')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'analytics'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-300 hover:bg-dark-700'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              <span className="font-medium">Analytics</span>
            </button>
            
            <button
              onClick={() => setActiveTab('sms-logs')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'sms-logs'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-300 hover:bg-dark-700'
              }`}
            >
              <MessageSquare className="w-5 h-5" />
              <span className="font-medium">SMS Logs</span>
            </button>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {activeTab === 'agents' && <AgentManagement />}
            {activeTab === 'monitoring' && <CallMonitoring />}
            {activeTab === 'analytics' && <Analytics />}
            {activeTab === 'sms-logs' && <div className="text-gray-300">SMS Logs component</div>}
          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminDashboard
