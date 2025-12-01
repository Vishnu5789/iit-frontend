import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { BuildingOfficeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
import { API_BASE_URL } from '../config/api.config'
import MarkdownRenderer from '../components/MarkdownRenderer'

interface Industry {
  _id: string
  name: string
  description: string
  icon: string
  order: number
  isActive: boolean
  createdBy?: {
    fullName: string
    email: string
  }
  createdAt: string
  updatedAt: string
}

export default function IndustryDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [industry, setIndustry] = useState<Industry | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchIndustry()
  }, [id])

  const fetchIndustry = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${API_BASE_URL}/industries/${id}`)
      const data = await response.json()
      if (data.success) {
        setIndustry(data.data)
      } else {
        setError('Industry not found')
      }
    } catch (error) {
      console.error('Error fetching industry:', error)
      setError('Failed to load industry information')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="pt-28 md:pt-32 lg:pt-36 px-4 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-dark/60">Loading industry information...</p>
        </div>
      </div>
    )
  }

  if (error || !industry) {
    return (
      <div className="pt-28 md:pt-32 lg:pt-36 px-4 min-h-screen">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-lg text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/industry')}
            className="text-primary hover:text-primary/80 font-semibold"
          >
            ← Back to Industries
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-28 md:pt-32 lg:pt-36 px-4 min-h-screen bg-gradient-to-br from-primary/5 via-white to-secondary/5">
      <div className="max-w-5xl mx-auto pb-16">
        {/* Back Button */}
        <button
          onClick={() => navigate('/industry')}
          className="mb-6 text-primary hover:text-primary/80 flex items-center gap-2 font-semibold transition-all"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          Back to Industries
        </button>

        {/* Industry Content */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-primary/10 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-primary/80 text-white p-8 md:p-12">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 bg-white/20 rounded-xl">
                <BuildingOfficeIcon className="h-12 w-12 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                  {industry.name}
                </h1>
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="p-8 md:p-12">
            <h2 className="text-2xl font-bold text-primary mb-6 flex items-center gap-3">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              About This Industry
            </h2>
            <MarkdownRenderer content={industry.description} />
          </div>

          {/* Related Information */}
          <div className="bg-gray-50 p-8 md:p-12 border-t border-gray-200">
            <h2 className="text-2xl font-bold text-primary mb-6">Related Courses</h2>
            <p className="text-dark/70 leading-relaxed mb-6">
              Explore our specialized courses designed to prepare you for a career in {industry.name}. 
              Our industry-aligned curriculum ensures you gain practical skills and knowledge that employers value.
            </p>
            <button
              onClick={() => navigate('/courses')}
              className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Browse Courses
            </button>
          </div>

          {/* Why Choose Us Section */}
          <div className="p-8 md:p-12">
            <h2 className="text-2xl font-bold text-primary mb-6">Why Study {industry.name} with Us?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-dark mb-2">Industry-Relevant Skills</h3>
                  <p className="text-dark/70 text-sm">
                    Learn the exact tools and techniques used by professionals in this field
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-dark mb-2">Expert Instructors</h3>
                  <p className="text-dark/70 text-sm">
                    Learn from professionals with real-world experience in the industry
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-dark mb-2">Hands-On Projects</h3>
                  <p className="text-dark/70 text-sm">
                    Build a portfolio of real-world projects that showcase your skills
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-dark mb-2">Career Support</h3>
                  <p className="text-dark/70 text-sm">
                    Get guidance and resources to launch your career in this industry
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Industries CTA */}
        <div className="mt-12 text-center">
          <button
            onClick={() => navigate('/industry')}
            className="text-primary hover:text-primary/80 font-semibold transition-all"
          >
            ← Explore More Industries
          </button>
        </div>
      </div>
    </div>
  )
}

