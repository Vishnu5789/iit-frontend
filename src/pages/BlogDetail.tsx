import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ClockIcon, CalendarIcon, UserIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
import { API_BASE_URL } from '../config/api.config'
import MarkdownRenderer from '../components/MarkdownRenderer'

interface Blog {
  _id: string
  title: string
  category: string
  summary: string
  content: string
  readTime: string
  publishedDate: string
  author?: {
    fullName: string
    email: string
  }
}

export default function BlogDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [blog, setBlog] = useState<Blog | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchBlog()
  }, [id])

  const fetchBlog = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${API_BASE_URL}/blogs/${id}`)
      const data = await response.json()
      if (data.success) {
        setBlog(data.data)
      } else {
        setError('Blog not found')
      }
    } catch (error) {
      console.error('Error fetching blog:', error)
      setError('Failed to load blog')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="pt-28 md:pt-32 lg:pt-36 px-4 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-dark/60">Loading article...</p>
        </div>
      </div>
    )
  }

  if (error || !blog) {
    return (
      <div className="pt-28 md:pt-32 lg:pt-36 px-4 min-h-screen">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-lg text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/blog')}
            className="text-primary hover:text-primary/80 font-semibold"
          >
            ← Back to Blog
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-28 md:pt-32 lg:pt-36 px-4 min-h-screen bg-gradient-to-br from-primary/5 via-white to-secondary/5">
      <div className="max-w-4xl mx-auto pb-16">
        {/* Back Button */}
        <button
          onClick={() => navigate('/blog')}
          className="mb-6 text-primary hover:text-primary/80 flex items-center gap-2 font-semibold transition-all"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          Back to Blog
        </button>

        {/* Article Content */}
        <article className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-primary/10 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-primary/80 text-white p-8 md:p-12">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-white/20 text-white text-sm font-semibold px-4 py-1 rounded-full">
                {blog.category}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
              {blog.title}
            </h1>
            <div className="flex flex-wrap gap-4 md:gap-6 text-white/90">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                <span>{new Date(blog.publishedDate).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
              <div className="flex items-center gap-2">
                <ClockIcon className="h-5 w-5" />
                <span>{blog.readTime}</span>
              </div>
              {blog.author && (
                <div className="flex items-center gap-2">
                  <UserIcon className="h-5 w-5" />
                  <span>{blog.author.fullName}</span>
                </div>
              )}
            </div>
          </div>

          {/* Summary */}
          <div className="p-8 md:p-12 border-b border-gray-200 bg-primary/5">
            <p className="text-lg md:text-xl text-dark/80 leading-relaxed italic">
              {blog.summary}
            </p>
          </div>

          {/* Main Content */}
          <div className="p-8 md:p-12">
            <MarkdownRenderer content={blog.content} />
          </div>
        </article>

        {/* Back to Blog CTA */}
        <div className="mt-12 text-center">
          <button
            onClick={() => navigate('/blog')}
            className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-all duration-300 transform hover:scale-105"
          >
            Read More Articles
          </button>
        </div>
      </div>
    </div>
  )
}

