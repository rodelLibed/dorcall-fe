import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Phone } from 'lucide-react'
import axiosInstance from '../helpers/axios'
import { getToken } from '../helpers/token'

interface Agent {
  id: string
  username: string
  authType: string
  columnId: number
}

const AgentManagement: React.FC = () => {
  const [showAddModal, setShowAddModal] = useState(false)
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    sipExtension: '',
    sipPassword: ''
  })
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState('')

  const token = getToken()

  const fetchAgents = async () => {
    setLoading(true)
    try {
      const { data } = await axiosInstance(token).get('/api/agents')
      if (data.success) {
        setAgents(data.agents)
      }
    } catch (err) {
      console.error('Failed to fetch agents:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAgents()
  }, [])

  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    setFormLoading(true)

    try {
      const { data } = await axiosInstance(token).post('/api/agents', formData)

      if (data.success) {
        setShowAddModal(false)
        setFormData({ username: '', sipExtension: '', sipPassword: '' })
        fetchAgents()
      } else {
        setFormError(data.message || 'Failed to create agent')
      }
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to create agent')
    } finally {
      setFormLoading(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-100">Agent Management</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Agent</span>
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-dark-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Extension
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Username
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {agents.map((agent) => (
                <tr key={agent.columnId} className="hover:bg-dark-700 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-300">
                      <Phone className="w-4 h-4 mr-2 text-gray-400" />
                      {agent.id}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-300">{agent.username}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button className="p-2 bg-dark-600 hover:bg-dark-500 rounded-lg transition-colors">
                        <Edit className="w-4 h-4 text-gray-300" />
                      </button>
                      <button className="p-2 bg-dark-600 hover:bg-red-600 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4 text-gray-300" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Agent Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card p-6 w-full max-w-md m-4">
            <h3 className="text-xl font-bold text-gray-100 mb-4">Add New Agent</h3>
            
            {formError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500 rounded-lg text-red-500 text-sm">
                {formError}
              </div>
            )}
            
            <form onSubmit={handleCreateAgent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Username *
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  SIP Extension *
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="1001"
                  value={formData.sipExtension}
                  onChange={(e) => setFormData({ ...formData, sipExtension: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  SIP Password *
                </label>
                <input
                  type="password"
                  className="input-field"
                  placeholder="••••••••"
                  value={formData.sipPassword}
                  onChange={(e) => setFormData({ ...formData, sipPassword: e.target.value })}
                  required
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setFormError('') }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1"
                  disabled={formLoading}
                >
                  {formLoading ? 'Creating...' : 'Create Agent'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AgentManagement
