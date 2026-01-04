import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ArrowLeftIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline'
import apiService from '../../services/api'
import FileUpload from '../../components/FileUpload'

export default function ManageHomepage() {
  const navigate = useNavigate()
  const [config, setConfig] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('hero')

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
        toast.success('Image updated successfully!')
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update image')
    }
  }

  const handleImageRemove = async (imageType: string) => {
    try {
      const response = await apiService.updateHomeImage(imageType, { url: '', fileId: '' })
      if (response.success) {
        setConfig(response.data)
        toast.success('Image removed successfully!')
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove image')
    }
  }

  const handleStatsUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsSaving(true)
      const response = await apiService.updateHomeStats(config.stats)
      if (response.success) {
        setConfig(response.data)
        toast.success('Stats updated successfully!')
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update stats')
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
        toast.success('Hero text updated successfully!')
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update hero text')
    } finally {
      setIsSaving(false)
    }
  }

  const handleContentSectionUpdate = async (sectionName: string, e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsSaving(true)
      const response = await apiService.updateContentSection(sectionName, config[sectionName])
      if (response.success) {
        setConfig(response.data)
        toast.success('Content updated successfully!')
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update content')
    } finally {
      setIsSaving(false)
    }
  }

  const addPrinciple = () => {
    const principles = config?.pedagogySection?.principles || []
    setConfig({
      ...config,
      pedagogySection: {
        ...config.pedagogySection,
        principles: [...principles, { title: '', description: '' }]
      }
    })
  }

  const removePrinciple = (index: number) => {
    const principles = config?.pedagogySection?.principles || []
    setConfig({
      ...config,
      pedagogySection: {
        ...config.pedagogySection,
        principles: principles.filter((_: any, i: number) => i !== index)
      }
    })
  }

  const addValue = () => {
    const values = config?.coreValuesSection?.values || []
    setConfig({
      ...config,
      coreValuesSection: {
        ...config.coreValuesSection,
        values: [...values, { name: '', description: '' }]
      }
    })
  }

  const removeValue = (index: number) => {
    const values = config?.coreValuesSection?.values || []
    setConfig({
      ...config,
      coreValuesSection: {
        ...config.coreValuesSection,
        values: values.filter((_: any, i: number) => i !== index)
      }
    })
  }

  const addFeature = () => {
    const features = config?.whyChooseUsSection?.features || []
    setConfig({
      ...config,
      whyChooseUsSection: {
        ...config.whyChooseUsSection,
        features: [...features, { icon: '🚀', title: '', description: '' }]
      }
    })
  }

  const removeFeature = (index: number) => {
    const features = config?.whyChooseUsSection?.features || []
    setConfig({
      ...config,
      whyChooseUsSection: {
        ...config.whyChooseUsSection,
        features: features.filter((_: any, i: number) => i !== index)
      }
    })
  }

  if (isLoading) {
    return (
      <div className="pt-16 md:pt-20 px-4 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  const tabs = [
    { id: 'hero', label: 'Hero Section' },
    { id: 'mission', label: 'Mission' },
    { id: 'missionVision', label: 'Mission & Vision' },
    { id: 'pedagogy', label: 'Pedagogy' },
    { id: 'values', label: 'Core Values' },
    { id: 'journey', label: 'Join Journey' },
    { id: 'whyChoose', label: 'Why Choose Us' },
    { id: 'instructors', label: 'Instructors' },
    { id: 'images', label: 'Images' },
    { id: 'stats', label: 'Stats' }
  ]

  return (
    <div className="pt-28 md:pt-32 lg:pt-36 px-4 min-h-screen bg-gradient-to-b from-light to-white">
      <div className="max-w-7xl mx-auto py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin')}
            className="inline-flex items-center gap-2 text-primary hover:text-primary-dark mb-4 transition font-medium"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl md:text-4xl font-bold text-dark mb-2">Manage Homepage</h1>
          <p className="text-medium">Customize all homepage content and images</p>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-gray-600 hover:text-primary'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Hero Text Section */}
        {activeTab === 'hero' && (
          <div className="bg-white rounded-xl shadow-md p-8 mb-6 border border-gray-200">
            <h2 className="text-2xl font-bold text-dark mb-6">Hero Section Text</h2>
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
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                {isSaving ? 'Saving...' : 'Save Hero Text'}
              </button>
            </form>
          </div>
        )}

        {/* Mission Section */}
        {activeTab === 'mission' && (
          <div className="bg-white rounded-xl shadow-md p-8 mb-6 border border-gray-200">
            <h2 className="text-2xl font-bold text-dark mb-6">Mission Section</h2>
            <form onSubmit={(e) => handleContentSectionUpdate('missionSection', e)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark mb-2">Title</label>
                <input
                  type="text"
                  value={config?.missionSection?.title || ''}
                  onChange={(e) => setConfig({ ...config, missionSection: { ...config.missionSection, title: e.target.value } })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark mb-2">Paragraph 1</label>
                <textarea
                  rows={3}
                  value={config?.missionSection?.paragraph1 || ''}
                  onChange={(e) => setConfig({ ...config, missionSection: { ...config.missionSection, paragraph1: e.target.value } })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark mb-2">Paragraph 2</label>
                <textarea
                  rows={3}
                  value={config?.missionSection?.paragraph2 || ''}
                  onChange={(e) => setConfig({ ...config, missionSection: { ...config.missionSection, paragraph2: e.target.value } })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                {isSaving ? 'Saving...' : 'Save Mission Section'}
              </button>
            </form>
          </div>
        )}

        {/* Mission & Vision Section */}
        {activeTab === 'missionVision' && (
          <div className="bg-white rounded-xl shadow-md p-8 mb-6 border border-gray-200">
            <h2 className="text-2xl font-bold text-dark mb-6">Mission & Vision Section</h2>
            <form onSubmit={(e) => handleContentSectionUpdate('missionVisionSection', e)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark mb-2">Title</label>
                <input
                  type="text"
                  value={config?.missionVisionSection?.title || ''}
                  onChange={(e) => setConfig({ ...config, missionVisionSection: { ...config.missionVisionSection, title: e.target.value } })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark mb-2">Mission</label>
                <textarea
                  rows={3}
                  value={config?.missionVisionSection?.mission || ''}
                  onChange={(e) => setConfig({ ...config, missionVisionSection: { ...config.missionVisionSection, mission: e.target.value } })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark mb-2">Vision</label>
                <textarea
                  rows={3}
                  value={config?.missionVisionSection?.vision || ''}
                  onChange={(e) => setConfig({ ...config, missionVisionSection: { ...config.missionVisionSection, vision: e.target.value } })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                {isSaving ? 'Saving...' : 'Save Mission & Vision Section'}
              </button>
            </form>
          </div>
        )}

        {/* Pedagogy Section */}
        {activeTab === 'pedagogy' && (
          <div className="bg-white rounded-xl shadow-md p-8 mb-6 border border-gray-200">
            <h2 className="text-2xl font-bold text-dark mb-6">Pedagogy Section</h2>
            <form onSubmit={(e) => handleContentSectionUpdate('pedagogySection', e)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark mb-2">Title</label>
                <input
                  type="text"
                  value={config?.pedagogySection?.title || ''}
                  onChange={(e) => setConfig({ ...config, pedagogySection: { ...config.pedagogySection, title: e.target.value } })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark mb-2">Description</label>
                <textarea
                  rows={2}
                  value={config?.pedagogySection?.description || ''}
                  onChange={(e) => setConfig({ ...config, pedagogySection: { ...config.pedagogySection, description: e.target.value } })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-dark">Learning Principles</label>
                  <button
                    type="button"
                    onClick={addPrinciple}
                    className="flex items-center gap-2 px-3 py-1 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm"
                  >
                    <PlusIcon className="w-4 h-4" />
                    Add Principle
                  </button>
                </div>
                <div className="space-y-4">
                  {(config?.pedagogySection?.principles || []).map((principle: any, index: number) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">Principle {index + 1}</span>
                        <button
                          type="button"
                          onClick={() => removePrinciple(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                      <input
                        type="text"
                        placeholder="Principle Title"
                        value={principle.title || ''}
                        onChange={(e) => {
                          const principles = [...(config?.pedagogySection?.principles || [])]
                          principles[index].title = e.target.value
                          setConfig({ ...config, pedagogySection: { ...config.pedagogySection, principles } })
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent mb-2"
                      />
                      <textarea
                        rows={2}
                        placeholder="Principle Description"
                        value={principle.description || ''}
                        onChange={(e) => {
                          const principles = [...(config?.pedagogySection?.principles || [])]
                          principles[index].description = e.target.value
                          setConfig({ ...config, pedagogySection: { ...config.pedagogySection, principles } })
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  ))}
                </div>
              </div>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                {isSaving ? 'Saving...' : 'Save Pedagogy Section'}
              </button>
            </form>
          </div>
        )}

        {/* Core Values Section */}
        {activeTab === 'values' && (
          <div className="bg-white rounded-xl shadow-md p-8 mb-6 border border-gray-200">
            <h2 className="text-2xl font-bold text-dark mb-6">Core Values Section</h2>
            <form onSubmit={(e) => handleContentSectionUpdate('coreValuesSection', e)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark mb-2">Title</label>
                <input
                  type="text"
                  value={config?.coreValuesSection?.title || ''}
                  onChange={(e) => setConfig({ ...config, coreValuesSection: { ...config.coreValuesSection, title: e.target.value } })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-dark">Values</label>
                  <button
                    type="button"
                    onClick={addValue}
                    className="flex items-center gap-2 px-3 py-1 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm"
                  >
                    <PlusIcon className="w-4 h-4" />
                    Add Value
                  </button>
                </div>
                <div className="space-y-4">
                  {(config?.coreValuesSection?.values || []).map((value: any, index: number) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">Value {index + 1}</span>
                        <button
                          type="button"
                          onClick={() => removeValue(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                      <input
                        type="text"
                        placeholder="Value Name"
                        value={value.name || ''}
                        onChange={(e) => {
                          const values = [...(config?.coreValuesSection?.values || [])]
                          values[index].name = e.target.value
                          setConfig({ ...config, coreValuesSection: { ...config.coreValuesSection, values } })
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent mb-2"
                      />
                      <textarea
                        rows={2}
                        placeholder="Value Description"
                        value={value.description || ''}
                        onChange={(e) => {
                          const values = [...(config?.coreValuesSection?.values || [])]
                          values[index].description = e.target.value
                          setConfig({ ...config, coreValuesSection: { ...config.coreValuesSection, values } })
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  ))}
                </div>
              </div>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                {isSaving ? 'Saving...' : 'Save Core Values Section'}
              </button>
            </form>
          </div>
        )}

        {/* Join Journey Section */}
        {activeTab === 'journey' && (
          <div className="bg-white rounded-xl shadow-md p-8 mb-6 border border-gray-200">
            <h2 className="text-2xl font-bold text-dark mb-6">Join Journey Section</h2>
            <form onSubmit={(e) => handleContentSectionUpdate('joinJourneySection', e)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark mb-2">Title</label>
                <input
                  type="text"
                  value={config?.joinJourneySection?.title || ''}
                  onChange={(e) => setConfig({ ...config, joinJourneySection: { ...config.joinJourneySection, title: e.target.value } })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark mb-2">Description</label>
                <textarea
                  rows={3}
                  value={config?.joinJourneySection?.description || ''}
                  onChange={(e) => setConfig({ ...config, joinJourneySection: { ...config.joinJourneySection, description: e.target.value } })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark mb-2">Button 1 Text</label>
                  <input
                    type="text"
                    value={config?.joinJourneySection?.button1?.text || ''}
                    onChange={(e) => setConfig({ ...config, joinJourneySection: { ...config.joinJourneySection, button1: { ...config.joinJourneySection?.button1, text: e.target.value } } })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark mb-2">Button 1 Link</label>
                  <input
                    type="text"
                    value={config?.joinJourneySection?.button1?.link || ''}
                    onChange={(e) => setConfig({ ...config, joinJourneySection: { ...config.joinJourneySection, button1: { ...config.joinJourneySection?.button1, link: e.target.value } } })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark mb-2">Button 2 Text</label>
                  <input
                    type="text"
                    value={config?.joinJourneySection?.button2?.text || ''}
                    onChange={(e) => setConfig({ ...config, joinJourneySection: { ...config.joinJourneySection, button2: { ...config.joinJourneySection?.button2, text: e.target.value } } })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark mb-2">Button 2 Link</label>
                  <input
                    type="text"
                    value={config?.joinJourneySection?.button2?.link || ''}
                    onChange={(e) => setConfig({ ...config, joinJourneySection: { ...config.joinJourneySection, button2: { ...config.joinJourneySection?.button2, link: e.target.value } } })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark mb-2">Button 3 Text</label>
                  <input
                    type="text"
                    value={config?.joinJourneySection?.button3?.text || ''}
                    onChange={(e) => setConfig({ ...config, joinJourneySection: { ...config.joinJourneySection, button3: { ...config.joinJourneySection?.button3, text: e.target.value } } })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark mb-2">Button 3 Link</label>
                  <input
                    type="text"
                    value={config?.joinJourneySection?.button3?.link || ''}
                    onChange={(e) => setConfig({ ...config, joinJourneySection: { ...config.joinJourneySection, button3: { ...config.joinJourneySection?.button3, link: e.target.value } } })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                {isSaving ? 'Saving...' : 'Save Join Journey Section'}
              </button>
            </form>
          </div>
        )}

        {/* Why Choose Us Section */}
        {activeTab === 'whyChoose' && (
          <div className="bg-white rounded-xl shadow-md p-8 mb-6 border border-gray-200">
            <h2 className="text-2xl font-bold text-dark mb-6">Why Choose Us Section</h2>
            <form onSubmit={(e) => handleContentSectionUpdate('whyChooseUsSection', e)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark mb-2">Title</label>
                <input
                  type="text"
                  value={config?.whyChooseUsSection?.title || ''}
                  onChange={(e) => setConfig({ ...config, whyChooseUsSection: { ...config.whyChooseUsSection, title: e.target.value } })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark mb-2">Subtitle</label>
                <input
                  type="text"
                  value={config?.whyChooseUsSection?.subtitle || ''}
                  onChange={(e) => setConfig({ ...config, whyChooseUsSection: { ...config.whyChooseUsSection, subtitle: e.target.value } })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-dark">Features</label>
                  <button
                    type="button"
                    onClick={addFeature}
                    className="flex items-center gap-2 px-3 py-1 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm"
                  >
                    <PlusIcon className="w-4 h-4" />
                    Add Feature
                  </button>
                </div>
                <div className="space-y-4">
                  {(config?.whyChooseUsSection?.features || []).map((feature: any, index: number) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">Feature {index + 1}</span>
                        <button
                          type="button"
                          onClick={() => removeFeature(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                      <input
                        type="text"
                        placeholder="Icon (emoji)"
                        value={feature.icon || ''}
                        onChange={(e) => {
                          const features = [...(config?.whyChooseUsSection?.features || [])]
                          features[index].icon = e.target.value
                          setConfig({ ...config, whyChooseUsSection: { ...config.whyChooseUsSection, features } })
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent mb-2"
                      />
                      <input
                        type="text"
                        placeholder="Feature Title"
                        value={feature.title || ''}
                        onChange={(e) => {
                          const features = [...(config?.whyChooseUsSection?.features || [])]
                          features[index].title = e.target.value
                          setConfig({ ...config, whyChooseUsSection: { ...config.whyChooseUsSection, features } })
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent mb-2"
                      />
                      <textarea
                        rows={2}
                        placeholder="Feature Description"
                        value={feature.description || ''}
                        onChange={(e) => {
                          const features = [...(config?.whyChooseUsSection?.features || [])]
                          features[index].description = e.target.value
                          setConfig({ ...config, whyChooseUsSection: { ...config.whyChooseUsSection, features } })
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  ))}
                </div>
              </div>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                {isSaving ? 'Saving...' : 'Save Why Choose Us Section'}
              </button>
            </form>
          </div>
        )}

        {/* Instructors Section */}
        {activeTab === 'instructors' && (
          <div className="bg-white rounded-xl shadow-md p-8 mb-6 border border-gray-200">
            <h2 className="text-2xl font-bold text-dark mb-6">Instructors Section</h2>
            <form onSubmit={(e) => handleContentSectionUpdate('instructorsSection', e)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark mb-2">Title</label>
                <input
                  type="text"
                  value={config?.instructorsSection?.title || ''}
                  onChange={(e) => setConfig({ ...config, instructorsSection: { ...config.instructorsSection, title: e.target.value } })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark mb-2">Subtitle</label>
                <input
                  type="text"
                  value={config?.instructorsSection?.subtitle || ''}
                  onChange={(e) => setConfig({ ...config, instructorsSection: { ...config.instructorsSection, subtitle: e.target.value } })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                {isSaving ? 'Saving...' : 'Save Instructors Section'}
              </button>
            </form>
          </div>
        )}

        {/* Stats Section */}
        {activeTab === 'stats' && (
          <div className="bg-white rounded-xl shadow-md p-8 mb-6 border border-gray-200">
            <h2 className="text-2xl font-bold text-dark mb-6">Homepage Stats</h2>
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
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                {isSaving ? 'Saving...' : 'Save Stats'}
              </button>
            </form>
          </div>
        )}

        {/* Images Section */}
        {activeTab === 'images' && (
          <div className="bg-white rounded-xl shadow-md p-8 border border-gray-200">
            <h2 className="text-2xl font-bold text-dark mb-6">Homepage Images</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold text-dark mb-2">Hero Image</h3>
                <FileUpload
                  label="Upload Hero Image"
                  accept="image/*"
                  folder="homepage"
                  onUploadComplete={(fileData) => handleImageUpload('heroImage', fileData)}
                  currentFile={config?.heroImage?.url ? { url: config.heroImage.url, name: 'Hero Image' } : undefined}
                  onRemove={() => handleImageRemove('heroImage')}
                />
              </div>
              <div>
                <h3 className="font-semibold text-dark mb-2">Stars Image</h3>
                <FileUpload
                  label="Upload Stars Image"
                  accept="image/*"
                  folder="homepage"
                  onUploadComplete={(fileData) => handleImageUpload('starsImage', fileData)}
                  currentFile={config?.starsImage?.url ? { url: config.starsImage.url, name: 'Stars Image' } : undefined}
                  onRemove={() => handleImageRemove('starsImage')}
                />
              </div>
              <div>
                <h3 className="font-semibold text-dark mb-2">Vision Image</h3>
                <FileUpload
                  label="Upload Vision Image"
                  accept="image/*"
                  folder="homepage"
                  onUploadComplete={(fileData) => handleImageUpload('visionImage', fileData)}
                  currentFile={config?.visionImage?.url ? { url: config.visionImage.url, name: 'Vision Image' } : undefined}
                  onRemove={() => handleImageRemove('visionImage')}
                />
              </div>
              <div>
                <h3 className="font-semibold text-dark mb-2">Team Collaboration Image</h3>
                <FileUpload
                  label="Upload Team Image"
                  accept="image/*"
                  folder="homepage"
                  onUploadComplete={(fileData) => handleImageUpload('teamCollaborationImage', fileData)}
                  currentFile={config?.teamCollaborationImage?.url ? { url: config.teamCollaborationImage.url, name: 'Team Image' } : undefined}
                  onRemove={() => handleImageRemove('teamCollaborationImage')}
                />
              </div>
              <div>
                <h3 className="font-semibold text-dark mb-2">Goals Image</h3>
                <FileUpload
                  label="Upload Goals Image"
                  accept="image/*"
                  folder="homepage"
                  onUploadComplete={(fileData) => handleImageUpload('goalsImage', fileData)}
                  currentFile={config?.goalsImage?.url ? { url: config.goalsImage.url, name: 'Goals Image' } : undefined}
                  onRemove={() => handleImageRemove('goalsImage')}
                />
              </div>
              <div>
                <h3 className="font-semibold text-dark mb-2">Journey Image</h3>
                <FileUpload
                  label="Upload Journey Image"
                  accept="image/*"
                  folder="homepage"
                  onUploadComplete={(fileData) => handleImageUpload('journeyImage', fileData)}
                  currentFile={config?.journeyImage?.url ? { url: config.journeyImage.url, name: 'Journey Image' } : undefined}
                  onRemove={() => handleImageRemove('journeyImage')}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
