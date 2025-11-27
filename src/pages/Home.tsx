import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import apiService from '../services/api'

const Home = () => {
  const navigate = useNavigate()
  const [config, setConfig] = useState<any>(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [showVideo, setShowVideo] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)

  // All images from homepage folder
  const heroImages = [
    '/homepage/82fed7ddfe19a40b50dc1508d9371408.jpg',
    '/homepage/6acb473884b3e7aa7a83467b628f3921.jpg',
    '/homepage/4addc37503cbf4e69b8672af2b4ec9af.jpg',
    '/homepage/1bd94ca3acb92c76890de8dfc3b1e297.jpg',
    '/homepage/0b82803feda096bb75082e8942bb0f2d.jpg',
    '/homepage/Ceaser-768x658-1.jpg',
    '/homepage/1d823051d52c1a387612fb3ddf88910e.jpg',
    '/homepage/0e1e014bc9213484c85003b7e02f5d8d.jpg',
    '/homepage/95201ff5525ef6a006e4abf982ff97a5.jpg',
    '/homepage/1ba7a05d2d7b27c02a0221457ff15693.jpg',
    '/homepage/8e24b19fe59a7a2a863999d088207cd1 (1).jpg',
    '/homepage/666953facea59abe605d0983258b91e5.jpg',
    '/homepage/ddb90b8f49bfbefa5e377a8e266d7765 (1).jpg',
    '/homepage/559e262d6cb39ee495ecfdcaecb0c057.jpg',
    '/homepage/b666d7bca15acfcc9aecc7dff3c17c90.jpg',
    '/homepage/f1456503d372b765fa8b36a056548d11.jpg',
    '/homepage/9bd8936f196534110b61f4c132d51dac.jpg',
    '/homepage/26997984e76c16d4cbecb81836e10d01.jpg',
    '/homepage/a2e6f96be47c17a3df0a3f3ec0a8fd96.jpg',
    '/homepage/a6ba1ccce64fd8fa49b817da8fd2106e.jpg',
    '/homepage/c36d900e75ca51ab251e81935210cdac.jpg',
    '/homepage/e53a6d22949ba0cda8ff547e1e85bad8.jpg',
    '/homepage/e132e1c924d5088912c91eefabf1a823.jpg',
    '/homepage/f9081e9da41c470112bcf3634e2acf69.jpg',
    '/homepage/fc83566263c169159d3b237ad2b2e5a4.jpg',
    '/homepage/crop_69325bcbb010898c6b160b693ecb2bda.jpg',
    '/homepage/csm-infrastructureandsystemsengineering-banner.jpg',
    '/homepage/GhUPwWagjW6uM59FCeYsiuwwxTgrke871634558728.jpg',
    '/homepage/Hexagon-Intergraph-Smart3D-UseCase4-592x304.jpg',
    '/homepage/Hexagon-Smart3D-UseCase1New-624x704.jpg',
    '/homepage/WhatsApp Image 2025-10-27 at 7.52.16 PM.jpeg',
    '/homepage/WhatsApp Image 2025-10-27 at 7.52.17 PM (1).jpeg',
    '/homepage/WhatsApp Image 2025-10-27 at 7.52.17 PM.jpeg',
    '/homepage/WhatsApp Image 2025-10-27 at 7.53.07 PM.jpeg',
    '/homepage/WhatsApp Image 2025-10-27 at 7.53.08 PM (1).jpeg',
    '/homepage/WhatsApp Image 2025-10-27 at 7.53.08 PM (3).jpeg',
    '/homepage/WhatsApp Image 2025-10-27 at 7.53.08 PM (2).jpeg',
    '/homepage/WhatsApp Image 2025-10-27 at 7.53.08 PM.jpeg',
    '/homepage/WhatsApp Image 2025-10-27 at 7.53.09 PM (1).jpeg',
    '/homepage/WhatsApp Image 2025-10-27 at 7.53.09 PM (2).jpeg',
    '/homepage/WhatsApp Image 2025-10-27 at 7.53.09 PM (3).jpeg',
    '/homepage/WhatsApp Image 2025-10-27 at 7.53.09 PM.jpeg',
    '/homepage/WhatsApp Image 2025-10-27 at 7.53.10 PM (1).jpeg',
    '/homepage/WhatsApp Image 2025-10-27 at 7.53.10 PM (2).jpeg',
    '/homepage/WhatsApp Image 2025-10-27 at 7.53.10 PM.jpeg',
    '/homepage/WhatsApp Image 2025-10-27 at 7.53.11 PM (1).jpeg',
    '/homepage/WhatsApp Image 2025-10-27 at 7.53.11 PM (2).jpeg',
    '/homepage/WhatsApp Image 2025-10-27 at 7.53.11 PM (3).jpeg',
    '/homepage/WhatsApp Image 2025-10-27 at 7.53.11 PM.jpeg'
  ]

  useEffect(() => {
    fetchHomeConfig()
  }, [])

  useEffect(() => {
    // When video ends, start image carousel
    const video = videoRef.current
    if (video) {
      const handleVideoEnd = () => {
        setShowVideo(false)
        setCurrentSlide(0)
      }
      video.addEventListener('ended', handleVideoEnd)
      return () => video.removeEventListener('ended', handleVideoEnd)
    }
  }, [])

  useEffect(() => {
    // Auto-advance slides every 5 seconds when showing images
    if (!showVideo) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % heroImages.length)
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [showVideo, heroImages.length])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroImages.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length)
  }

  const fetchHomeConfig = async () => {
    try {
      const response = await apiService.getHomeConfig()
      if (response.success) {
        setConfig(response.data)
      }
    } catch (error) {
      console.error('Error fetching home config:', error)
    }
  }

  // Default images if backend not configured
  const getImage = (type: string, defaultPath: string) => {
    return config?.[type]?.url || defaultPath
  }

  const creators = [
    {
      id: 1,
      name: "Dr. James Sterling",
      role: "Former SpaceX Stress Analyst",
      description: "Led structural analysis for Mars mission components. 15+ years in aerospace engineering.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face&auto=format&q=80",
      initials: "JS"
    },
    {
      id: 2,
      name: "Sarah Mitchell",
      role: "Lead CAD Designer at Apple",
      description: "Designed next-generation product enclosures. Expert in advanced manufacturing processes.",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face&auto=format&q=80",
      initials: "SM"
    },
    {
      id: 3,
      name: "Dr. Robert Chen",
      role: "Medical Device Innovation Lead",
      description: "Pioneered life-saving surgical instruments. PhD in Biomedical Engineering from MIT.",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face&auto=format&q=80",
      initials: "RC"
    },
    {
      id: 4,
      name: "Alexandra Liu",
      role: "Tesla Senior Simulation Engineer",
      description: "Advanced FEA specialist for electric vehicle systems. Expert in thermal management.",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face&auto=format&q=80",
      initials: "AL"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-light to-white">
      {/* Hero Video/Image Carousel Section */}
      <div className="relative w-full h-[90vh] overflow-hidden">
        {/* Video */}
        {showVideo && (
          <>
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover"
              autoPlay
              muted
              playsInline
            >
              <source src="/homepage/ISAAC INSTITUTE OF TECHNOLOGY (2).mp4" type="video/mp4" />
            </video>
            
            {/* Skip Video Button */}
            <button
              onClick={() => {
                setShowVideo(false)
                setCurrentSlide(0)
              }}
              className="absolute bottom-8 right-8 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 hover:scale-105 z-10 flex items-center gap-2"
            >
              Skip Video
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </>
        )}

        {/* Image Carousel */}
        {!showVideo && (
          <div className="absolute inset-0 w-full h-full">
            {heroImages.map((image, index) => (
              <div
                key={index}
                className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${
                  index === currentSlide ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <img
                  src={image}
                  alt={`Hero slide ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}

            {/* Navigation Arrows */}
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
          </div>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#1a1f71]/50 to-[#2d3192]/40"></div>

        {/* Content Overlay */}
        <div className="absolute inset-0 flex items-center justify-start px-8 md:px-16 lg:px-24">
          <div className="max-w-3xl text-white">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 drop-shadow-lg" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
              Isaac Institute of Technology, Master Software And Technical skills with Industry Experts !
            </h1>
            <button
              onClick={() => navigate('/about')}
              className="bg-gradient-to-r from-[#4a5ba8] to-[#5c6bb8] hover:from-[#3a4b98] hover:to-[#4c5ba8] text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              READ MORE
            </button>
          </div>
        </div>

        {/* Slide Indicators */}
        {!showVideo && (
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2">
            {heroImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? 'bg-white w-8'
                    : 'bg-white/50 hover:bg-white/75'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
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
            <img src="/assets/vision.svg" alt="vision" className="w-full max-w-sm md:max-w-md object-contain" />
          </div>
        </div>

        {/* Fourth Section - Our Pedagogy */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 md:gap-12 mb-16 md:mb-24">
          <div className="flex items-center justify-center flex-1 px-2 md:px-6">
            <img src="/assets/team-collaboration.svg" alt="team collaboration" className="w-full max-w-sm md:max-w-md object-contain" />
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

        {/* Instructors Section - Udemy Style */}
        <div className="mb-20 md:mb-32">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-dark mb-4">Learn from the Best in the Industry</h2>
            <p className="text-lg text-medium max-w-3xl mx-auto">
              Our instructors are industry veterans from SpaceX, Tesla, Apple, and leading tech companies
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {creators.map((creator) => (
              <div key={creator.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-xl transition-shadow">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden ring-4 ring-primary/10">
                  <img 
                    src={creator.image} 
                    alt={creator.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                  <div className="w-full h-full bg-primary/10 flex items-center justify-center hidden">
                    <span className="text-primary font-bold text-2xl">{creator.initials}</span>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-dark text-center mb-2">{creator.name}</h3>
                <p className="text-sm text-primary text-center mb-3 font-medium">{creator.role}</p>
                <p className="text-sm text-medium text-center leading-relaxed">{creator.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Sixth Section - Our Core Values */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 md:gap-12 mb-16 md:mb-24">
          <div className="flex items-center justify-center flex-1 px-2 md:px-6">
            <img src="/assets/goals.svg" alt="goals" className="w-full max-w-sm md:max-w-md object-contain" />
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
            <img src="/assets/journey.svg" alt="journey" className="w-full max-w-sm md:max-w-md object-contain" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
