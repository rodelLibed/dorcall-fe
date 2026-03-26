import React from 'react'
import { Phone, Clock, Users, Headphones, PhoneOff } from 'lucide-react'

interface ActiveCall {
  id: number
  agentName: string
  agentExtension: string
  customerNumber: string
  duration: string
  status: 'active' | 'on-hold' | 'ringing'
}

const CallMonitoring: React.FC = () => {
  // Demo data
  const activeCalls: ActiveCall[] = [
    {
      id: 1,
      agentName: 'John Doe',
      agentExtension: '1001',
      customerNumber: '+1 (555) 123-4567',
      duration: '05:32',
      status: 'active'
    },
    {
      id: 2,
      agentName: 'Jane Smith',
      agentExtension: '1002',
      customerNumber: '+1 (555) 987-6543',
      duration: '12:45',
      status: 'active'
    },
    {
      id: 3,
      agentName: 'Mike Johnson',
      agentExtension: '1003',
      customerNumber: '+1 (555) 246-8135',
      duration: '00:15',
      status: 'ringing'
    },
    {
      id: 4,
      agentName: 'Sarah Williams',
      agentExtension: '1004',
      customerNumber: '+1 (555) 369-2580',
      duration: '03:22',
      status: 'on-hold'
    }
  ]

  const statusConfig = {
    active: {
      color: 'text-green-400',
      bg: 'bg-green-500/20',
      label: 'Active'
    },
    'on-hold': {
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/20',
      label: 'On Hold'
    },
    ringing: {
      color: 'text-primary-400',
      bg: 'bg-primary-500/20',
      label: 'Ringing'
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-100 mb-6">Call Monitoring</h2>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Active Calls</p>
              <p className="text-2xl font-bold text-green-400">8</p>
            </div>
            <Phone className="w-8 h-8 text-green-400" />
          </div>
        </div>
        
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Avg Call Time</p>
              <p className="text-2xl font-bold text-primary-400">6:24</p>
            </div>
            <Clock className="w-8 h-8 text-primary-400" />
          </div>
        </div>
        
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Waiting Calls</p>
              <p className="text-2xl font-bold text-yellow-400">3</p>
            </div>
            <Headphones className="w-8 h-8 text-yellow-400" />
          </div>
        </div>
        
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Available Agents</p>
              <p className="text-2xl font-bold text-purple-400">4</p>
            </div>
            <Users className="w-8 h-8 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Active Calls List */}
      <div className="card">
        <div className="px-6 py-4 border-b border-dark-700">
          <h3 className="text-lg font-semibold text-gray-100">Active Calls</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-dark-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Agent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Extension
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {activeCalls.map((call) => (
                <tr key={call.id} className="hover:bg-dark-700 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white font-medium text-sm mr-3">
                        {call.agentName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="text-sm font-medium text-gray-100">{call.agentName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-300">{call.agentExtension}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-300">{call.customerNumber}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-300">
                      <Clock className="w-4 h-4 mr-2 text-gray-400" />
                      {call.duration}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[call.status].bg} ${statusConfig[call.status].color}`}>
                      {statusConfig[call.status].label}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button className="p-2 bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors">
                        <Headphones className="w-4 h-4 text-white" title="Listen" />
                      </button>
                      <button className="p-2 bg-dark-600 hover:bg-red-600 rounded-lg transition-colors">
                        <PhoneOff className="w-4 h-4 text-gray-300" title="End Call" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {activeCalls.length === 0 && (
          <div className="text-center py-12">
            <Phone className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No active calls</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default CallMonitoring
