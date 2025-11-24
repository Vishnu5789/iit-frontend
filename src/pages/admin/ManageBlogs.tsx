import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline'
import apiService from '../../services/api'
import { API_BASE_URL } from '../../config/api.config'

interface Blog {
  _id: string
  title: string
  category: string
  summary: string
  content: string
  readTime: string
  isPublished: boolean
  publishedDate: string
}

const ManageBlogs = () => {
  const navigate = useNavigate()
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    category: 'CAD',
    summary: '',
    content: '',
    readTime: '5 min read',
    isPublished: true
  })

  useEffect(() => {
    checkAdminAccess()
    fetchBlogs()
  }, [])

  const checkAdminAccess = () => {
    const user = apiService.getUser()
    if (!user || user.role !== 'admin') {
      navigate('/login')
    }
  }

  const fetchBlogs = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/blogs`)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const token = apiService.getToken()
      const url = editingBlog 
        ? `${API_BASE_URL}/blogs/${editingBlog._id}`
        : `${API_BASE_URL}/blogs`
      
      const response = await fetch(url, {
        method: editingBlog ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()
      
      if (data.success) {
        fetchBlogs()
        closeModal()
        alert(editingBlog ? 'Blog updated successfully!' : 'Blog created successfully!')
      } else {
        alert(data.message || 'Operation failed')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('An error occurred')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog?')) return

    try {
      const token = apiService.getToken()
      const response = await fetch(`${API_BASE_URL}/blogs/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      
      if (data.success) {
        fetchBlogs()
        alert('Blog deleted successfully!')
      } else {
        alert(data.message || 'Delete failed')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('An error occurred')
    }
  }

  const openCreateModal = () => {
    setEditingBlog(null)
    setFormData({
      title: '',
      category: 'CAD',
      summary: '',
      content: '',
      readTime: '5 min read',
      isPublished: true
    })
    setShowModal(true)
  }

  const openEditModal = (blog: Blog) => {
    setEditingBlog(blog)
    setFormData({
      title: blog.title,
      category: blog.category,
      summary: blog.summary,
      content: blog.content,
      readTime: blog.readTime,
      isPublished: blog.isPublished
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingBlog(null)
  }

  return (
    <div className="pt-28 md:pt-32 lg:pt-36 px-4 min-h-screen bg-gradient-to-b from-light to-white">
      <div className="max-w-7xl mx-auto mb-16">
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-2">Manage Blog Posts</h1>
            <p className="text-lg text-dark/70">Add, edit, or remove blog articles</p>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
          >
            <PlusIcon className="h-5 w-5" />
            Add Blog
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-lg text-dark/60">Loading blogs...</p>
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-md border border-gray-200">
            <p className="text-lg text-dark/60">No blogs found. Create your first blog post!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {blogs.map((blog) => (
              <div
                key={blog._id}
                className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-xl hover:scale-[1.01] transition-all duration-300"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full">
                        {blog.category}
                      </span>
                      <span className="text-sm text-dark/60">{blog.readTime}</span>
                      <span className={`text-xs px-3 py-1 rounded-full ${blog.isPublished ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {blog.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-primary mb-2">{blog.title}</h3>
                    <p className="text-dark/70 text-sm mb-2 line-clamp-2">{blog.summary}</p>
                    <p className="text-dark/50 text-xs">
                      Published: {new Date(blog.publishedDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => openEditModal(blog)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(blog._id)}
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

        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-primary">
                    {editingBlog ? 'Edit Blog Post' : 'Add New Blog Post'}
                  </h2>
                  <button onClick={closeModal} className="text-dark/60 hover:text-dark">
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-primary mb-2">
                      Blog Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full px-4 py-3 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-primary mb-2">
                        Category *
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                        className="w-full px-4 py-3 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                      >
                        <option>CAD</option>
                        <option>CAE</option>
                        <option>Mechanical Engineering</option>
                        <option>Electrical/PCB Design</option>
                        <option>Product Design</option>
                        <option>Industry 4.0</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-primary mb-2">
                        Read Time *
                      </label>
                      <input
                        type="text"
                        value={formData.readTime}
                        onChange={(e) => setFormData({...formData, readTime: e.target.value})}
                        placeholder="e.g., 5 min read"
                        className="w-full px-4 py-3 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-primary mb-2">
                      Summary * (150-180 words)
                    </label>
                    <textarea
                      value={formData.summary}
                      onChange={(e) => setFormData({...formData, summary: e.target.value})}
                      rows={3}
                      maxLength={500}
                      className="w-full px-4 py-3 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                      required
                    />
                    <p className="text-xs text-dark/50 mt-1">{formData.summary.length}/500 characters</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-primary mb-2">
                      Full Content *
                    </label>
                    <textarea
                      value={formData.content}
                      onChange={(e) => setFormData({...formData, content: e.target.value})}
                      rows={10}
                      maxLength={10000}
                      className="w-full px-4 py-3 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                      required
                    />
                    <p className="text-xs text-dark/50 mt-1">{formData.content.length}/10000 characters</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isPublished}
                      onChange={(e) => setFormData({...formData, isPublished: e.target.checked})}
                      className="w-4 h-4"
                    />
                    <label className="text-sm text-dark/70">Published (visible to users)</label>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-all duration-300"
                    >
                      {editingBlog ? 'Update Blog' : 'Create Blog'}
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

export default ManageBlogs

