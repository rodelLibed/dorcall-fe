import React, { useState } from 'react'
import { Phone, PhoneIncoming, PhoneOutgoing, Clock, Filter, Search } from 'lucide-react'

interface Call {
  id: number
  customerNumber: string
  callType: 'inbound' | 'outbound'
  callStatus: 'answered' | 'missed' | 'failed' | 'busy'
  duration: string
  timestamp: string
}

const CallHistory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'inbound' | 'outbound'>('all')

  // Demo data
  const calls: Call[] = [
    {
      id: 1,
      customerNumber: '+1 (555) 123-4567',
      callType: 'inbound',
      callStatus: 'answered',
      duration: '5:32',
      timestamp: '2026-03-25 10:30 AM'
    },
    {
      id: 2,
      customerNumber: '+1 (555) 987-6543',
      callType: 'outbound',
      callStatus: 'answered',
      duration: '12:45',
      timestamp: '2026-03-25 9:15 AM'
    },
    {
      id: 3,
      customerNumber: '+1 (555) 246-8135',
      callType: 'inbound',
      callStatus: 'missed',
      duration: '0:00',
      timestamp: '2026-03-25 8:52 AM'
    },
    {
      id: 4,
      customerNumber: '+1 (555) 369-2580',
      callType: 'outbound',
      callStatus: 'busy',
      duration: '0:00',
      timestamp: '2026-03-25 8:30 AM'
    },
    {
      id: 5,
      customerNumber: '+1 (555) 147-2589',
      callType: 'inbound',
      callStatus: 'answered',
      duration: '8:15',
      timestamp: '2026-03-24 4:20 PM'
    }
  ]

  const statusColors = {
    answered: 'text-green-400',
    missed: 'text-red-400',
    failed: 'text-red-400',
    busy: 'text-yellow-400'
  }

  const filteredCalls = calls.filter(call => {
    const matchesSearch = call.customerNumber.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === 'all' || call.callType === filterType
    return matchesSearch && matchesFilter
  })

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-100 mb-6">Call History</h2>
      
      <div className="card p-6">
        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by phone number..."
              className="input-field pl-10"
            />
          </div>
          
          <div className="flex items-center space-x-2 bg-dark-700 rounded-lg px-4">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="bg-transparent text-gray-100 focus:outline-none cursor-pointer py-2"
            >
              <option value="all">All Calls</option>
              <option value="inbound">Inbound</option>
              <option value="outbound">Outbound</option>
            </select>
          </div>
        </div>

        {/* Call List */}
        <div className="space-y-3">
          {filteredCalls.map((call) => (
            <div
              key={call.id}
              className="bg-dark-700 rounded-lg p-4 hover:bg-dark-600 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-lg ${
                    call.callType === 'inbound' ? 'bg-primary-500/20' : 'bg-green-500/20'
                  }`}>
                    {call.callType === 'inbound' ? (
                      <PhoneIncoming className={`w-5 h-5 ${
                        call.callType === 'inbound' ? 'text-primary-400' : 'text-green-400'
                      }`} />
                    ) : (
                      <PhoneOutgoing className="w-5 h-5 text-green-400" />
                    )}
                  </div>
                  
                  <div>
                    <div className="text-gray-100 font-medium">{call.customerNumber}</div>
                    <div className="text-sm text-gray-400 flex items-center space-x-3 mt-1">
                      <span className={statusColors[call.callStatus]}>
                        {call.callStatus.charAt(0).toUpperCase() + call.callStatus.slice(1)}
                      </span>
                      {call.duration !== '0:00' && (
                        <>
                          <span>•</span>
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {call.duration}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-sm text-gray-400">{call.timestamp}</div>
                  <button className="mt-2 text-primary-400 hover:text-primary-300 text-sm font-medium">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredCalls.length === 0 && (
          <div className="text-center py-12">
            <Phone className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No calls found</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default CallHistory
