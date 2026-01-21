import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  PlayIcon, 
  ClockIcon, 
  AcademicCapIcon, 
  CheckIcon,
  ChevronRightIcon,
  DocumentTextIcon,
  LinkIcon,
  LockClosedIcon,
  TrophyIcon,
  FolderIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import apiService from '../services/api';
import toast from 'react-hot-toast';
import MarkdownRenderer from '../components/MarkdownRenderer';
import ProtectedPdfViewer from '../components/ProtectedPdfViewer';
import SecureImageViewer from '../components/SecureImageViewer';
import CourseStatsDisplay from '../components/CourseStatsDisplay';
import { prepareContentForRendering } from '../utils/contentCleaner';

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
  images?: Array<{
    url: string;
    fileId: string;
  }>;
  textContent?: Array<{
    title: string;
    content: string;
  }>;
  externalVideoLinks?: Array<{
    title: string;
    url: string;
    description: string;
    platform: string;
  }>;
  keyPoints?: string[];
  aboutCourse?: string;
  eligibility?: string[];
  objectives?: string[];
  mediaFolders?: Array<{
    folderName: string;
    videos: Array<{ name: string; url: string; fileId: string; duration?: string }>;
    pdfs: Array<{ name: string; url: string; fileId: string }>;
    images: Array<{ url: string; fileId: string }>;
    textContent?: Array<{ title: string; content: string }>;
    externalVideoLinks?: Array<{ title: string; url: string; description?: string; platform?: string }>;
  }>;
}

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [error, setError] = useState('');
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'folders' | 'textContent' | 'externalLinks' | 'quizzes' | 'certificates'>('folders');
  const [expandedFolders, setExpandedFolders] = useState<Set<number>>(new Set());
  const [formData, setFormData] = useState({
    firstName: '',
    email: '',
    phone: '',
    qualification: '',
    location: '',
    courseName: ''
  });
  const [submittingForm, setSubmittingForm] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Content protection: Disable right-click, text selection, image/PDF dragging, and printing
  useEffect(() => {
    if (isEnrolled) {
      const handleContextMenu = (e: MouseEvent) => {
        e.preventDefault();
        return false;
      };

      const handleDragStart = (e: DragEvent) => {
        e.preventDefault();
        return false;
      };

      const handleSelectStart = (e: Event) => {
        e.preventDefault();
        return false;
      };

      const handleCopy = (e: ClipboardEvent) => {
        e.preventDefault();
        return false;
      };

      // Prevent keyboard shortcuts for printing and saving PDFs/images
      const handleKeyDown = (e: KeyboardEvent) => {
        // Prevent Ctrl+P / Cmd+P (Print)
        if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
          e.preventDefault();
          return false;
        }
        // Prevent Ctrl+S / Cmd+S (Save)
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
          e.preventDefault();
          return false;
        }
        // Prevent Ctrl+Shift+P / Cmd+Shift+P (Print dialog alternative)
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'P') {
          e.preventDefault();
          return false;
        }
      };

      document.addEventListener('contextmenu', handleContextMenu);
      document.addEventListener('dragstart', handleDragStart);
      document.addEventListener('selectstart', handleSelectStart);
      document.addEventListener('copy', handleCopy);
      document.addEventListener('keydown', handleKeyDown);

      return () => {
        document.removeEventListener('contextmenu', handleContextMenu);
        document.removeEventListener('dragstart', handleDragStart);
        document.removeEventListener('selectstart', handleSelectStart);
        document.removeEventListener('copy', handleCopy);
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isEnrolled]);

  useEffect(() => {
    console.log('🎯 CourseDetail mounted/updated, Course ID:', id);
    fetchCourse();
    checkEnrollment();
  }, [id]);

  useEffect(() => {
    if (isEnrolled) {
      fetchQuizzes();
      fetchCertificates();
    }
  }, [isEnrolled]);

  // Handle opening specific tab from navigation state
  useEffect(() => {
    const state = location.state as any;
    if (state?.openTab) {
      console.log('📑 Opening tab from navigation:', state.openTab);
      setActiveTab(state.openTab);
      // Clear the state after processing
      window.history.replaceState({}, document.title);
    }
  }, [id]);

  const checkEnrollment = async () => {
    try {
      const user = apiService.getUser();
      console.log('👤 Current user:', user);
      if (!user) {
        console.log('❌ No user logged in');
        setIsEnrolled(false);
        return;
      }
      
      // Check if user is enrolled in this course
      console.log('🔍 Checking enrollment for course:', id);
      const response = await apiService.checkEnrollment(id!);
      console.log('🔍 Enrollment response:', response);
      const enrolled = response.success && response.data?.isEnrolled;
      console.log('✅ Is enrolled?', enrolled);
      setIsEnrolled(enrolled);
    } catch (error) {
      console.error('❌ Error checking enrollment:', error);
      setIsEnrolled(false);
    }
  };

  const fetchQuizzes = async () => {
    try {
      console.log('📝 Fetching quizzes for course:', id);
      const response = await apiService.getCourseQuizzes(id!);
      console.log('📝 Quizzes response:', response);
      if (response.success) {
        console.log('📝 Quizzes data:', response.data);
        const quizzesData = response.data || [];
        
        // Fetch attempts for each quiz
        const quizzesWithAttempts = await Promise.all(
          quizzesData.map(async (quiz: any) => {
            try {
              const attemptsResponse = await apiService.getUserAttempts(quiz._id);
              if (attemptsResponse.success) {
                const attempts = attemptsResponse.data || [];
                const completedAttempts = attempts.filter((a: any) => a.status === 'completed');
                const passedAttempt = completedAttempts.find((a: any) => a.passed);
                const bestAttempt = completedAttempts.reduce((best: any, current: any) => 
                  !best || current.percentage > best.percentage ? current : best
                , null);
                
                return {
                  ...quiz,
                  attempts: completedAttempts,
                  attemptsUsed: completedAttempts.length,
                  hasPassed: !!passedAttempt,
                  bestAttempt: bestAttempt,
                  maxAttemptsReached: quiz.attemptsAllowed !== -1 && completedAttempts.length >= quiz.attemptsAllowed
                };
              }
              return { ...quiz, attempts: [], attemptsUsed: 0, hasPassed: false, maxAttemptsReached: false };
            } catch (error) {
              console.error('Error fetching attempts for quiz:', quiz._id, error);
              return { ...quiz, attempts: [], attemptsUsed: 0, hasPassed: false, maxAttemptsReached: false };
            }
          })
        );
        
        setQuizzes(quizzesWithAttempts);
      } else {
        console.error('❌ Failed to fetch quizzes:', response);
      }
    } catch (error: any) {
      console.error('❌ Error fetching quizzes:', error);
      console.error('❌ Error details:', error.message, error.status);
    }
  };

  const fetchCertificates = async () => {
    try {
      const response = await apiService.getUserCertificates();
      if (response.success) {
        // Filter certificates for this course
        const courseCerts = response.data?.filter((cert: any) => cert.course._id === id) || [];
        setCertificates(courseCerts);
      }
    } catch (error) {
      console.error('Error fetching certificates:', error);
    }
  };

  const fetchCourse = async () => {
    try {
      console.log('📚 Fetching course data for ID:', id);
      setIsLoading(true);
      const response = await apiService.getCourse(id!);
      console.log('📚 Course data response:', response);
      if (response.success && response.data) {
        console.log('✅ Course data loaded successfully');
        setCourse(response.data);
        setFormData(prev => ({ ...prev, courseName: response.data.title }));
      } else {
        console.error('❌ Failed to fetch course:', response);
        setError(response.message || 'Failed to load course details');
      }
    } catch (error: any) {
      console.error('❌ Error fetching course:', error);
      setError('Failed to load course details');
    } finally {
      setIsLoading(false);
      console.log('📚 Course loading complete');
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
      } else if (error.message?.includes('already enrolled')) {
        toast.error('You are already enrolled in this course');
        // Refresh enrollment status
        await checkEnrollment();
      } else {
        toast.error(error.message || 'Failed to add course to cart');
      }
    } finally {
      setAddingToCart(false);
    }
  };

  const handleAdminEnroll = async () => {
    if (!apiService.isAuthenticated()) {
      navigate('/login', { state: { from: `/courses/${id}` } });
      return;
    }

    try {
      setAddingToCart(true);
      const response = await apiService.adminSelfEnroll(id!);
      if (response.success) {
        toast.success('Successfully enrolled in course!');
        // Refresh enrollment status
        await checkEnrollment();
        // Reload the page to show enrolled content
        window.location.reload();
      } else {
        toast.error(response.message || 'Failed to enroll in course');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to enroll in course');
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

              {/* Course Statistics - Inline in Header */}
              <CourseStatsDisplay courseId={id!} variant="inline" className="mb-8" />

              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center gap-4">
                {!isEnrolled && apiService.getUser()?.role === 'admin' && (
                  <button
                    onClick={handleAdminEnroll}
                    disabled={addingToCart}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg flex items-center gap-2 transition-all disabled:opacity-50"
                  >
                    {addingToCart ? 'ENROLLING...' : 'ENROLL AS ADMIN (FREE)'}
                    <CheckIcon className="h-5 w-5" />
                  </button>
                )}
                {!isEnrolled && course.price && course.price > 0 && (
                  <button
                    onClick={handleAddToCart}
                    disabled={addingToCart}
                    className="bg-[#f4e500] hover:bg-[#e0d400] text-dark font-bold py-3 px-8 rounded-lg flex items-center gap-2 transition-all disabled:opacity-50"
                  >
                    {addingToCart ? 'ADDING...' : 'APPLY NOW'}
                    <ChevronRightIcon className="h-5 w-5" />
                  </button>
                )}
                {isEnrolled && (
                  <div className="bg-green-100 border-2 border-green-600 text-green-800 font-bold py-3 px-8 rounded-lg flex items-center gap-2">
                    <CheckIcon className="h-5 w-5" />
                    ENROLLED
                  </div>
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

      {/* Course Information - All Sections Visible Vertically */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          
          {/* Key Points Section */}
          {course.keyPoints && course.keyPoints.length > 0 && (
            <div className="bg-white rounded-xl shadow-md p-8">
              <h2 className="text-3xl font-bold text-dark mb-6 border-b border-gray-200 pb-4">Key Points</h2>
              <ul className="space-y-4">
                {course.keyPoints.map((point, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="h-2 w-2 bg-dark rounded-full mt-2 flex-shrink-0"></span>
                    <span className="text-gray-700 leading-relaxed">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* About Course Section */}
          <div className="bg-white rounded-xl shadow-md p-8">
            <h2 className="text-3xl font-bold text-dark mb-6 border-b border-gray-200 pb-4">About This Course</h2>
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

          {/* Eligibility Section */}
          {course.eligibility && course.eligibility.length > 0 && (
            <div className="bg-white rounded-xl shadow-md p-8">
              <h2 className="text-3xl font-bold text-dark mb-6 border-b border-gray-200 pb-4">Eligibility Criteria</h2>
              <ul className="space-y-3">
                {course.eligibility.map((criterion, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckIcon className="h-6 w-6 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">{criterion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Syllabus Section */}
          <div className="bg-white rounded-xl shadow-md p-8">
            <h2 className="text-3xl font-bold text-dark mb-6 border-b border-gray-200 pb-4">Course Syllabus</h2>
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
                    className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all font-semibold"
                  >
                    Download
                  </a>
                </div>
              </div>
            ) : (
              <p className="text-gray-600">Syllabus will be provided upon enrollment.</p>
            )}
          </div>

          {/* Objectives Section */}
          {course.objectives && course.objectives.length > 0 && (
            <div className="bg-white rounded-xl shadow-md p-8">
              <h2 className="text-3xl font-bold text-dark mb-6 border-b border-gray-200 pb-4">Course Objectives</h2>
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
            </div>
          )}

        </div>
      </div>

      {/* Premium Content Tabs Section - Only for Enrolled Users */}
      {isEnrolled && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="bg-white rounded-xl shadow-md p-8">
            <h2 className="text-3xl font-bold text-dark mb-6 border-b border-gray-200 pb-4">Premium Course Content</h2>
            
            {/* Tabs for Premium Content */}
            <div className="bg-gray-100 rounded-lg p-2 mb-6">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveTab('folders')}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                    activeTab === 'folders'
                      ? 'bg-white text-dark shadow-md'
                      : 'text-gray-600 hover:text-dark hover:bg-white/50'
                  }`}
                >
                  📁 Course Content
                </button>
                <button
                  onClick={() => setActiveTab('textContent')}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                    activeTab === 'textContent'
                      ? 'bg-white text-dark shadow-md'
                      : 'text-gray-600 hover:text-dark hover:bg-white/50'
                  }`}
                >
                  Text Content
                </button>
                <button
                  onClick={() => setActiveTab('externalLinks')}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                    activeTab === 'externalLinks'
                      ? 'bg-white text-dark shadow-md'
                      : 'text-gray-600 hover:text-dark hover:bg-white/50'
                  }`}
                >
                  External Videos
                </button>
                <button
                  onClick={() => setActiveTab('quizzes')}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                    activeTab === 'quizzes'
                      ? 'bg-white text-dark shadow-md'
                      : 'text-gray-600 hover:text-dark hover:bg-white/50'
                  }`}
                >
                  📝 Quizzes & Tests ({quizzes.length})
                </button>
                <button
                  onClick={() => setActiveTab('certificates')}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                    activeTab === 'certificates'
                      ? 'bg-white text-dark shadow-md'
                      : 'text-gray-600 hover:text-dark hover:bg-white/50'
                  }`}
                >
                  🏆 Certificates ({certificates.length})
                </button>
              </div>
            </div>

            {/* Premium Content Display */}
            <div>
          {/* Folders Tab - Folder-based content organization */}
          {activeTab === 'folders' && (
            <div className="select-none" onContextMenu={(e) => e.preventDefault()}>
              <h3 className="text-2xl font-bold text-dark mb-4">Course Content</h3>
              {course.mediaFolders && course.mediaFolders.length > 0 ? (
                <div className="space-y-4">
                  {course.mediaFolders.map((folder, folderIndex) => (
                    <div key={folderIndex} className="border border-gray-200 rounded-lg overflow-hidden">
                      {/* Folder Header */}
                      <div 
                        className="bg-primary/10 px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-primary/15 transition-colors"
                        onClick={() => {
                          const newExpanded = new Set(expandedFolders)
                          if (newExpanded.has(folderIndex)) {
                            newExpanded.delete(folderIndex)
                          } else {
                            newExpanded.add(folderIndex)
                          }
                          setExpandedFolders(newExpanded)
                        }}
                      >
                        <div className="flex items-center gap-3">
                          {expandedFolders.has(folderIndex) ? (
                            <ChevronUpIcon className="h-5 w-5 text-primary" />
                          ) : (
                            <ChevronDownIcon className="h-5 w-5 text-primary" />
                          )}
                          <FolderIcon className="h-6 w-6 text-primary" />
                          <span className="font-bold text-lg text-dark">{folder.folderName}</span>
                          <span className="text-sm text-gray-600">
                            ({folder.videos.length} videos, {folder.pdfs.length} PDFs, {folder.images.length} images
                            {folder.textContent && folder.textContent.length > 0 && `, ${folder.textContent.length} text sections`}
                            {folder.externalVideoLinks && folder.externalVideoLinks.length > 0 && `, ${folder.externalVideoLinks.length} external videos`})
                          </span>
        </div>
      </div>

                      {/* Folder Content */}
                      {expandedFolders.has(folderIndex) && (
                        <div className="bg-white p-4 space-y-6">
                          {/* Videos in Folder */}
                          {folder.videos.length > 0 && (
                            <div>
                              <h4 className="text-lg font-semibold text-dark mb-3 flex items-center gap-2">
                                <PlayIcon className="h-5 w-5 text-primary" />
                                Videos ({folder.videos.length})
                              </h4>
                              <div className="grid grid-cols-1 gap-4">
                                {folder.videos.map((video, videoIndex) => (
                                  <div key={videoIndex} className="border border-gray-200 rounded-lg overflow-hidden">
                                    <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                                      <p className="font-semibold text-gray-900 text-sm">{video.name}</p>
                                    </div>
                                    <div className="bg-black">
                                      <video
                                        controls
                                        controlsList="nodownload noplaybackrate"
                                        disablePictureInPicture
                                        className="w-full aspect-video"
                                        onContextMenu={(e) => e.preventDefault()}
                                      >
                                        <source src={video.url} type="video/mp4" />
                                        Your browser does not support the video tag.
                                      </video>
                      </div>
                    </div>
                  ))}
                </div>
            </div>
          )}

                          {/* PDFs in Folder */}
                          {folder.pdfs.length > 0 && (
            <div>
                              <h4 className="text-lg font-semibold text-dark mb-3 flex items-center gap-2">
                                <DocumentTextIcon className="h-5 w-5 text-primary" />
                                PDFs ({folder.pdfs.length})
                              </h4>
                <div className="grid grid-cols-1 gap-4">
                                {folder.pdfs.map((pdf, pdfIndex) => (
                                  <div key={pdfIndex} className="border border-gray-200 rounded-lg overflow-hidden">
                                    <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                                      <p className="font-semibold text-gray-900 text-sm">{pdf.name}</p>
                          </div>
                                    <ProtectedPdfViewer 
                                      pdfUrl={pdf.url}
                                      pdfName={pdf.name}
                                      height="600px"
                                    />
                    </div>
                  ))}
                </div>
            </div>
          )}

                          {/* Images in Folder */}
                          {folder.images.length > 0 && (
            <div>
                              <h4 className="text-lg font-semibold text-dark mb-3 flex items-center gap-2">
                                <PhotoIcon className="h-5 w-5 text-primary" />
                                Images ({folder.images.length})
                              </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {folder.images.map((image, imageIndex) => (
                                  <div 
                                    key={imageIndex} 
                                    className="border border-gray-200 rounded-lg overflow-hidden hover:border-primary hover:shadow-lg transition-all cursor-pointer"
                                    onClick={() => setSelectedImage(image.url)}
                                    onDragStart={(e) => e.preventDefault()}
                                  >
                      <img 
                        src={image.url} 
                                      alt={`${folder.folderName} image ${imageIndex + 1}`}
                                      className="w-full h-48 object-cover pointer-events-none"
                                      draggable={false}
                                      onContextMenu={(e) => e.preventDefault()}
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Text Content in Folder */}
                          {folder.textContent && folder.textContent.length > 0 && (
                            <div>
                              <h4 className="text-lg font-semibold text-dark mb-3 flex items-center gap-2">
                                <DocumentTextIcon className="h-5 w-5 text-primary" />
                                Text Content ({folder.textContent.length})
                              </h4>
                              <div className="space-y-4">
                                {folder.textContent.map((text, textIndex) => {
                                  const { content, isHTML } = prepareContentForRendering(text.content)
                                  return (
                                    <div key={textIndex} className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
                                      <h5 className="font-bold text-xl text-dark mb-4 border-b border-gray-100 pb-3">{text.title}</h5>
                                      {/* Render based on content type */}
                                      {isHTML ? (
                                        <div 
                                          className="prose prose-lg max-w-none"
                                          dangerouslySetInnerHTML={{ __html: content }}
                                          onContextMenu={(e) => e.preventDefault()}
                                          onCopy={(e) => e.preventDefault()}
                                          style={{ userSelect: 'none', fontFamily: 'inherit' }}
                                        />
                                      ) : (
                                        <div
                                          onContextMenu={(e) => e.preventDefault()}
                                          onCopy={(e) => e.preventDefault()}
                                          style={{ userSelect: 'none' }}
                                        >
                                          <MarkdownRenderer content={content} />
                                        </div>
                                      )}
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          )}

                          {/* External Video Links in Folder */}
                          {folder.externalVideoLinks && folder.externalVideoLinks.length > 0 && (
                            <div>
                              <h4 className="text-lg font-semibold text-dark mb-3 flex items-center gap-2">
                                <PlayIcon className="h-5 w-5 text-primary" />
                                External Videos ({folder.externalVideoLinks.length})
                              </h4>
                              <div className="space-y-4">
                                {folder.externalVideoLinks.map((video, videoIndex) => (
                                  <div key={videoIndex} className="border border-gray-200 rounded-lg p-6 bg-white">
                                    <div className="flex items-start justify-between gap-4">
                                      <div className="flex-1">
                                        <h5 className="font-bold text-lg text-dark mb-2">{video.title}</h5>
                                        {video.description && (
                                          <p className="text-gray-600 mb-3">{video.description}</p>
                                        )}
                                        {video.platform && (
                                          <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-sm rounded-full font-semibold mb-3">
                                            {video.platform}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <a
                                      href={video.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition font-semibold"
                                    >
                                      <PlayIcon className="h-5 w-5" />
                                      Watch Video
                                    </a>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {folder.videos.length === 0 && folder.pdfs.length === 0 && folder.images.length === 0 && 
                           (!folder.textContent || folder.textContent.length === 0) && 
                           (!folder.externalVideoLinks || folder.externalVideoLinks.length === 0) && (
                            <p className="text-gray-500 text-center py-4">This folder is empty.</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No course content available yet.</p>
              )}
            </div>
          )}

          {/* Text Content Tab */}
          {activeTab === 'textContent' && (
            <div onContextMenu={(e) => e.preventDefault()} onCopy={(e) => e.preventDefault()}>
              <h3 className="text-2xl font-bold text-dark mb-4">Text Content</h3>
              {course.textContent && course.textContent.length > 0 ? (
                <div className="space-y-6">
                  {course.textContent.map((text, index) => {
                    const { content, isHTML } = prepareContentForRendering(text.content)
                    return (
                      <div key={index} className="border-l-4 border-primary pl-6 py-2">
                        <h4 className="text-xl font-semibold text-gray-900 mb-3">{text.title}</h4>
                        <div 
                          className="text-gray-700 leading-relaxed" 
                          onCopy={(e) => e.preventDefault()}
                          style={{ userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none' }}
                        >
                          {/* Render based on content type */}
                          {isHTML ? (
                            <div 
                              className="prose prose-lg max-w-none"
                              dangerouslySetInnerHTML={{ __html: content }}
                              style={{
                                fontFamily: 'inherit'
                              }}
                            />
                          ) : (
                            <MarkdownRenderer content={content} />
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-gray-600">No text content available for this course yet.</p>
              )}
            </div>
          )}

          {/* External Video Links Tab */}
          {activeTab === 'externalLinks' && (
            <div>
              <h3 className="text-2xl font-bold text-dark mb-4">External Video Links</h3>
              {course.externalVideoLinks && course.externalVideoLinks.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {course.externalVideoLinks.map((link, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-primary transition-all">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          <LinkIcon className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900 mb-1">{link.title}</p>
                            {link.description && (
                              <p className="text-sm text-gray-600 mb-2">{link.description}</p>
                            )}
                            <span className="inline-block px-2 py-1 bg-primary/10 text-primary text-xs rounded">
                              {link.platform}
                            </span>
                          </div>
                        </div>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all whitespace-nowrap"
                        >
                          Watch
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No external video links available for this course yet.</p>
              )}
            </div>
          )}

          {/* Quizzes & Tests Tab - Only for Enrolled Users */}
          {activeTab === 'quizzes' && (
            <div>
                <h3 className="text-2xl font-bold text-dark mb-4">Quizzes & Tests</h3>
                {quizzes.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {quizzes.map((quiz) => (
                      <div key={quiz._id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-all">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <h4 className="font-bold text-dark text-lg mb-2">{quiz.title}</h4>
                            <p className="text-sm text-medium line-clamp-2">{quiz.description}</p>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-semibold ml-3 ${
                            quiz.type === 'quiz' ? 'bg-blue-100 text-blue-700' :
                            quiz.type === 'test' ? 'bg-purple-100 text-purple-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {quiz.type === 'quiz' ? 'Quiz' : quiz.type === 'test' ? 'Test' : 'Final Exam'}
                          </span>
                        </div>
                        <div className="space-y-2 mb-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <ClockIcon className="w-4 h-4" />
                            <span>{quiz.timeLimit} minutes</span>
                          </div>
                          <div>📝 {quiz.questions?.length || 0} questions • {quiz.totalPoints} points</div>
                          <div>✅ Passing: {quiz.passingScore}%</div>
                          <div>🔄 {quiz.attemptsAllowed === -1 ? 'Unlimited attempts' : `${quiz.attemptsUsed || 0}/${quiz.attemptsAllowed} attempts used`}</div>
                        </div>
                        
                        {/* Show different UI based on user's quiz status */}
                        {quiz.hasPassed ? (
                          <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4">
                            <div className="flex items-center gap-2 text-green-700 mb-2">
                              <CheckIcon className="w-5 h-5 font-bold" />
                              <span className="font-bold">Quiz Passed!</span>
                            </div>
                            <div className="text-sm text-green-600 space-y-1">
                              <div>Score: <span className="font-semibold">{quiz.bestAttempt?.percentage?.toFixed(1)}%</span></div>
                              <div>Points: <span className="font-semibold">{quiz.bestAttempt?.pointsEarned}/{quiz.totalPoints}</span></div>
                            </div>
                            <button
                              onClick={() => navigate(`/quiz/${quiz._id}/results`, { 
                                state: { 
                                  results: {
                                    attemptId: quiz.bestAttempt?._id,
                                    pointsEarned: quiz.bestAttempt?.pointsEarned,
                                    totalPoints: quiz.totalPoints,
                                    percentage: quiz.bestAttempt?.percentage,
                                    passed: true,
                                    passingScore: quiz.passingScore,
                                    answers: quiz.bestAttempt?.answers
                                  },
                                  quizTitle: quiz.title,
                                  courseId: id
                                } 
                              })}
                              className="w-full mt-3 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-all"
                            >
                              View Results
                            </button>
                          </div>
                        ) : quiz.maxAttemptsReached ? (
                          <div className="bg-red-50 border-2 border-red-500 rounded-lg p-4">
                            <div className="flex items-center gap-2 text-red-700 mb-2">
                              <LockClosedIcon className="w-5 h-5" />
                              <span className="font-bold">Maximum Attempts Reached</span>
                            </div>
                            <div className="text-sm text-red-600">
                              {quiz.bestAttempt && (
                                <div className="space-y-1">
                                  <div>Best Score: <span className="font-semibold">{quiz.bestAttempt.percentage?.toFixed(1)}%</span></div>
                                  <div>Required: <span className="font-semibold">{quiz.passingScore}%</span></div>
                                </div>
                              )}
                            </div>
                            {quiz.bestAttempt && (
                              <button
                                onClick={() => navigate(`/quiz/${quiz._id}/results`, { 
                                  state: { 
                                    results: {
                                      attemptId: quiz.bestAttempt?._id,
                                      pointsEarned: quiz.bestAttempt?.pointsEarned,
                                      totalPoints: quiz.totalPoints,
                                      percentage: quiz.bestAttempt?.percentage,
                                      passed: false,
                                      passingScore: quiz.passingScore,
                                      answers: quiz.bestAttempt?.answers
                                    },
                                    quizTitle: quiz.title,
                                    courseId: id
                                  } 
                                })}
                                className="w-full mt-3 bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-all"
                              >
                                View Last Attempt
                              </button>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={() => navigate(`/quiz/${quiz._id}`, { state: { courseId: id } })}
                            className="w-full bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary/90 transition-all"
                          >
                            Start {quiz.type === 'quiz' ? 'Quiz' : 'Test'}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-gray-50 rounded-lg">
                    <DocumentTextIcon className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">No quizzes or tests available yet</p>
                    <p className="text-sm text-gray-500">Your instructor will add assessments soon.</p>
                  </div>
                )}
              </div>
          )}

          {/* Certificates Tab - Only for Enrolled Users */}
          {activeTab === 'certificates' && (
            <div>
                <h3 className="text-2xl font-bold text-dark mb-4">Certificates</h3>
                {certificates.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {certificates.map((cert) => (
                      <div key={cert._id} className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg border border-primary/20 p-6 hover:shadow-lg transition-all">
                        <div className="flex justify-between items-start mb-4">
                          <TrophyIcon className="w-12 h-12 text-primary" />
                          <span className="bg-primary text-white px-3 py-1 rounded-full text-xs font-semibold">
                            {cert.grade}
                          </span>
                        </div>
                        <h4 className="font-bold text-dark text-lg mb-2">{cert.courseName}</h4>
                        <div className="space-y-2 text-sm text-gray-600 mb-4">
                          <div>📅 Issued: {new Date(cert.issueDate).toLocaleDateString()}</div>
                          <div>📊 Score: {cert.score}%</div>
                          <div>🔢 Certificate #: {cert.certificateNumber}</div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => window.open(`/certificate/${cert._id}`, '_blank')}
                            className="flex-1 bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary/90 transition-all text-sm"
                          >
                            View Certificate
                          </button>
                          <button
                            onClick={() => window.open(`/verify-certificate/${cert.certificateNumber}`, '_blank')}
                            className="flex-1 bg-white border border-primary text-primary px-4 py-2 rounded-lg font-semibold hover:bg-primary/10 transition-all text-sm"
                          >
                            Verify
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg border border-primary/20">
                    <TrophyIcon className="w-20 h-20 text-primary mx-auto mb-4" />
                    <h4 className="text-xl font-bold text-dark mb-3">Earn Your Certificate</h4>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      Complete all quizzes and tests with passing grades to generate your certificate.
                    </p>
                    {quizzes.length > 0 && (
                      <button
                        onClick={() => setActiveTab('quizzes')}
                        className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-all shadow-md"
                      >
                        Start Quizzes
                      </button>
                    )}
                  </div>
                )}
              </div>
          )}
            </div>
          </div>
        </div>
      )}

      {/* Secure Image Viewer - Canvas-based with watermarks */}
      {selectedImage && (
        <SecureImageViewer
          imageUrl={selectedImage}
          imageName="Course Image"
          onClose={() => setSelectedImage(null)}
        />
      )}
    </div>
  );
}

