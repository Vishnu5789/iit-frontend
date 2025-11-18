import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline'
import apiService from '../../services/api'

interface Industry {
  _id: string
  name: string
  description: string
  icon: string
  order: number
  isActive: boolean
}

const ManageIndustries = () => {
  const navigate = useNavigate()
  const [industries, setIndustries] = useState<Industry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingIndustry, setEditingIndustry] = useState<Industry | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: 'BuildingOffice2Icon',
    order: 0,
    isActive: true
  })

  useEffect(() => {
    checkAdminAccess()
    fetchIndustries()
  }, [])

  const checkAdminAccess = () => {
    const user = apiService.getUser()
    if (!user || user.role !== 'admin') {
      navigate('/login')
    }
  }

  const fetchIndustries = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/industries')
      const data = await response.json()
      if (data.success) {
        setIndustries(data.data)
      }
    } catch (error) {
      console.error('Error fetching industries:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const token = apiService.getToken()
      const url = editingIndustry 
        ? `http://localhost:5000/api/industries/${editingIndustry._id}`
        : 'http://localhost:5000/api/industries'
      
      const response = await fetch(url, {
        method: editingIndustry ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()
      
      if (data.success) {
        fetchIndustries()
        closeModal()
        alert(editingIndustry ? 'Industry updated successfully!' : 'Industry created successfully!')
      } else {
        alert(data.message || 'Operation failed')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('An error occurred')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this industry?')) return

    try {
      const token = apiService.getToken()
      const response = await fetch(`http://localhost:5000/api/industries/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      
      if (data.success) {
        fetchIndustries()
        alert('Industry deleted successfully!')
      } else {
        alert(data.message || 'Delete failed')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('An error occurred')
    }
  }

  const openCreateModal = () => {
    setEditingIndustry(null)
    setFormData({
      name: '',
      description: '',
      icon: 'BuildingOffice2Icon',
      order: industries.length,
      isActive: true
    })
    setShowModal(true)
  }

  const openEditModal = (industry: Industry) => {
    setEditingIndustry(industry)
    setFormData({
      name: industry.name,
      description: industry.description,
      icon: industry.icon,
      order: industry.order,
      isActive: industry.isActive
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingIndustry(null)
  }

  return (
    <div className="pt-28 md:pt-32 lg:pt-36 px-4 min-h-screen">
      <div className="max-w-7xl mx-auto mb-16">
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-2">Manage Industries</h1>
            <p className="text-lg text-dark/70">Add, edit, or remove industry sectors</p>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
          >
            <PlusIcon className="h-5 w-5" />
            Add Industry
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-lg text-dark/60">Loading industries...</p>
          </div>
        ) : industries.length === 0 ? (
          <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-primary/10">
            <p className="text-lg text-dark/60">No industries found. Create your first industry!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {industries.map((industry) => (
              <div
                key={industry._id}
                className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-primary/10 hover:shadow-xl hover:scale-[1.01] transition-all duration-300"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-primary">{industry.name}</h3>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        Order: {industry.order}
                      </span>
                    </div>
                    <p className="text-dark/70 text-sm mb-3 line-clamp-3">{industry.description}</p>
                    <div className="flex gap-2">
                      <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                        {industry.icon}
                      </span>
                      <span className={`text-xs px-3 py-1 rounded-full ${industry.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {industry.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => openEditModal(industry)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(industry._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-primary">
                    {editingIndustry ? 'Edit Industry' : 'Add New Industry'}
                  </h2>
                  <button onClick={closeModal} className="text-dark/60 hover:text-dark">
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-primary mb-2">
                      Industry Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-3 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-primary mb-2">
                      Description *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows={5}
                      maxLength={1500}
                      className="w-full px-4 py-3 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                      required
                    />
                    <p className="text-xs text-dark/50 mt-1">{formData.description.length}/1500 characters</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-primary mb-2">
                        Icon Name
                      </label>
                      <input
                        type="text"
                        value={formData.icon}
                        onChange={(e) => setFormData({...formData, icon: e.target.value})}
                        placeholder="BuildingOffice2Icon"
                        className="w-full px-4 py-3 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                      <p className="text-xs text-dark/50 mt-1">Heroicon name</p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-primary mb-2">
                        Display Order
                      </label>
                      <input
                        type="number"
                        value={formData.order}
                        onChange={(e) => setFormData({...formData, order: parseInt(e.target.value)})}
                        className="w-full px-4 py-3 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                      className="w-4 h-4"
                    />
                    <label className="text-sm text-dark/70">Active (visible to users)</label>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-all duration-300"
                    >
                      {editingIndustry ? 'Update Industry' : 'Create Industry'}
                    </button>
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-6 py-3 border border-primary/20 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-300"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ManageIndustries

