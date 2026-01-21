import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon, FolderIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'
import apiService from '../../services/api'
import FileUpload from '../../components/FileUpload'
import RichTextEditor from '../../components/RichTextEditor'
import { API_BASE_URL } from '../../config/api.config'

interface Course {
  _id: string
  title: string
  description: string
  syllabus?: {
    url: string
    fileId: string
    name: string
  }
  duration: string
  level: string
  category: string
  price?: number
  discountPrice?: number
  isActive: boolean
  thumbnail?: {
    url: string
    fileId: string
  }
  sampleVideos?: Array<{
    name: string
    url: string
    fileId: string
    description?: string
  }>
  pdfFiles?: Array<{
    name: string
    url: string
    fileId: string
  }>
  videoFiles?: Array<{
    name: string
    url: string
    fileId: string
  }>
  images?: Array<{
    url: string
    fileId: string
  }>
  textContent?: Array<{
    title: string
    content: string
  }>
  externalVideoLinks?: Array<{
    title: string
    url: string
    description?: string
    platform?: string
  }>
  keyPoints?: string[]
  aboutCourse?: string
  eligibility?: string[]
  objectives?: string[]
  mediaFolders?: Array<{
    folderName: string
    videos: Array<{ name: string; url: string; fileId: string; duration?: string }>
    pdfs: Array<{ name: string; url: string; fileId: string }>
    images: Array<{ url: string; fileId: string }>
    textContent: Array<{ title: string; content: string }>
    externalVideoLinks: Array<{ title: string; url: string; description?: string; platform?: string }>
  }>
}

const ManageCourses = () => {
  const navigate = useNavigate()
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    syllabus: { url: '', fileId: '', name: '' },
    duration: '',
    level: 'Beginner',
    category: 'CAD',
    price: 0,
    discountPrice: 0,
    isActive: true,
    thumbnail: { url: '', fileId: '' },
    sampleVideos: [] as Array<{ name: string; url: string; fileId: string; description?: string }>,
    pdfFiles: [] as Array<{ name: string; url: string; fileId: string }>,
    videoFiles: [] as Array<{ name: string; url: string; fileId: string }>,
    images: [] as Array<{ url: string; fileId: string }>,
    mediaFolders: [] as Array<{
      folderName: string
      videos: Array<{ name: string; url: string; fileId: string; duration?: string }>
      pdfs: Array<{ name: string; url: string; fileId: string }>
      images: Array<{ url: string; fileId: string }>
      textContent: Array<{ title: string; content: string }>
      externalVideoLinks: Array<{ title: string; url: string; description?: string; platform?: string }>
    }>,
    keyPoints: '',
    aboutCourse: '',
    eligibility: '',
    objectives: ''
  })
  
  const [newTextContent, setNewTextContent] = useState({ title: '', content: '' })
  const [editingTextContent, setEditingTextContent] = useState<{ folderIndex: number; textIndex: number } | null>(null)
  const [newExternalVideo, setNewExternalVideo] = useState({ title: '', url: '', description: '', platform: 'youtube' })
  const [newFolderName, setNewFolderName] = useState('')
  const [expandedFolders, setExpandedFolders] = useState<Set<number>>(new Set())

  useEffect(() => {
    checkAdminAccess()
    fetchCourses()
  }, [])

  const checkAdminAccess = () => {
    const user = apiService.getUser()
    if (!user || user.role !== 'admin') {
      navigate('/login')
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields
    if (!formData.syllabus.url) {
      alert('Please upload course syllabus PDF')
      return
    }
    
    if (!formData.thumbnail.url) {
      alert('Please upload course thumbnail image')
      return
    }
    
    if (!formData.keyPoints.trim()) {
      alert('Please enter at least one key point')
      return
    }
    
    if (!formData.aboutCourse.trim()) {
      alert('Please provide information about the course')
      return
    }
    
    if (!formData.eligibility.trim()) {
      alert('Please enter at least one eligibility criterion')
      return
    }
    
    if (!formData.objectives.trim()) {
      alert('Please enter at least one course objective')
      return
    }
    
    if (formData.sampleVideos.length === 0) {
      alert('Please upload at least one sample video')
      return
    }
    
    // Validate folder-based media organization
    if (formData.mediaFolders.length === 0) {
      alert('Please create at least one folder and add content (videos, PDFs, images, text content, or external videos)')
      return
    }
    
    const hasContent = formData.mediaFolders.some(folder => 
      folder.videos.length > 0 || folder.pdfs.length > 0 || folder.images.length > 0 ||
      (folder.textContent && folder.textContent.length > 0) ||
      (folder.externalVideoLinks && folder.externalVideoLinks.length > 0)
    )
    
    if (!hasContent) {
      alert('Please add at least one video, PDF, or image to a folder')
      return
    }
    
    // Convert text fields to arrays
    const submissionData = {
      ...formData,
      keyPoints: formData.keyPoints.split('\n').filter(point => point.trim() !== ''),
      eligibility: formData.eligibility.split('\n').filter(item => item.trim() !== ''),
      objectives: formData.objectives.split('\n').filter(obj => obj.trim() !== '')
    }
    
    try {
      const token = apiService.getToken()
      const url = editingCourse
        ? `${API_BASE_URL}/courses/${editingCourse._id}`
        : `${API_BASE_URL}/courses`
      
      const response = await fetch(url, {
        method: editingCourse ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submissionData)
      })

      const data = await response.json()
      
      if (data.success) {
        fetchCourses()
        closeModal()
        alert(editingCourse ? 'Course updated successfully!' : 'Course created successfully!')
      } else {
        alert(data.message || 'Operation failed')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('An error occurred')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return

    try {
      const token = apiService.getToken()
      const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      
      if (data.success) {
        fetchCourses()
        alert('Course deleted successfully!')
      } else {
        alert(data.message || 'Delete failed')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('An error occurred')
    }
  }

  const openCreateModal = () => {
    setEditingCourse(null)
    setFormData({
      title: '',
      description: '',
      syllabus: { url: '', fileId: '', name: '' },
      duration: '',
      level: 'Beginner',
      category: 'CAD',
      price: 0,
      discountPrice: 0,
      isActive: true,
      thumbnail: { url: '', fileId: '' },
      sampleVideos: [],
      pdfFiles: [],
      videoFiles: [],
      images: [],
      mediaFolders: [],
      keyPoints: '',
      aboutCourse: '',
      eligibility: '',
      objectives: ''
    })
    setNewTextContent({ title: '', content: '' })
    setNewExternalVideo({ title: '', url: '', description: '', platform: 'youtube' })
    setShowModal(true)
  }

  const openEditModal = (course: Course) => {
    setEditingCourse(course)
    setFormData({
      title: course.title,
      description: course.description,
      syllabus: course.syllabus || { url: '', fileId: '', name: '' },
      duration: course.duration,
      level: course.level,
      category: course.category,
      price: course.price || 0,
      discountPrice: course.discountPrice || 0,
      isActive: course.isActive,
      thumbnail: course.thumbnail || { url: '', fileId: '' },
      sampleVideos: course.sampleVideos || [],
      pdfFiles: course.pdfFiles || [],
      videoFiles: course.videoFiles || [],
      images: course.images || [],
      mediaFolders: course.mediaFolders || [],
      keyPoints: course.keyPoints?.join('\n') || '',
      aboutCourse: course.aboutCourse || '',
      eligibility: course.eligibility?.join('\n') || '',
      objectives: course.objectives?.join('\n') || ''
    })
    setNewTextContent({ title: '', content: '' })
    setNewExternalVideo({ title: '', url: '', description: '', platform: 'youtube' })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingCourse(null)
    setNewFolderName('')
    setExpandedFolders(new Set())
  }

  // Folder management functions
  const createFolder = () => {
    if (!newFolderName.trim()) {
      alert('Please enter a folder name')
      return
    }
    const newFolder = {
      folderName: newFolderName.trim(),
      videos: [],
      pdfs: [],
      images: [],
      textContent: [],
      externalVideoLinks: []
    }
    setFormData({
      ...formData,
      mediaFolders: [...formData.mediaFolders, newFolder]
    })
    setNewFolderName('')
    setExpandedFolders(new Set([...expandedFolders, formData.mediaFolders.length]))
  }

  const deleteFolder = (folderIndex: number) => {
    if (!confirm('Are you sure you want to delete this folder and all its contents?')) return
    setFormData({
      ...formData,
      mediaFolders: formData.mediaFolders.filter((_, i) => i !== folderIndex)
    })
    const newExpanded = new Set(expandedFolders)
    newExpanded.delete(folderIndex)
    setExpandedFolders(newExpanded)
  }

  const toggleFolder = (folderIndex: number) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(folderIndex)) {
      newExpanded.delete(folderIndex)
    } else {
      newExpanded.add(folderIndex)
    }
    setExpandedFolders(newExpanded)
  }

  const addVideoToFolder = (folderIndex: number, fileData: { name: string; url: string; fileId: string }) => {
    const updatedFolders = [...formData.mediaFolders]
    updatedFolders[folderIndex].videos.push(fileData)
    setFormData({ ...formData, mediaFolders: updatedFolders })
  }

  const addPdfToFolder = (folderIndex: number, fileData: { name: string; url: string; fileId: string }) => {
    const updatedFolders = [...formData.mediaFolders]
    updatedFolders[folderIndex].pdfs.push(fileData)
    setFormData({ ...formData, mediaFolders: updatedFolders })
  }

  const addImageToFolder = (folderIndex: number, fileData: { url: string; fileId: string }) => {
    const updatedFolders = [...formData.mediaFolders]
    updatedFolders[folderIndex].images.push(fileData)
    setFormData({ ...formData, mediaFolders: updatedFolders })
  }

  const removeVideoFromFolder = (folderIndex: number, videoIndex: number) => {
    const updatedFolders = [...formData.mediaFolders]
    updatedFolders[folderIndex].videos = updatedFolders[folderIndex].videos.filter((_, i) => i !== videoIndex)
    setFormData({ ...formData, mediaFolders: updatedFolders })
  }

  const removePdfFromFolder = (folderIndex: number, pdfIndex: number) => {
    const updatedFolders = [...formData.mediaFolders]
    updatedFolders[folderIndex].pdfs = updatedFolders[folderIndex].pdfs.filter((_, i) => i !== pdfIndex)
    setFormData({ ...formData, mediaFolders: updatedFolders })
  }

  const removeImageFromFolder = (folderIndex: number, imageIndex: number) => {
    const updatedFolders = [...formData.mediaFolders]
    updatedFolders[folderIndex].images = updatedFolders[folderIndex].images.filter((_, i) => i !== imageIndex)
    setFormData({ ...formData, mediaFolders: updatedFolders })
  }

  const addTextContentToFolder = (folderIndex: number, textData: { title: string; content: string }) => {
    const updatedFolders = [...formData.mediaFolders]
    if (!updatedFolders[folderIndex].textContent) {
      updatedFolders[folderIndex].textContent = []
    }
    updatedFolders[folderIndex].textContent.push(textData)
    setFormData({ ...formData, mediaFolders: updatedFolders })
    setNewTextContent({ title: '', content: '' })
    setEditingTextContent(null)
  }

  const updateTextContentInFolder = (folderIndex: number, textIndex: number, textData: { title: string; content: string }) => {
    const updatedFolders = [...formData.mediaFolders]
    updatedFolders[folderIndex].textContent[textIndex] = textData
    setFormData({ ...formData, mediaFolders: updatedFolders })
    setNewTextContent({ title: '', content: '' })
    setEditingTextContent(null)
  }

  const editTextContentInFolder = (folderIndex: number, textIndex: number) => {
    const textContent = formData.mediaFolders[folderIndex].textContent[textIndex]
    setNewTextContent({ title: textContent.title, content: textContent.content })
    setEditingTextContent({ folderIndex, textIndex })
  }

  const cancelEditTextContent = () => {
    setNewTextContent({ title: '', content: '' })
    setEditingTextContent(null)
  }

  const removeTextContentFromFolder = (folderIndex: number, textIndex: number) => {
    const updatedFolders = [...formData.mediaFolders]
    updatedFolders[folderIndex].textContent = updatedFolders[folderIndex].textContent.filter((_, i) => i !== textIndex)
    setFormData({ ...formData, mediaFolders: updatedFolders })
    // If we're editing the item being removed, cancel edit mode
    if (editingTextContent?.folderIndex === folderIndex && editingTextContent?.textIndex === textIndex) {
      cancelEditTextContent()
    }
  }

  const addExternalVideoToFolder = (folderIndex: number, videoData: { title: string; url: string; description?: string; platform?: string }) => {
    const updatedFolders = [...formData.mediaFolders]
    if (!updatedFolders[folderIndex].externalVideoLinks) {
      updatedFolders[folderIndex].externalVideoLinks = []
    }
    updatedFolders[folderIndex].externalVideoLinks.push(videoData)
    setFormData({ ...formData, mediaFolders: updatedFolders })
  }

  const removeExternalVideoFromFolder = (folderIndex: number, videoIndex: number) => {
    const updatedFolders = [...formData.mediaFolders]
    updatedFolders[folderIndex].externalVideoLinks = updatedFolders[folderIndex].externalVideoLinks.filter((_, i) => i !== videoIndex)
    setFormData({ ...formData, mediaFolders: updatedFolders })
  }

  return (
    <div className="pt-28 md:pt-32 lg:pt-36 px-4 min-h-screen bg-gradient-to-b from-light to-white">
      <div className="max-w-7xl mx-auto mb-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-2">Manage Courses</h1>
            <p className="text-lg text-dark/70">Add, edit, or remove courses</p>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
          >
            <PlusIcon className="h-5 w-5" />
            Add Course
          </button>
        </div>

        {/* Courses List */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-lg text-dark/60">Loading courses...</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-md border border-gray-200">
            <p className="text-lg text-dark/60">No courses found. Create your first course!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {courses.map((course) => (
              <div
                key={course._id}
                className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-xl hover:scale-[1.01] transition-all duration-300"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-primary mb-2">{course.title}</h3>
                    <p className="text-dark/70 text-sm mb-3 line-clamp-2">{course.description}</p>
                    <div className="flex flex-wrap gap-3 text-sm">
                      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                        {course.duration}
                      </span>
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">
                        {course.level}
                      </span>
                      <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                        {course.category}
                      </span>
                      <span className={`px-3 py-1 rounded-full ${course.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {course.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    <button
                      onClick={() => navigate(`/admin/courses/${course._id}/quizzes`)}
                      className="px-4 py-2 text-xs font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-all whitespace-nowrap"
                      title="Manage Quizzes & Tests"
                    >
                      Quizzes & Tests
                    </button>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(course)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(course._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full my-8">
              <div className="sticky top-0 bg-white z-10 p-6 border-b border-gray-200 rounded-t-xl">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-primary">
                    {editingCourse ? 'Edit Course' : 'Add New Course - World-Class LMS'}
                  </h2>
                  <button onClick={closeModal} className="text-dark/60 hover:text-dark">
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-primary mb-2">
                      Course Title
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full px-4 py-3 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-primary mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows={4}
                      className="w-full px-4 py-3 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-primary mb-2">
                      About Course
                    </label>
                    <textarea
                      value={formData.aboutCourse}
                      onChange={(e) => setFormData({...formData, aboutCourse: e.target.value})}
                      rows={6}
                      placeholder="Provide detailed information about the course..."
                      className="w-full px-4 py-3 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Detailed course information for the About Course tab</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-primary mb-2">
                      Key Points (One per line)
                    </label>
                    <textarea
                      value={formData.keyPoints}
                      onChange={(e) => setFormData({...formData, keyPoints: e.target.value})}
                      rows={8}
                      placeholder="Competent Trainer with more than 20+ years' experience&#10;More than 100 recruiters&#10;100% Placement assistance&#10;Hands on experience to work on live projects"
                      className="w-full px-4 py-3 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono text-sm"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Enter each key point on a new line. Minimum 3 points required.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-primary mb-2">
                      Eligibility Criteria (One per line)
                    </label>
                    <textarea
                      value={formData.eligibility}
                      onChange={(e) => setFormData({...formData, eligibility: e.target.value})}
                      rows={5}
                      placeholder="Engineering graduates (Mechanical, Civil, Chemical, etc.)&#10;Diploma holders in relevant engineering fields&#10;Working professionals seeking career advancement"
                      className="w-full px-4 py-3 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono text-sm"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Enter each eligibility criterion on a new line</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-primary mb-2">
                      Course Objectives (One per line)
                    </label>
                    <textarea
                      value={formData.objectives}
                      onChange={(e) => setFormData({...formData, objectives: e.target.value})}
                      rows={6}
                      placeholder="Develop comprehensive knowledge of industry standards&#10;Gain hands-on experience with real-world projects&#10;Master the technical skills required for professional excellence"
                      className="w-full px-4 py-3 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono text-sm"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Enter each objective on a new line. Minimum 3 objectives required.</p>
                  </div>

                  <div>
                    <FileUpload
                      label="Course Syllabus (PDF/DOC)"
                      accept=".pdf,.doc,.docx"
                      folder="syllabus"
                      onUploadComplete={(fileData) => {
                        setFormData({
                          ...formData,
                          syllabus: {
                            url: fileData.url,
                            fileId: fileData.fileId,
                            name: fileData.name
                          }
                        })
                      }}
                      currentFile={formData.syllabus.url ? {
                        url: formData.syllabus.url,
                        name: formData.syllabus.name
                      } : undefined}
                      onRemove={() => {
                        setFormData({
                          ...formData,
                          syllabus: { url: '', fileId: '', name: '' }
                        })
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-primary mb-2">
                        Duration
                      </label>
                      <input
                        type="text"
                        value={formData.duration}
                        onChange={(e) => setFormData({...formData, duration: e.target.value})}
                        placeholder="e.g., 8 weeks"
                        className="w-full px-4 py-3 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-primary mb-2">
                        Level
                      </label>
                      <select
                        value={formData.level}
                        onChange={(e) => setFormData({...formData, level: e.target.value})}
                        className="w-full px-4 py-3 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                        required
                      >
                        <option>Beginner</option>
                        <option>Intermediate</option>
                        <option>Advanced</option>
                        <option>Beginner to Intermediate</option>
                        <option>Beginner to Advanced</option>
                        <option>Intermediate to Advanced</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-primary mb-2">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-4 py-3 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                      required
                    >
                      <option>CAD</option>
                      <option>CAE</option>
                      <option>PCB Design</option>
                      <option>Programming</option>
                      <option>Other</option>
                    </select>
                  </div>

                  {/* Price Fields */}
                  <div>
                    <label className="block text-sm font-semibold text-primary mb-2">
                      Price (₹)
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                      className="w-full px-4 py-3 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="5000"
                      min="0"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-primary mb-2">
                      Discount Price (₹) <span className="text-gray-400">(Optional)</span>
                    </label>
                    <input
                      type="number"
                      value={formData.discountPrice}
                      onChange={(e) => setFormData({...formData, discountPrice: parseFloat(e.target.value) || 0})}
                      className="w-full px-4 py-3 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="4000"
                      min="0"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Leave as 0 if no discount. Discount price should be less than regular price.
                    </p>
                  </div>

                  {/* File Uploads */}
                  <div className="border-t border-primary/10 pt-4">
                    <h3 className="text-lg font-bold text-primary mb-4">Course Media</h3>
                    
                    <div className="space-y-4">
                      {/* Thumbnail Upload */}
                      <div>
                        <FileUpload
                          label="Course Thumbnail"
                          accept=".jpg,.jpeg,.png,.webp"
                          folder="courses/thumbnails"
                          onUploadComplete={(fileData) => setFormData({
                            ...formData,
                            thumbnail: { url: fileData.url, fileId: fileData.fileId }
                          })}
                          currentFile={formData.thumbnail?.url ? formData.thumbnail : undefined}
                          onRemove={() => setFormData({
                            ...formData,
                            thumbnail: { url: '', fileId: '' }
                          })}
                        />
                        {formData.thumbnail.url && (
                          <p className="text-xs text-green-600 mt-1 font-semibold">✓ Thumbnail uploaded</p>
                        )}
                      </div>

                      {/* Sample Videos Upload */}
                      <div>
                        <label className="block text-sm font-semibold text-primary mb-2">
                          Sample Videos (Preview for users before purchase)
                        </label>
                        <p className="text-xs text-gray-600 mb-2">
                          Upload preview videos to showcase your course. Add as many as needed!
                        </p>
                        <FileUpload
                          label="Add Sample Video"
                          accept=".mp4,.mov,.avi,.mkv"
                          folder="courses/sample-videos"
                          onUploadComplete={(fileData) => setFormData({
                            ...formData,
                            sampleVideos: [...formData.sampleVideos, fileData]
                          })}
                        />
                        
                        {/* Display uploaded sample videos */}
                        {formData.sampleVideos.length > 0 && (
                          <div className="mt-3 space-y-2">
                            <p className="text-xs text-green-600 font-semibold">
                              ✓ {formData.sampleVideos.length} sample video(s) uploaded
                            </p>
                            {formData.sampleVideos.map((video, index) => (
                              <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                <span className="text-sm text-gray-700 truncate flex-1">{video.name}</span>
                                <button
                                  type="button"
                                  onClick={() => setFormData({
                                    ...formData,
                                    sampleVideos: formData.sampleVideos.filter((_, i) => i !== index)
                                  })}
                                  className="text-red-600 hover:text-red-800 text-sm ml-2"
                                >
                                  Remove
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Folder-Based Media Organization */}
                      <div className="mt-6 pt-6 border-t border-primary/20">
                        <label className="block text-sm font-semibold text-primary mb-2">
                          Course Content Folders (Organize videos, PDFs, and images by folder)
                        </label>
                        <p className="text-xs text-gray-600 mb-3">
                          Create folders to organize your course content. Each folder can contain videos, PDFs, and images.
                        </p>

                        {/* Create New Folder */}
                        <div className="bg-gray-50 p-4 rounded-lg mb-4">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Enter folder name (e.g., Module 1, Week 1, Introduction)"
                              value={newFolderName}
                              onChange={(e) => setNewFolderName(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && createFolder()}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                            <button
                              type="button"
                              onClick={createFolder}
                              className="px-4 py-2 bg-primary text-white rounded font-semibold hover:bg-primary/90 transition-all flex items-center gap-2"
                            >
                              <FolderIcon className="h-5 w-5" />
                              Create Folder
                            </button>
                          </div>
                        </div>

                        {/* Display Folders */}
                        {formData.mediaFolders.length > 0 ? (
                          <div className="space-y-3">
                            {formData.mediaFolders.map((folder, folderIndex) => (
                              <div key={folderIndex} className="border border-gray-200 rounded-lg overflow-hidden">
                                {/* Folder Header */}
                                <div 
                                  className="bg-primary/5 px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-primary/10 transition-colors"
                                  onClick={() => toggleFolder(folderIndex)}
                                >
                                  <div className="flex items-center gap-3">
                                    {expandedFolders.has(folderIndex) ? (
                                      <ChevronUpIcon className="h-5 w-5 text-primary" />
                                    ) : (
                                      <ChevronDownIcon className="h-5 w-5 text-primary" />
                                    )}
                                    <FolderIcon className="h-5 w-5 text-primary" />
                                    <span className="font-semibold text-dark">{folder.folderName}</span>
                                    <span className="text-xs text-gray-500">
                                      ({folder.videos.length} videos, {folder.pdfs.length} PDFs, {folder.images.length} images)
                                    </span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      deleteFolder(folderIndex)
                                    }}
                                    className="text-red-600 hover:text-red-800 p-1"
                                  >
                                    <TrashIcon className="h-5 w-5" />
                                  </button>
                                </div>

                                {/* Folder Content */}
                                {expandedFolders.has(folderIndex) && (
                                  <div className="p-4 bg-white space-y-4">
                                    {/* Videos Section */}
                                    <div>
                                      <label className="block text-sm font-semibold text-primary mb-2">
                                        Videos
                                      </label>
                        <FileUpload
                                        label="Add Video"
                                        accept=".mp4,.mov,.avi,.mkv"
                                        folder={`courses/folders/${folder.folderName}/videos`}
                                        onUploadComplete={(fileData) => addVideoToFolder(folderIndex, fileData)}
                        />
                                      {folder.videos.length > 0 && (
                                        <div className="mt-2 space-y-1">
                                          {folder.videos.map((video, videoIndex) => (
                                            <div key={videoIndex} className="flex items-center justify-between bg-gray-50 p-2 rounded text-sm">
                                              <span className="text-gray-700 truncate flex-1">{video.name}</span>
                                <button
                                  type="button"
                                                onClick={() => removeVideoFromFolder(folderIndex, videoIndex)}
                                                className="text-red-600 hover:text-red-800 ml-2"
                                >
                                  Remove
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                                    {/* PDFs Section */}
                      <div>
                        <label className="block text-sm font-semibold text-primary mb-2">
                                        📚 PDFs
                        </label>
                        <FileUpload
                                        label="Add PDF"
                                        accept=".pdf"
                                        folder={`courses/folders/${folder.folderName}/pdfs`}
                                        onUploadComplete={(fileData) => addPdfToFolder(folderIndex, fileData)}
                        />
                                      {folder.pdfs.length > 0 && (
                                        <div className="mt-2 space-y-1">
                                          {folder.pdfs.map((pdf, pdfIndex) => (
                                            <div key={pdfIndex} className="flex items-center justify-between bg-gray-50 p-2 rounded text-sm">
                                              <span className="text-gray-700 truncate flex-1">{pdf.name}</span>
                                <button
                                  type="button"
                                                onClick={() => removePdfFromFolder(folderIndex, pdfIndex)}
                                                className="text-red-600 hover:text-red-800 ml-2"
                                >
                                  Remove
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                                    {/* Images Section */}
                                    <div>
                        <label className="block text-sm font-semibold text-primary mb-2">
                                        📷 Images
                        </label>
                        <FileUpload
                          label="Add Image"
                          accept=".jpg,.jpeg,.png,.webp,.gif"
                                        folder={`courses/folders/${folder.folderName}/images`}
                                        onUploadComplete={(fileData) => addImageToFolder(folderIndex, { url: fileData.url, fileId: fileData.fileId })}
                        />
                                      {folder.images.length > 0 && (
                                        <div className="mt-2 grid grid-cols-3 gap-2">
                                          {folder.images.map((image, imageIndex) => (
                                            <div key={imageIndex} className="relative group">
                                  <img 
                                    src={image.url} 
                                                alt={`${folder.folderName} image ${imageIndex + 1}`}
                                                className="w-full h-20 object-cover rounded border border-gray-200"
                                  />
                                  <button
                                    type="button"
                                                onClick={() => removeImageFromFolder(folderIndex, imageIndex)}
                                                className="absolute top-1 right-1 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                                ×
                                  </button>
                                </div>
                              ))}
                            </div>
                                      )}
                                    </div>

                                    {/* Text Content Section */}
                                    <div>
                                      <label className="block text-sm font-semibold text-primary mb-2">
                                        Text Content
                                      </label>
                                      <div className="bg-gray-50 p-3 rounded-lg mb-2 space-y-2">
                                        <input
                                          type="text"
                                          placeholder="Content Title"
                                          value={newTextContent.title}
                                          onChange={(e) => setNewTextContent({ ...newTextContent, title: e.target.value })}
                                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        />
                                        <RichTextEditor
                                          value={newTextContent.content}
                                          onChange={(value) => setNewTextContent({ ...newTextContent, content: value })}
                                          rows={5}
                                          placeholder="Enter text content here. Use the toolbar to format text, change fonts, and add colors..."
                                        />
                                        <div className="flex gap-2">
                                          <button
                                            type="button"
                                            onClick={() => {
                                              if (newTextContent.title && newTextContent.content) {
                                                if (editingTextContent && editingTextContent.folderIndex === folderIndex) {
                                                  updateTextContentInFolder(folderIndex, editingTextContent.textIndex, newTextContent)
                                                } else {
                                                  addTextContentToFolder(folderIndex, newTextContent)
                                                }
                                              } else {
                                                alert('Please fill in both title and content')
                                              }
                                            }}
                                            className="flex-1 bg-primary text-white px-3 py-1.5 rounded text-sm font-semibold hover:bg-primary/90 transition-all"
                                          >
                                            {editingTextContent && editingTextContent.folderIndex === folderIndex ? '✓ Update Text Content' : '+ Add Text Content'}
                                          </button>
                                          {editingTextContent && editingTextContent.folderIndex === folderIndex && (
                                            <button
                                              type="button"
                                              onClick={cancelEditTextContent}
                                              className="px-3 py-1.5 bg-gray-500 text-white rounded text-sm font-semibold hover:bg-gray-600 transition-all"
                                            >
                                              Cancel
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                      {folder.textContent && folder.textContent.length > 0 && (
                                        <div className="mt-2 space-y-1">
                                          {folder.textContent.map((text, textIndex) => (
                                            <div key={textIndex} className={`flex items-start justify-between p-2 rounded text-sm ${
                                              editingTextContent?.folderIndex === folderIndex && editingTextContent?.textIndex === textIndex
                                                ? 'bg-blue-50 border-2 border-blue-300'
                                                : 'bg-gray-50'
                                            }`}>
                                              <div className="flex-1">
                                                <span className="font-semibold text-gray-700">{text.title}</span>
                                                <p className="text-xs text-gray-600 mt-1 line-clamp-1">{text.content}</p>
                                              </div>
                                              <div className="flex gap-2 ml-2">
                                                <button
                                                  type="button"
                                                  onClick={() => editTextContentInFolder(folderIndex, textIndex)}
                                                  className="text-blue-600 hover:text-blue-800 font-medium"
                                                >
                                                  Edit
                                                </button>
                                                <button
                                                  type="button"
                                                  onClick={() => removeTextContentFromFolder(folderIndex, textIndex)}
                                                  className="text-red-600 hover:text-red-800 font-medium"
                                                >
                                                  Remove
                                                </button>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>

                                    {/* External Video Links Section */}
                                    <div>
                                      <label className="block text-sm font-semibold text-primary mb-2">
                                        External Video Links
                                      </label>
                                      <div className="bg-gray-50 p-3 rounded-lg mb-2 space-y-2">
                                        <input
                                          type="text"
                                          placeholder="Video Title"
                                          value={newExternalVideo.title}
                                          onChange={(e) => setNewExternalVideo({ ...newExternalVideo, title: e.target.value })}
                                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        />
                                        <input
                                          type="url"
                                          placeholder="Video URL"
                                          value={newExternalVideo.url}
                                          onChange={(e) => setNewExternalVideo({ ...newExternalVideo, url: e.target.value })}
                                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        />
                                        <select
                                          value={newExternalVideo.platform}
                                          onChange={(e) => setNewExternalVideo({ ...newExternalVideo, platform: e.target.value })}
                                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        >
                                          <option value="youtube">YouTube</option>
                                          <option value="vimeo">Vimeo</option>
                                          <option value="other">Other</option>
                                        </select>
                                        <textarea
                                          placeholder="Description (optional)"
                                          value={newExternalVideo.description}
                                          onChange={(e) => setNewExternalVideo({ ...newExternalVideo, description: e.target.value })}
                                          rows={2}
                                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => {
                                            if (newExternalVideo.title && newExternalVideo.url) {
                                              addExternalVideoToFolder(folderIndex, { ...newExternalVideo })
                                              setNewExternalVideo({ title: '', url: '', description: '', platform: 'youtube' })
                                            } else {
                                              alert('Please fill in at least title and URL')
                                            }
                                          }}
                                          className="w-full bg-primary text-white px-3 py-1.5 rounded text-sm font-semibold hover:bg-primary/90 transition-all"
                                        >
                                          + Add External Video
                                        </button>
                                      </div>
                                      {folder.externalVideoLinks && folder.externalVideoLinks.length > 0 && (
                                        <div className="mt-2 space-y-1">
                                          {folder.externalVideoLinks.map((video, videoIndex) => (
                                            <div key={videoIndex} className="flex items-start justify-between bg-gray-50 p-2 rounded text-sm">
                                              <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                  <span className="font-semibold text-gray-700">{video.title}</span>
                                                  <span className="text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                                                    {video.platform}
                                                  </span>
                                                </div>
                                                <p className="text-xs text-blue-600 mt-1 truncate">{video.url}</p>
                                              </div>
                                              <button
                                                type="button"
                                                onClick={() => removeExternalVideoFromFolder(folderIndex, videoIndex)}
                                                className="text-red-600 hover:text-red-800 ml-2"
                                              >
                                                Remove
                                              </button>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                            <FolderIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">No folders created yet. Create your first folder above.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                      className="w-4 h-4"
                    />
                    <label className="text-sm text-dark/70">Active (visible to users)</label>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-all duration-300"
                    >
                      {editingCourse ? 'Update Course' : 'Create Course'}
                    </button>
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-6 py-3 border border-primary/20 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-300"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ManageCourses

