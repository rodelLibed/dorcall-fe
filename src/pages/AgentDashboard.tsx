import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Phone, MessageSquare, Users, Clock, LogOut, Settings, User, Activity } from 'lucide-react'
import Dialer from '../components/Dialer'
import CallHistory from '../components/CallHistory'
import SmsChat from '../components/SmsChat'
import ContactList from '../components/ContactList'
import { removeToken } from '../helpers/token'

type TabType = 'dialer' | 'calls' | 'sms' | 'contacts'

const AgentDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dialer')
  const [agentStatus, setAgentStatus] = useState<'available' | 'busy' | 'offline'>('available')
  const navigate = useNavigate()

  const handleLogout = () => {
    removeToken()
    localStorage.removeItem('user')
    navigate('/agent-login')
  }

  const statusColors = {
    available: 'bg-green-500',
    busy: 'bg-yellow-500',
    offline: 'bg-red-500'
  }

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Top Navigation */}
      <nav className="bg-dark-800 border-b border-dark-700">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Phone className="w-8 h-8 text-primary-500" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
              DorCall Agent
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Agent Status */}
            <div className="flex items-center space-x-2 bg-dark-700 px-4 py-2 rounded-lg">
              <Activity className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-300">Status:</span>
              <div className="flex items-center space-x-2">
                <span className={`w-2 h-2 rounded-full ${statusColors[agentStatus]}`}></span>
                <select
                  value={agentStatus}
                  onChange={(e) => setAgentStatus(e.target.value as any)}
                  className="bg-transparent text-sm font-medium text-gray-100 focus:outline-none cursor-pointer"
                >
                  <option value="available">Available</option>
                  <option value="busy">Busy</option>
                  <option value="offline">Offline</option>
                </select>
              </div>
            </div>
            
            <button className="p-2 hover:bg-dark-700 rounded-lg transition-colors">
              <Settings className="w-5 h-5 text-gray-400" />
            </button>
            
            <div className="flex items-center space-x-2 bg-dark-700 px-3 py-2 rounded-lg">
              <User className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-300">Agent 001</span>
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

      {/* Main Content */}
      <div className="flex h-[calc(100vh-73px)]">
        {/* Sidebar */}
        <aside className="w-64 bg-dark-800 border-r border-dark-700 p-4">
          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('dialer')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'dialer'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-300 hover:bg-dark-700'
              }`}
            >
              <Phone className="w-5 h-5" />
              <span className="font-medium">Dialer</span>
            </button>
            
            <button
              onClick={() => setActiveTab('calls')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'calls'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-300 hover:bg-dark-700'
              }`}
            >
              <Clock className="w-5 h-5" />
              <span className="font-medium">Call History</span>
            </button>
            
            <button
              onClick={() => setActiveTab('sms')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'sms'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-300 hover:bg-dark-700'
              }`}
            >
              <MessageSquare className="w-5 h-5" />
              <span className="font-medium">SMS Chat</span>
            </button>
            
            <button
              onClick={() => setActiveTab('contacts')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'contacts'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-300 hover:bg-dark-700'
              }`}
            >
              <Users className="w-5 h-5" />
              <span className="font-medium">Contacts</span>
            </button>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {activeTab === 'dialer' && <Dialer />}
            {activeTab === 'calls' && <CallHistory />}
            {activeTab === 'sms' && <SmsChat />}
            {activeTab === 'contacts' && <ContactList />}
          </div>
        </main>
      </div>
    </div>
  )
}

export default AgentDashboard
