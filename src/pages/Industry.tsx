import { useEffect, useState } from 'react'
import { BuildingOffice2Icon, RocketLaunchIcon, CogIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

interface Industry {
  _id: string
  name: string
  description: string
  icon: string
  order: number
}

const Industry = () => {
  const [industries, setIndustries] = useState<Industry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchIndustries()
  }, [])

  const fetchIndustries = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/industries')
      const data = await response.json()
      if (data.success) {
        setIndustries(data.data)
      }
    } catch (error) {
      console.error('Error fetching industries:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const projects = [
    {
      title: "Electric Vehicle Battery Enclosure Design",
      tools: "SOLIDWORKS & ANSYS",
      description: "Structural design and crash simulation with thermal management analysis"
    },
    {
      title: "Aircraft Wing Structural Analysis",
      tools: "CATIA & FEA",
      description: "Complex surface modeling and structural integrity validation under flight loads"
    },
    {
      title: "Automotive Engine Component Design",
      tools: "Siemens NX",
      description: "Parametric modeling with manufacturing simulation to optimize machining processes"
    },
    {
      title: "Multi-Layer PCB for Medical Device",
      tools: "Altium Designer",
      description: "Schematic capture, component placement, high-speed routing, and manufacturing files"
    },
    {
      title: "Wind Turbine Blade Optimization",
      tools: "Fusion 360 & FEA",
      description: "Generative design algorithms and simulation to maximize energy efficiency"
    },
    {
      title: "Industrial Robot Arm Assembly",
      tools: "SOLIDWORKS",
      description: "Complete mechanical design including motion simulation and stress analysis"
    },
    {
      title: "Pipeline Stress Analysis",
      tools: "AutoCAD & ANSYS",
      description: "Detailed pipe routing and pressure vessel analysis for operational safety"
    },
    {
      title: "Smart Building HVAC System Design",
      tools: "CAD & Simulation",
      description: "Integrated design to optimize energy efficiency, airflow, and thermal comfort"
    }
  ]

  const benefits = [
    {
      title: "Immediate Job Readiness",
      description: "Companies don't have time for extensive training. They need engineers who can contribute from day one. Our industry-focused approach means you understand not just tools, but how they're applied in real business contexts."
    },
    {
      title: "Higher Starting Salaries",
      description: "Engineers with specialized CAD, CAE, and design skills command premium salaries. Industry-specific expertise in automotive, aerospace, or electronics design makes you significantly more valuable than generic engineering graduates."
    },
    {
      title: "Career Flexibility",
      description: "Mastering industry-standard tools opens doors across multiple sectors. SOLIDWORKS skills transfer from automotive to consumer products; ANSYS knowledge applies across any field requiring simulation; AutoCAD serves civil, mechanical, and electrical disciplines alike."
    },
    {
      title: "Professional Credibility",
      description: "Understanding industry workflows, standards, and terminology makes you a credible team member from the start. You speak the language, understand the constraints, and appreciate the business context behind engineering decisions."
    },
    {
      title: "Portfolio Advantage",
      description: "Industry-relevant projects in your portfolio demonstrate practical capability beyond academic transcripts. Employers can see you've tackled realistic challenges, making hiring decisions easier and faster."
    },
    {
      title: "Networking Opportunities",
      description: "Learning industry applications connects you with professionals in your target field—instructors, mentors, and fellow students who become valuable career contacts and potential collaborators."
    }
  ]

  return (
    <div className="pt-28 md:pt-32 lg:pt-36 px-4 min-h-screen">
      <div className="max-w-7xl mx-auto mb-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-4">
            <BuildingOffice2Icon className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-6">
            Industry Applications
          </h1>
          <p className="text-lg md:text-xl text-dark/80 font-medium mb-4">
            Real-World Engineering That Drives Innovation
          </p>
          <div className="max-w-4xl mx-auto">
            <p className="text-base md:text-lg text-dark/70 leading-relaxed">
              Engineering design isn't just academic theory—it's the foundation of every product, structure, and system that shapes our modern world. From the vehicles we drive to the smartphones we depend on, from renewable energy systems powering cities to aerospace technologies exploring beyond Earth, skilled engineers using advanced design and simulation tools make it all possible. At Isaac Institute of Technology, we don't just teach software—we prepare you for real-world industry challenges. Our courses are built around actual workflows, industry standards, and the tools that companies like Tesla, Boeing, General Electric, and thousands of innovative firms use daily. Understanding industry applications helps you see beyond the software interface to the impact your skills can create.
            </p>
          </div>
        </div>

        {/* Industry Sectors */}
        <div className="mb-20">
          <h2 className="text-2xl md:text-3xl font-bold text-primary mb-8 text-center">Industry Sectors We Serve</h2>
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-lg text-dark/60">Loading industries...</p>
            </div>
          ) : industries.length === 0 ? (
            <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-primary/10">
              <p className="text-lg text-dark/60">No industry information available yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {industries.map((industry) => (
                <div
                  key={industry._id}
                  className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-primary/10 hover:shadow-xl transition-all duration-300"
                >
                  <h3 className="text-xl font-bold text-primary mb-3">{industry.name}</h3>
                  <p className="text-dark/70 text-sm leading-relaxed">{industry.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Real-World Projects */}
        <div className="mb-20">
          <h2 className="text-2xl md:text-3xl font-bold text-primary mb-8 text-center">Real-World Project Examples</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {projects.map((project, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-5 border border-primary/20 hover:from-primary/10 hover:to-primary/20 transition-all duration-300"
              >
                <RocketLaunchIcon className="h-8 w-8 text-primary mb-3" />
                <h3 className="text-base font-bold text-primary mb-2">{project.title}</h3>
                <p className="text-xs text-dark/60 font-semibold mb-2">{project.tools}</p>
                <p className="text-sm text-dark/70">{project.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Industry Workflow Alignment */}
        <div className="mb-20">
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-8 md:p-12 border border-primary/20">
            <div className="flex items-center justify-center mb-6">
              <CogIcon className="h-12 w-12 text-primary" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-6 text-center">
              How Our Courses Align With Industry Workflows
            </h2>
            <p className="text-dark/70 text-base md:text-lg leading-relaxed max-w-4xl mx-auto text-center">
              We don't teach software in isolation—we teach industry-standard workflows. Our curriculum is developed in consultation with engineering professionals, hiring managers, and industry experts who understand what companies actually need. Each course follows real project methodologies: starting with requirements analysis, moving through concept design and detailed modeling, performing analysis and validation, and finally creating manufacturing-ready deliverables. You learn the same processes, standards, and best practices used at leading companies. This means when you enter the workforce, you're not starting from zero—you understand how projects flow, how teams collaborate, what documentation is required, and how to deliver professional results on schedule.
            </p>
          </div>
        </div>

        {/* Industry Benefits */}
        <div className="mb-20">
          <h2 className="text-2xl md:text-3xl font-bold text-primary mb-8 text-center">Industry Benefits for Students</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-primary/10"
              >
                <CheckCircleIcon className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-lg font-bold text-primary mb-3">{benefit.title}</h3>
                <p className="text-dark/70 text-sm leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Companies Section */}
        <div className="mb-20">
          <h2 className="text-2xl md:text-3xl font-bold text-primary mb-8 text-center">Companies We Work With</h2>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-8 md:p-12 border border-primary/10">
            <p className="text-dark/70 text-base md:text-lg leading-relaxed text-center max-w-4xl mx-auto mb-6">
              Our graduates have joined leading organizations across diverse industries:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
              <div className="flex items-start gap-3">
                <CheckCircleIcon className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-dark/70 text-sm"><strong>Automotive manufacturers</strong> including electric vehicle innovators and traditional OEMs</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircleIcon className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-dark/70 text-sm"><strong>Aerospace companies</strong> developing next-generation aircraft and space systems</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircleIcon className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-dark/70 text-sm"><strong>Electronics firms</strong> creating consumer products, medical devices, and telecommunications</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircleIcon className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-dark/70 text-sm"><strong>Engineering consultancies</strong> serving clients across multiple industries</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircleIcon className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-dark/70 text-sm"><strong>Manufacturing companies</strong> producing industrial equipment to consumer goods</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircleIcon className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-dark/70 text-sm"><strong>Energy sector leaders</strong> in both traditional and renewable technologies</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircleIcon className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-dark/70 text-sm"><strong>Startups and innovation labs</strong> where engineers drive product development</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircleIcon className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-dark/70 text-sm"><strong>Research institutions</strong> advancing engineering knowledge and breakthrough tech</p>
              </div>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-8 md:p-12 text-white text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">Ready to Make Your Mark in Industry?</h2>
          <p className="text-lg leading-relaxed max-w-3xl mx-auto mb-8">
            The engineering industry doesn't wait, and neither should you. Every day you delay gaining industry-relevant skills is a day your competitors move ahead. Whether you're a student preparing for your first job, a professional seeking advancement, or someone considering a career change, the time to invest in your engineering future is now. Our courses give you more than software proficiency—they give you industry credibility, practical problem-solving ability, and the confidence to tackle complex real-world challenges. Companies need skilled engineers. Industries are evolving. Opportunities are everywhere. The only question is: are you ready to seize them? Explore our courses, choose your path, and take the first step toward the engineering career you've envisioned. Your industry awaits.
          </p>
          <button className="bg-white text-primary px-8 py-4 rounded-lg font-semibold text-lg hover:bg-light/90 transition-all duration-300 transform hover:scale-105">
            Start Your Journey Today
          </button>
        </div>
      </div>
    </div>
  )
}

export default Industry

