import React, { useState } from 'react'
import { Send, Search, Phone } from 'lucide-react'

interface Message {
  id: number
  text: string
  sender: 'agent' | 'customer'
  timestamp: string
}

interface Conversation {
  id: number
  customerNumber: string
  customerName: string
  lastMessage: string
  timestamp: string
  unread: number
}

const SmsChat: React.FC = () => {
  const [selectedConversation, setSelectedConversation] = useState<number | null>(1)
  const [messageText, setMessageText] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  // Demo data
  const conversations: Conversation[] = [
    {
      id: 1,
      customerNumber: '+1 (555) 123-4567',
      customerName: 'John Smith',
      lastMessage: 'Thank you for your help!',
      timestamp: '10:30 AM',
      unread: 0
    },
    {
      id: 2,
      customerNumber: '+1 (555) 987-6543',
      customerName: 'Sarah Johnson',
      lastMessage: 'When can I expect delivery?',
      timestamp: '9:15 AM',
      unread: 2
    },
    {
      id: 3,
      customerNumber: '+1 (555) 246-8135',
      customerName: 'Mike Davis',
      lastMessage: 'I need to update my order',
      timestamp: 'Yesterday',
      unread: 0
    }
  ]

  const messages: Message[] = [
    {
      id: 1,
      text: 'Hello, I need help with my order',
      sender: 'customer',
      timestamp: '10:25 AM'
    },
    {
      id: 2,
      text: 'Hi! I\'d be happy to help. What\'s your order number?',
      sender: 'agent',
      timestamp: '10:26 AM'
    },
    {
      id: 3,
      text: 'It\'s #12345',
      sender: 'customer',
      timestamp: '10:27 AM'
    },
    {
      id: 4,
      text: 'Let me check that for you. Your order is scheduled for delivery tomorrow.',
      sender: 'agent',
      timestamp: '10:28 AM'
    },
    {
      id: 5,
      text: 'Thank you for your help!',
      sender: 'customer',
      timestamp: '10:30 AM'
    }
  ]

  const handleSendMessage = () => {
    if (messageText.trim()) {
      // Send message logic here
      setMessageText('')
    }
  }

  const filteredConversations = conversations.filter(conv =>
    conv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.customerNumber.includes(searchTerm)
  )

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-100 mb-6">SMS Chat</h2>
      
      <div className="card overflow-hidden">
        <div className="flex h-[600px]">
          {/* Conversations List */}
          <div className="w-80 border-r border-dark-700 flex flex-col">
            <div className="p-4 border-b border-dark-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search conversations..."
                  className="w-full pl-10 pr-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-sm text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv.id)}
                  className={`w-full p-4 text-left hover:bg-dark-700 transition-colors border-b border-dark-700 ${
                    selectedConversation === conv.id ? 'bg-dark-700' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <div className="font-medium text-gray-100">{conv.customerName}</div>
                    <div className="text-xs text-gray-400">{conv.timestamp}</div>
                  </div>
                  <div className="text-sm text-gray-400 mb-1">{conv.customerNumber}</div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-400 truncate flex-1">{conv.lastMessage}</div>
                    {conv.unread > 0 && (
                      <span className="ml-2 bg-primary-600 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                        {conv.unread}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          {selectedConversation ? (
            <div className="flex-1 flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b border-dark-700 flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-100">
                    {conversations.find(c => c.id === selectedConversation)?.customerName}
                  </div>
                  <div className="text-sm text-gray-400">
                    {conversations.find(c => c.id === selectedConversation)?.customerNumber}
                  </div>
                </div>
                <button className="p-2 hover:bg-dark-700 rounded-lg transition-colors">
                  <Phone className="w-5 h-5 text-primary-400" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'agent' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-md rounded-lg p-3 ${
                        message.sender === 'agent'
                          ? 'bg-primary-600 text-white'
                          : 'bg-dark-700 text-gray-100'
                      }`}
                    >
                      <div className="text-sm">{message.text}</div>
                      <div className={`text-xs mt-1 ${
                        message.sender === 'agent' ? 'text-primary-200' : 'text-gray-400'
                      }`}>
                        {message.timestamp}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-dark-700">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="btn-primary px-6 flex items-center space-x-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              Select a conversation to start chatting
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SmsChat
