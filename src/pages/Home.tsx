import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import apiService from '../services/api'

const Home = () => {
  const navigate = useNavigate()
  const [config, setConfig] = useState<any>(null)
  const [instructors, setInstructors] = useState<any[]>([])
  const [selectedInstructor, setSelectedInstructor] = useState<any>(null)
  const [showInstructorModal, setShowInstructorModal] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [heroSlides, setHeroSlides] = useState<any[]>([])
  const [loadingSlides, setLoadingSlides] = useState(true)


  useEffect(() => {
    fetchHomeConfig()
    fetchInstructors()
    fetchHeroSlides()
  }, [])

  useEffect(() => {
    // Auto-advance slides based on their autoplayDuration
    if (heroSlides.length > 0) {
      const currentSlideData = heroSlides[currentSlide]
      const duration = currentSlideData?.autoplayDuration || 5000
      
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
      }, duration)
      
      return () => clearInterval(interval)
    }
  }, [currentSlide, heroSlides])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)
  }

  const fetchHomeConfig = async () => {
    try {
      const response = await apiService.getHomeConfig()
      if (response.success) {
        console.log('Home config loaded:', response.data)
        setConfig(response.data)
      }
    } catch (error) {
      console.error('Error fetching home config:', error)
    }
  }

  const fetchInstructors = async () => {
    try {
      const response = await apiService.getInstructors()
      if (response.success && response.data) {
        console.log('Instructors loaded:', response.data)
        // Limit to 4 instructors for home page display
        setInstructors(response.data.slice(0, 4))
      }
    } catch (error) {
      console.error('Error fetching instructors:', error)
    }
  }

  const fetchHeroSlides = async () => {
    try {
      setLoadingSlides(true)
      const response = await apiService.getHeroSlides()
      if (response.success && response.data && response.data.length > 0) {
        console.log('Hero slides loaded:', response.data)
        setHeroSlides(response.data)
      } else {
        console.log('No hero slides found, using fallback')
        // Use fallback if no slides configured
        setHeroSlides([])
      }
    } catch (error) {
      console.error('Error fetching hero slides:', error)
      setHeroSlides([])
    } finally {
      setLoadingSlides(false)
    }
  }

  // Default images if backend not configured
  const getImage = (type: string, defaultPath: string) => {
    const imageUrl = config?.[type]?.url;
    console.log(`Getting image for ${type}:`, imageUrl);
    // Only use config image if it's not empty
    if (imageUrl && imageUrl !== '' && imageUrl !== defaultPath) {
      console.log(`Using custom image for ${type}:`, imageUrl);
      return imageUrl;
    }
    console.log(`Using default image for ${type}:`, defaultPath);
    return defaultPath;
  }

  // Helper function to get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-light to-white">
      {/* Hero Slides Section */}
      <div className="relative w-full h-[90vh] overflow-hidden">
        {loadingSlides ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary"></div>
          </div>
        ) : heroSlides.length > 0 ? (
          <>
            {/* Dynamic Slides */}
            {heroSlides.map((slide, index) => (
              <div
                key={slide._id}
                className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${
                  index === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
              >
                {slide.type === 'video' ? (
                  <video
                    className="absolute inset-0 w-full h-full object-cover"
                    autoPlay={index === currentSlide}
                    muted
                    loop
                    playsInline
                  >
                    <source src={slide.media.url} type="video/mp4" />
                  </video>
                ) : (
                  <img
                    src={slide.media.url}
                    alt={slide.title}
                    className="w-full h-full object-cover"
                  />
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#1a1f71]/50 to-[#2d3192]/40"></div>

                {/* Content Overlay */}
                <div className="absolute inset-0 flex items-center justify-start px-8 md:px-16 lg:px-24">
                  <div className="max-w-3xl text-white">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 drop-shadow-lg" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
                      {slide.title}
                    </h1>
                    {slide.description && (
                      <p className="text-lg md:text-xl mb-6 drop-shadow-lg" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
                        {slide.description}
                      </p>
                    )}
                    <button
                      onClick={() => navigate(slide.buttonLink)}
                      className="bg-gradient-to-r from-[#4a5ba8] to-[#5c6bb8] hover:from-[#3a4b98] hover:to-[#4c5ba8] text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      {slide.buttonText}
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Navigation Arrows */}
            {heroSlides.length > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300 hover:scale-110 z-10"
                  aria-label="Previous slide"
                >
                  <ChevronLeftIcon className="h-8 w-8" />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300 hover:scale-110 z-10"
                  aria-label="Next slide"
                >
                  <ChevronRightIcon className="h-8 w-8" />
                </button>

                {/* Slide Indicators */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                  {heroSlides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        index === currentSlide ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/80'
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          // Fallback if no slides configured
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-[#1a1f71] to-[#2d3192] flex items-center justify-center">
            <div className="text-center text-white px-8">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Isaac Institute of Technology
              </h1>
              <p className="text-lg md:text-xl mb-6">
                Master Software And Technical skills with Industry Experts!
              </p>
              <button
                onClick={() => navigate('/about')}
                className="bg-white text-primary px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                READ MORE
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Rest of the content */}
      <div className="max-w-7xl mx-auto w-full px-4">

        {/* Why Choose Us Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-dark mb-4">Why Isaac Institute?</h2>
            <p className="text-lg text-medium max-w-3xl mx-auto">
              We're revolutionizing engineering education for the digital age
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🚀</span>
              </div>
              <h3 className="text-xl font-bold text-dark mb-2">Industry Experts</h3>
              <p className="text-medium">Learn from professionals at SpaceX, Apple, Tesla, and more</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⚡</span>
              </div>
              <h3 className="text-xl font-bold text-dark mb-2">Hands-On Projects</h3>
              <p className="text-medium">Build real-world projects that showcase your skills</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎯</span>
              </div>
              <h3 className="text-xl font-bold text-dark mb-2">Career Ready</h3>
              <p className="text-medium">Get job-ready skills that employers are actively seeking</p>
            </div>
          </div>
        </div>

        {/* Mission Section */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 md:gap-16 mb-20">
          <div className="flex items-center justify-center flex-1">
            <img src={getImage('starsImage', '/assets/stars.svg')} alt="stars" className="w-full max-w-md object-contain" />
          </div>
          
          <div className="flex flex-col gap-4 items-start justify-center flex-1">
            <h2 className="text-3xl md:text-4xl font-bold text-dark">Engineering the Future, One Student at a Time</h2>
            <p className="text-lg text-medium leading-relaxed">
              In a rapidly evolving tech landscape, engineers need more than theory—they need practical, cutting-edge skills. We bridge that gap with expert-led courses designed for real-world impact.
            </p>
            <p className="text-lg text-medium leading-relaxed">
              Founded by industry veterans from SpaceX, Tesla, and Apple, Isaac Institute equips engineers with the tools, knowledge, and confidence to shape tomorrow's innovations. The future is engineering—and it starts here.
            </p>
          </div>
        </div>

        {/* Third Section - Our Mission & Vision */}
        <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-6 md:gap-12 mb-16 md:mb-24">
          <div className="flex flex-col gap-3 items-start justify-center flex-1 px-2 md:px-6">
            <h1 className="text-xl md:text-2xl font-bold text-primary">Our Mission & Vision</h1>
            <p className="text-xs md:text-sm font-medium text-dark/60 max-w-md md:max-w-2xl">
              Our Mission: To empower every design engineer with the practical skills, theoretical depth, and innovative mindset required to solve complex challenges and lead the future of product development.
            </p>
            <p className="text-xs md:text-sm font-medium text-dark/60 max-w-md md:max-w-2xl">
              Our Vision: A world where engineering education is no longer a barrier to innovation, but its catalyst. We envision a global community where engineers can continuously learn, apply, and excel throughout their careers.
            </p>
          </div>
          <div className="flex items-center justify-center flex-1 px-2 md:px-6">
            <img src={getImage('visionImage', '/assets/vision.svg')} alt="vision" className="w-full max-w-sm md:max-w-md object-contain" />
          </div>
        </div>

        {/* Fourth Section - Our Pedagogy */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 md:gap-12 mb-16 md:mb-24">
          <div className="flex items-center justify-center flex-1 px-2 md:px-6">
            <img src={getImage('teamCollaborationImage', '/assets/team-collaboration.svg')} alt="team collaboration" className="w-full max-w-sm md:max-w-md object-contain" />
          </div>
          
          <div className="flex flex-col gap-3 items-start justify-center flex-1 px-2 md:px-6">
            <h1 className="text-xl md:text-2xl font-bold text-primary">More Than a Tutorial. A Transformation.</h1>
            <p className="text-xs md:text-sm font-medium text-dark/60 max-w-md md:max-w-2xl">
              We've built our curriculum on a core set of learning principles that ensure real, tangible skill development.
            </p>
            <ul className="text-xs md:text-sm font-medium text-dark/60 max-w-md md:max-w-2xl space-y-2">
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span><strong>Principle-Based Learning:</strong> We teach the why behind the what. Understand the core mechanics, material science, and physics so your skills are software-agnostic and enduring.</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span><strong>Project-Centric Application:</strong> Knowledge without application is theory. Every course includes real-world projects with downloadable files, datasets, and challenges that mirror professional workflows.</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span><strong>Expert-Led Instruction:</strong> Learn from the best. Our instructors are active industry professionals, lead engineers, and PhDs who bring current, real-world insights directly to you.</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span><strong>Community of Practice:</strong> Join a global network of peers. Collaborate, solve problems, and share knowledge in our exclusive forums and live Q&A sessions.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Instructors Section - Dynamic from Database */}
        <div className="mb-20 md:mb-32">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-dark mb-4">Learn from the Best in the Industry</h2>
            <p className="text-lg text-medium max-w-3xl mx-auto">
              Our instructors are industry veterans from SpaceX, Tesla, Apple, and leading tech companies
            </p>
          </div>
          
          {instructors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {instructors.map((instructor) => (
                <div 
                  key={instructor._id} 
                  onClick={() => {
                    setSelectedInstructor(instructor);
                    setShowInstructorModal(true);
                  }}
                  className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-xl transition-all cursor-pointer hover:scale-105 hover:border-primary"
                >
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden ring-4 ring-primary/10">
                    {instructor.profileImage?.url ? (
                      <img 
                        src={instructor.profileImage.url} 
                        alt={instructor.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className={`w-full h-full bg-primary/10 flex items-center justify-center ${instructor.profileImage?.url ? 'hidden' : ''}`}>
                      <span className="text-primary font-bold text-2xl">{getInitials(instructor.name)}</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-dark text-center mb-2">{instructor.name}</h3>
                  <p className="text-sm text-primary text-center mb-3 font-medium">{instructor.title}</p>
                  <p className="text-sm text-medium text-center leading-relaxed line-clamp-3">{instructor.description}</p>
                  <p className="text-xs text-primary text-center mt-3 font-semibold">Click for more details →</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading instructors...</p>
            </div>
          )}
        </div>

        {/* Sixth Section - Our Core Values */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 md:gap-12 mb-16 md:mb-24">
          <div className="flex items-center justify-center flex-1 px-2 md:px-6">
            <img src={getImage('goalsImage', '/assets/goals.svg')} alt="goals" className="w-full max-w-sm md:max-w-md object-contain" />
          </div>
          
          <div className="flex flex-col gap-3 items-start justify-center flex-1 px-2 md:px-6">
            <h1 className="text-xl md:text-2xl font-bold text-primary">Our Core Values</h1>
            <ul className="text-xs md:text-sm font-medium text-dark/60 max-w-md md:max-w-2xl space-y-3">
              <li className="flex items-start">
                <span className="text-primary mr-2 font-bold">•</span>
                <div>
                  <span className="font-bold text-primary">Excellence:</span> We are relentlessly committed to the highest standards in content, instruction, and user experience.
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2 font-bold">•</span>
                <div>
                  <span className="font-bold text-primary">Clarity:</span> We break down complexity into clear, understandable, and actionable lessons.
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2 font-bold">•</span>
                <div>
                  <span className="font-bold text-primary">Integrity:</span> We teach proven, validated methods. Our goal is your success, not just course completion.
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2 font-bold">•</span>
                <div>
                  <span className="font-bold text-primary">Innovation:</span> We continuously evolve our curriculum to include the latest tools and methodologies, from Generative Design to Advanced Composites.
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Seventh Section - Join the Journey */}
        <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-6 md:gap-12 mb-16">
          <div className="flex flex-col gap-3 items-start justify-center flex-1 px-2 md:px-6">
            <h1 className="text-xl md:text-2xl font-bold text-primary">Ready to Redefine What You Can Design?</h1>
            <p className="text-xs md:text-sm font-medium text-dark/60 max-w-md md:max-w-2xl">
              Whether you're an aspiring engineer, a seasoned professional looking to specialize, or a manager aiming to upskill your team, Isaac Institute of Technology is your partner in professional growth.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-4 w-full">
              <button 
                onClick={() => navigate('/courses')}
                className="w-full sm:w-auto border border-primary hover:bg-primary duration-300 text-primary hover:text-light px-4 py-2 rounded-md cursor-pointer text-xs md:text-sm"
              >
                Explore Our Courses
              </button>
              <button 
                onClick={() => navigate('/about')}
                className="w-full sm:w-auto border border-primary hover:bg-primary duration-300 text-primary hover:text-light px-4 py-2 rounded-md cursor-pointer text-xs md:text-sm"
              >
                View Our Instructor Team
              </button>
              <button 
                onClick={() => navigate('/contact')}
                className="w-full sm:w-auto border border-dark bg-theme text-dark hover:bg-dark hover:text-light duration-300 px-4 py-2 rounded-md cursor-pointer text-xs md:text-sm"
              >
                Contact Us for Team Training
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-center flex-1 px-2 md:px-6">
            <img src={getImage('journeyImage', '/assets/journey.svg')} alt="journey" className="w-full max-w-sm md:max-w-md object-contain" />
          </div>
        </div>
      </div>

      {/* Instructor Detail Modal */}
      {showInstructorModal && selectedInstructor && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4"
          onClick={() => setShowInstructorModal(false)}
        >
          <div 
            className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-primary to-primary/90 text-white p-6 rounded-t-xl">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full overflow-hidden ring-4 ring-white/30 flex-shrink-0">
                    {selectedInstructor.profileImage?.url ? (
                      <img 
                        src={selectedInstructor.profileImage.url} 
                        alt={selectedInstructor.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-white/20 flex items-center justify-center">
                        <span className="text-white font-bold text-2xl">{getInitials(selectedInstructor.name)}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-1">{selectedInstructor.name}</h2>
                    <p className="text-white/90 text-sm">{selectedInstructor.title}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowInstructorModal(false)}
                  className="text-white/80 hover:text-white text-2xl font-bold hover:bg-white/10 w-8 h-8 rounded-full flex items-center justify-center transition-all"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-lg font-bold text-dark mb-2">About</h3>
                <p className="text-medium text-sm leading-relaxed">{selectedInstructor.description}</p>
              </div>

              {/* Experience & Specialization */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedInstructor.yearsOfExperience && (
                  <div className="bg-primary/5 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-primary mb-1">Years of Experience</h4>
                    <p className="text-2xl font-bold text-dark">{selectedInstructor.yearsOfExperience}+ years</p>
                  </div>
                )}
                {selectedInstructor.specialization && (
                  <div className="bg-primary/5 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-primary mb-1">Specialization</h4>
                    <p className="text-sm text-dark font-medium">{selectedInstructor.specialization}</p>
                  </div>
                )}
              </div>

              {/* Previous Companies */}
              {selectedInstructor.previousCompanies && selectedInstructor.previousCompanies.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-dark mb-3">Previous Experience</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedInstructor.previousCompanies.map((company: string, index: number) => (
                      <span 
                        key={index}
                        className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {company}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {selectedInstructor.education && selectedInstructor.education.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-dark mb-3">Education</h3>
                  <div className="space-y-3">
                    {selectedInstructor.education.map((edu: any, index: number) => (
                      <div key={index} className="border-l-4 border-primary pl-4">
                        <h4 className="font-semibold text-dark">{edu.degree}</h4>
                        <p className="text-sm text-medium">{edu.institution}</p>
                        {edu.year && <p className="text-xs text-medium mt-1">{edu.year}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Achievements */}
              {selectedInstructor.achievements && selectedInstructor.achievements.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-dark mb-3">Achievements & Recognition</h3>
                  <ul className="space-y-2">
                    {selectedInstructor.achievements.map((achievement: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <span className="text-primary mr-2 font-bold">•</span>
                        <span className="text-sm text-medium">{achievement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Contact Information */}
              {(selectedInstructor.email || selectedInstructor.linkedin) && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-bold text-dark mb-3">Connect</h3>
                  <div className="flex flex-wrap gap-3">
                    {selectedInstructor.email && (
                      <a 
                        href={`mailto:${selectedInstructor.email}`}
                        className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-all text-sm font-medium"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Email
                      </a>
                    )}
                    {selectedInstructor.linkedin && (
                      <a 
                        href={selectedInstructor.linkedin.startsWith('http') ? selectedInstructor.linkedin : `https://${selectedInstructor.linkedin}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-[#0A66C2] text-white px-4 py-2 rounded-lg hover:bg-[#004182] transition-all text-sm font-medium"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                        LinkedIn
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Home
