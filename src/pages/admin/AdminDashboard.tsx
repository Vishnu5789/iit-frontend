import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AcademicCapIcon, NewspaperIcon, BuildingOffice2Icon, HomeIcon, UsersIcon, EnvelopeIcon, ChatBubbleLeftRightIcon, UserGroupIcon, PhotoIcon, VideoCameraIcon } from '@heroicons/react/24/outline'
import apiService from '../../services/api'
import { API_BASE_URL } from '../../config/api.config'

const AdminDashboard = () => {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    coursesCount: 0,
    blogsCount: 0,
    industriesCount: 0,
    usersCount: 0,
    contactMessagesCount: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAdminAccess()
    fetchStats()
  }, [])

  const checkAdminAccess = () => {
    const user = apiService.getUser()
    if (!user || user.role !== 'admin') {
      navigate('/login')
    }
  }

  const fetchStats = async () => {
    try {
      const [courses, blogs, industries, users, contact] = await Promise.all([
        fetch(`${API_BASE_URL}/courses`).then(res => res.json()),
        fetch(`${API_BASE_URL}/blogs`).then(res => res.json()),
        fetch(`${API_BASE_URL}/industries`).then(res => res.json()),
        apiService.getUserStats(),
        apiService.getContactStats()
      ])

      setStats({
        coursesCount: courses.count || 0,
        blogsCount: blogs.count || 0,
        industriesCount: industries.count || 0,
        usersCount: users.data?.totalUsers || 0,
        contactMessagesCount: contact.data?.newMessages || 0
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const dashboardCards = [
    {
      title: 'Courses',
      count: stats.coursesCount,
      icon: AcademicCapIcon,
      color: 'from-blue-500 to-blue-600',
      link: '/admin/courses'
    },
    {
      title: 'Users',
      count: stats.usersCount,
      icon: UsersIcon,
      color: 'from-orange-500 to-orange-600',
      link: '/admin/users'
    },
    {
      title: 'Blog Posts',
      count: stats.blogsCount,
      icon: NewspaperIcon,
      color: 'from-green-500 to-green-600',
      link: '/admin/blogs'
    },
    {
      title: 'Industries',
      count: stats.industriesCount,
      icon: BuildingOffice2Icon,
      color: 'from-purple-500 to-purple-600',
      link: '/admin/industries'
    },
    {
      title: 'Homepage',
      count: '✓',
      icon: HomeIcon,
      color: 'from-pink-500 to-pink-600',
      link: '/admin/homepage'
    },
    {
      title: 'Messages',
      count: stats.contactMessagesCount,
      icon: EnvelopeIcon,
      color: 'from-cyan-500 to-cyan-600',
      link: '/admin/contact-messages'
    },
    {
      title: 'Admissions',
      count: '📝',
      icon: AcademicCapIcon,
      color: 'from-indigo-500 to-indigo-600',
      link: '/admin/admissions'
    },
    {
      title: 'Webinar',
      count: '📹',
      icon: VideoCameraIcon,
      color: 'from-teal-500 to-teal-600',
      link: '/admin/webinar'
    },
    {
      title: 'Webinar Registrations',
      count: '👥',
      icon: UsersIcon,
      color: 'from-purple-500 to-purple-600',
      link: '/admin/webinar-registrations'
    },
    {
      title: 'Blog Subscribers',
      count: '📧',
      icon: EnvelopeIcon,
      color: 'from-blue-500 to-blue-600',
      link: '/admin/blog-subscribers'
    },
    {
      title: 'Widget',
      count: '⚙️',
      icon: ChatBubbleLeftRightIcon,
      color: 'from-indigo-500 to-indigo-600',
      link: '/admin/contact-widget'
    },
    {
      title: 'Instructors',
      count: '👨‍🏫',
      icon: UserGroupIcon,
      color: 'from-emerald-500 to-emerald-600',
      link: '/admin/instructors'
    },
    {
      title: 'Hero Slides',
      count: '🎬',
      icon: PhotoIcon,
      color: 'from-rose-500 to-rose-600',
      link: '/admin/hero-slides'
    }
  ]

  return (
    <div className="pt-28 md:pt-32 lg:pt-36 px-4 min-h-screen bg-gradient-to-b from-light to-white">
      <div className="max-w-7xl mx-auto mb-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
            <span className="text-primary font-semibold text-sm">Admin Panel</span>
            <span className="text-secondary">⚙️</span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-dark mb-4">Admin Dashboard</h1>
          <p className="text-lg text-medium">Manage your courses, blogs, and industry content</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-12">
          {dashboardCards.map((card, index) => {
            const Icon = card.icon
            return (
              <div
                key={index}
                onClick={() => navigate(card.link)}
                className="group bg-white rounded-xl shadow-md hover:shadow-2xl p-6 border border-gray-200 hover:border-primary/30 transition-all duration-300 cursor-pointer transform hover:scale-105"
              >
                <div className={`w-14 h-14 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-dark mb-1 text-center">
                  {isLoading ? '...' : card.count}
                </h3>
                <p className="text-medium text-sm text-center font-medium">{card.title}</p>
              </div>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-md p-8 border border-gray-200">
          <h2 className="text-2xl font-bold text-dark mb-6 text-center">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/admin/courses')}
              className="bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-4 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-[1.03]"
            >
              Manage Courses
            </button>
            <button
              onClick={() => navigate('/admin/users')}
              className="bg-gradient-to-r from-accent to-orange-600 text-white px-6 py-4 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-[1.03]"
            >
              Manage Users
            </button>
            <button
              onClick={() => navigate('/admin/homepage')}
              className="bg-gradient-to-r from-pink-500 to-pink-600 text-white px-6 py-4 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-[1.03]"
            >
              Manage Homepage
            </button>
            <button
              onClick={() => navigate('/admin/blogs')}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-4 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-[1.03]"
            >
              Manage Blogs
            </button>
            <button
              onClick={() => navigate('/admin/industries')}
              className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-4 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-[1.03]"
            >
              Manage Industries
            </button>
            <button
              onClick={() => navigate('/admin/contact')}
              className="bg-gradient-to-r from-secondary to-blue-500 text-white px-6 py-4 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-[1.03]"
            >
              Manage Contact
            </button>
            <button
              onClick={() => navigate('/admin/contact-messages')}
              className="bg-gradient-to-r from-teal-500 to-teal-600 text-white px-6 py-4 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-[1.03]"
            >
              View Messages
            </button>
            <button
              onClick={() => navigate('/admin/about')}
              className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-4 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-[1.03]"
            >
              Manage About
            </button>
            <button
              onClick={() => navigate('/admin/industry-page')}
              className="bg-gradient-to-r from-lime-500 to-lime-600 text-white px-6 py-4 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-[1.03]"
            >
              Manage Industry Page
            </button>
            <button
              onClick={() => navigate('/admin/contact-widget')}
              className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-6 py-4 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-[1.03]"
            >
              Manage Contact Widget
            </button>
            <button
              onClick={() => navigate('/admin/instructors')}
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-4 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-[1.03]"
            >
              Manage Instructors
            </button>
            <button
              onClick={() => navigate('/admin/resources')}
              className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white px-6 py-4 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-[1.03]"
            >
              Manage Resources
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard

