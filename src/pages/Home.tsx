import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import apiService from '../services/api'

const Home = () => {
  const navigate = useNavigate()
  const [config, setConfig] = useState<any>(null)

  useEffect(() => {
    fetchHomeConfig()
  }, [])

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
    <div className="pt-16 md:pt-20 px-4 min-h-screen bg-gradient-to-b from-light to-white">
      <div className="max-w-7xl mx-auto w-full">
        {/* Hero Section - Engineering is Future */}
        <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-8 md:gap-16 mb-20 md:mb-32 py-12 md:py-20">
          <div className="flex flex-col gap-6 items-start justify-center flex-1">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
              <span className="text-primary font-semibold text-sm">
                {config?.heroText?.badge || 'Engineering is Future'}
              </span>
              <span className="text-secondary">⚡</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-dark leading-tight">
              {config?.heroText?.headline || 'Master the Skills That Build Tomorrow'}
            </h1>
            <p className="text-lg md:text-xl text-medium max-w-2xl leading-relaxed">
              {config?.heroText?.description || 'Learn CAD, CAE, PCB Design, and Programming from industry experts. Join thousands of engineers shaping the future of technology.'}
            </p>
            <div className="flex flex-wrap gap-4 mt-4">
              <button 
                onClick={() => window.location.href = '/courses'}
                className="px-8 py-4 bg-primary text-white font-semibold rounded hover:bg-primary-dark transition shadow-lg hover:shadow-xl"
              >
                Explore Courses
              </button>
              <button 
                onClick={() => window.location.href = '/about'}
                className="px-8 py-4 border-2 border-dark text-dark font-semibold rounded hover:bg-dark hover:text-white transition"
              >
                Learn More
              </button>
            </div>
            <div className="flex items-center gap-8 mt-6">
              <div>
                <div className="text-3xl font-bold text-dark">{config?.stats?.studentsCount || '10K+'}</div>
                <div className="text-sm text-medium">Students</div>
              </div>
              <div className="h-12 w-px bg-medium/30"></div>
              <div>
                <div className="text-3xl font-bold text-dark">{config?.stats?.coursesCount || '50+'}</div>
                <div className="text-sm text-medium">Courses</div>
              </div>
              <div className="h-12 w-px bg-medium/30"></div>
              <div>
                <div className="text-3xl font-bold text-dark">{config?.stats?.averageRating || '4.8★'}</div>
                <div className="text-sm text-medium">Average Rating</div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center flex-1">
            <img src={getImage('heroImage', '/assets/hero.svg')} alt="Engineering is Future" className="w-full max-w-md md:max-w-lg object-contain drop-shadow-2xl" />
          </div>
        </div>

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
        <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-6 md:gap-12">
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
