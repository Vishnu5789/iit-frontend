import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import apiService from '../../services/api'

export default function ManageContact() {
  const navigate = useNavigate()
  const [config, setConfig] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    checkAdminAccess()
    fetchConfig()
  }, [])

  const checkAdminAccess = () => {
    const user = apiService.getUser()
    if (!user || user.role !== 'admin') {
      navigate('/login')
    }
  }

  const fetchConfig = async () => {
    try {
      setIsLoading(true)
      const response = await apiService.getContactConfig()
      if (response.success) {
        setConfig(response.data)
      }
    } catch (error) {
      console.error('Error fetching config:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsSaving(true)
      const response = await apiService.updateContactConfig(config)
      if (response.success) {
        setConfig(response.data)
        setMessage({ type: 'success', text: 'Contact settings updated successfully!' })
        setTimeout(() => setMessage(null), 3000)
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update settings' })
      setTimeout(() => setMessage(null), 3000)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="pt-16 md:pt-20 px-4 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="pt-28 md:pt-32 lg:pt-36 px-4 min-h-screen bg-gradient-to-b from-light to-white">
      <div className="max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2 text-primary hover:text-primary-dark mb-4 transition"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-dark">Manage Contact Page</h1>
          <p className="text-medium mt-2">Customize contact information and page content</p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Page Content */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-dark mb-4">Page Content</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark mb-2">Heading</label>
                <input
                  type="text"
                  value={config?.pageContent?.heading || ''}
                  onChange={(e) => setConfig({ ...config, pageContent: { ...config?.pageContent, heading: e.target.value } })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark mb-2">Subheading</label>
                <textarea
                  rows={2}
                  value={config?.pageContent?.subheading || ''}
                  onChange={(e) => setConfig({ ...config, pageContent: { ...config?.pageContent, subheading: e.target.value } })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-dark mb-4">Contact Information</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark mb-2">Email</label>
                  <input
                    type="email"
                    value={config?.email || ''}
                    onChange={(e) => setConfig({ ...config, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark mb-2">Phone</label>
                  <input
                    type="tel"
                    value={config?.phone || ''}
                    onChange={(e) => setConfig({ ...config, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-dark mb-4">Address</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark mb-2">Street</label>
                <input
                  type="text"
                  value={config?.address?.street || ''}
                  onChange={(e) => setConfig({ ...config, address: { ...config?.address, street: e.target.value } })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-dark mb-2">City</label>
                  <input
                    type="text"
                    value={config?.address?.city || ''}
                    onChange={(e) => setConfig({ ...config, address: { ...config?.address, city: e.target.value } })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark mb-2">State</label>
                  <input
                    type="text"
                    value={config?.address?.state || ''}
                    onChange={(e) => setConfig({ ...config, address: { ...config?.address, state: e.target.value } })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark mb-2">Zip Code</label>
                  <input
                    type="text"
                    value={config?.address?.zipCode || ''}
                    onChange={(e) => setConfig({ ...config, address: { ...config?.address, zipCode: e.target.value } })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark mb-2">Country</label>
                <input
                  type="text"
                  value={config?.address?.country || ''}
                  onChange={(e) => setConfig({ ...config, address: { ...config?.address, country: e.target.value } })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Office Hours */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-dark mb-4">Office Hours</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark mb-2">Weekdays</label>
                <input
                  type="text"
                  value={config?.officeHours?.weekdays || ''}
                  onChange={(e) => setConfig({ ...config, officeHours: { ...config?.officeHours, weekdays: e.target.value } })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Monday - Friday: 9:00 AM - 6:00 PM"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark mb-2">Weekend</label>
                <input
                  type="text"
                  value={config?.officeHours?.weekend || ''}
                  onChange={(e) => setConfig({ ...config, officeHours: { ...config?.officeHours, weekend: e.target.value } })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Saturday - Sunday: Closed"
                />
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-dark mb-4">Social Media</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark mb-2">Facebook URL</label>
                <input
                  type="url"
                  value={config?.socialMedia?.facebook || ''}
                  onChange={(e) => setConfig({ ...config, socialMedia: { ...config?.socialMedia, facebook: e.target.value } })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="https://facebook.com/your-page"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark mb-2">Twitter URL</label>
                <input
                  type="url"
                  value={config?.socialMedia?.twitter || ''}
                  onChange={(e) => setConfig({ ...config, socialMedia: { ...config?.socialMedia, twitter: e.target.value } })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="https://twitter.com/your-profile"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark mb-2">LinkedIn URL</label>
                <input
                  type="url"
                  value={config?.socialMedia?.linkedin || ''}
                  onChange={(e) => setConfig({ ...config, socialMedia: { ...config?.socialMedia, linkedin: e.target.value } })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="https://linkedin.com/company/your-company"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark mb-2">Instagram URL</label>
                <input
                  type="url"
                  value={config?.socialMedia?.instagram || ''}
                  onChange={(e) => setConfig({ ...config, socialMedia: { ...config?.socialMedia, instagram: e.target.value } })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="https://instagram.com/your-profile"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark mb-2">YouTube URL</label>
                <input
                  type="url"
                  value={config?.socialMedia?.youtube || ''}
                  onChange={(e) => setConfig({ ...config, socialMedia: { ...config?.socialMedia, youtube: e.target.value } })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="https://youtube.com/channel/your-channel"
                />
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-dark mb-4">Google Maps Embed</h2>
            <div>
              <label className="block text-sm font-medium text-dark mb-2">Map Embed URL</label>
              <input
                type="url"
                value={config?.mapUrl || ''}
                onChange={(e) => setConfig({ ...config, mapUrl: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="https://www.google.com/maps/embed?..."
              />
              <p className="text-xs text-gray-500 mt-2">
                Get embed URL from Google Maps → Share → Embed a map
              </p>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="px-6 py-2 border border-gray-300 text-dark rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

