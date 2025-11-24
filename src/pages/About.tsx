import { useEffect, useState } from 'react'
import { 
  AcademicCapIcon,
  RocketLaunchIcon,
  HeartIcon,
  CheckCircleIcon,
  UsersIcon
} from '@heroicons/react/24/outline'
import apiService from '../services/api'

export default function About() {
  const [config, setConfig] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    try {
      const response = await apiService.getAboutConfig()
      if (response.success) {
        setConfig(response.data)
      }
    } catch (error) {
      console.error('Error fetching about config:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="pt-28 md:pt-32 lg:pt-36 px-4 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="pt-28 md:pt-32 lg:pt-36 px-4 min-h-screen">
      <div className="max-w-7xl mx-auto mb-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-4">
            {config?.heroHeading || 'About Isaac Institute of Technology'}
          </h1>
          <p className="text-xl md:text-2xl text-dark/80 font-medium mb-4">
            {config?.heroSubheading || 'Empowering Engineers for Tomorrow\'s Challenges'}
          </p>
          <p className="text-lg text-dark/70 max-w-3xl mx-auto">
            {config?.heroDescription || 'Learn more about our company and mission.'}
          </p>
          {config?.heroImage?.url && (
            <div className="mt-8 flex justify-center">
              <img 
                src={config.heroImage.url} 
                alt="About Hero" 
                className="max-w-2xl w-full rounded-xl shadow-lg"
              />
            </div>
          )}
        </div>

        {/* Statistics */}
        {config?.stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-6 text-center border border-primary/20">
              <p className="text-4xl font-bold text-primary mb-2">
                {config.stats.students?.value?.toLocaleString() || '10,000'}+
              </p>
              <p className="text-sm text-dark/70 font-medium">
                {config.stats.students?.label || 'Students Worldwide'}
              </p>
            </div>
            <div className="bg-gradient-to-br from-secondary/10 to-secondary/5 rounded-xl p-6 text-center border border-secondary/20">
              <p className="text-4xl font-bold text-secondary mb-2">
                {config.stats.courses?.value || '50'}+
              </p>
              <p className="text-sm text-dark/70 font-medium">
                {config.stats.courses?.label || 'Expert-Led Courses'}
              </p>
            </div>
            <div className="bg-gradient-to-br from-accent/10 to-accent/5 rounded-xl p-6 text-center border border-accent/20">
              <p className="text-4xl font-bold text-accent mb-2">
                {config.stats.rating?.value || '4.8'}★
              </p>
              <p className="text-sm text-dark/70 font-medium">
                {config.stats.rating?.label || 'Average Rating'}
              </p>
            </div>
            <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-xl p-6 text-center border border-green-500/20">
              <p className="text-4xl font-bold text-green-600 mb-2">
                {config.stats.industries?.value || '15'}+
              </p>
              <p className="text-sm text-dark/70 font-medium">
                {config.stats.industries?.label || 'Industries Served'}
              </p>
            </div>
          </div>
        )}

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {/* Mission */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-8 border border-primary/10">
            <div className="flex items-center gap-3 mb-4">
              <AcademicCapIcon className="h-10 w-10 text-primary" />
              <h2 className="text-2xl font-bold text-primary">
                {config?.missionHeading || 'Our Mission'}
              </h2>
            </div>
            <p className="text-dark/70 leading-relaxed mb-4">
              {config?.missionContent || 'To empower every design engineer with the practical skills, theoretical depth, and innovative mindset required to solve complex challenges and lead the future of product development.'}
            </p>
            {config?.missionImage?.url && (
              <img 
                src={config.missionImage.url} 
                alt="Mission" 
                className="w-full rounded-lg mt-4"
              />
            )}
          </div>

          {/* Vision */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-8 border border-primary/10">
            <div className="flex items-center gap-3 mb-4">
              <RocketLaunchIcon className="h-10 w-10 text-secondary" />
              <h2 className="text-2xl font-bold text-primary">
                {config?.visionHeading || 'Our Vision'}
              </h2>
            </div>
            <p className="text-dark/70 leading-relaxed mb-4">
              {config?.visionContent || 'A world where engineering education is no longer a barrier to innovation, but its catalyst. We envision a global community where engineers can continuously learn, apply, and excel throughout their careers.'}
            </p>
            {config?.visionImage?.url && (
              <img 
                src={config.visionImage.url} 
                alt="Vision" 
                className="w-full rounded-lg mt-4"
              />
            )}
          </div>
        </div>

        {/* Story Section */}
        {config?.storyHeading && (
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-8 md:p-12 mb-20 border border-primary/20">
            <div className="flex items-center justify-center gap-3 mb-6">
              <HeartIcon className="h-10 w-10 text-primary" />
              <h2 className="text-3xl font-bold text-primary">
                {config.storyHeading}
              </h2>
            </div>
            <p className="text-dark/70 text-lg leading-relaxed max-w-4xl mx-auto text-center">
              {config?.storyContent || 'Isaac Institute of Technology was born from a disconnect. In a world of rapid technological advancement, design engineers were often left with theoretical knowledge or shallow software tutorials, but little guidance on how to bridge the gap to practical, robust, and manufacturable design.'}
            </p>
          </div>
        )}

        {/* Values */}
        {config?.values && config.values.length > 0 && (
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-primary mb-8 text-center">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {config.values.map((value: any, index: number) => (
                <div
                  key={index}
                  className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-primary/10 hover:shadow-xl transition-all duration-300"
                >
                  <CheckCircleIcon className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-xl font-bold text-dark mb-3">{value.title}</h3>
                  <p className="text-dark/70 leading-relaxed">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Team */}
        {config?.team && config.team.length > 0 && (
          <div className="mb-20">
            <div className="text-center mb-10">
              <UsersIcon className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-primary mb-3">Meet Our Team</h2>
              <p className="text-lg text-dark/70">
                The passionate people behind Isaac Institute of Technology
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {config.team.map((member: any, index: number) => (
                <div
                  key={index}
                  className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-primary/10 hover:shadow-xl transition-all duration-300"
                >
                  {member.image?.url && (
                    <img 
                      src={member.image.url} 
                      alt={member.name}
                      className="w-full h-64 object-cover"
                    />
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-dark mb-1">{member.name}</h3>
                    <p className="text-primary font-semibold mb-3">{member.role}</p>
                    {member.bio && (
                      <p className="text-dark/70 text-sm leading-relaxed mb-4">{member.bio}</p>
                    )}
                    <div className="flex gap-3">
                      {member.linkedin && (
                        <a
                          href={member.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-700 hover:text-blue-900 transition"
                        >
                          <span className="text-sm font-semibold">LinkedIn</span>
                        </a>
                      )}
                      {member.twitter && (
                        <a
                          href={member.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sky-500 hover:text-sky-700 transition"
                        >
                          <span className="text-sm font-semibold">Twitter</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-8 md:p-12 text-white text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Join Our Learning Community
          </h2>
          <p className="text-lg leading-relaxed max-w-3xl mx-auto mb-8">
            Start your journey to becoming an industry-ready engineer. Explore our courses and take the first step toward your engineering future.
          </p>
          <button
            onClick={() => window.location.href = '/courses'}
            className="bg-white text-primary px-8 py-4 rounded-lg font-semibold text-lg hover:bg-light/90 transition-all duration-300 transform hover:scale-105"
          >
            Explore Courses
          </button>
        </div>
      </div>
    </div>
  )
}
