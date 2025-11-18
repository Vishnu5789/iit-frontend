import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AcademicCapIcon, NewspaperIcon, BuildingOffice2Icon, UsersIcon } from '@heroicons/react/24/outline'
import apiService from '../../services/api'

const AdminDashboard = () => {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    coursesCount: 0,
    blogsCount: 0,
    industriesCount: 0
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
      const [courses, blogs, industries] = await Promise.all([
        fetch('http://localhost:5000/api/courses').then(res => res.json()),
        fetch('http://localhost:5000/api/blogs').then(res => res.json()),
        fetch('http://localhost:5000/api/industries').then(res => res.json())
      ])

      setStats({
        coursesCount: courses.count || 0,
        blogsCount: blogs.count || 0,
        industriesCount: industries.count || 0
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
    }
  ]

  return (
    <div className="pt-28 md:pt-32 lg:pt-36 px-4 min-h-screen">
      <div className="max-w-7xl mx-auto mb-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-4">Admin Dashboard</h1>
          <p className="text-lg text-dark/70">Manage your courses, blogs, and industry content</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {dashboardCards.map((card, index) => {
            const Icon = card.icon
            return (
              <div
                key={index}
                onClick={() => navigate(card.link)}
                className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-8 border border-primary/10 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer"
              >
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-6 mx-auto`}>
                  <Icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-4xl font-bold text-primary mb-2 text-center">
                  {isLoading ? '...' : card.count}
                </h3>
                <p className="text-dark/60 text-center font-semibold">{card.title}</p>
              </div>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-8 border border-primary/10">
          <h2 className="text-2xl font-bold text-primary mb-6 text-center">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/admin/courses')}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-[1.02] shadow-md"
            >
              Manage Courses
            </button>
            <button
              onClick={() => navigate('/admin/blogs')}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-[1.02] shadow-md"
            >
              Manage Blogs
            </button>
            <button
              onClick={() => navigate('/admin/industries')}
              className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-purple-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-[1.02] shadow-md"
            >
              Manage Industries
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard

