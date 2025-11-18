const Home = () => {
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
    <div className="pt-28 md:pt-32 lg:pt-36 px-4 min-h-screen">
      <div className="max-w-5xl mx-auto w-full">
        {/* First Section - Engineering Mastery */}
        <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-6 md:gap-12 mb-16 md:mb-24">
          <div className="flex flex-col gap-3 items-start justify-center flex-1 px-2 md:px-6">
            <h1 className="text-xl md:text-2xl font-bold text-primary">Engineering Mastery, Reimagined.</h1>
            <p className="text-xs md:text-sm font-medium text-dark/60 max-w-md md:max-w-2xl">
              At Isaac Institute of Technology, we believe the most innovative designs begin with a profound understanding of first principles. We are the definitive digital academy for design engineers who aren't just building parts—they're building what's next.
            </p>
          </div>
          <div className="flex items-center justify-center flex-1 px-2 md:px-6">
            <img src="/assets/hero.svg" alt="hero" className="w-full max-w-sm md:max-w-md object-contain" />
          </div>
        </div>

        {/* Second Section - Why We Were Founded */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 md:gap-12 mb-16 md:mb-24">
          <div className="flex items-center justify-center flex-1 px-2 md:px-6">
            <img src="/assets/stars.svg" alt="stars" className="w-full max-w-sm md:max-w-md object-contain" />
          </div>
          
          <div className="flex flex-col gap-3 items-start justify-center flex-1 px-2 md:px-6">
            <h1 className="text-xl md:text-2xl font-bold text-primary">Why We Were Founded</h1>
            <p className="text-xs md:text-sm font-medium text-dark/60 max-w-md md:max-w-2xl">
              Isaac Institute of Technology was born from a disconnect. In a world of rapid technological advancement, design engineers were often left with theoretical knowledge or shallow software tutorials, but little guidance on how to bridge the gap to practical, robust, and manufacturable design.
            </p>
            <p className="text-xs md:text-sm font-medium text-dark/60 max-w-md md:max-w-2xl">
              Named for the spirit of inquiry and foundational understanding epitomized by Isaac Newton, our institute was founded by a team of seasoned lead engineers, simulation specialists, and CAD masters. We saw that the future of engineering depended on continuous, deep-skills education. Our mission is to provide that foundation and push its boundaries.
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

        {/* Fifth Section - Meet Our Instructors */}
        <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-6 md:gap-12 mb-16 md:mb-24">
          <div className="flex flex-col gap-3 items-start justify-center flex-1 px-2 md:px-6">
            <h1 className="text-xl md:text-2xl font-bold text-primary">Learn from Industry Leaders, Not Just Teachers.</h1>
            <p className="text-xs md:text-sm font-medium text-dark/60 max-w-md md:max-w-2xl">
              The Isaac faculty is a curated group of professionals who have designed everything from life-saving medical devices to interplanetary spacecraft. They are selected not only for their expertise but for their ability to mentor and demystify complex topics.
            </p>
          </div>
          
          <div className="flex items-center justify-center flex-1 px-2 md:px-6 overflow-y-hidden">
            <div className="w-full max-w-lg md:max-w-xl relative overflow-hidden">
              <div className="flex animate-scroll-fast hover:pause-scroll gap-4 overflow-x-auto scrollbar-hide hover:overflow-x-scroll" style={{scrollbarWidth: 'none', msOverflowStyle: 'none', width: 'max-content'}}>
                {/* Instructor Cards */}
                {creators.map((creator) => (
                  <div key={creator.id} className="flex-shrink-0 w-64 p-4 transition-all duration-300 hover:scale-105">
                    <div className="w-full h-40 bg-gradient-to-br from-primary/10 to-theme/10 rounded-xl mb-3 flex items-center justify-center overflow-hidden">
                      <img 
                        src={creator.image} 
                        alt={creator.name}
                        className="w-full h-full object-cover rounded-xl"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                      <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center hidden">
                        <span className="text-primary font-bold text-xl">{creator.initials}</span>
                      </div>
                    </div>
                    <h3 className="text-sm font-bold text-primary mb-1">{creator.name}</h3>
                    <p className="text-xs text-dark/70 mb-2 font-medium">{creator.role}</p>
                    <p className="text-xs text-dark/60 leading-relaxed">{creator.description}</p>
                  </div>
                ))}

                {/* Duplicate cards for seamless loop */}
                {creators.map((creator) => (
                  <div key={`duplicate-${creator.id}`} className="flex-shrink-0 w-64 p-4 transition-all duration-300 hover:scale-105">
                    <div className="w-full h-40 bg-gradient-to-br from-primary/10 to-theme/10 rounded-xl mb-3 flex items-center justify-center overflow-hidden">
                      <img 
                        src={creator.image} 
                        alt={creator.name}
                        className="w-full h-full object-cover rounded-xl"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                      <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center hidden">
                        <span className="text-primary font-bold text-xl">{creator.initials}</span>
                      </div>
                    </div>
                    <h3 className="text-sm font-bold text-primary mb-1">{creator.name}</h3>
                    <p className="text-xs text-dark/70 mb-2 font-medium">{creator.role}</p>
                    <p className="text-xs text-dark/60 leading-relaxed">{creator.description}</p>
                  </div>
                ))}
              </div>
            </div>
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
              <button className="w-full sm:w-auto border border-primary hover:bg-primary duration-300 text-primary hover:text-light px-4 py-2 rounded-md cursor-pointer text-xs md:text-sm">
                Explore Our Courses
              </button>
              <button className="w-full sm:w-auto border border-primary hover:bg-primary duration-300 text-primary hover:text-light px-4 py-2 rounded-md cursor-pointer text-xs md:text-sm">
                View Our Instructor Team
              </button>
              <button className="w-full sm:w-auto border border-dark bg-theme text-dark hover:bg-dark hover:text-light duration-300 px-4 py-2 rounded-md cursor-pointer text-xs md:text-sm">
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
