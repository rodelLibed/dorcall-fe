import React, { useState } from 'react'
import { Search, Phone, MessageSquare, Plus, Edit, Trash2 } from 'lucide-react'

interface Contact {
  id: number
  name: string
  phoneNumber: string
  email?: string
  company?: string
  lastContact: string
}

const ContactList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)

  // Demo data
  const contacts: Contact[] = [
    {
      id: 1,
      name: 'John Smith',
      phoneNumber: '+1 (555) 123-4567',
      email: 'john.smith@example.com',
      company: 'Acme Corp',
      lastContact: '2026-03-25'
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      phoneNumber: '+1 (555) 987-6543',
      email: 'sarah.j@example.com',
      company: 'Tech Solutions',
      lastContact: '2026-03-24'
    },
    {
      id: 3,
      name: 'Mike Davis',
      phoneNumber: '+1 (555) 246-8135',
      email: 'mike.davis@example.com',
      lastContact: '2026-03-23'
    },
    {
      id: 4,
      name: 'Emily Brown',
      phoneNumber: '+1 (555) 369-2580',
      email: 'emily.b@example.com',
      company: 'Global Industries',
      lastContact: '2026-03-22'
    },
    {
      id: 5,
      name: 'Robert Wilson',
      phoneNumber: '+1 (555) 147-2589',
      email: 'r.wilson@example.com',
      lastContact: '2026-03-21'
    }
  ]

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.phoneNumber.includes(searchTerm) ||
    contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.company?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-100">Contacts</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Contact</span>
        </button>
      </div>
      
      <div className="card p-6">
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search contacts..."
              className="input-field pl-10"
            />
          </div>
        </div>

        {/* Contacts Grid */}
        <div className="grid gap-4">
          {filteredContacts.map((contact) => (
            <div
              key={contact.id}
              className="bg-dark-700 rounded-lg p-4 hover:bg-dark-600 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-100 mb-2">{contact.name}</h3>
                  
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center text-gray-300">
                      <Phone className="w-4 h-4 mr-2 text-gray-400" />
                      {contact.phoneNumber}
                    </div>
                    
                    {contact.email && (
                      <div className="flex items-center text-gray-300">
                        <MessageSquare className="w-4 h-4 mr-2 text-gray-400" />
                        {contact.email}
                      </div>
                    )}
                    
                    {contact.company && (
                      <div className="text-gray-400">
                        {contact.company}
                      </div>
                    )}
                    
                    <div className="text-gray-500 text-xs mt-2">
                      Last contact: {contact.lastContact}
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2 ml-4">
                  <button className="p-2 bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors">
                    <Phone className="w-4 h-4 text-white" />
                  </button>
                  <button className="p-2 bg-dark-600 hover:bg-dark-500 rounded-lg transition-colors">
                    <MessageSquare className="w-4 h-4 text-gray-300" />
                  </button>
                  <button className="p-2 bg-dark-600 hover:bg-dark-500 rounded-lg transition-colors">
                    <Edit className="w-4 h-4 text-gray-300" />
                  </button>
                  <button className="p-2 bg-dark-600 hover:bg-red-600 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4 text-gray-300" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredContacts.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No contacts found</p>
          </div>
        )}
      </div>

      {/* Add Contact Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card p-6 w-full max-w-md m-4">
            <h3 className="text-xl font-bold text-gray-100 mb-4">Add New Contact</h3>
            
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name *
                </label>
                <input type="text" className="input-field" placeholder="John Smith" required />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Phone Number *
                </label>
                <input type="tel" className="input-field" placeholder="+1 (555) 123-4567" required />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input type="email" className="input-field" placeholder="john@example.com" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Company
                </label>
                <input type="text" className="input-field" placeholder="Acme Corp" />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1"
                >
                  Add Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ContactList
