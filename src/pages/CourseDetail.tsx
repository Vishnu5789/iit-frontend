import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  PlayIcon, 
  ClockIcon, 
  AcademicCapIcon, 
  CheckIcon,
  PhoneIcon,
  EnvelopeIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/solid';
import apiService from '../services/api';
import toast from 'react-hot-toast';

interface Course {
  _id: string;
  title: string;
  description: string;
  syllabus?: {
    url: string;
    fileId: string;
    name: string;
  };
  duration: string;
  level: string;
  category: string;
  price?: number;
  discountPrice?: number;
  thumbnail: {
    url: string;
  };
  sampleVideos?: Array<{
    name: string;
    url: string;
    duration: string;
    description: string;
  }>;
  videoFiles?: Array<{
    name: string;
    url: string;
  }>;
  pdfFiles?: Array<{
    name: string;
    url: string;
  }>;
  keyPoints?: string[];
  aboutCourse?: string;
  eligibility?: string[];
  objectives?: string[];
}

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'keyPoints' | 'about' | 'eligibility' | 'syllabus' | 'objective'>('keyPoints');
  const [formData, setFormData] = useState({
    firstName: '',
    email: '',
    phone: '',
    qualification: '',
    location: '',
    courseName: ''
  });
  const [submittingForm, setSubmittingForm] = useState(false);

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getCourse(id!);
      if (response.success && response.data) {
        setCourse(response.data);
        setFormData(prev => ({ ...prev, courseName: response.data.title }));
        if (response.data.sampleVideos?.length > 0) {
          setSelectedVideo(response.data.sampleVideos[0]);
        }
      }
    } catch (error: any) {
      console.error('Error fetching course:', error);
      setError('Failed to load course details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!apiService.isAuthenticated()) {
      navigate('/login', { state: { from: `/courses/${id}` } });
      return;
    }

    try {
      setAddingToCart(true);
      const response = await apiService.addToCart(id!);
      if (response.success) {
        toast.success('Course added to cart!');
        navigate('/cart');
      }
    } catch (error: any) {
      if (error.message?.includes('already in cart')) {
        navigate('/cart');
      } else {
        toast.error(error.message || 'Failed to add course to cart');
      }
    } finally {
      setAddingToCart(false);
    }
  };

  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.firstName || !formData.email || !formData.phone) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!formData.location || !formData.qualification) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmittingForm(true);
      
      // Prepare data for contact API
      const contactFormData = {
        name: formData.firstName,
        email: formData.email,
        phone: formData.phone,
        subject: `Course Enquiry: ${formData.courseName}`,
        message: `
Course Enquiry Details:
------------------------
Course: ${formData.courseName}
Qualification: ${formData.qualification}
Location: ${formData.location}

This is an enquiry from the course detail page.
        `.trim()
      };

      const response = await apiService.submitContactForm(contactFormData);
      
      if (response.success) {
        toast.success('Enquiry submitted successfully! We will contact you soon.');
        
        // Reset form
        setFormData({
          firstName: '',
          email: '',
          phone: '',
          qualification: '',
          location: '',
          courseName: course?.title || ''
        });
      } else {
        toast.error(response.message || 'Failed to submit enquiry. Please try again.');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit enquiry. Please try again.');
    } finally {
      setSubmittingForm(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-light flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error || 'Course not found'}</p>
          <button
            onClick={() => navigate('/courses')}
            className="mt-4 text-primary hover:underline"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-light pt-20">
      {/* Hero Section with Background */}
      <div 
        className="relative bg-gradient-to-r from-[#1a1f71] to-[#2d3192] min-h-[500px]"
        style={{
          backgroundImage: course.thumbnail?.url ? `linear-gradient(rgba(26, 31, 113, 0.85), rgba(45, 49, 146, 0.85)), url(${course.thumbnail.url})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
            {/* Left Content */}
            <div className="lg:col-span-2 text-white">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-sm mb-6">
                <button onClick={() => navigate('/')} className="hover:underline">
                  Home
                </button>
                <ChevronRightIcon className="h-4 w-4" />
                <button onClick={() => navigate('/courses')} className="hover:underline">
                  Engineering Training Programs
                </button>
                <ChevronRightIcon className="h-4 w-4" />
                <span>{course.title}</span>
              </div>

              {/* Course Title */}
              <h1 className="text-5xl font-bold mb-6">{course.title}</h1>

              {/* Course Description */}
              <p className="text-lg mb-8 leading-relaxed max-w-3xl">
                {course.description || `${course.title} course is one-of-a-kind. This course is structured to raise the level of expertise in design and to improve the competitiveness in the global markets.`}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center gap-4">
                {course.price && course.price > 0 && (
                  <button
                    onClick={handleAddToCart}
                    disabled={addingToCart}
                    className="bg-[#f4e500] hover:bg-[#e0d400] text-dark font-bold py-3 px-8 rounded-lg flex items-center gap-2 transition-all disabled:opacity-50"
                  >
                    {addingToCart ? 'ADDING...' : 'APPLY NOW'}
                    <ChevronRightIcon className="h-5 w-5" />
                  </button>
                )}
                <button
                  onClick={() => {
                    const formElement = document.getElementById('enquiry-form');
                    formElement?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-white font-semibold hover:underline flex items-center gap-2"
                >
                  Enquiry Now
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Enquiry Form - Right Side */}
            <div className="lg:col-span-1">
              <div id="enquiry-form" className="bg-white rounded-xl shadow-2xl p-8">
                <h2 className="text-2xl font-bold text-dark mb-6">Enquiry Now</h2>
                
                <form onSubmit={handleEnquirySubmit} className="space-y-4">
                  <div>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="First Name *"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Email *"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Phone Number *"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <select
                      name="qualification"
                      value={formData.qualification}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-gray-700"
                    >
                      <option value="">Select Qualification *</option>
                      <option value="diploma">Diploma</option>
                      <option value="bachelor">Bachelor's Degree</option>
                      <option value="master">Master's Degree</option>
                      <option value="phd">PhD</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="Location *"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <select
                      name="courseName"
                      value={formData.courseName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-gray-700"
                      disabled
                    >
                      <option value={course.title}>{course.title}</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={submittingForm}
                    className="w-full bg-gradient-to-r from-[#1a1f71] to-[#2d3192] text-white py-4 px-6 rounded-lg font-bold hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {submittingForm ? 'Submitting...' : 'Submit'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs and Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Tabs */}
        <div className="bg-gray-100 rounded-lg p-2 mb-8 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            <button
              onClick={() => setActiveTab('keyPoints')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
                activeTab === 'keyPoints'
                  ? 'bg-white text-dark shadow-md'
                  : 'text-gray-600 hover:text-dark'
              }`}
            >
              Key Points
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
                activeTab === 'about'
                  ? 'bg-white text-dark shadow-md'
                  : 'text-gray-600 hover:text-dark'
              }`}
            >
              About Course
            </button>
            <button
              onClick={() => setActiveTab('eligibility')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
                activeTab === 'eligibility'
                  ? 'bg-white text-dark shadow-md'
                  : 'text-gray-600 hover:text-dark'
              }`}
            >
              Eligibility
            </button>
            <button
              onClick={() => setActiveTab('syllabus')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
                activeTab === 'syllabus'
                  ? 'bg-white text-dark shadow-md'
                  : 'text-gray-600 hover:text-dark'
              }`}
            >
              Syllabus
            </button>
        <button
              onClick={() => setActiveTab('objective')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
                activeTab === 'objective'
                  ? 'bg-white text-dark shadow-md'
                  : 'text-gray-600 hover:text-dark'
              }`}
            >
              Objective
        </button>
          </div>
              </div>
              
        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Key Points Tab */}
          {activeTab === 'keyPoints' && (
            <div>
              {course.keyPoints && course.keyPoints.length > 0 ? (
                <ul className="space-y-4">
                  {course.keyPoints.map((point, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="h-2 w-2 bg-dark rounded-full mt-2 flex-shrink-0"></span>
                      <span className="text-gray-700 leading-relaxed">{point}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600">No key points available for this course.</p>
              )}
            </div>
          )}

          {/* About Course Tab */}
          {activeTab === 'about' && (
            <div>
              <h3 className="text-2xl font-bold text-dark mb-4">About This Course</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                {course.aboutCourse || course.description}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="flex items-start gap-3">
                  <ClockIcon className="h-6 w-6 text-primary flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-dark">Duration</p>
                    <p className="text-gray-600">{course.duration}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <AcademicCapIcon className="h-6 w-6 text-primary flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-dark">Level</p>
                    <p className="text-gray-600">{course.level}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Eligibility Tab */}
          {activeTab === 'eligibility' && (
            <div>
              <h3 className="text-2xl font-bold text-dark mb-4">Eligibility Criteria</h3>
              {course.eligibility && course.eligibility.length > 0 ? (
                <ul className="space-y-3">
                  {course.eligibility.map((criterion, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckIcon className="h-6 w-6 text-green-600 flex-shrink-0" />
                      <span className="text-gray-700">{criterion}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600">No eligibility criteria specified for this course.</p>
              )}
            </div>
          )}

          {/* Syllabus Tab */}
          {activeTab === 'syllabus' && (
            <div>
              <h3 className="text-2xl font-bold text-dark mb-4">Course Syllabus</h3>
              {course.syllabus?.url ? (
                <div className="space-y-4">
                  <p className="text-gray-700 mb-4">
                    Download the complete course syllabus to understand the detailed curriculum, topics covered, and learning outcomes.
                  </p>
                <div className="flex items-center justify-between bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                        <p className="font-semibold text-gray-900">{course.title} Syllabus</p>
                      <p className="text-sm text-gray-500">{course.syllabus.name || 'Syllabus.pdf'}</p>
                    </div>
                  </div>
                  <a
                    href={course.syllabus.url}
                    target="_blank"
                    rel="noopener noreferrer"
                      className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-all"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                      Download
                  </a>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600">
                  Detailed syllabus will be shared upon enrollment. Please contact us for more information.
                </p>
            )}

              {/* Sample Videos Section */}
            {course.sampleVideos && course.sampleVideos.length > 0 && (
                <div className="mt-8">
                  <h4 className="text-xl font-bold text-dark mb-4">Sample Videos</h4>
                {selectedVideo && (
                  <div className="mb-6">
                    <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden mb-4">
                      <video
                        key={selectedVideo.url}
                        controls
                        className="w-full h-full"
                        poster={course.thumbnail.url}
                      >
                        <source src={selectedVideo.url} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {selectedVideo.name}
                    </h3>
                    {selectedVideo.description && (
                      <p className="text-gray-600">{selectedVideo.description}</p>
                    )}
                  </div>
                )}
                  <div className="grid grid-cols-1 gap-2">
                  {course.sampleVideos.map((video, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedVideo(video)}
                        className={`text-left p-4 rounded-lg border transition-all ${
                        selectedVideo?.url === video.url
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <PlayIcon className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium text-gray-900">{video.name}</p>
                            {video.description && (
                              <p className="text-sm text-gray-500 mt-1">{video.description}</p>
                            )}
                          </div>
                        </div>
                        {video.duration && (
                          <span className="text-sm text-gray-500">{video.duration}</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
                  </div>
                )}

          {/* Objective Tab */}
          {activeTab === 'objective' && (
                    <div>
              <h3 className="text-2xl font-bold text-dark mb-4">Course Objectives</h3>
              {course.objectives && course.objectives.length > 0 ? (
                <ul className="space-y-3">
                  {course.objectives.map((objective, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-primary font-bold text-sm">{index + 1}</span>
                    </div>
                      <span className="text-gray-700 pt-1">{objective}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600">No objectives specified for this course.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Fixed Contact Icons */}
      <div className="fixed right-6 bottom-6 flex flex-col gap-3 z-50">
        <a
          href="https://wa.me/"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110"
          title="WhatsApp"
        >
          <ChatBubbleLeftRightIcon className="h-6 w-6" />
        </a>
        <a
          href="tel:"
          className="bg-primary text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110"
          title="Call Us"
        >
          <PhoneIcon className="h-6 w-6" />
        </a>
        <a
          href="mailto:"
          className="bg-accent text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110"
          title="Email Us"
        >
          <EnvelopeIcon className="h-6 w-6" />
        </a>
      </div>
    </div>
  );
}

