import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeftIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline'
import apiService from '../../services/api'
import FileUpload from '../../components/FileUpload'

export default function ManageAbout() {
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
      const response = await apiService.getAboutConfig()
      if (response.success) {
        setConfig(response.data)
      }
    } catch (error) {
      console.error('Error fetching config:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageUpload = (field: string, file: any) => {
    setConfig({ ...config, [field]: { url: file.url, fileId: file.fileId } })
  }

  const handleImageRemove = (field: string) => {
    setConfig({ ...config, [field]: { url: '', fileId: '' } })
  }

  const addValue = () => {
    const newValue = {
      title: '',
      description: '',
      icon: 'CheckCircle'
    }
    setConfig({
      ...config,
      values: [...(config?.values || []), newValue]
    })
  }

  const removeValue = (index: number) => {
    const updatedValues = config.values.filter((_: any, i: number) => i !== index)
    setConfig({ ...config, values: updatedValues })
  }

  const updateValue = (index: number, field: string, value: string) => {
    const updatedValues = [...config.values]
    updatedValues[index][field] = value
    setConfig({ ...config, values: updatedValues })
  }

  const addTeamMember = () => {
    const newMember = {
      name: '',
      role: '',
      bio: '',
      image: { url: '', fileId: '' },
      linkedin: '',
      twitter: ''
    }
    setConfig({
      ...config,
      team: [...(config?.team || []), newMember]
    })
  }

  const removeTeamMember = (index: number) => {
    const updatedTeam = config.team.filter((_: any, i: number) => i !== index)
    setConfig({ ...config, team: updatedTeam })
  }

  const updateTeamMember = (index: number, field: string, value: any) => {
    const updatedTeam = [...config.team]
    updatedTeam[index][field] = value
    setConfig({ ...config, team: updatedTeam })
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsSaving(true)
      const response = await apiService.updateAboutConfig(config)
      if (response.success) {
        setConfig(response.data)
        setMessage({ type: 'success', text: 'About page updated successfully!' })
        setTimeout(() => setMessage(null), 3000)
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update' })
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
      <div className="max-w-5xl mx-auto py-8">
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2 text-primary hover:text-primary-dark mb-4 transition"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-dark">Manage About Page</h1>
          <p className="text-medium mt-2">Customize the about page content and images</p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Hero Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-dark mb-4">Hero Section</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark mb-2">Heading</label>
                <input
                  type="text"
                  value={config?.heroHeading || ''}
                  onChange={(e) => setConfig({ ...config, heroHeading: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark mb-2">Subheading</label>
                <input
                  type="text"
                  value={config?.heroSubheading || ''}
                  onChange={(e) => setConfig({ ...config, heroSubheading: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark mb-2">Description</label>
                <textarea
                  rows={3}
                  value={config?.heroDescription || ''}
                  onChange={(e) => setConfig({ ...config, heroDescription: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <FileUpload
                label="Hero Image"
                accept="image/*"
                folder="about"
                onUploadComplete={(file) => handleImageUpload('heroImage', file)}
                currentFile={config?.heroImage}
                onRemove={() => handleImageRemove('heroImage')}
              />
            </div>
          </div>

          {/* Statistics */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-dark mb-4">Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['students', 'courses', 'rating', 'industries'].map((stat) => (
                <div key={stat} className="border rounded-lg p-4">
                  <h3 className="font-semibold text-dark mb-3 capitalize">{stat}</h3>
                  <input
                    type={stat === 'rating' ? 'number' : 'number'}
                    step={stat === 'rating' ? '0.1' : '1'}
                    placeholder="Value"
                    value={config?.stats?.[stat]?.value || ''}
                    onChange={(e) => setConfig({
                      ...config,
                      stats: {
                        ...config?.stats,
                        [stat]: {
                          ...config?.stats?.[stat],
                          value: parseFloat(e.target.value) || 0
                        }
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded mb-2"
                  />
                  <input
                    type="text"
                    placeholder="Label"
                    value={config?.stats?.[stat]?.label || ''}
                    onChange={(e) => setConfig({
                      ...config,
                      stats: {
                        ...config?.stats,
                        [stat]: {
                          ...config?.stats?.[stat],
                          label: e.target.value
                        }
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Mission & Vision */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-dark mb-4">Mission</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Heading"
                  value={config?.missionHeading || ''}
                  onChange={(e) => setConfig({ ...config, missionHeading: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
                <textarea
                  rows={4}
                  placeholder="Content"
                  value={config?.missionContent || ''}
                  onChange={(e) => setConfig({ ...config, missionContent: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
                <FileUpload
                  label="Mission Image"
                  accept="image/*"
                  folder="about"
                  onUploadComplete={(file) => handleImageUpload('missionImage', file)}
                  currentFile={config?.missionImage}
                  onRemove={() => handleImageRemove('missionImage')}
                />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-dark mb-4">Vision</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Heading"
                  value={config?.visionHeading || ''}
                  onChange={(e) => setConfig({ ...config, visionHeading: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
                <textarea
                  rows={4}
                  placeholder="Content"
                  value={config?.visionContent || ''}
                  onChange={(e) => setConfig({ ...config, visionContent: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
                <FileUpload
                  label="Vision Image"
                  accept="image/*"
                  folder="about"
                  onUploadComplete={(file) => handleImageUpload('visionImage', file)}
                  currentFile={config?.visionImage}
                  onRemove={() => handleImageRemove('visionImage')}
                />
              </div>
            </div>
          </div>

          {/* Story */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-dark mb-4">Story Section</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Heading"
                value={config?.storyHeading || ''}
                onChange={(e) => setConfig({ ...config, storyHeading: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              <textarea
                rows={4}
                placeholder="Content"
                value={config?.storyContent || ''}
                onChange={(e) => setConfig({ ...config, storyContent: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          {/* Values */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-dark">Values</h2>
              <button
                type="button"
                onClick={addValue}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
              >
                <PlusIcon className="w-5 h-5" />
                Add Value
              </button>
            </div>
            <div className="space-y-4">
              {config?.values?.map((value: any, index: number) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-dark">Value #{index + 1}</h3>
                    <button
                      type="button"
                      onClick={() => removeValue(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Title"
                    value={value.title}
                    onChange={(e) => updateValue(index, 'title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded mb-2"
                  />
                  <textarea
                    rows={3}
                    placeholder="Description"
                    value={value.description}
                    onChange={(e) => updateValue(index, 'description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Team Members */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-dark">Team Members</h2>
              <button
                type="button"
                onClick={addTeamMember}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
              >
                <PlusIcon className="w-5 h-5" />
                Add Member
              </button>
            </div>
            <div className="space-y-6">
              {config?.team?.map((member: any, index: number) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-dark">Member #{index + 1}</h3>
                    <button
                      type="button"
                      onClick={() => removeTeamMember(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Name"
                      value={member.name}
                      onChange={(e) => updateTeamMember(index, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                    />
                    <input
                      type="text"
                      placeholder="Role"
                      value={member.role}
                      onChange={(e) => updateTeamMember(index, 'role', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                    />
                    <textarea
                      rows={2}
                      placeholder="Bio"
                      value={member.bio}
                      onChange={(e) => updateTeamMember(index, 'bio', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="url"
                        placeholder="LinkedIn URL"
                        value={member.linkedin}
                        onChange={(e) => updateTeamMember(index, 'linkedin', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded"
                      />
                      <input
                        type="url"
                        placeholder="Twitter URL"
                        value={member.twitter}
                        onChange={(e) => updateTeamMember(index, 'twitter', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded"
                      />
                    </div>
                    <FileUpload
                      label="Member Photo"
                      accept="image/*"
                      folder="team"
                      onUploadComplete={(file) => updateTeamMember(index, 'image', { url: file.url, fileId: file.fileId })}
                      currentFile={member.image}
                      onRemove={() => updateTeamMember(index, 'image', { url: '', fileId: '' })}
                    />
                  </div>
                </div>
              ))}
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
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

