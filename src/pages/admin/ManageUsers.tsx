import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeftIcon, 
  MagnifyingGlassIcon,
  UserIcon,
  AcademicCapIcon,
  TrashIcon,
  PlusIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import apiService from '../../services/api'

interface User {
  _id: string
  fullName: string
  email: string
  role: string
  isVerified: boolean
  enrolledCourses: Array<{
    _id: string
    title: string
    thumbnail?: { url: string }
  }>
  createdAt: string
}

export default function ManageUsers() {
  const navigate = useNavigate()
  const [users, setUsers] = useState<User[]>([])
  const [allCourses, setAllCourses] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showEnrollModal, setShowEnrollModal] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    checkAdminAccess()
    fetchUsers()
    fetchCourses()
  }, [search, roleFilter])

  const checkAdminAccess = () => {
    const user = apiService.getUser()
    if (!user || user.role !== 'admin') {
      navigate('/login')
    }
  }

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const response = await apiService.getAllUsers({ search, role: roleFilter })
      if (response.success) {
        setUsers(response.data)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCourses = async () => {
    try {
      const response = await apiService.getCourses()
      if (response.success) {
        setAllCourses(response.data)
      }
    } catch (error) {
      console.error('Error fetching courses:', error)
    }
  }

  const handleEnrollUser = async (courseId: string) => {
    if (!selectedUser) return
    
    try {
      const response = await apiService.enrollUser(selectedUser._id, courseId)
      if (response.success) {
        setMessage({ type: 'success', text: response.message || 'User enrolled successfully!' })
        setTimeout(() => setMessage(null), 3000)
        fetchUsers()
        setShowEnrollModal(false)
        setSelectedUser(null)
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to enroll user' })
      setTimeout(() => setMessage(null), 3000)
    }
  }

  const handleUnenrollUser = async (userId: string, courseId: string) => {
    if (!confirm('Are you sure you want to unenroll this user from the course?')) return

    try {
      const response = await apiService.unenrollUser(userId, courseId)
      if (response.success) {
        setMessage({ type: 'success', text: response.message || 'User unenrolled successfully!' })
        setTimeout(() => setMessage(null), 3000)
        fetchUsers()
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to unenroll user' })
      setTimeout(() => setMessage(null), 3000)
    }
  }

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) return

    try {
      const response = await apiService.deleteUser(userId)
      if (response.success) {
        setMessage({ type: 'success', text: 'User deleted successfully!' })
        setTimeout(() => setMessage(null), 3000)
        fetchUsers()
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to delete user' })
      setTimeout(() => setMessage(null), 3000)
    }
  }

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      const response = await apiService.updateUserRole(userId, newRole)
      if (response.success) {
        setMessage({ type: 'success', text: 'User role updated successfully!' })
        setTimeout(() => setMessage(null), 3000)
        fetchUsers()
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update role' })
      setTimeout(() => setMessage(null), 3000)
    }
  }

  const getAvailableCoursesForUser = (user: User) => {
    const enrolledIds = user.enrolledCourses.map(c => c._id)
    return allCourses.filter(course => !enrolledIds.includes(course._id))
  }

  return (
    <div className="pt-28 md:pt-32 lg:pt-36 px-4 min-h-screen bg-gradient-to-b from-light to-white">
      <div className="max-w-7xl mx-auto py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <button
            onClick={() => navigate('/admin')}
            className="inline-flex items-center gap-2 text-primary hover:text-primary-dark mb-4 transition font-medium"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Back to Dashboard
          </button>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
            <span className="text-primary font-semibold text-sm">User Management</span>
            <span className="text-secondary">👥</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-dark mb-2">Manage Users</h1>
          <p className="text-medium">View and manage all users and their course enrollments</p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            {message.text}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-6 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">All Roles</option>
              <option value="user">User</option>
              <option value="instructor">Instructor</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        {/* Users List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center border border-gray-200">
            <UserIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No users found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user._id} className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-dark">{user.fullName}</h3>
                      <select
                        value={user.role}
                        onChange={(e) => handleUpdateRole(user._id, e.target.value)}
                        className="px-3 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-primary"
                      >
                        <option value="user">User</option>
                        <option value="instructor">Instructor</option>
                        <option value="admin">Admin</option>
                      </select>
                      {user.isVerified && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Verified</span>
                      )}
                    </div>
                    <p className="text-medium text-sm">{user.email}</p>
                    <p className="text-gray-500 text-xs mt-1">
                      Joined: {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteUser(user._id, user.fullName)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                    title="Delete User"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>

                {/* Enrolled Courses */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-dark flex items-center gap-2">
                      <AcademicCapIcon className="w-5 h-5" />
                      Enrolled Courses ({user.enrolledCourses.length})
                    </h4>
                    <button
                      onClick={() => {
                        setSelectedUser(user)
                        setShowEnrollModal(true)
                      }}
                      className="flex items-center gap-1 px-3 py-1 bg-primary text-white text-sm rounded hover:bg-primary-dark transition"
                    >
                      <PlusIcon className="w-4 h-4" />
                      Enroll in Course
                    </button>
                  </div>

                  {user.enrolledCourses.length === 0 ? (
                    <p className="text-gray-500 text-sm">No courses enrolled</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {user.enrolledCourses.map((course) => (
                        <div key={course._id} className="flex items-center gap-2 p-2 border border-gray-200 rounded hover:bg-gray-50">
                          {course.thumbnail?.url && (
                            <img src={course.thumbnail.url} alt={course.title} className="w-12 h-12 object-cover rounded" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-dark truncate">{course.title}</p>
                          </div>
                          <button
                            onClick={() => handleUnenrollUser(user._id, course._id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded transition flex-shrink-0"
                            title="Unenroll"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Enroll Modal */}
      {showEnrollModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-dark">
                  Enroll {selectedUser.fullName} in Course
                </h3>
                <button
                  onClick={() => {
                    setShowEnrollModal(false)
                    setSelectedUser(null)
                  }}
                  className="p-2 hover:bg-gray-100 rounded"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              {getAvailableCoursesForUser(selectedUser).length === 0 ? (
                <p className="text-gray-600 py-8 text-center">User is already enrolled in all available courses</p>
              ) : (
                <div className="space-y-3">
                  {getAvailableCoursesForUser(selectedUser).map((course) => (
                    <div
                      key={course._id}
                      className="flex items-center gap-3 p-3 border border-gray-200 rounded hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleEnrollUser(course._id)}
                    >
                      {course.thumbnail?.url && (
                        <img src={course.thumbnail.url} alt={course.title} className="w-16 h-16 object-cover rounded" />
                      )}
                      <div className="flex-1">
                        <h4 className="font-semibold text-dark">{course.title}</h4>
                        <p className="text-sm text-medium">{course.category} • {course.level}</p>
                      </div>
                      <PlusIcon className="w-6 h-6 text-primary" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

