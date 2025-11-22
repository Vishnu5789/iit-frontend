import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { 
  PlayIcon, 
  DocumentTextIcon, 
  PhotoIcon,
  ArrowLeftIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline'
import apiService from '../services/api'

interface CourseContent {
  _id: string
  title: string
  description: string
  thumbnail: {
    url: string
  }
  duration: string
  level: string
  category: string
  videoFiles: Array<{
    _id: string
    name: string
    url: string
    duration?: string
    description?: string
    uploadedAt: string
  }>
  pdfFiles: Array<{
    _id: string
    name: string
    url: string
    uploadedAt: string
  }>
  images: Array<{
    _id: string
    url: string
    uploadedAt: string
  }>
  sampleVideos: Array<{
    _id: string
    name: string
    url: string
    duration?: string
    description?: string
    uploadedAt: string
  }>
}

export default function CoursePlayer() {
  const navigate = useNavigate()
  const { courseId } = useParams<{ courseId: string }>()
  const [course, setCourse] = useState<CourseContent | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'videos' | 'pdfs' | 'images'>('videos')
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null)

  useEffect(() => {
    // Check if user is authenticated
    if (!apiService.isAuthenticated()) {
      navigate('/login')
      return
    }

    if (courseId) {
      fetchCourseContent()
    }
  }, [courseId, navigate])

  const fetchCourseContent = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await apiService.getCourseContent(courseId!)
      
      if (response.success) {
        setCourse(response.data)
        // Auto-select first video if available
        if (response.data.videoFiles?.length > 0) {
          setSelectedVideo(response.data.videoFiles[0].url)
        } else if (response.data.sampleVideos?.length > 0) {
          setSelectedVideo(response.data.sampleVideos[0].url)
        }
      } else {
        setError(response.message || 'Failed to fetch course content')
      }
    } catch (err: any) {
      console.error('Error fetching course content:', err)
      if (err.status === 403) {
        setError('You need to purchase this course to access its content.')
      } else {
        setError(err.message || 'Failed to fetch course content')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleVideoSelect = (url: string) => {
    setSelectedVideo(url)
  }

  const handleDownloadPdf = (url: string) => {
    window.open(url, '_blank')
  }

  if (isLoading) {
    return (
      <div className="pt-28 md:pt-32 lg:pt-36 px-4 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading course content...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="pt-28 md:pt-32 lg:pt-36 px-4 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate('/my-courses')}
            className="flex items-center gap-2 text-primary hover:text-primary-dark mb-6 transition"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Back to My Courses
          </button>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <LockClosedIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <p className="text-red-800 text-lg mb-4">{error}</p>
            {error.includes('purchase') && (
              <button
                onClick={() => navigate('/courses')}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
              >
                Browse Courses
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (!course) {
    return null
  }

  const allVideos = [...(course.sampleVideos || []), ...(course.videoFiles || [])]

  return (
    <div className="pt-28 md:pt-32 lg:pt-36 px-4 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto pb-12">
        {/* Back Button */}
        <button
          onClick={() => navigate('/my-courses')}
          className="flex items-center gap-2 text-primary hover:text-primary-dark mb-6 transition"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Back to My Courses
        </button>

        {/* Course Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-48 h-32 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
              {course.thumbnail?.url ? (
                <img
                  src={course.thumbnail.url}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <PlayIcon className="w-12 h-12 text-gray-400" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="mb-2">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                  {course.category}
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-dark mb-2">{course.title}</h1>
              <p className="text-gray-600 mb-3">{course.description}</p>
              <div className="flex gap-4 text-sm text-gray-500">
                <span>Duration: {course.duration}</span>
                <span>Level: {course.level}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Video Player */}
        {selectedVideo && (
          <div className="bg-black rounded-lg overflow-hidden mb-6 shadow-lg">
            <video
              key={selectedVideo}
              controls
              className="w-full aspect-video"
              src={selectedVideo}
            >
              Your browser does not support the video tag.
            </video>
          </div>
        )}

        {/* Content Tabs */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Tab Headers */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('videos')}
              className={`flex-1 px-6 py-4 font-semibold transition ${
                activeTab === 'videos'
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <PlayIcon className="w-5 h-5 inline-block mr-2" />
              Videos ({allVideos.length})
            </button>
            <button
              onClick={() => setActiveTab('pdfs')}
              className={`flex-1 px-6 py-4 font-semibold transition ${
                activeTab === 'pdfs'
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <DocumentTextIcon className="w-5 h-5 inline-block mr-2" />
              PDFs ({course.pdfFiles?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('images')}
              className={`flex-1 px-6 py-4 font-semibold transition ${
                activeTab === 'images'
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <PhotoIcon className="w-5 h-5 inline-block mr-2" />
              Images ({course.images?.length || 0})
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Videos Tab */}
            {activeTab === 'videos' && (
              <div className="space-y-3">
                {allVideos.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No videos available</p>
                ) : (
                  allVideos.map((video, index) => (
                    <div
                      key={video._id || index}
                      onClick={() => handleVideoSelect(video.url)}
                      className={`p-4 border rounded-lg cursor-pointer transition ${
                        selectedVideo === video.url
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-primary hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <PlayIcon className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-dark">{video.name}</h4>
                          {video.description && (
                            <p className="text-sm text-gray-600">{video.description}</p>
                          )}
                          {video.duration && (
                            <p className="text-xs text-gray-500 mt-1">{video.duration}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* PDFs Tab */}
            {activeTab === 'pdfs' && (
              <div className="space-y-3">
                {!course.pdfFiles || course.pdfFiles.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No PDFs available</p>
                ) : (
                  course.pdfFiles.map((pdf, index) => (
                    <div
                      key={pdf._id || index}
                      className="p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-gray-50 transition"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <DocumentTextIcon className="w-5 h-5 text-red-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-dark">{pdf.name}</h4>
                            <p className="text-xs text-gray-500">
                              Uploaded: {new Date(pdf.uploadedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDownloadPdf(pdf.url)}
                          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition text-sm font-semibold"
                        >
                          View/Download
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Images Tab */}
            {activeTab === 'images' && (
              <div>
                {!course.images || course.images.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No images available</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {course.images.map((image, index) => (
                      <div
                        key={image._id || index}
                        className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition cursor-pointer"
                        onClick={() => window.open(image.url, '_blank')}
                      >
                        <img
                          src={image.url}
                          alt={`Course image ${index + 1}`}
                          className="w-full h-48 object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

