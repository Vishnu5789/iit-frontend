import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import apiService from '../../services/api'
import FileUpload from '../../components/FileUpload'

export default function ManageHomepage() {
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
      const response = await apiService.getHomeConfig()
      if (response.success) {
        setConfig(response.data)
      }
    } catch (error) {
      console.error('Error fetching config:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageUpload = async (imageType: string, fileData: any) => {
    try {
      const response = await apiService.updateHomeImage(imageType, fileData)
      if (response.success) {
        setConfig(response.data)
        setMessage({ type: 'success', text: 'Image updated successfully!' })
        setTimeout(() => setMessage(null), 3000)
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update image' })
      setTimeout(() => setMessage(null), 3000)
    }
  }

  const handleStatsUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsSaving(true)
      const response = await apiService.updateHomeStats(config.stats)
      if (response.success) {
        setConfig(response.data)
        setMessage({ type: 'success', text: 'Stats updated successfully!' })
        setTimeout(() => setMessage(null), 3000)
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update stats' })
      setTimeout(() => setMessage(null), 3000)
    } finally {
      setIsSaving(false)
    }
  }

  const handleHeroTextUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsSaving(true)
      const response = await apiService.updateHeroText(config.heroText)
      if (response.success) {
        setConfig(response.data)
        setMessage({ type: 'success', text: 'Hero text updated successfully!' })
        setTimeout(() => setMessage(null), 3000)
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update hero text' })
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
          <h1 className="text-3xl font-bold text-dark">Manage Homepage</h1>
          <p className="text-medium mt-2">Customize homepage images, stats, and content</p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            {message.text}
          </div>
        )}

        {/* Hero Text Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-dark mb-4">Hero Section Text</h2>
          <form onSubmit={handleHeroTextUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark mb-2">Badge Text</label>
              <input
                type="text"
                value={config?.heroText?.badge || ''}
                onChange={(e) => setConfig({ ...config, heroText: { ...config.heroText, badge: e.target.value } })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-2">Headline</label>
              <input
                type="text"
                value={config?.heroText?.headline || ''}
                onChange={(e) => setConfig({ ...config, heroText: { ...config.heroText, headline: e.target.value } })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-2">Description</label>
              <textarea
                rows={3}
                value={config?.heroText?.description || ''}
                onChange={(e) => setConfig({ ...config, heroText: { ...config.heroText, description: e.target.value } })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Hero Text'}
            </button>
          </form>
        </div>

        {/* Stats Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-dark mb-4">Homepage Stats</h2>
          <form onSubmit={handleStatsUpdate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark mb-2">Students Count</label>
                <input
                  type="text"
                  value={config?.stats?.studentsCount || ''}
                  onChange={(e) => setConfig({ ...config, stats: { ...config.stats, studentsCount: e.target.value } })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="10K+"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark mb-2">Courses Count</label>
                <input
                  type="text"
                  value={config?.stats?.coursesCount || ''}
                  onChange={(e) => setConfig({ ...config, stats: { ...config.stats, coursesCount: e.target.value } })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="50+"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark mb-2">Average Rating</label>
                <input
                  type="text"
                  value={config?.stats?.averageRating || ''}
                  onChange={(e) => setConfig({ ...config, stats: { ...config.stats, averageRating: e.target.value } })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="4.8★"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Stats'}
            </button>
          </form>
        </div>

        {/* Images Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-dark mb-4">Homepage Images</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Hero Image */}
            <div>
              <h3 className="font-semibold text-dark mb-2">Hero Image</h3>
              <FileUpload
                label="Upload Hero Image"
                accept="image/*"
                folder="homepage"
                onUploadComplete={(fileData) => handleImageUpload('heroImage', fileData)}
                currentFile={config?.heroImage?.url ? { url: config.heroImage.url, name: 'Hero Image' } : undefined}
                onRemove={() => handleImageUpload('heroImage', { url: '/assets/hero.svg', fileId: '' })}
              />
            </div>

            {/* Stars Image */}
            <div>
              <h3 className="font-semibold text-dark mb-2">Stars Image</h3>
              <FileUpload
                label="Upload Stars Image"
                accept="image/*"
                folder="homepage"
                onUploadComplete={(fileData) => handleImageUpload('starsImage', fileData)}
                currentFile={config?.starsImage?.url ? { url: config.starsImage.url, name: 'Stars Image' } : undefined}
                onRemove={() => handleImageUpload('starsImage', { url: '/assets/stars.svg', fileId: '' })}
              />
            </div>

            {/* Vision Image */}
            <div>
              <h3 className="font-semibold text-dark mb-2">Vision Image</h3>
              <FileUpload
                label="Upload Vision Image"
                accept="image/*"
                folder="homepage"
                onUploadComplete={(fileData) => handleImageUpload('visionImage', fileData)}
                currentFile={config?.visionImage?.url ? { url: config.visionImage.url, name: 'Vision Image' } : undefined}
                onRemove={() => handleImageUpload('visionImage', { url: '/assets/vision.svg', fileId: '' })}
              />
            </div>

            {/* Team Collaboration Image */}
            <div>
              <h3 className="font-semibold text-dark mb-2">Team Collaboration Image</h3>
              <FileUpload
                label="Upload Team Image"
                accept="image/*"
                folder="homepage"
                onUploadComplete={(fileData) => handleImageUpload('teamCollaborationImage', fileData)}
                currentFile={config?.teamCollaborationImage?.url ? { url: config.teamCollaborationImage.url, name: 'Team Image' } : undefined}
                onRemove={() => handleImageUpload('teamCollaborationImage', { url: '/assets/team-collaboration.svg', fileId: '' })}
              />
            </div>

            {/* Goals Image */}
            <div>
              <h3 className="font-semibold text-dark mb-2">Goals Image</h3>
              <FileUpload
                label="Upload Goals Image"
                accept="image/*"
                folder="homepage"
                onUploadComplete={(fileData) => handleImageUpload('goalsImage', fileData)}
                currentFile={config?.goalsImage?.url ? { url: config.goalsImage.url, name: 'Goals Image' } : undefined}
                onRemove={() => handleImageUpload('goalsImage', { url: '/assets/goals.svg', fileId: '' })}
              />
            </div>

            {/* Journey Image */}
            <div>
              <h3 className="font-semibold text-dark mb-2">Journey Image</h3>
              <FileUpload
                label="Upload Journey Image"
                accept="image/*"
                folder="homepage"
                onUploadComplete={(fileData) => handleImageUpload('journeyImage', fileData)}
                currentFile={config?.journeyImage?.url ? { url: config.journeyImage.url, name: 'Journey Image' } : undefined}
                onRemove={() => handleImageUpload('journeyImage', { url: '/assets/journey.svg', fileId: '' })}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

