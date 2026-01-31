import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon, FolderIcon, ChevronDownIcon, ChevronUpIcon, MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline'
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
    subfolders?: Array<{
      folderName: string
      videos: Array<{ name: string; url: string; fileId: string; duration?: string }>
      pdfs: Array<{ name: string; url: string; fileId: string }>
      images: Array<{ url: string; fileId: string }>
      textContent: Array<{ title: string; content: string }>
      externalVideoLinks: Array<{ title: string; url: string; description?: string; platform?: string }>
    }>
  }>
}

const ManageCourses = () => {
  const navigate = useNavigate()
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  
  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterLevel, setFilterLevel] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
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
      subfolders?: Array<{
        folderName: string
        videos: Array<{ name: string; url: string; fileId: string; duration?: string }>
        pdfs: Array<{ name: string; url: string; fileId: string }>
        images: Array<{ url: string; fileId: string }>
        textContent: Array<{ title: string; content: string }>
        externalVideoLinks: Array<{ title: string; url: string; description?: string; platform?: string }>
      }>
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
  const [newSubfolderName, setNewSubfolderName] = useState('')
  const [expandedFolders, setExpandedFolders] = useState<Set<number>>(new Set())
  const [expandedSubfolders, setExpandedSubfolders] = useState<Set<string>>(new Set())
  const [editingFolder, setEditingFolder] = useState<number | null>(null)
  const [editingSubfolder, setEditingSubfolder] = useState<{folderIndex: number; subfolderIndex: number} | null>(null)
  const [editFolderName, setEditFolderName] = useState('')
  const [syllabusTextContent, setSyllabusTextContent] = useState('')
  const [customCategories, setCustomCategories] = useState<string[]>([])
  const [showCustomCategoryInput, setShowCustomCategoryInput] = useState(false)
  const [newCustomCategory, setNewCustomCategory] = useState('')

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
        
        // Extract custom categories from existing courses
        const defaultCategories = ['CAD', 'CAE', 'PCB Design', 'Programming', 'Other']
        const existingCustomCategories: string[] = []
        data.data.forEach((course: Course) => {
          if (course.category && !defaultCategories.includes(course.category) && !existingCustomCategories.includes(course.category)) {
            existingCustomCategories.push(course.category)
          }
        })
        setCustomCategories(existingCustomCategories)
      }
    } catch (error) {
      console.error('Error fetching courses:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddCustomCategory = () => {
    if (newCustomCategory.trim() && !customCategories.includes(newCustomCategory.trim())) {
      const newCategory = newCustomCategory.trim()
      setCustomCategories([...customCategories, newCategory])
      setFormData({...formData, category: newCategory})
      setNewCustomCategory('')
      setShowCustomCategoryInput(false)
    }
  }

  const handleCancelCustomCategory = () => {
    setNewCustomCategory('')
    setShowCustomCategoryInput(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields - at least one syllabus format must be provided
    if (!formData.syllabus.url && !syllabusTextContent.trim()) {
      alert('Please provide course syllabus (PDF or text content or both)')
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
      objectives: formData.objectives.split('\n').filter(obj => obj.trim() !== ''),
      syllabusText: syllabusTextContent.trim() || undefined
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
    
    // Load syllabusText if available
    if ((course as any).syllabusText) {
      setSyllabusTextContent((course as any).syllabusText)
    } else {
      setSyllabusTextContent('')
    }
    
    // Check if the course category is a custom category
    const defaultCategories = ['CAD', 'CAE', 'PCB Design', 'Programming', 'Other']
    if (course.category && !defaultCategories.includes(course.category) && !customCategories.includes(course.category)) {
      setCustomCategories([...customCategories, course.category])
    }
    
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
    setSyllabusTextContent('')
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
      externalVideoLinks: [],
      subfolders: []
    }
    setFormData({
      ...formData,
      mediaFolders: [...formData.mediaFolders, newFolder]
    })
    setNewFolderName('')
    setExpandedFolders(new Set([...expandedFolders, formData.mediaFolders.length]))
  }

  const editFolder = (folderIndex: number) => {
    setEditingFolder(folderIndex)
    setEditFolderName(formData.mediaFolders[folderIndex].folderName)
  }

  const saveEditFolder = (folderIndex: number) => {
    if (!editFolderName.trim()) {
      alert('Please enter a folder name')
      return
    }
    const updatedFolders = [...formData.mediaFolders]
    updatedFolders[folderIndex].folderName = editFolderName.trim()
    setFormData({ ...formData, mediaFolders: updatedFolders })
    setEditingFolder(null)
    setEditFolderName('')
  }

  const cancelEditFolder = () => {
    setEditingFolder(null)
    setEditFolderName('')
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

  // Subfolder management functions
  const createSubfolder = (folderIndex: number) => {
    if (!newSubfolderName.trim()) {
      alert('Please enter a subfolder name')
      return
    }
    const newSubfolder = {
      folderName: newSubfolderName.trim(),
      videos: [],
      pdfs: [],
      images: [],
      textContent: [],
      externalVideoLinks: []
    }
    const updatedFolders = [...formData.mediaFolders]
    if (!updatedFolders[folderIndex].subfolders) {
      updatedFolders[folderIndex].subfolders = []
    }
    updatedFolders[folderIndex].subfolders!.push(newSubfolder)
    setFormData({ ...formData, mediaFolders: updatedFolders })
    setNewSubfolderName('')
    setExpandedSubfolders(new Set([...expandedSubfolders, `${folderIndex}-${updatedFolders[folderIndex].subfolders!.length - 1}`]))
  }

  const editSubfolder = (folderIndex: number, subfolderIndex: number) => {
    setEditingSubfolder({ folderIndex, subfolderIndex })
    setEditFolderName(formData.mediaFolders[folderIndex].subfolders![subfolderIndex].folderName)
  }

  const saveEditSubfolder = () => {
    if (!editingSubfolder || !editFolderName.trim()) {
      alert('Please enter a subfolder name')
      return
    }
    const updatedFolders = [...formData.mediaFolders]
    updatedFolders[editingSubfolder.folderIndex].subfolders![editingSubfolder.subfolderIndex].folderName = editFolderName.trim()
    setFormData({ ...formData, mediaFolders: updatedFolders })
    setEditingSubfolder(null)
    setEditFolderName('')
  }

  const cancelEditSubfolder = () => {
    setEditingSubfolder(null)
    setEditFolderName('')
  }

  const deleteSubfolder = (folderIndex: number, subfolderIndex: number) => {
    if (!confirm('Are you sure you want to delete this subfolder and all its contents?')) return
    const updatedFolders = [...formData.mediaFolders]
    updatedFolders[folderIndex].subfolders = updatedFolders[folderIndex].subfolders!.filter((_, i) => i !== subfolderIndex)
    setFormData({ ...formData, mediaFolders: updatedFolders })
    const newExpanded = new Set(expandedSubfolders)
    newExpanded.delete(`${folderIndex}-${subfolderIndex}`)
    setExpandedSubfolders(newExpanded)
  }

  const toggleSubfolder = (folderIndex: number, subfolderIndex: number) => {
    const key = `${folderIndex}-${subfolderIndex}`
    const newExpanded = new Set(expandedSubfolders)
    if (newExpanded.has(key)) {
      newExpanded.delete(key)
    } else {
      newExpanded.add(key)
    }
    setExpandedSubfolders(newExpanded)
  }

  const addVideoToFolder = (folderIndex: number, fileData: { name: string; url: string; fileId: string }, subfolderIndex?: number) => {
    const updatedFolders = [...formData.mediaFolders]
    if (subfolderIndex !== undefined) {
      updatedFolders[folderIndex].subfolders![subfolderIndex].videos.push(fileData)
    } else {
      updatedFolders[folderIndex].videos.push(fileData)
    }
    setFormData({ ...formData, mediaFolders: updatedFolders })
  }

  const addPdfToFolder = (folderIndex: number, fileData: { name: string; url: string; fileId: string }, subfolderIndex?: number) => {
    const updatedFolders = [...formData.mediaFolders]
    if (subfolderIndex !== undefined) {
      updatedFolders[folderIndex].subfolders![subfolderIndex].pdfs.push(fileData)
    } else {
      updatedFolders[folderIndex].pdfs.push(fileData)
    }
    setFormData({ ...formData, mediaFolders: updatedFolders })
  }

  const addImageToFolder = (folderIndex: number, fileData: { url: string; fileId: string }, subfolderIndex?: number) => {
    const updatedFolders = [...formData.mediaFolders]
    if (subfolderIndex !== undefined) {
      updatedFolders[folderIndex].subfolders![subfolderIndex].images.push(fileData)
    } else {
      updatedFolders[folderIndex].images.push(fileData)
    }
    setFormData({ ...formData, mediaFolders: updatedFolders })
  }

  const removeVideoFromFolder = (folderIndex: number, videoIndex: number, subfolderIndex?: number) => {
    const updatedFolders = [...formData.mediaFolders]
    if (subfolderIndex !== undefined) {
      updatedFolders[folderIndex].subfolders![subfolderIndex].videos = updatedFolders[folderIndex].subfolders![subfolderIndex].videos.filter((_, i) => i !== videoIndex)
    } else {
      updatedFolders[folderIndex].videos = updatedFolders[folderIndex].videos.filter((_, i) => i !== videoIndex)
    }
    setFormData({ ...formData, mediaFolders: updatedFolders })
  }

  const removePdfFromFolder = (folderIndex: number, pdfIndex: number, subfolderIndex?: number) => {
    const updatedFolders = [...formData.mediaFolders]
    if (subfolderIndex !== undefined) {
      updatedFolders[folderIndex].subfolders![subfolderIndex].pdfs = updatedFolders[folderIndex].subfolders![subfolderIndex].pdfs.filter((_, i) => i !== pdfIndex)
    } else {
      updatedFolders[folderIndex].pdfs = updatedFolders[folderIndex].pdfs.filter((_, i) => i !== pdfIndex)
    }
    setFormData({ ...formData, mediaFolders: updatedFolders })
  }

  const removeImageFromFolder = (folderIndex: number, imageIndex: number, subfolderIndex?: number) => {
    const updatedFolders = [...formData.mediaFolders]
    if (subfolderIndex !== undefined) {
      updatedFolders[folderIndex].subfolders![subfolderIndex].images = updatedFolders[folderIndex].subfolders![subfolderIndex].images.filter((_, i) => i !== imageIndex)
    } else {
      updatedFolders[folderIndex].images = updatedFolders[folderIndex].images.filter((_, i) => i !== imageIndex)
    }
    setFormData({ ...formData, mediaFolders: updatedFolders })
  }

  const addTextContentToFolder = (folderIndex: number, textData: { title: string; content: string }, subfolderIndex?: number) => {
    const updatedFolders = [...formData.mediaFolders]
    if (subfolderIndex !== undefined) {
      if (!updatedFolders[folderIndex].subfolders![subfolderIndex].textContent) {
        updatedFolders[folderIndex].subfolders![subfolderIndex].textContent = []
      }
      updatedFolders[folderIndex].subfolders![subfolderIndex].textContent.push(textData)
    } else {
      if (!updatedFolders[folderIndex].textContent) {
        updatedFolders[folderIndex].textContent = []
      }
      updatedFolders[folderIndex].textContent.push(textData)
    }
    setFormData({ ...formData, mediaFolders: updatedFolders })
    setNewTextContent({ title: '', content: '' })
    setEditingTextContent(null)
  }

  const updateTextContentInFolder = (folderIndex: number, textIndex: number, textData: { title: string; content: string }, subfolderIndex?: number) => {
    const updatedFolders = [...formData.mediaFolders]
    if (subfolderIndex !== undefined) {
      updatedFolders[folderIndex].subfolders![subfolderIndex].textContent[textIndex] = textData
    } else {
      updatedFolders[folderIndex].textContent[textIndex] = textData
    }
    setFormData({ ...formData, mediaFolders: updatedFolders })
    setNewTextContent({ title: '', content: '' })
    setEditingTextContent(null)
  }

  const editTextContentInFolder = (folderIndex: number, textIndex: number, subfolderIndex?: number) => {
    let textContent
    if (subfolderIndex !== undefined) {
      textContent = formData.mediaFolders[folderIndex].subfolders![subfolderIndex].textContent[textIndex]
    } else {
      textContent = formData.mediaFolders[folderIndex].textContent[textIndex]
    }
    setNewTextContent({ title: textContent.title, content: textContent.content })
    setEditingTextContent({ folderIndex, textIndex })
  }

  const cancelEditTextContent = () => {
    setNewTextContent({ title: '', content: '' })
    setEditingTextContent(null)
  }

  const removeTextContentFromFolder = (folderIndex: number, textIndex: number, subfolderIndex?: number) => {
    const updatedFolders = [...formData.mediaFolders]
    if (subfolderIndex !== undefined) {
      updatedFolders[folderIndex].subfolders![subfolderIndex].textContent = updatedFolders[folderIndex].subfolders![subfolderIndex].textContent.filter((_, i) => i !== textIndex)
    } else {
      updatedFolders[folderIndex].textContent = updatedFolders[folderIndex].textContent.filter((_, i) => i !== textIndex)
    }
    setFormData({ ...formData, mediaFolders: updatedFolders })
    // If we're editing the item being removed, cancel edit mode
    if (editingTextContent?.folderIndex === folderIndex && editingTextContent?.textIndex === textIndex) {
      cancelEditTextContent()
    }
  }

  const addExternalVideoToFolder = (folderIndex: number, videoData: { title: string; url: string; description?: string; platform?: string }, subfolderIndex?: number) => {
    const updatedFolders = [...formData.mediaFolders]
    if (subfolderIndex !== undefined) {
      if (!updatedFolders[folderIndex].subfolders![subfolderIndex].externalVideoLinks) {
        updatedFolders[folderIndex].subfolders![subfolderIndex].externalVideoLinks = []
      }
      updatedFolders[folderIndex].subfolders![subfolderIndex].externalVideoLinks.push(videoData)
    } else {
      if (!updatedFolders[folderIndex].externalVideoLinks) {
        updatedFolders[folderIndex].externalVideoLinks = []
      }
      updatedFolders[folderIndex].externalVideoLinks.push(videoData)
    }
    setFormData({ ...formData, mediaFolders: updatedFolders })
  }

  const removeExternalVideoFromFolder = (folderIndex: number, videoIndex: number, subfolderIndex?: number) => {
    const updatedFolders = [...formData.mediaFolders]
    if (subfolderIndex !== undefined) {
      updatedFolders[folderIndex].subfolders![subfolderIndex].externalVideoLinks = updatedFolders[folderIndex].subfolders![subfolderIndex].externalVideoLinks.filter((_, i) => i !== videoIndex)
    } else {
      updatedFolders[folderIndex].externalVideoLinks = updatedFolders[folderIndex].externalVideoLinks.filter((_, i) => i !== videoIndex)
    }
    setFormData({ ...formData, mediaFolders: updatedFolders })
  }

  // Filter courses based on search and filters
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = filterCategory === 'all' || course.category === filterCategory
    const matchesLevel = filterLevel === 'all' || course.level === filterLevel
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && course.isActive) ||
                         (filterStatus === 'inactive' && !course.isActive)
    
    return matchesSearch && matchesCategory && matchesLevel && matchesStatus
  })

  return (
    <div className="pt-28 md:pt-32 lg:pt-36 px-4 min-h-screen bg-gradient-to-b from-light to-white">
      <div className="max-w-7xl mx-auto mb-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
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

        {/* Search and Filter Section */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <FunnelIcon className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold text-primary">Search & Filter</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              />
            </div>

            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            >
              <option value="all">All Categories</option>
              <option value="CAD">CAD</option>
              <option value="CAE">CAE</option>
              <option value="PCB Design">PCB Design</option>
              <option value="Programming">Programming</option>
              <option value="Other">Other</option>
              {customCategories.map((category, index) => (
                <option key={index} value={category}>{category}</option>
              ))}
            </select>

            {/* Level Filter */}
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            >
              <option value="all">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Beginner to Intermediate">Beginner to Intermediate</option>
              <option value="Beginner to Advanced">Beginner to Advanced</option>
              <option value="Intermediate to Advanced">Intermediate to Advanced</option>
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Results Count */}
          <div className="mt-4 text-sm text-gray-600">
            Showing <span className="font-semibold text-primary">{filteredCourses.length}</span> of <span className="font-semibold">{courses.length}</span> courses
          </div>
        </div>

        {/* Courses List */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-lg text-dark/60">Loading courses...</p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-md border border-gray-200">
            <p className="text-lg text-dark/60">
              {courses.length === 0 ? 'No courses found. Create your first course!' : 'No courses match your search criteria.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredCourses.map((course) => (
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

                  {/* Syllabus Section - Both PDF and Text */}
                  <div className="border border-primary/20 rounded-lg p-4 space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-primary mb-2">
                        Course Syllabus * <span className="text-gray-500 font-normal">(Provide at least one format)</span>
                      </label>
                      <p className="text-xs text-gray-600 mb-4">
                        You can provide syllabus in PDF format, text format, or both
                      </p>
                    </div>

                    {/* PDF Upload Section */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-dark mb-3 flex items-center gap-2">
                        📄 PDF/DOC Format
                      </h4>
                      <FileUpload
                        label="Upload Syllabus File (Optional)"
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
                      {formData.syllabus.url && (
                        <p className="text-xs text-green-600 mt-2 font-semibold">✓ PDF syllabus uploaded</p>
                      )}
                    </div>

                    {/* Text Content Section */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-dark mb-3 flex items-center gap-2">
                        📝 Text/Rich Text Format
                      </h4>
                      <RichTextEditor
                        value={syllabusTextContent}
                        onChange={(value) => setSyllabusTextContent(value)}
                        rows={8}
                        placeholder="Enter detailed course syllabus content here. Use the toolbar to format text, add headings, lists, etc..."
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        💡 Tip: Use headings for modules/weeks, bullet points for topics, and formatting to make it easy to read
                      </p>
                      {syllabusTextContent.trim() && (
                        <p className="text-xs text-green-600 mt-2 font-semibold">✓ Text syllabus added</p>
                      )}
                    </div>

                    {/* Status Indicator */}
                    {!formData.syllabus.url && !syllabusTextContent.trim() && (
                      <p className="text-xs text-amber-600 font-medium">
                        ⚠️ Please provide at least one syllabus format (PDF or Text)
                      </p>
                    )}
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
                    <div className="flex gap-2">
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                        className="flex-1 px-4 py-3 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                        required
                      >
                        <option>CAD</option>
                        <option>CAE</option>
                        <option>PCB Design</option>
                        <option>Programming</option>
                        <option>Other</option>
                        {customCategories.map((category, index) => (
                          <option key={index} value={category}>{category}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => setShowCustomCategoryInput(true)}
                        className="px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center"
                        title="Add Custom Category"
                      >
                        <PlusIcon className="h-5 w-5" />
                      </button>
                    </div>
                    
                    {/* Custom Category Input */}
                    {showCustomCategoryInput && (
                      <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-primary/20">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Add Custom Category
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newCustomCategory}
                            onChange={(e) => setNewCustomCategory(e.target.value)}
                            placeholder="Enter category name..."
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                handleAddCustomCategory()
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={handleAddCustomCategory}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            Add
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelCustomCategory}
                            className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
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
                                <div className="bg-primary/5 px-4 py-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 flex-1">
                                      <button
                                        type="button"
                                        onClick={() => toggleFolder(folderIndex)}
                                        className="hover:bg-primary/20 rounded p-1"
                                      >
                                        {expandedFolders.has(folderIndex) ? (
                                          <ChevronUpIcon className="h-5 w-5 text-primary" />
                                        ) : (
                                          <ChevronDownIcon className="h-5 w-5 text-primary" />
                                        )}
                                      </button>
                                      <FolderIcon className="h-5 w-5 text-primary" />
                                      
                                      {editingFolder === folderIndex ? (
                                        <div className="flex items-center gap-2 flex-1">
                                          <input
                                            type="text"
                                            value={editFolderName}
                                            onChange={(e) => setEditFolderName(e.target.value)}
                                            className="px-2 py-1 border border-primary rounded text-sm flex-1"
                                            onClick={(e) => e.stopPropagation()}
                                            autoFocus
                                          />
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              saveEditFolder(folderIndex)
                                            }}
                                            className="text-green-600 hover:text-green-800 font-medium text-xs"
                                          >
                                            Save
                                          </button>
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              cancelEditFolder()
                                            }}
                                            className="text-gray-600 hover:text-gray-800 font-medium text-xs"
                                          >
                                            Cancel
                                          </button>
                                        </div>
                                      ) : (
                                        <div className="flex items-center gap-2 flex-1">
                                          <span className="font-semibold text-dark">{folder.folderName}</span>
                                          <span className="text-xs text-gray-500">
                                            ({folder.videos.length} videos, {folder.pdfs.length} PDFs, {folder.images.length} images
                                            {folder.subfolders && folder.subfolders.length > 0 && `, ${folder.subfolders.length} subfolders`})
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                      {editingFolder !== folderIndex && (
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            editFolder(folderIndex)
                                          }}
                                          className="text-blue-600 hover:text-blue-800 p-1"
                                          title="Edit folder name"
                                        >
                                          <PencilIcon className="h-4 w-4" />
                                        </button>
                                      )}
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          deleteFolder(folderIndex)
                                        }}
                                        className="text-red-600 hover:text-red-800 p-1"
                                        title="Delete folder"
                                      >
                                        <TrashIcon className="h-5 w-5" />
                                      </button>
                                    </div>
                                  </div>
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
                                          {folder.textContent.map((text, textIndex) => {
                                            // Strip HTML tags for preview
                                            const stripHtml = (html: string) => {
                                              const tmp = document.createElement('div');
                                              tmp.innerHTML = html;
                                              return tmp.textContent || tmp.innerText || '';
                                            };
                                            
                                            return (
                                            <div key={textIndex} className={`flex items-start justify-between p-2 rounded text-sm ${
                                              editingTextContent?.folderIndex === folderIndex && editingTextContent?.textIndex === textIndex
                                                ? 'bg-blue-50 border-2 border-blue-300'
                                                : 'bg-gray-50'
                                            }`}>
                                              <div className="flex-1">
                                                <span className="font-semibold text-gray-700">{text.title}</span>
                                                <p className="text-xs text-gray-600 mt-1 line-clamp-1">{stripHtml(text.content)}</p>
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
                                            );
                                          })}
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

                                    {/* Subfolders Section */}
                                    <div className="mt-6 pt-6 border-t-2 border-primary/20">
                                      <label className="block text-sm font-bold text-primary mb-2 flex items-center gap-2">
                                        📁 Subfolders
                                        <span className="text-xs text-gray-500 font-normal">(Organize content within this folder)</span>
                                      </label>
                                      
                                      {/* Create Subfolder */}
                                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg mb-3">
                                        <div className="flex gap-2">
                                          <input
                                            type="text"
                                            placeholder="Enter subfolder name (e.g., Week 1.1, Part A, Introduction)"
                                            value={newSubfolderName}
                                            onChange={(e) => setNewSubfolderName(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && createSubfolder(folderIndex)}
                                            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                          />
                                          <button
                                            type="button"
                                            onClick={() => createSubfolder(folderIndex)}
                                            className="px-4 py-2 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 transition-all text-sm flex items-center gap-2"
                                          >
                                            <FolderIcon className="h-4 w-4" />
                                            Create Subfolder
                                          </button>
                                        </div>
                                      </div>

                                      {/* Display Subfolders */}
                                      {folder.subfolders && folder.subfolders.length > 0 ? (
                                        <div className="space-y-2">
                                          {folder.subfolders.map((subfolder, subfolderIndex) => (
                                            <div key={subfolderIndex} className="border-2 border-blue-200 rounded-lg overflow-hidden bg-blue-50/50">
                                              {/* Subfolder Header */}
                                              <div className="bg-blue-100 px-3 py-2">
                                                <div className="flex items-center justify-between">
                                                  <div className="flex items-center gap-2 flex-1">
                                                    <button
                                                      type="button"
                                                      onClick={() => toggleSubfolder(folderIndex, subfolderIndex)}
                                                      className="hover:bg-blue-200 rounded p-1"
                                                    >
                                                      {expandedSubfolders.has(`${folderIndex}-${subfolderIndex}`) ? (
                                                        <ChevronUpIcon className="h-4 w-4 text-blue-700" />
                                                      ) : (
                                                        <ChevronDownIcon className="h-4 w-4 text-blue-700" />
                                                      )}
                                                    </button>
                                                    <FolderIcon className="h-4 w-4 text-blue-700" />
                                                    
                                                    {editingSubfolder?.folderIndex === folderIndex && editingSubfolder?.subfolderIndex === subfolderIndex ? (
                                                      <div className="flex items-center gap-2 flex-1">
                                                        <input
                                                          type="text"
                                                          value={editFolderName}
                                                          onChange={(e) => setEditFolderName(e.target.value)}
                                                          className="px-2 py-0.5 border border-blue-500 rounded text-sm flex-1"
                                                          onClick={(e) => e.stopPropagation()}
                                                          autoFocus
                                                        />
                                                        <button
                                                          type="button"
                                                          onClick={(e) => {
                                                            e.stopPropagation()
                                                            saveEditSubfolder()
                                                          }}
                                                          className="text-green-600 hover:text-green-800 font-medium text-xs"
                                                        >
                                                          Save
                                                        </button>
                                                        <button
                                                          type="button"
                                                          onClick={(e) => {
                                                            e.stopPropagation()
                                                            cancelEditSubfolder()
                                                          }}
                                                          className="text-gray-600 hover:text-gray-800 font-medium text-xs"
                                                        >
                                                          Cancel
                                                        </button>
                                                      </div>
                                                    ) : (
                                                      <div className="flex items-center gap-2 flex-1">
                                                        <span className="font-semibold text-gray-800 text-sm">{subfolder.folderName}</span>
                                                        <span className="text-xs text-gray-600">
                                                          ({subfolder.videos.length} videos, {subfolder.pdfs.length} PDFs, {subfolder.images.length} images)
                                                        </span>
                                                      </div>
                                                    )}
                                                  </div>
                                                  
                                                  <div className="flex items-center gap-1">
                                                    {!(editingSubfolder?.folderIndex === folderIndex && editingSubfolder?.subfolderIndex === subfolderIndex) && (
                                                      <button
                                                        type="button"
                                                        onClick={(e) => {
                                                          e.stopPropagation()
                                                          editSubfolder(folderIndex, subfolderIndex)
                                                        }}
                                                        className="text-blue-600 hover:text-blue-800 p-1"
                                                        title="Edit subfolder name"
                                                      >
                                                        <PencilIcon className="h-3.5 w-3.5" />
                                                      </button>
                                                    )}
                                                    <button
                                                      type="button"
                                                      onClick={(e) => {
                                                        e.stopPropagation()
                                                        deleteSubfolder(folderIndex, subfolderIndex)
                                                      }}
                                                      className="text-red-600 hover:text-red-800 p-1"
                                                      title="Delete subfolder"
                                                    >
                                                      <TrashIcon className="h-4 w-4" />
                                                    </button>
                                                  </div>
                                                </div>
                                              </div>

                                              {/* Subfolder Content */}
                                              {expandedSubfolders.has(`${folderIndex}-${subfolderIndex}`) && (
                                                <div className="p-3 bg-white space-y-3">
                                                  {/* Videos in Subfolder */}
                                                  <div>
                                                    <label className="block text-xs font-semibold text-primary mb-1">
                                                      🎥 Videos
                                                    </label>
                                                    <FileUpload
                                                      label="Add Video"
                                                      accept=".mp4,.mov,.avi,.mkv"
                                                      folder={`courses/folders/${folder.folderName}/${subfolder.folderName}/videos`}
                                                      onUploadComplete={(fileData) => addVideoToFolder(folderIndex, fileData, subfolderIndex)}
                                                    />
                                                    {subfolder.videos.length > 0 && (
                                                      <div className="mt-1 space-y-1">
                                                        {subfolder.videos.map((video, videoIndex) => (
                                                          <div key={videoIndex} className="flex items-center justify-between bg-gray-50 p-1.5 rounded text-xs">
                                                            <span className="text-gray-700 truncate flex-1">{video.name}</span>
                                                            <button
                                                              type="button"
                                                              onClick={() => removeVideoFromFolder(folderIndex, videoIndex, subfolderIndex)}
                                                              className="text-red-600 hover:text-red-800 ml-2 text-xs"
                                                            >
                                                              Remove
                                                            </button>
                                                          </div>
                                                        ))}
                                                      </div>
                                                    )}
                                                  </div>

                                                  {/* PDFs in Subfolder */}
                                                  <div>
                                                    <label className="block text-xs font-semibold text-primary mb-1">
                                                      📚 PDFs
                                                    </label>
                                                    <FileUpload
                                                      label="Add PDF"
                                                      accept=".pdf"
                                                      folder={`courses/folders/${folder.folderName}/${subfolder.folderName}/pdfs`}
                                                      onUploadComplete={(fileData) => addPdfToFolder(folderIndex, fileData, subfolderIndex)}
                                                    />
                                                    {subfolder.pdfs.length > 0 && (
                                                      <div className="mt-1 space-y-1">
                                                        {subfolder.pdfs.map((pdf, pdfIndex) => (
                                                          <div key={pdfIndex} className="flex items-center justify-between bg-gray-50 p-1.5 rounded text-xs">
                                                            <span className="text-gray-700 truncate flex-1">{pdf.name}</span>
                                                            <button
                                                              type="button"
                                                              onClick={() => removePdfFromFolder(folderIndex, pdfIndex, subfolderIndex)}
                                                              className="text-red-600 hover:text-red-800 ml-2 text-xs"
                                                            >
                                                              Remove
                                                            </button>
                                                          </div>
                                                        ))}
                                                      </div>
                                                    )}
                                                  </div>

                                                  {/* Images in Subfolder */}
                                                  <div>
                                                    <label className="block text-xs font-semibold text-primary mb-1">
                                                      📷 Images
                                                    </label>
                                                    <FileUpload
                                                      label="Add Image"
                                                      accept=".jpg,.jpeg,.png,.webp,.gif"
                                                      folder={`courses/folders/${folder.folderName}/${subfolder.folderName}/images`}
                                                      onUploadComplete={(fileData) => addImageToFolder(folderIndex, { url: fileData.url, fileId: fileData.fileId }, subfolderIndex)}
                                                    />
                                                    {subfolder.images.length > 0 && (
                                                      <div className="mt-1 grid grid-cols-3 gap-1">
                                                        {subfolder.images.map((image, imageIndex) => (
                                                          <div key={imageIndex} className="relative group">
                                                            <img 
                                                              src={image.url} 
                                                              alt={`${subfolder.folderName} image ${imageIndex + 1}`}
                                                              className="w-full h-16 object-cover rounded border border-gray-200"
                                                            />
                                                            <button
                                                              type="button"
                                                              onClick={() => removeImageFromFolder(folderIndex, imageIndex, subfolderIndex)}
                                                              className="absolute top-0.5 right-0.5 bg-red-600 text-white text-xs px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                                            >
                                                              ×
                                                            </button>
                                                          </div>
                                                        ))}
                                                      </div>
                                                    )}
                                                  </div>

                                                  {/* Text Content in Subfolder */}
                                                  <div>
                                                    <label className="block text-xs font-semibold text-primary mb-1">
                                                      📝 Text Content
                                                    </label>
                                                    <div className="bg-gray-50 p-2 rounded-lg mb-1 space-y-1.5">
                                                      <input
                                                        type="text"
                                                        placeholder="Content Title"
                                                        value={newTextContent.title}
                                                        onChange={(e) => setNewTextContent({ ...newTextContent, title: e.target.value })}
                                                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary/50"
                                                      />
                                                      <RichTextEditor
                                                        value={newTextContent.content}
                                                        onChange={(value) => setNewTextContent({ ...newTextContent, content: value })}
                                                        rows={3}
                                                        placeholder="Enter text content here..."
                                                      />
                                                      <div className="flex gap-2">
                                                        <button
                                                          type="button"
                                                          onClick={() => {
                                                            if (newTextContent.title && newTextContent.content) {
                                                              if (editingTextContent && editingTextContent.folderIndex === folderIndex) {
                                                                updateTextContentInFolder(folderIndex, editingTextContent.textIndex, newTextContent, subfolderIndex)
                                                              } else {
                                                                addTextContentToFolder(folderIndex, newTextContent, subfolderIndex)
                                                              }
                                                            } else {
                                                              alert('Please fill in both title and content')
                                                            }
                                                          }}
                                                          className="flex-1 bg-primary text-white px-2 py-1 rounded text-xs font-semibold hover:bg-primary/90 transition-all"
                                                        >
                                                          {editingTextContent && editingTextContent.folderIndex === folderIndex ? '✓ Update' : '+ Add'}
                                                        </button>
                                                        {editingTextContent && editingTextContent.folderIndex === folderIndex && (
                                                          <button
                                                            type="button"
                                                            onClick={cancelEditTextContent}
                                                            className="px-2 py-1 bg-gray-500 text-white rounded text-xs font-semibold hover:bg-gray-600 transition-all"
                                                          >
                                                            Cancel
                                                          </button>
                                                        )}
                                                      </div>
                                                    </div>
                                                    {subfolder.textContent && subfolder.textContent.length > 0 && (
                                                      <div className="mt-1 space-y-1">
                                                        {subfolder.textContent.map((text, textIndex) => {
                                                          const stripHtml = (html: string) => {
                                                            const tmp = document.createElement('div');
                                                            tmp.innerHTML = html;
                                                            return tmp.textContent || tmp.innerText || '';
                                                          };
                                                          
                                                          return (
                                                            <div key={textIndex} className="flex items-start justify-between bg-gray-50 p-1.5 rounded text-xs">
                                                              <div className="flex-1">
                                                                <span className="font-semibold text-gray-700">{text.title}</span>
                                                                <p className="text-xs text-gray-600 mt-0.5 line-clamp-1">{stripHtml(text.content)}</p>
                                                              </div>
                                                              <div className="flex gap-1 ml-2">
                                                                <button
                                                                  type="button"
                                                                  onClick={() => editTextContentInFolder(folderIndex, textIndex, subfolderIndex)}
                                                                  className="text-blue-600 hover:text-blue-800 font-medium text-xs"
                                                                >
                                                                  Edit
                                                                </button>
                                                                <button
                                                                  type="button"
                                                                  onClick={() => removeTextContentFromFolder(folderIndex, textIndex, subfolderIndex)}
                                                                  className="text-red-600 hover:text-red-800 font-medium text-xs"
                                                                >
                                                                  Remove
                                                                </button>
                                                              </div>
                                                            </div>
                                                          );
                                                        })}
                                                      </div>
                                                    )}
                                                  </div>

                                                  {/* External Videos in Subfolder */}
                                                  <div>
                                                    <label className="block text-xs font-semibold text-primary mb-1">
                                                      🔗 External Video Links
                                                    </label>
                                                    <div className="bg-gray-50 p-2 rounded-lg mb-1 space-y-1.5">
                                                      <input
                                                        type="text"
                                                        placeholder="Video Title"
                                                        value={newExternalVideo.title}
                                                        onChange={(e) => setNewExternalVideo({ ...newExternalVideo, title: e.target.value })}
                                                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary/50"
                                                      />
                                                      <input
                                                        type="url"
                                                        placeholder="Video URL"
                                                        value={newExternalVideo.url}
                                                        onChange={(e) => setNewExternalVideo({ ...newExternalVideo, url: e.target.value })}
                                                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary/50"
                                                      />
                                                      <select
                                                        value={newExternalVideo.platform}
                                                        onChange={(e) => setNewExternalVideo({ ...newExternalVideo, platform: e.target.value })}
                                                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary/50"
                                                      >
                                                        <option value="youtube">YouTube</option>
                                                        <option value="vimeo">Vimeo</option>
                                                        <option value="other">Other</option>
                                                      </select>
                                                      <button
                                                        type="button"
                                                        onClick={() => {
                                                          if (newExternalVideo.title && newExternalVideo.url) {
                                                            addExternalVideoToFolder(folderIndex, { ...newExternalVideo }, subfolderIndex)
                                                            setNewExternalVideo({ title: '', url: '', description: '', platform: 'youtube' })
                                                          } else {
                                                            alert('Please fill in at least title and URL')
                                                          }
                                                        }}
                                                        className="w-full bg-primary text-white px-2 py-1 rounded text-xs font-semibold hover:bg-primary/90 transition-all"
                                                      >
                                                        + Add External Video
                                                      </button>
                                                    </div>
                                                    {subfolder.externalVideoLinks && subfolder.externalVideoLinks.length > 0 && (
                                                      <div className="mt-1 space-y-1">
                                                        {subfolder.externalVideoLinks.map((video, videoIndex) => (
                                                          <div key={videoIndex} className="flex items-start justify-between bg-gray-50 p-1.5 rounded text-xs">
                                                            <div className="flex-1">
                                                              <div className="flex items-center gap-1">
                                                                <span className="font-semibold text-gray-700">{video.title}</span>
                                                                <span className="text-xs px-1 py-0.5 rounded bg-blue-100 text-blue-700">
                                                                  {video.platform}
                                                                </span>
                                                              </div>
                                                              <p className="text-xs text-blue-600 mt-0.5 truncate">{video.url}</p>
                                                            </div>
                                                            <button
                                                              type="button"
                                                              onClick={() => removeExternalVideoFromFolder(folderIndex, videoIndex, subfolderIndex)}
                                                              className="text-red-600 hover:text-red-800 ml-2 text-xs"
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
                                        <div className="text-center py-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-dashed border-blue-300">
                                          <FolderIcon className="h-8 w-8 text-blue-400 mx-auto mb-1" />
                                          <p className="text-xs text-gray-600">No subfolders yet. Create one above to organize content further.</p>
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

