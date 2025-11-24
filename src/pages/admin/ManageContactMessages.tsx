import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeftIcon,
  EnvelopeIcon,
  PhoneIcon,
  TrashIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import apiService from '../../services/api'

interface Message {
  _id: string
  name: string
  email: string
  phone?: string
  subject: string
  message: string
  status: 'new' | 'read' | 'replied' | 'archived'
  adminNotes?: string
  createdAt: string
}

export default function ManageContactMessages() {
  const navigate = useNavigate()
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [alert, setAlert] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    checkAdminAccess()
    fetchMessages()
  }, [statusFilter])

  const checkAdminAccess = () => {
    const user = apiService.getUser()
    if (!user || user.role !== 'admin') {
      navigate('/login')
    }
  }

  const fetchMessages = async () => {
    try {
      setIsLoading(true)
      const response = await apiService.getContactMessages({ status: statusFilter })
      if (response.success) {
        setMessages(response.data)
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewMessage = async (message: Message) => {
    setSelectedMessage(message)
    if (message.status === 'new') {
      try {
        await apiService.updateMessageStatus(message._id, { status: 'read' })
        fetchMessages()
      } catch (error) {
        console.error('Error updating status:', error)
      }
    }
  }

  const handleUpdateStatus = async (messageId: string, status: string, adminNotes?: string) => {
    try {
      const response = await apiService.updateMessageStatus(messageId, { status, adminNotes })
      if (response.success) {
        setAlert({ type: 'success', text: 'Status updated successfully!' })
        setTimeout(() => setAlert(null), 3000)
        fetchMessages()
        setSelectedMessage(null)
      }
    } catch (error: any) {
      setAlert({ type: 'error', text: error.message || 'Failed to update status' })
      setTimeout(() => setAlert(null), 3000)
    }
  }

  const handleDeleteMessage = async (messageId: string, messageName: string) => {
    if (!confirm(`Are you sure you want to delete message from "${messageName}"?`)) return

    try {
      const response = await apiService.deleteContactMessage(messageId)
      if (response.success) {
        setAlert({ type: 'success', text: 'Message deleted successfully!' })
        setTimeout(() => setAlert(null), 3000)
        fetchMessages()
        if (selectedMessage?._id === messageId) {
          setSelectedMessage(null)
        }
      }
    } catch (error: any) {
      setAlert({ type: 'error', text: error.message || 'Failed to delete message' })
      setTimeout(() => setAlert(null), 3000)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800'
      case 'read': return 'bg-yellow-100 text-yellow-800'
      case 'replied': return 'bg-green-100 text-green-800'
      case 'archived': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="pt-16 md:pt-20 px-4 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2 text-primary hover:text-primary-dark mb-4 transition"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-dark">Contact Messages</h1>
          <p className="text-medium mt-2">View and manage contact form submissions</p>
        </div>

        {/* Alert */}
        {alert && (
          <div className={`mb-6 p-4 rounded-lg ${alert.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            {alert.text}
          </div>
        )}

        {/* Filter */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">All Messages</option>
            <option value="new">New</option>
            <option value="read">Read</option>
            <option value="replied">Replied</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Messages List */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : messages.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <EnvelopeIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No messages found</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message._id}
                  className={`bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition ${
                    selectedMessage?._id === message._id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleViewMessage(message)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-bold text-dark">{message.name}</h3>
                      <p className="text-sm text-medium">{message.email}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded ${getStatusColor(message.status)}`}>
                      {message.status}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-dark mb-1">{message.subject}</p>
                  <p className="text-sm text-gray-600 line-clamp-2">{message.message}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(message.createdAt).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Message Detail */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            {selectedMessage ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-xl font-bold text-dark">Message Details</h2>
                  <button
                    onClick={() => handleDeleteMessage(selectedMessage._id, selectedMessage.name)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                    title="Delete Message"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-dark">From:</label>
                    <p className="text-medium">{selectedMessage.name}</p>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-dark flex items-center gap-2">
                      <EnvelopeIcon className="w-4 h-4" />
                      Email:
                    </label>
                    <a href={`mailto:${selectedMessage.email}`} className="text-primary hover:underline">
                      {selectedMessage.email}
                    </a>
                  </div>

                  {selectedMessage.phone && (
                    <div>
                      <label className="text-sm font-semibold text-dark flex items-center gap-2">
                        <PhoneIcon className="w-4 h-4" />
                        Phone:
                      </label>
                      <a href={`tel:${selectedMessage.phone}`} className="text-primary hover:underline">
                        {selectedMessage.phone}
                      </a>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-semibold text-dark">Subject:</label>
                    <p className="text-medium">{selectedMessage.subject}</p>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-dark">Message:</label>
                    <p className="text-medium whitespace-pre-wrap mt-2 p-4 bg-gray-50 rounded">
                      {selectedMessage.message}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-dark">Date:</label>
                    <p className="text-medium">{new Date(selectedMessage.createdAt).toLocaleString()}</p>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-dark mb-2 block">Status:</label>
                    <select
                      value={selectedMessage.status}
                      onChange={(e) => handleUpdateStatus(selectedMessage._id, e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="new">New</option>
                      <option value="read">Read</option>
                      <option value="replied">Replied</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-dark mb-2 block">Admin Notes:</label>
                    <textarea
                      rows={3}
                      defaultValue={selectedMessage.adminNotes}
                      onBlur={(e) => {
                        if (e.target.value !== selectedMessage.adminNotes) {
                          handleUpdateStatus(selectedMessage._id, selectedMessage.status, e.target.value)
                        }
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Add private notes..."
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <EyeIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">Select a message to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

