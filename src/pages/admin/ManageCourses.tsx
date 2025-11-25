import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline'
import apiService from '../../services/api'
import FileUpload from '../../components/FileUpload'
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
    videoFiles: [] as Array<{ name: string; url: string; fileId: string }>
  })

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
    
    // Validate syllabus is uploaded
    if (!formData.syllabus.url) {
      alert('Please upload course syllabus PDF')
      return
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
        body: JSON.stringify(formData)
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
      videoFiles: []
    })
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
      videoFiles: course.videoFiles || []
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingCourse(null)
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
                  <div className="flex gap-2 ml-4">
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
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-primary">
                    {editingCourse ? 'Edit Course' : 'Add New Course'}
                  </h2>
                  <button onClick={closeModal} className="text-dark/60 hover:text-dark">
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-primary mb-2">
                      Course Title *
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
                      Description *
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
                    <FileUpload
                      label="Course Syllabus (PDF/DOC) *"
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
                    {!formData.syllabus.url && (
                      <p className="text-xs text-red-500 mt-1">* Syllabus PDF is required</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-primary mb-2">
                        Duration *
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
                        Level *
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
                      Category *
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
                      Price (₹) *
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

                      {/* Sample Videos Upload */}
                      <div>
                        <label className="block text-sm font-semibold text-primary mb-2">
                          Sample Videos (Preview for users before purchase)
                        </label>
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

                      {/* PDF Upload */}
                      <div>
                        <FileUpload
                          label="Add PDF Materials"
                          accept=".pdf"
                          folder="courses/pdfs"
                          onUploadComplete={(fileData) => setFormData({
                            ...formData,
                            pdfFiles: [...formData.pdfFiles, fileData]
                          })}
                        />
                        {formData.pdfFiles.length > 0 && (
                          <div className="mt-2 space-y-2">
                            {formData.pdfFiles.map((pdf, index) => (
                              <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                <span className="text-sm text-dark/70">{pdf.name}</span>
                                <button
                                  type="button"
                                  onClick={() => setFormData({
                                    ...formData,
                                    pdfFiles: formData.pdfFiles.filter((_, i) => i !== index)
                                  })}
                                  className="text-red-600 hover:text-red-800 text-xs"
                                >
                                  Remove
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Video Upload */}
                      <div>
                        <FileUpload
                          label="Add Video Lessons"
                          accept=".mp4,.mov,.avi,.mkv"
                          folder="courses/videos"
                          onUploadComplete={(fileData) => setFormData({
                            ...formData,
                            videoFiles: [...formData.videoFiles, fileData]
                          })}
                        />
                        {formData.videoFiles.length > 0 && (
                          <div className="mt-2 space-y-2">
                            {formData.videoFiles.map((video, index) => (
                              <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                <span className="text-sm text-dark/70">{video.name}</span>
                                <button
                                  type="button"
                                  onClick={() => setFormData({
                                    ...formData,
                                    videoFiles: formData.videoFiles.filter((_, i) => i !== index)
                                  })}
                                  className="text-red-600 hover:text-red-800 text-xs"
                                >
                                  Remove
                                </button>
                              </div>
                            ))}
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

