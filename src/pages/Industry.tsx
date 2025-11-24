import { useEffect, useState } from 'react'
import { BuildingOffice2Icon, RocketLaunchIcon, CogIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { API_BASE_URL } from '../config/api.config'
import apiService from '../services/api'

interface Industry {
  _id: string
  name: string
  description: string
  icon: string
  order: number
}

const Industry = () => {
  const [industries, setIndustries] = useState<Industry[]>([])
  const [config, setConfig] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [industriesRes, configRes] = await Promise.all([
        fetch(`${API_BASE_URL}/industries`).then(res => res.json()),
        apiService.getIndustryConfig()
      ])

      if (industriesRes.success) {
        setIndustries(industriesRes.data)
      }
      if (configRes.success) {
        setConfig(configRes.data)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="pt-28 md:pt-32 lg:pt-36 px-4 min-h-screen">
      <div className="max-w-7xl mx-auto mb-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-4">
            <BuildingOffice2Icon className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-6">
            {config?.heroHeading || 'Industry Applications'}
          </h1>
          <p className="text-lg md:text-xl text-dark/80 font-medium mb-4">
            {config?.heroSubheading || 'Real-World Engineering That Drives Innovation'}
          </p>
          <div className="max-w-4xl mx-auto">
            <p className="text-base md:text-lg text-dark/70 leading-relaxed">
              {config?.heroDescription || 'Engineering design isn\'t just academic theory—it\'s the foundation of every product, structure, and system that shapes our modern world.'}
            </p>
          </div>
        </div>

        {/* Industry Sectors */}
        <div className="mb-20">
          <h2 className="text-2xl md:text-3xl font-bold text-primary mb-8 text-center">Industry Sectors We Serve</h2>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : industries.length === 0 ? (
            <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-primary/10">
              <p className="text-lg text-dark/60">No industry information available yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {industries.map((industry) => (
                <div
                  key={industry._id}
                  className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-primary/10 hover:shadow-xl transition-all duration-300"
                >
                  <h3 className="text-xl font-bold text-primary mb-3">{industry.name}</h3>
                  <p className="text-dark/70 text-sm leading-relaxed">{industry.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Real-World Projects */}
        {config?.projects && config.projects.length > 0 && (
          <div className="mb-20">
            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-8 text-center">Real-World Project Examples</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {config.projects.sort((a: any, b: any) => a.order - b.order).map((project: any, index: number) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-5 border border-primary/20 hover:from-primary/10 hover:to-primary/20 transition-all duration-300"
                >
                  <RocketLaunchIcon className="h-8 w-8 text-primary mb-3" />
                  <h3 className="text-base font-bold text-primary mb-2">{project.title}</h3>
                  <p className="text-xs text-dark/60 font-semibold mb-2">{project.tools}</p>
                  <p className="text-sm text-dark/70">{project.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Industry Workflow Alignment */}
        {config?.workflowHeading && (
          <div className="mb-20">
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-8 md:p-12 border border-primary/20">
              <div className="flex items-center justify-center mb-6">
                <CogIcon className="h-12 w-12 text-primary" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-primary mb-6 text-center">
                {config.workflowHeading}
              </h2>
              <p className="text-dark/70 text-base md:text-lg leading-relaxed max-w-4xl mx-auto text-center">
                {config.workflowContent}
              </p>
            </div>
          </div>
        )}

        {/* Industry Benefits */}
        {config?.benefits && config.benefits.length > 0 && (
          <div className="mb-20">
            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-8 text-center">Industry Benefits for Students</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {config.benefits.sort((a: any, b: any) => a.order - b.order).map((benefit: any, index: number) => (
                <div
                  key={index}
                  className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-primary/10"
                >
                  <CheckCircleIcon className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-lg font-bold text-primary mb-3">{benefit.title}</h3>
                  <p className="text-dark/70 text-sm leading-relaxed">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Companies Section */}
        {config?.companiesHeading && (
          <div className="mb-20">
            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-8 text-center">
              {config.companiesHeading}
            </h2>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-8 md:p-12 border border-primary/10">
              <p className="text-dark/70 text-base md:text-lg leading-relaxed text-center max-w-4xl mx-auto mb-6">
                {config.companiesDescription}
              </p>
              {config.companyCategories && config.companyCategories.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
                  {config.companyCategories.sort((a: any, b: any) => a.order - b.order).map((category: any, index: number) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircleIcon className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                      <p className="text-dark/70 text-sm">
                        <strong>{category.title}</strong> {category.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Final CTA */}
        {config?.ctaHeading && (
          <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-8 md:p-12 text-white text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">{config.ctaHeading}</h2>
            <p className="text-lg leading-relaxed max-w-3xl mx-auto mb-8">
              {config.ctaDescription}
            </p>
            <button
              onClick={() => window.location.href = config.ctaButtonLink || '/courses'}
              className="bg-white text-primary px-8 py-4 rounded-lg font-semibold text-lg hover:bg-light/90 transition-all duration-300 transform hover:scale-105"
            >
              {config.ctaButtonText || 'Start Your Journey Today'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Industry
