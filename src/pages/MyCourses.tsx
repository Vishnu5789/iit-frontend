import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AcademicCapIcon, ClockIcon, SignalIcon } from '@heroicons/react/24/outline'
import apiService from '../services/api'

interface Course {
  _id: string
  title: string
  description: string
  thumbnail: {
    url: string
  }
  duration: string
  level: string
  category: string
  price: number
  discountPrice: number
  createdAt: string
}

export default function MyCourses() {
  const navigate = useNavigate()
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check if user is authenticated
    if (!apiService.isAuthenticated()) {
      navigate('/login')
      return
    }

    fetchEnrolledCourses()
  }, [navigate])

  const fetchEnrolledCourses = async () => {
    try {
      setIsLoading(true)
      const response = await apiService.getEnrolledCourses()
      
      if (response.success) {
        setCourses(response.data)
      } else {
        setError(response.message || 'Failed to fetch enrolled courses')
      }
    } catch (err: any) {
      console.error('Error fetching enrolled courses:', err)
      setError(err.message || 'Failed to fetch enrolled courses')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCourseClick = (courseId: string) => {
    navigate(`/course-player/${courseId}`)
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner':
        return 'bg-green-100 text-green-800'
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-800'
      case 'Advanced':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }

  if (isLoading) {
    return (
      <div className="pt-28 md:pt-32 lg:pt-36 px-4 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your courses...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="pt-28 md:pt-32 lg:pt-36 px-4 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800">{error}</p>
            <button
              onClick={fetchEnrolledCourses}
              className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-28 md:pt-32 lg:pt-36 px-4 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto pb-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-dark mb-2">My Courses</h1>
          <p className="text-gray-600">
            {courses.length === 0 
              ? 'You haven\'t enrolled in any courses yet.' 
              : `You have ${courses.length} course${courses.length > 1 ? 's' : ''} enrolled.`}
          </p>
        </div>

        {/* Empty State */}
        {courses.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <AcademicCapIcon className="w-24 h-24 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No courses yet</h3>
            <p className="text-gray-600 mb-6">
              Start learning today! Browse our courses and find one that's perfect for you.
            </p>
            <button
              onClick={() => navigate('/courses')}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition font-semibold"
            >
              Browse Courses
            </button>
          </div>
        ) : (
          /* Courses Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div
                key={course._id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                onClick={() => handleCourseClick(course._id)}
              >
                {/* Course Thumbnail */}
                <div className="relative h-48 bg-gray-200">
                  {course.thumbnail?.url ? (
                    <img
                      src={course.thumbnail.url}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <AcademicCapIcon className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getLevelColor(course.level)}`}>
                      {course.level}
                    </span>
                  </div>
                </div>

                {/* Course Info */}
                <div className="p-6">
                  <div className="mb-3">
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                      {course.category}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-dark mb-2 line-clamp-2">
                    {course.title}
                  </h3>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {course.description}
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <ClockIcon className="w-4 h-4" />
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <SignalIcon className="w-4 h-4" />
                      <span>{course.level}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <button className="w-full py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition font-semibold">
                      Continue Learning
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

