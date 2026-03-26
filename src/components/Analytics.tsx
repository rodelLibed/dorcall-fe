import React from 'react'
import { TrendingUp, TrendingDown, Phone, PhoneIncoming, PhoneOutgoing, Clock, Users } from 'lucide-react'

const Analytics: React.FC = () => {
  // Demo data
  const metrics = [
    {
      label: 'Total Calls',
      value: '1,245',
      change: '+12.5%',
      trend: 'up',
      icon: Phone
    },
    {
      label: 'Answered Calls',
      value: '1,089',
      change: '+8.3%',
      trend: 'up',
      icon: PhoneIncoming
    },
    {
      label: 'Missed Calls',
      value: '156',
      change: '-5.2%',
      trend: 'down',
      icon: PhoneOutgoing
    },
    {
      label: 'Avg Call Duration',
      value: '6:24',
      change: '+2.1%',
      trend: 'up',
      icon: Clock
    }
  ]

  const hourlyData = [
    { hour: '9 AM', calls: 45 },
    { hour: '10 AM', calls: 67 },
    { hour: '11 AM', calls: 89 },
    { hour: '12 PM', calls: 72 },
    { hour: '1 PM', calls: 54 },
    { hour: '2 PM', calls: 78 },
    { hour: '3 PM', calls: 92 },
    { hour: '4 PM', calls: 85 },
    { hour: '5 PM', calls: 63 }
  ]

  const maxCalls = Math.max(...hourlyData.map(d => d.calls))

  const topAgents = [
    { name: 'Jane Smith', calls: 31, avgDuration: '7:45', satisfaction: 98 },
    { name: 'John Doe', calls: 23, avgDuration: '6:20', satisfaction: 95 },
    { name: 'Mike Johnson', calls: 18, avgDuration: '5:55', satisfaction: 92 }
  ]

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-100 mb-6">Analytics & Reports</h2>

      {/* Time Period Selector */}
      <div className="flex items-center space-x-2 mb-6">
        <button className="btn-primary">Today</button>
        <button className="btn-secondary">This Week</button>
        <button className="btn-secondary">This Month</button>
        <button className="btn-secondary">Custom Range</button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {metrics.map((metric, index) => (
          <div key={index} className="card p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 bg-primary-500/20 rounded-lg">
                <metric.icon className="w-5 h-5 text-primary-400" />
              </div>
              <div className={`flex items-center text-sm font-medium ${
                metric.trend === 'up' ? 'text-green-400' : 'text-red-400'
              }`}>
                {metric.trend === 'up' ? (
                  <TrendingUp className="w-4 h-4 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 mr-1" />
                )}
                {metric.change}
              </div>
            </div>
            <div className="text-sm text-gray-400 mb-1">{metric.label}</div>
            <div className="text-2xl font-bold text-gray-100">{metric.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hourly Call Volume */}
        <div className="card p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-100 mb-6">Call Volume by Hour</h3>
          
          <div className="space-y-3">
            {hourlyData.map((data, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-400">{data.hour}</span>
                  <span className="text-sm font-medium text-gray-100">{data.calls} calls</span>
                </div>
                <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-500"
                    style={{ width: `${(data.calls / maxCalls) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performing Agents */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-100 mb-6">Top Agents Today</h3>
          
          <div className="space-y-4">
            {topAgents.map((agent, index) => (
              <div key={index} className="bg-dark-700 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-medium mr-3">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-100">{agent.name}</div>
                    <div className="text-xs text-gray-400">{agent.calls} calls</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <div className="text-gray-400">Avg Duration</div>
                    <div className="text-gray-100 font-medium">{agent.avgDuration}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Satisfaction</div>
                    <div className="text-green-400 font-medium">{agent.satisfaction}%</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Call Status Distribution */}
      <div className="card p-6 mt-6">
        <h3 className="text-lg font-semibold text-gray-100 mb-6">Call Status Distribution</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-dark-700 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-2">Answered</div>
            <div className="flex items-end justify-between">
              <div className="text-2xl font-bold text-green-400">87.5%</div>
              <div className="text-sm text-gray-400">1,089</div>
            </div>
            <div className="mt-2 h-1 bg-dark-600 rounded-full overflow-hidden">
              <div className="h-full bg-green-400" style={{ width: '87.5%' }} />
            </div>
          </div>
          
          <div className="bg-dark-700 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-2">Missed</div>
            <div className="flex items-end justify-between">
              <div className="text-2xl font-bold text-red-400">12.5%</div>
              <div className="text-sm text-gray-400">156</div>
            </div>
            <div className="mt-2 h-1 bg-dark-600 rounded-full overflow-hidden">
              <div className="h-full bg-red-400" style={{ width: '12.5%' }} />
            </div>
          </div>
          
          <div className="bg-dark-700 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-2">Busy</div>
            <div className="flex items-end justify-between">
              <div className="text-2xl font-bold text-yellow-400">5.2%</div>
              <div className="text-sm text-gray-400">65</div>
            </div>
            <div className="mt-2 h-1 bg-dark-600 rounded-full overflow-hidden">
              <div className="h-full bg-yellow-400" style={{ width: '5.2%' }} />
            </div>
          </div>
          
          <div className="bg-dark-700 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-2">Failed</div>
            <div className="flex items-end justify-between">
              <div className="text-2xl font-bold text-gray-400">2.1%</div>
              <div className="text-sm text-gray-400">26</div>
            </div>
            <div className="mt-2 h-1 bg-dark-600 rounded-full overflow-hidden">
              <div className="h-full bg-gray-400" style={{ width: '2.1%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analytics
