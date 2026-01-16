import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { 
  PlayIcon, 
  DocumentTextIcon, 
  PhotoIcon,
  ArrowLeftIcon,
  LockClosedIcon,
  FolderIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline'
import apiService from '../services/api'
import ProtectedPdfViewer from '../components/ProtectedPdfViewer'
import SecureImageViewer from '../components/SecureImageViewer'

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
  mediaFolders?: Array<{
    folderName: string
    videos: Array<{ name: string; url: string; fileId: string; duration?: string }>
    pdfs: Array<{ name: string; url: string; fileId: string }>
    images: Array<{ url: string; fileId: string }>
    textContent?: Array<{ title: string; content: string }>
    externalVideoLinks?: Array<{ title: string; url: string; description?: string; platform?: string }>
  }>
}

export default function CoursePlayer() {
  const navigate = useNavigate()
  const { courseId } = useParams<{ courseId: string }>()
  const [course, setCourse] = useState<CourseContent | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'folders' | 'videos' | 'pdfs' | 'images'>('folders')
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [expandedFolders, setExpandedFolders] = useState<Set<number>>(new Set())

  // Content protection: Disable right-click, text selection, image/PDF dragging, and printing
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };

    const handleSelectStart = (e: Event) => {
      e.preventDefault();
      return false;
    };

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      return false;
    };

    // Prevent keyboard shortcuts for printing and saving PDFs/images
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent Ctrl+P / Cmd+P (Print)
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        return false;
      }
      // Prevent Ctrl+S / Cmd+S (Save)
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        return false;
      }
      // Prevent Ctrl+Shift+P / Cmd+Shift+P (Print dialog alternative)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        return false;
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('dragstart', handleDragStart);
    document.addEventListener('selectstart', handleSelectStart);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('dragstart', handleDragStart);
      document.removeEventListener('selectstart', handleSelectStart);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

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
          <div className="bg-black rounded-lg overflow-hidden mb-6 shadow-lg select-none" onContextMenu={(e) => e.preventDefault()}>
            <video
              key={selectedVideo}
              controls
              controlsList="nodownload noplaybackrate"
              disablePictureInPicture
              className="w-full aspect-video"
              src={selectedVideo}
              onContextMenu={(e) => e.preventDefault()}
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
              onClick={() => setActiveTab('folders')}
              className={`flex-1 px-6 py-4 font-semibold transition ${
                activeTab === 'folders'
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FolderIcon className="w-5 h-5 inline-block mr-2" />
              Course Content
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6 select-none" onContextMenu={(e) => e.preventDefault()}>
            {/* Folders Tab - Folder-based content organization */}
            {activeTab === 'folders' && (
              <div>
                {course.mediaFolders && course.mediaFolders.length > 0 ? (
                  <div className="space-y-4">
                    {course.mediaFolders.map((folder, folderIndex) => (
                      <div key={folderIndex} className="border border-gray-200 rounded-lg overflow-hidden">
                        {/* Folder Header */}
                        <div 
                          className="bg-primary/10 px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-primary/15 transition-colors"
                          onClick={() => {
                            const newExpanded = new Set(expandedFolders)
                            if (newExpanded.has(folderIndex)) {
                              newExpanded.delete(folderIndex)
                            } else {
                              newExpanded.add(folderIndex)
                            }
                            setExpandedFolders(newExpanded)
                          }}
                        >
                          <div className="flex items-center gap-3">
                            {expandedFolders.has(folderIndex) ? (
                              <ChevronUpIcon className="h-5 w-5 text-primary" />
                            ) : (
                              <ChevronDownIcon className="h-5 w-5 text-primary" />
                            )}
                            <FolderIcon className="h-6 w-6 text-primary" />
                            <span className="font-bold text-lg text-dark">{folder.folderName}</span>
                            <span className="text-sm text-gray-600">
                              ({folder.videos.length} videos, {folder.pdfs.length} PDFs, {folder.images.length} images
                              {folder.textContent && folder.textContent.length > 0 && `, ${folder.textContent.length} text sections`}
                              {folder.externalVideoLinks && folder.externalVideoLinks.length > 0 && `, ${folder.externalVideoLinks.length} external videos`})
                            </span>
                          </div>
                        </div>

                        {/* Folder Content */}
                        {expandedFolders.has(folderIndex) && (
                          <div className="bg-white p-4 space-y-4">
                            {/* Videos in Folder */}
                            {folder.videos.length > 0 && (
                              <div>
                                <h4 className="text-md font-semibold text-dark mb-2 flex items-center gap-2">
                                  <PlayIcon className="h-5 w-5 text-primary" />
                                  Videos ({folder.videos.length})
                                </h4>
                                <div className="space-y-2">
                                  {folder.videos.map((video, videoIndex) => (
                    <div
                                      key={videoIndex}
                      onClick={() => handleVideoSelect(video.url)}
                                      className={`p-3 border rounded-lg cursor-pointer transition ${
                        selectedVideo === video.url
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-primary hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                                          <PlayIcon className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1">
                                          <h5 className="font-semibold text-dark text-sm">{video.name}</h5>
                          {video.duration && (
                            <p className="text-xs text-gray-500 mt-1">{video.duration}</p>
                          )}
                        </div>
                      </div>
                    </div>
                                  ))}
                                </div>
              </div>
            )}

                            {/* PDFs in Folder */}
                            {folder.pdfs.length > 0 && (
                              <div>
                                <h4 className="text-md font-semibold text-dark mb-2 flex items-center gap-2">
                                  <DocumentTextIcon className="h-5 w-5 text-primary" />
                                  PDFs ({folder.pdfs.length})
                                </h4>
              <div className="space-y-3">
                                  {folder.pdfs.map((pdf, pdfIndex) => (
                    <div
                                      key={pdfIndex}
                                      className="border border-gray-200 rounded-lg overflow-hidden"
                    >
                                      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                                        <p className="font-semibold text-gray-900 text-sm">{pdf.name}</p>
                          </div>
                                      <ProtectedPdfViewer 
                                        pdfUrl={pdf.url}
                                        pdfName={pdf.name}
                                        height="500px"
                                      />
                        </div>
                                  ))}
                      </div>
              </div>
            )}

                            {/* Images in Folder */}
                            {folder.images.length > 0 && (
              <div>
                                <h4 className="text-md font-semibold text-dark mb-2 flex items-center gap-2">
                                  <PhotoIcon className="h-5 w-5 text-primary" />
                                  Images ({folder.images.length})
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                  {folder.images.map((image, imageIndex) => (
                      <div
                                      key={imageIndex}
                        className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition cursor-pointer"
                                      onClick={() => setSelectedImage(image.url)}
                                      onDragStart={(e) => e.preventDefault()}
                      >
                        <img
                          src={image.url}
                                        alt={`${folder.folderName} image ${imageIndex + 1}`}
                                        className="w-full h-40 object-cover pointer-events-none"
                                        draggable={false}
                                        onContextMenu={(e) => e.preventDefault()}
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Text Content in Folder */}
                            {folder.textContent && folder.textContent.length > 0 && (
                              <div>
                                <h4 className="text-md font-semibold text-dark mb-2 flex items-center gap-2">
                                  <DocumentTextIcon className="h-5 w-5 text-primary" />
                                  Text Content ({folder.textContent.length})
                                </h4>
                                <div className="space-y-4">
                                  {folder.textContent.map((text, textIndex) => (
                                    <div key={textIndex} className="border border-gray-200 rounded-lg p-4 bg-white">
                                      <h5 className="font-bold text-lg text-dark mb-3">{text.title}</h5>
                                      <div 
                                        className="prose prose-sm max-w-none text-gray-700"
                                        dangerouslySetInnerHTML={{ __html: text.content }}
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* External Video Links in Folder */}
                            {folder.externalVideoLinks && folder.externalVideoLinks.length > 0 && (
                              <div>
                                <h4 className="text-md font-semibold text-dark mb-2 flex items-center gap-2">
                                  <PlayIcon className="h-5 w-5 text-primary" />
                                  External Videos ({folder.externalVideoLinks.length})
                                </h4>
                                <div className="space-y-3">
                                  {folder.externalVideoLinks.map((video, videoIndex) => (
                                    <div key={videoIndex} className="border border-gray-200 rounded-lg p-4 bg-white">
                                      <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1">
                                          <h5 className="font-bold text-dark mb-1">{video.title}</h5>
                                          {video.description && (
                                            <p className="text-sm text-gray-600 mb-2">{video.description}</p>
                                          )}
                                          {video.platform && (
                                            <span className="inline-block px-2 py-1 bg-primary/10 text-primary text-xs rounded mb-2">
                                              {video.platform}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      <a
                                        href={video.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 mt-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition text-sm font-semibold"
                                      >
                                        <PlayIcon className="h-4 w-4" />
                                        Watch Video
                                      </a>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {folder.videos.length === 0 && folder.pdfs.length === 0 && folder.images.length === 0 && 
                             (!folder.textContent || folder.textContent.length === 0) && 
                             (!folder.externalVideoLinks || folder.externalVideoLinks.length === 0) && (
                              <p className="text-gray-500 text-center py-4">This folder is empty.</p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No course content available yet.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Secure Image Viewer - Canvas-based with watermarks */}
      {selectedImage && (
        <SecureImageViewer
          imageUrl={selectedImage}
          imageName="Course Image"
          onClose={() => setSelectedImage(null)}
        />
      )}
    </div>
  )
}

