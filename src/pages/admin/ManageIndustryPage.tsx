import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeftIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline'
import apiService from '../../services/api'

export default function ManageIndustryPage() {
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
      const response = await apiService.getIndustryConfig()
      if (response.success) {
        setConfig(response.data)
      }
    } catch (error) {
      console.error('Error fetching config:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const addProject = () => {
    setConfig({
      ...config,
      projects: [...(config?.projects || []), { title: '', tools: '', description: '', order: (config?.projects?.length || 0) + 1 }]
    })
  }

  const removeProject = (index: number) => {
    setConfig({ ...config, projects: config.projects.filter((_: any, i: number) => i !== index) })
  }

  const updateProject = (index: number, field: string, value: any) => {
    const updated = [...config.projects]
    updated[index][field] = value
    setConfig({ ...config, projects: updated })
  }

  const addBenefit = () => {
    setConfig({
      ...config,
      benefits: [...(config?.benefits || []), { title: '', description: '', icon: 'CheckCircle', order: (config?.benefits?.length || 0) + 1 }]
    })
  }

  const removeBenefit = (index: number) => {
    setConfig({ ...config, benefits: config.benefits.filter((_: any, i: number) => i !== index) })
  }

  const updateBenefit = (index: number, field: string, value: any) => {
    const updated = [...config.benefits]
    updated[index][field] = value
    setConfig({ ...config, benefits: updated })
  }

  const addCompanyCategory = () => {
    setConfig({
      ...config,
      companyCategories: [...(config?.companyCategories || []), { title: '', description: '', order: (config?.companyCategories?.length || 0) + 1 }]
    })
  }

  const removeCompanyCategory = (index: number) => {
    setConfig({ ...config, companyCategories: config.companyCategories.filter((_: any, i: number) => i !== index) })
  }

  const updateCompanyCategory = (index: number, field: string, value: any) => {
    const updated = [...config.companyCategories]
    updated[index][field] = value
    setConfig({ ...config, companyCategories: updated })
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsSaving(true)
      const response = await apiService.updateIndustryConfig(config)
      if (response.success) {
        setConfig(response.data)
        setMessage({ type: 'success', text: 'Industry page updated successfully!' })
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
    <div className="pt-28 md:pt-32 lg:pt-36 px-4 min-h-screen bg-gradient-to-b from-light to-white">
      <div className="max-w-5xl mx-auto py-8">
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2 text-primary hover:text-primary-dark mb-4 transition"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-dark">Manage Industry Page</h1>
          <p className="text-medium mt-2">Customize the industry page content (Note: Industry sectors are managed separately)</p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Hero Section */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-dark mb-4">Hero Section</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark mb-2">Heading</label>
                <input
                  type="text"
                  value={config?.heroHeading || ''}
                  onChange={(e) => setConfig({ ...config, heroHeading: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark mb-2">Subheading</label>
                <input
                  type="text"
                  value={config?.heroSubheading || ''}
                  onChange={(e) => setConfig({ ...config, heroSubheading: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark mb-2">Description</label>
                <textarea
                  rows={3}
                  value={config?.heroDescription || ''}
                  onChange={(e) => setConfig({ ...config, heroDescription: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Real-World Projects */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-dark">Real-World Projects</h2>
              <button
                type="button"
                onClick={addProject}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
              >
                <PlusIcon className="w-5 h-5" />
                Add Project
              </button>
            </div>
            <div className="space-y-4">
              {config?.projects?.map((project: any, index: number) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-dark">Project #{index + 1}</h3>
                    <button
                      type="button"
                      onClick={() => removeProject(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Title"
                      value={project.title}
                      onChange={(e) => updateProject(index, 'title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                    />
                    <input
                      type="text"
                      placeholder="Tools (e.g., SOLIDWORKS & ANSYS)"
                      value={project.tools}
                      onChange={(e) => updateProject(index, 'tools', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                    />
                    <textarea
                      rows={2}
                      placeholder="Description"
                      value={project.description}
                      onChange={(e) => updateProject(index, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                    />
                    <input
                      type="number"
                      placeholder="Display Order"
                      value={project.order}
                      onChange={(e) => updateProject(index, 'order', parseInt(e.target.value) || 0)}
                      className="w-32 px-3 py-2 border border-gray-300 rounded"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Workflow Section */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-dark mb-4">Workflow Alignment Section</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark mb-2">Heading</label>
                <input
                  type="text"
                  value={config?.workflowHeading || ''}
                  onChange={(e) => setConfig({ ...config, workflowHeading: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark mb-2">Content</label>
                <textarea
                  rows={4}
                  value={config?.workflowContent || ''}
                  onChange={(e) => setConfig({ ...config, workflowContent: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Industry Benefits */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-dark">Industry Benefits</h2>
              <button
                type="button"
                onClick={addBenefit}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
              >
                <PlusIcon className="w-5 h-5" />
                Add Benefit
              </button>
            </div>
            <div className="space-y-4">
              {config?.benefits?.map((benefit: any, index: number) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-dark">Benefit #{index + 1}</h3>
                    <button
                      type="button"
                      onClick={() => removeBenefit(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Title"
                      value={benefit.title}
                      onChange={(e) => updateBenefit(index, 'title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                    />
                    <textarea
                      rows={3}
                      placeholder="Description"
                      value={benefit.description}
                      onChange={(e) => updateBenefit(index, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                    />
                    <input
                      type="number"
                      placeholder="Display Order"
                      value={benefit.order}
                      onChange={(e) => updateBenefit(index, 'order', parseInt(e.target.value) || 0)}
                      className="w-32 px-3 py-2 border border-gray-300 rounded"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Companies Section */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-dark mb-4">Companies Section</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark mb-2">Heading</label>
                <input
                  type="text"
                  value={config?.companiesHeading || ''}
                  onChange={(e) => setConfig({ ...config, companiesHeading: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark mb-2">Description</label>
                <textarea
                  rows={2}
                  value={config?.companiesDescription || ''}
                  onChange={(e) => setConfig({ ...config, companiesDescription: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-dark">Company Categories</h3>
                <button
                  type="button"
                  onClick={addCompanyCategory}
                  className="flex items-center gap-2 px-3 py-1 bg-primary text-white text-sm rounded hover:bg-primary-dark transition"
                >
                  <PlusIcon className="w-4 h-4" />
                  Add Category
                </button>
              </div>
              <div className="space-y-3">
                {config?.companyCategories?.map((category: any, index: number) => (
                  <div key={index} className="border rounded p-3">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-semibold text-dark">Category #{index + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeCompanyCategory(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Title (e.g., Automotive manufacturers)"
                        value={category.title}
                        onChange={(e) => updateCompanyCategory(index, 'title', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Description"
                        value={category.description}
                        onChange={(e) => updateCompanyCategory(index, 'description', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                      />
                      <input
                        type="number"
                        placeholder="Order"
                        value={category.order}
                        onChange={(e) => updateCompanyCategory(index, 'order', parseInt(e.target.value) || 0)}
                        className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-dark mb-4">Call-to-Action Section</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark mb-2">Heading</label>
                <input
                  type="text"
                  value={config?.ctaHeading || ''}
                  onChange={(e) => setConfig({ ...config, ctaHeading: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark mb-2">Description</label>
                <textarea
                  rows={3}
                  value={config?.ctaDescription || ''}
                  onChange={(e) => setConfig({ ...config, ctaDescription: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark mb-2">Button Text</label>
                  <input
                    type="text"
                    value={config?.ctaButtonText || ''}
                    onChange={(e) => setConfig({ ...config, ctaButtonText: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark mb-2">Button Link</label>
                  <input
                    type="text"
                    value={config?.ctaButtonLink || ''}
                    onChange={(e) => setConfig({ ...config, ctaButtonLink: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
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

