import { useEffect, useState } from 'react'
import { AcademicCapIcon, ClockIcon, ChartBarIcon, CheckCircleIcon, ArrowRightIcon } from '@heroicons/react/24/outline'
import { useNavigate } from 'react-router-dom'

interface Course {
  _id: string
  title: string
  description: string
  duration: string
  level: string
  category: string
  thumbnail?: {
    url: string
    fileId: string
  }
}

const Courses = () => {
  const navigate = useNavigate()
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/courses')
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

  const whoShouldEnroll = [
    {
      title: "Engineering Students",
      description: "Looking to gain practical skills beyond theoretical coursework and stand out in campus placements."
    },
    {
      title: "Recent Graduates",
      description: "Seeking to bridge the gap between academic knowledge and industry requirements with job-ready technical skills."
    },
    {
      title: "Career Changers",
      description: "From non-engineering backgrounds wanting to break into high-demand technical roles in design and manufacturing."
    },
    {
      title: "Working Professionals",
      description: "Aiming to upskill, transition to specialized roles, or take on more challenging projects in their current positions."
    },
    {
      title: "Entrepreneurs & Makers",
      description: "Who want to design and prototype their own products without depending entirely on external design services."
    },
    {
      title: "Freelancers & Consultants",
      description: "Looking to expand their service offerings and work with clients across diverse industries and applications."
    }
  ]

  const whatYouLearn = [
    "Industry-standard workflows used by leading engineering companies worldwide",
    "Hands-on project experience with real-world design challenges and specifications",
    "Best practices for parametric modeling, assemblies, and technical documentation",
    "Simulation and analysis techniques to validate designs before manufacturing",
    "How to collaborate effectively in team-based engineering environments",
    "Troubleshooting common design problems and optimization strategies",
    "Creating manufacturing-ready files and technical drawings to industry standards",
    "Keyboard shortcuts, productivity tips, and professional techniques that save hours",
    "Portfolio-building projects that demonstrate your skills to potential employers",
    "Career guidance and interview preparation for technical engineering roles"
  ]

  const whyChooseUs = [
    {
      title: "Industry-Experienced Instructors",
      description: "Learn from professionals who've worked on real projects at major companies. Our instructors bring practical insights you won't find in textbooks—the tips, tricks, and workflows that make you efficient and effective."
    },
    {
      title: "Project-Based Learning",
      description: "Forget passive video watching. You'll work on actual engineering projects from day one—designing parts, running simulations, creating assemblies—building a professional portfolio that proves your capabilities."
    },
    {
      title: "Flexible Learning Schedules",
      description: "Access courses anytime, anywhere, at your own pace. Whether you're a full-time student or working professional, our platform adapts to your schedule with lifetime access to course materials."
    },
    {
      title: "Certification & Career Support",
      description: "Earn industry-recognized certificates that add weight to your resume. Plus, get resume reviews, interview preparation, and job placement assistance to accelerate your career trajectory."
    },
    {
      title: "Cutting-Edge Curriculum",
      description: "Our courses are continuously updated to reflect the latest software versions, industry trends, and employer requirements. You learn what's current, not outdated techniques from years ago."
    },
    {
      title: "Community & Mentorship",
      description: "Join a thriving community of learners and professionals. Get your doubts clarified, share projects, network with peers, and receive personalized mentorship throughout your learning journey."
    }
  ]

  const faqs = [
    {
      question: "Do I need prior engineering knowledge to start these courses?",
      answer: "For beginner-level courses like AutoCAD and Fusion 360, no prior experience is required—we start from the basics. However, advanced courses like CATIA V5 and Siemens NX assume you have fundamental CAD knowledge. Each course clearly states its prerequisites so you can choose appropriately."
    },
    {
      question: "What software do I need, and is it expensive?",
      answer: "Most software companies offer free student or trial versions that work perfectly for learning. We provide detailed guides on obtaining educational licenses for AutoCAD, SOLIDWORKS, ANSYS, and others. For professional use, subscription costs vary, but the investment pays off quickly with enhanced career opportunities."
    },
    {
      question: "How much time should I dedicate weekly to complete a course?",
      answer: "We recommend 5-8 hours per week for optimal learning, but our self-paced format lets you adjust based on your schedule. Some students complete courses faster by dedicating more time, while working professionals spread learning over a longer period. Consistency matters more than speed."
    },
    {
      question: "Will I get a certificate, and is it recognized by employers?",
      answer: "Yes, you receive a certificate of completion for every course. While our certificates demonstrate your commitment and learning, employers ultimately value demonstrated skills. That's why we emphasize project-based learning—your portfolio of completed projects often matters more than certificates alone."
    },
    {
      question: "Can I get job placement assistance after completing courses?",
      answer: "Absolutely. We offer resume reviews, portfolio guidance, mock interviews, and job referrals to our hiring partners. Many of our graduates have secured positions at leading engineering firms, startups, and consultancies. We also have an active alumni network that shares job opportunities."
    },
    {
      question: "What if I get stuck or need help during the course?",
      answer: "You're never alone. Each course includes discussion forums, direct instructor support, and community mentorship. Most questions get answered within 24 hours. Additionally, we host live Q&A sessions where you can interact with instructors and clarify doubts in real-time."
    }
  ]

  return (
    <div className="pt-28 md:pt-32 lg:pt-36 px-4 min-h-screen">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto mb-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-6">
            Engineering Design Courses
          </h1>
          <p className="text-lg md:text-xl text-dark/80 font-medium mb-4">
            Master Industry-Standard CAD, CAE & Engineering Tools
          </p>
          <div className="max-w-4xl mx-auto">
            <p className="text-base md:text-lg text-dark/70 leading-relaxed">
              In today's competitive engineering landscape, proficiency in design and simulation software is no longer optional—it's essential. Whether you're developing innovative products, analyzing complex systems, or bringing ideas to life, mastering industry-standard engineering tools gives you a decisive edge. Our comprehensive courses are designed to transform beginners into confident professionals and help experienced engineers stay ahead of rapidly evolving technology. From automotive design to electronics, manufacturing to aerospace, we equip you with the skills that employers demand and industries rely on.
            </p>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="mb-20">
          <h2 className="text-2xl md:text-3xl font-bold text-primary mb-8 text-center">Our Courses</h2>
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-lg text-dark/60">Loading courses...</p>
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-primary/10">
              <p className="text-lg text-dark/60">No courses available at the moment. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {courses.map((course) => (
              <div
                key={course._id}
                className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-primary/10 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer"
                onClick={() => navigate(`/courses/${course._id}`)}
              >
                {course.thumbnail?.url && (
                  <div className="w-full h-48 overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5">
                    <img 
                      src={course.thumbnail.url} 
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-primary mb-3">{course.title}</h3>
                  <p className="text-dark/70 text-sm leading-relaxed mb-4">{course.description}</p>
                  <div className="flex flex-wrap gap-4 text-sm mb-4">
                    <div className="flex items-center gap-2 text-dark/60">
                      <ClockIcon className="h-5 w-5 text-primary" />
                      <span className="font-semibold">{course.duration}</span>
                    </div>
                    <div className="flex items-center gap-2 text-dark/60">
                      <ChartBarIcon className="h-5 w-5 text-primary" />
                      <span className="font-semibold">{course.level}</span>
                    </div>
                  </div>
                  <button 
                    className="w-full bg-gradient-to-r from-primary to-secondary text-white py-2 px-4 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(`/courses/${course._id}`)
                    }}
                  >
                    View Details
                    <ArrowRightIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
              ))}
            </div>
          )}
        </div>

        {/* Who Should Enroll */}
        <div className="mb-20">
          <h2 className="text-2xl md:text-3xl font-bold text-primary mb-8 text-center">Who Should Enroll</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {whoShouldEnroll.map((item, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-6 border border-primary/20"
              >
                <h3 className="text-lg font-bold text-primary mb-2">{item.title}</h3>
                <p className="text-dark/70 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* What You Will Learn */}
        <div className="mb-20">
          <h2 className="text-2xl md:text-3xl font-bold text-primary mb-8 text-center">What You Will Learn</h2>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-8 border border-primary/10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {whatYouLearn.map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircleIcon className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-dark/70 text-sm">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="mb-20">
          <h2 className="text-2xl md:text-3xl font-bold text-primary mb-8 text-center">Why Choose Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyChooseUs.map((item, index) => (
              <div
                key={index}
                className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-primary/10 hover:shadow-xl transition-all duration-300"
              >
                <h3 className="text-lg font-bold text-primary mb-3">{item.title}</h3>
                <p className="text-dark/70 text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-primary mb-8 text-center">Frequently Asked Questions</h2>
          <div className="max-w-4xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-6 border border-primary/10"
              >
                <h3 className="text-lg font-bold text-primary mb-3">{faq.question}</h3>
                <p className="text-dark/70 text-sm leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-12 text-white">
          <AcademicCapIcon className="h-16 w-16 mx-auto mb-4" />
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Start Your Journey?</h2>
          <p className="text-lg mb-6 max-w-2xl mx-auto">
            Join thousands of engineers who have transformed their careers with our industry-leading courses.
          </p>
          <button className="bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-light/90 transition-all duration-300 transform hover:scale-105">
            Explore Courses
          </button>
        </div>
      </div>
    </div>
  )
}

export default Courses

