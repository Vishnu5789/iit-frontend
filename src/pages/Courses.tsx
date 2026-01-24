import { useEffect, useState } from 'react'
import { 
  AcademicCapIcon, 
  ClockIcon, 
  ChartBarIcon, 
  CheckCircleIcon, 
  ArrowRightIcon,
  PhoneIcon,
  EnvelopeIcon,
  ShoppingCartIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline'
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/solid'
import { useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../config/api.config'
import apiService from '../services/api'
import toast from 'react-hot-toast'

interface Course {
  _id: string
  title: string
  description: string
  duration: string
  level: string
  category: string
  price?: number
  discountPrice?: number
  thumbnail?: {
    url: string
    fileId: string
  }
}

interface CoursePageConfig {
  heroTitle: string
  heroDescription: string
  whoShouldEnroll: Array<{ title: string; description: string }>
  whatYouWillLearn: Array<{ point: string }>
  whyChooseUs: Array<{ title: string; description: string }>
  faqs: Array<{ question: string; answer: string }>
}

const Courses = () => {
  const navigate = useNavigate()
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('All Programs')
  const [coursePageConfig, setCoursePageConfig] = useState<CoursePageConfig | null>(null)
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(null)

  useEffect(() => {
    fetchCourses()
    fetchCoursePageConfig()
  }, [])

  const fetchCoursePageConfig = async () => {
    try {
      const response = await apiService.getCoursePageConfig()
      if (response.success && response.data) {
        setCoursePageConfig(response.data)
      }
    } catch (error) {
      console.error('Error fetching course page config:', error)
    }
  }

  const fetchCourses = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/courses`)
      const data = await response.json()
      if (data.success) {
        setCourses(data.data)
      }
    } catch (error) {
      console.error('Error fetching courses:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddToCart = async (e: React.MouseEvent, courseId: string) => {
    e.stopPropagation()
    
    if (!apiService.isAuthenticated()) {
      toast.error('Please login to add courses to cart')
      navigate('/login', { state: { from: '/courses' } })
      return
    }

    try {
      const response = await apiService.addToCart(courseId)
      if (response.success) {
        toast.success('Course added to cart!')
      }
    } catch (error: any) {
      if (error.message?.includes('already in cart')) {
        toast.error('This course is already in your cart')
      } else if (error.message?.includes('already enrolled') || error.message?.includes('enrolled in this course')) {
        toast.error('You are already enrolled in this course')
      } else {
        toast.error(error.message || 'Failed to add course to cart')
      }
    }
  }

  const formatPrice = (price?: number, discountPrice?: number) => {
    if (!price || price === 0) {
      return 'Free'
    }
    
    const finalPrice = discountPrice && discountPrice > 0 ? discountPrice : price
    return `₹${finalPrice.toLocaleString('en-IN')}`
  }

  const filteredCourses = selectedCategory === 'All Programs' 
    ? courses 
    : courses.filter(course => course.category === selectedCategory);

  const categories = ['All Programs', ...Array.from(new Set(courses.map(c => c.category)))];

  return (
    <div className="pt-28 md:pt-32 lg:pt-36 px-4 min-h-screen bg-light">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto mb-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-6">
            Engineering Design Courses
          </h1>
          <p className="text-lg md:text-xl text-dark/80 font-medium mb-4">
            {coursePageConfig?.heroTitle || 'Master Industry-Standard CAD, CAE & Engineering Tools'}
          </p>
          <div className="max-w-4xl mx-auto">
            <p className="text-base md:text-lg text-dark/70 leading-relaxed whitespace-pre-line">
              {coursePageConfig?.heroDescription || 'In today\'s competitive engineering landscape, proficiency in design and simulation software is no longer optional—it\'s essential. Whether you\'re developing innovative products, analyzing complex systems, or bringing ideas to life, mastering industry-standard engineering tools gives you a decisive edge.'}
            </p>
          </div>
        </div>

        {/* Filter Dropdown */}
        <div className="mb-8 flex justify-center">
          <div className="relative w-full max-w-2xl">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-6 py-4 bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-primary/20 rounded-full text-lg font-medium text-dark appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              style={{ paddingRight: '3rem' }}
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="h-6 w-6 text-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="mb-20">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-lg text-dark/60">Loading courses...</p>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-lg">
              <p className="text-lg text-dark/60">No courses available in this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCourses.map((course) => (
                <div
                  key={course._id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 group flex flex-col h-full"
                >
                  {/* Course Image - Fixed Height */}
                  <div 
                    className="w-full h-56 overflow-hidden bg-gray-100 flex-shrink-0 cursor-pointer"
                    onClick={() => navigate(`/courses/${course._id}`)}
                  >
                    {course.thumbnail?.url ? (
                      <img 
                        src={course.thumbnail.url} 
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                        <AcademicCapIcon className="h-20 w-20 text-primary/40" />
                      </div>
                    )}
                  </div>
                  
                  {/* Course Content - Flexible Height */}
                  <div className="bg-gradient-to-r from-[#1a1f71] to-[#2d3192] p-6 flex-grow flex flex-col">
                    <h3 
                      className="text-xl font-bold text-white mb-4 h-[3.5rem] line-clamp-2 cursor-pointer"
                      onClick={() => navigate(`/courses/${course._id}`)}
                    >
                      {course.title}
                    </h3>
                    
                    {/* Course Details */}
                    <div className="space-y-2 mt-auto">
                      <div className="flex items-center gap-2 text-white/90">
                        <ClockIcon className="h-5 w-5 text-[#f4e500]" />
                        <span className="text-sm">{course.duration}</span>
                      </div>
                      <div className="flex items-center gap-2 text-white/90">
                        <ChartBarIcon className="h-5 w-5 text-[#f4e500]" />
                        <span className="text-sm">{course.level}</span>
                      </div>
                      
                      {/* Price */}
                      <div className="flex items-center gap-2 pt-2">
                        {course.discountPrice && course.discountPrice > 0 && course.discountPrice < (course.price || 0) ? (
                          <>
                            <span className="text-2xl font-bold text-[#f4e500]">
                              {formatPrice(course.price, course.discountPrice)}
                            </span>
                            <span className="text-sm text-white/60 line-through">
                              ₹{course.price?.toLocaleString('en-IN')}
                            </span>
                          </>
                        ) : (
                          <span className="text-2xl font-bold text-[#f4e500]">
                            {formatPrice(course.price, course.discountPrice)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons - Fixed at Bottom */}
                  <div className="bg-white px-4 py-3 flex-shrink-0 flex gap-2">
                    <button 
                      className="flex-1 bg-[#f4e500] text-dark font-bold py-3 px-4 rounded-lg hover:bg-[#e0d400] transition-all flex items-center justify-center gap-2"
                      onClick={(e) => handleAddToCart(e, course._id)}
                    >
                      <ShoppingCartIcon className="h-5 w-5" />
                      <span>Add to Cart</span>
                    </button>
                    <button 
                      className="bg-primary text-white font-semibold py-3 px-4 rounded-lg hover:bg-primary-dark transition-all"
                      onClick={() => navigate(`/courses/${course._id}`)}
                      title="View Details"
                    >
                      <ArrowRightIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Who Should Enroll */}
        {coursePageConfig && coursePageConfig.whoShouldEnroll.length > 0 && (
          <div className="mb-20">
            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-8 text-center">Who Should Enroll</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {coursePageConfig.whoShouldEnroll.map((item, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-6 border border-primary/20"
                >
                  <h3 className="text-lg font-bold text-primary mb-2">{item.title}</h3>
                  <p className="text-dark/70 text-sm">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* What You Will Learn */}
        {coursePageConfig && coursePageConfig.whatYouWillLearn.length > 0 && (
          <div className="mb-20">
            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-8 text-center">What You Will Learn</h2>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-8 border border-primary/10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {coursePageConfig.whatYouWillLearn.map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircleIcon className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-dark/70 text-sm">{item.point}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Why Choose Us */}
        {coursePageConfig && coursePageConfig.whyChooseUs.length > 0 && (
          <div className="mb-20">
            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-8 text-center">Why Choose Us</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {coursePageConfig.whyChooseUs.map((item, index) => (
                <div
                  key={index}
                  className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-primary/10 hover:shadow-xl transition-all duration-300"
                >
                  <h3 className="text-lg font-bold text-primary mb-3">{item.title}</h3>
                  <p className="text-dark/70 text-sm leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FAQ */}
        {coursePageConfig && coursePageConfig.faqs.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-8 text-center">Frequently Asked Questions</h2>
            <div className="max-w-4xl mx-auto space-y-4">
              {coursePageConfig.faqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-primary/10 overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedFaqIndex(expandedFaqIndex === index ? null : index)}
                    className="w-full flex items-center justify-between p-6 hover:bg-primary/5 transition-colors text-left"
                  >
                    <h3 className="text-lg font-bold text-primary pr-4">{faq.question}</h3>
                    {expandedFaqIndex === index ? (
                      <ChevronUpIcon className="h-6 w-6 text-primary flex-shrink-0" />
                    ) : (
                      <ChevronDownIcon className="h-6 w-6 text-primary flex-shrink-0" />
                    )}
                  </button>
                  {expandedFaqIndex === index && (
                    <div className="px-6 pb-6 border-t border-primary/10">
                      <p className="text-dark/70 text-sm leading-relaxed whitespace-pre-line pt-4">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="text-center bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-12 text-white">
          <AcademicCapIcon className="h-16 w-16 mx-auto mb-4" />
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Start Your Journey?</h2>
          <p className="text-lg mb-6 max-w-2xl mx-auto">
            Join thousands of engineers who have transformed their careers with our industry-leading courses.
          </p>
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-light/90 transition-all duration-300 transform hover:scale-105"
          >
            Explore Courses
          </button>
        </div>
      </div>

      {/* Fixed Contact Icons */}
      <div className="fixed right-6 bottom-6 flex flex-col gap-3 z-50">
        <a
          href="https://wa.me/"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110"
          title="WhatsApp"
        >
          <ChatBubbleLeftRightIcon className="h-6 w-6" />
        </a>
        <a
          href="tel:"
          className="bg-primary text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110"
          title="Call Us"
        >
          <PhoneIcon className="h-6 w-6" />
        </a>
        <a
          href="mailto:"
          className="bg-accent text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110"
          title="Email Us"
        >
          <EnvelopeIcon className="h-6 w-6" />
        </a>
      </div>
    </div>
  )
}

export default Courses

