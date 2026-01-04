import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { NewspaperIcon, EnvelopeIcon, ArrowRightIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { API_BASE_URL } from '../config/api.config'
import toast from 'react-hot-toast'
import apiService from '../services/api'

interface Blog {
  _id: string
  title: string
  category: string
  summary: string
  content: string
  readTime: string
  publishedDate: string
  thumbnail?: {
    url: string
    fileId: string
  }
  image?: {
    url: string
    fileId: string
  }
  images?: Array<{
    url: string
    fileId: string
  }>
}

const categoryDescriptions: { [key: string]: string } = {
  "CAD": "Master computer-aided design tools, techniques, and workflows",
  "CAE": "Dive into analysis, simulation, and validation methods",
  "Mechanical Engineering": "Core concepts, applications, and industry practices",
  "Electrical/PCB Design": "Electronics design, circuit boards, and embedded systems",
  "Product Design": "From concept to manufacturing-ready products",
  "Industry 4.0": "Smart manufacturing, automation, and digital transformation"
}

const Blog = () => {
  const navigate = useNavigate()
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [email, setEmail] = useState('')
  const [isSubscribing, setIsSubscribing] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)

  // Get unique categories from blogs
  const categories = Array.from(new Set(blogs.map(blog => blog.category)))
    .map(cat => ({
      name: cat,
      description: categoryDescriptions[cat] || `${cat} articles and insights`
    }))

  useEffect(() => {
    fetchBlogs()
  }, [])

  const fetchBlogs = async (category?: string) => {
    try {
      setIsLoading(true)
      const url = category 
        ? `${API_BASE_URL}/blogs?category=${encodeURIComponent(category)}`
        : `${API_BASE_URL}/blogs`
      const response = await fetch(url)
      const data = await response.json()
      if (data.success) {
        setBlogs(data.data)
      }
    } catch (error) {
      console.error('Error fetching blogs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCategoryClick = (categoryName: string) => {
    if (selectedCategory === categoryName) {
      // If same category clicked, show all
      setSelectedCategory('')
      fetchBlogs()
    } else {
      setSelectedCategory(categoryName)
      fetchBlogs(categoryName)
    }
  }

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address')
      return
    }

    try {
      setIsSubscribing(true)
      const response = await apiService.subscribeToBlog(email)
      
      if (response.success) {
        toast.success(response.message || 'Successfully subscribed to our newsletter!')
        setIsSubscribed(true)
        setEmail('')
      } else {
        toast.error(response.message || 'Failed to subscribe')
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to subscribe. Please try again.')
    } finally {
      setIsSubscribing(false)
    }
  }

  return (
    <div className="pt-28 md:pt-32 lg:pt-36 px-4 min-h-screen">
      <div className="max-w-7xl mx-auto mb-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-4">
            <NewspaperIcon className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-6">
            Engineering Design Blog
          </h1>
          <p className="text-lg md:text-xl text-dark/80 max-w-4xl mx-auto">
            Insights, Tutorials & Industry Trends
          </p>
          <div className="max-w-4xl mx-auto mt-6">
            <p className="text-base md:text-lg text-dark/70 leading-relaxed">
              Welcome to the Isaac Institute of Technology blog—your go-to resource for cutting-edge insights, practical tutorials, and career-shaping knowledge in engineering design. Whether you're mastering CAD software, exploring simulation techniques, or staying updated on industry innovations, we deliver content that matters. Our articles are crafted by industry professionals and educators who understand both the technical depths and real-world applications of engineering tools. From beginner-friendly guides to advanced techniques, we're here to accelerate your learning journey and keep you ahead of the curve.
            </p>
          </div>
        </div>

        {/* Categories */}
        {categories.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-8 text-center">Browse by Category</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <button
                onClick={() => handleCategoryClick('')}
                className={`text-left rounded-xl p-5 border transition-all duration-300 group ${
                  selectedCategory === ''
                    ? 'bg-primary text-white border-primary'
                    : 'bg-gradient-to-br from-primary/10 to-primary/5 hover:from-primary hover:to-primary/90 hover:text-white border-primary/20'
                }`}
              >
                <h3 className={`text-lg font-bold mb-2 ${selectedCategory === '' ? 'text-white' : 'text-primary group-hover:text-white'}`}>All Categories</h3>
                <p className={`text-sm ${selectedCategory === '' ? 'text-white/90' : 'text-dark/70 group-hover:text-white/90'}`}>View all blog posts</p>
              </button>
              {categories.map((category, index) => (
                <button
                  key={index}
                  onClick={() => handleCategoryClick(category.name)}
                  className={`text-left rounded-xl p-5 border transition-all duration-300 group ${
                    selectedCategory === category.name
                      ? 'bg-primary text-white border-primary'
                      : 'bg-gradient-to-br from-primary/10 to-primary/5 hover:from-primary hover:to-primary/90 hover:text-white border-primary/20'
                  }`}
                >
                  <h3 className={`text-lg font-bold mb-2 ${selectedCategory === category.name ? 'text-white' : 'text-primary group-hover:text-white'}`}>{category.name}</h3>
                  <p className={`text-sm ${selectedCategory === category.name ? 'text-white/90' : 'text-dark/70 group-hover:text-white/90'}`}>{category.description}</p>
                </button>
              ))}
            </div>
            {selectedCategory && (
              <div className="mt-4 text-center">
                <p className="text-medium">
                  Showing blogs in category: <span className="font-semibold text-primary">{selectedCategory}</span>
                  <button
                    onClick={() => handleCategoryClick('')}
                    className="ml-2 text-primary hover:underline"
                  >
                    (Clear filter)
                  </button>
                </p>
              </div>
            )}
          </div>
        )}

        {/* Featured Articles */}
        <div className="mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-primary mb-8 text-center">
            {selectedCategory ? `${selectedCategory} Articles` : 'Featured Articles'}
          </h2>
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-lg text-dark/60">Loading blog posts...</p>
            </div>
          ) : blogs.length === 0 ? (
            <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-primary/10">
              <p className="text-lg text-dark/60">No blog posts available yet. Check back soon for exciting content!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {blogs.map((blog) => (
                <div
                  key={blog._id}
                  onClick={() => navigate(`/blog/${blog._id}`)}
                  className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-primary/10 hover:shadow-xl hover:scale-[1.01] transition-all duration-300 cursor-pointer"
                >
                  {(blog.thumbnail?.url || blog.image?.url) && (
                    <div className="w-full h-64 md:h-80 overflow-hidden">
                      <img 
                        src={blog.thumbnail?.url || blog.image?.url} 
                        alt={blog.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-6 md:p-8">
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <span className="bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full">
                        {blog.category}
                      </span>
                      <span className="text-sm text-dark/60">
                        {new Date(blog.publishedDate).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </span>
                      <span className="text-sm text-dark/60">•</span>
                      <span className="text-sm text-dark/60">{blog.readTime}</span>
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-primary mb-4 hover:text-primary/80 transition-colors">
                      {blog.title}
                    </h3>
                    <p className="text-dark/70 text-sm md:text-base leading-relaxed mb-4">
                      {blog.summary}
                    </p>
                    <button className="text-primary font-semibold text-sm flex items-center gap-2 hover:gap-3 transition-all duration-300">
                      Read Full Article
                      <ArrowRightIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Why Follow Our Blog */}
        <div className="mb-16">
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl p-8 md:p-12 border border-primary/20">
            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-6 text-center">Why Follow Our Blog</h2>
            <p className="text-dark/70 text-base md:text-lg leading-relaxed max-w-4xl mx-auto text-center">
              Engineering isn't static—new tools emerge, industry standards evolve, and career opportunities shift constantly. Our blog keeps you informed, skilled, and competitive. We don't just regurgitate software manuals or repeat generic advice. Every article is crafted by professionals who've worked in industry, taught thousands of students, and understand what actually matters for career success. We combine technical depth with practical applicability, ensuring you get actionable insights you can apply immediately. Whether you're troubleshooting a challenging project, deciding what to learn next, or staying updated on industry trends, our blog delivers value that accelerates your growth. Join thousands of engineering professionals and students who rely on our content to stay ahead.
            </p>
          </div>
        </div>

        {/* Newsletter CTA */}
        <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-8 md:p-12 text-white text-center">
          <EnvelopeIcon className="h-16 w-16 mx-auto mb-4" />
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Never Miss an Update</h2>
          <p className="text-lg mb-6 max-w-3xl mx-auto">
            Subscribe to our engineering newsletter and get the latest tutorials, industry insights, and career tips delivered directly to your inbox every week. Plus, subscribers get early access to new courses, exclusive webinars with industry experts, and special discounts. Join our community of forward-thinking engineers who are committed to continuous learning and professional excellence. Your next breakthrough insight is just one email away.
          </p>
          {isSubscribed ? (
            <div className="max-w-md mx-auto bg-white/20 rounded-lg p-6">
              <CheckCircleIcon className="h-12 w-12 mx-auto mb-3 text-white" />
              <p className="text-lg font-semibold mb-2">Thank you for subscribing!</p>
              <p className="text-sm text-white/90">We'll send you the latest blog posts and updates.</p>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="max-w-md mx-auto flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="flex-1 px-4 py-3 rounded-lg text-dark focus:outline-none focus:ring-2 focus:ring-white"
              />
              <button
                type="submit"
                disabled={isSubscribing}
                className="bg-white text-primary px-6 py-3 rounded-lg font-semibold hover:bg-light/90 transition-all duration-300 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubscribing ? 'Subscribing...' : 'Subscribe Now'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default Blog

