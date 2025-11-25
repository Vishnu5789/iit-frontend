import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PlayIcon, ClockIcon, AcademicCapIcon, ShoppingCartIcon, CheckIcon } from '@heroicons/react/24/outline';
import apiService from '../services/api';

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
}

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getCourse(id!);
      if (response.success && response.data) {
        setCourse(response.data);
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
        alert('Course added to cart!');
        navigate('/cart');
      }
    } catch (error: any) {
      if (error.message?.includes('already in cart')) {
        navigate('/cart');
      } else {
        alert(error.message || 'Failed to add course to cart');
      }
    } finally {
      setAddingToCart(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-secondary/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-secondary/5 flex items-center justify-center">
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

  const finalPrice = course.discountPrice && course.discountPrice > 0 ? course.discountPrice : (course.price || 0);
  const discount = course.price && course.discountPrice && course.discountPrice > 0 
    ? Math.round(((course.price - course.discountPrice) / course.price) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-secondary/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <button
          onClick={() => navigate('/courses')}
          className="mb-6 text-primary hover:text-primary/80 flex items-center gap-2"
        >
          ← Back to Courses
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Left 2/3 */}
          <div className="lg:col-span-2 space-y-8">
            {/* Course Header */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-primary/10 p-8">
              <div className="flex items-start gap-4 mb-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  {course.category}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-secondary/10 text-secondary">
                  {course.level}
                </span>
              </div>
              
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{course.title}</h1>
              
              <div className="flex items-center gap-6 text-gray-600 mb-6">
                <div className="flex items-center gap-2">
                  <ClockIcon className="h-5 w-5" />
                  <span>{course.duration}</span>
                </div>
              </div>

              <p className="text-gray-700 leading-relaxed">{course.description}</p>
            </div>

            {/* Course Syllabus */}
            {course.syllabus?.url && (
              <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-primary/10 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <AcademicCapIcon className="h-6 w-6 text-primary" />
                  Course Syllabus
                </h2>
                <div className="flex items-center justify-between bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Course Syllabus Document</p>
                      <p className="text-sm text-gray-500">{course.syllabus.name || 'Syllabus.pdf'}</p>
                    </div>
                  </div>
                  <a
                    href={course.syllabus.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-all"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download Syllabus
                  </a>
                </div>
                <p className="text-sm text-gray-600 mt-4">
                  📄 Click the button above to download and view the complete course syllabus
                </p>
              </div>
            )}

            {/* Sample Videos */}
            {course.sampleVideos && course.sampleVideos.length > 0 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-primary/10 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <PlayIcon className="h-6 w-6 text-primary" />
                  Sample Videos
                </h2>

                {/* Video Player */}
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

                {/* Video List */}
                <div className="space-y-2">
                  {course.sampleVideos.map((video, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedVideo(video)}
                      className={`w-full text-left p-4 rounded-lg border transition-all ${
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

            {/* Course Content Info */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-primary/10 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                What You'll Get
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckIcon className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">Full Course Access</p>
                    <p className="text-gray-600 text-sm">Lifetime access to all course materials</p>
                  </div>
                </div>
                {course.videoFiles && course.videoFiles.length > 0 && (
                  <div className="flex items-start gap-3">
                    <CheckIcon className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-medium text-gray-900">{course.videoFiles.length} Video Lessons</p>
                      <p className="text-gray-600 text-sm">Comprehensive video tutorials</p>
                    </div>
                  </div>
                )}
                {course.pdfFiles && course.pdfFiles.length > 0 && (
                  <div className="flex items-start gap-3">
                    <CheckIcon className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-medium text-gray-900">{course.pdfFiles.length} PDF Resources</p>
                      <p className="text-gray-600 text-sm">Downloadable study materials</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <CheckIcon className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">Certificate of Completion</p>
                    <p className="text-gray-600 text-sm">Earn a certificate upon course completion</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Right 1/3 */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-primary/10 p-8">
              {/* Course Image */}
              {course.thumbnail.url && (
                <img
                  src={course.thumbnail.url}
                  alt={course.title}
                  className="w-full h-48 object-cover rounded-lg mb-6"
                />
              )}

              {/* Pricing */}
              {course.price && course.price > 0 ? (
                <div className="mb-6">
                  <div className="flex items-baseline gap-3 mb-2">
                    <span className="text-4xl font-bold text-gray-900">
                      ₹{finalPrice.toLocaleString()}
                    </span>
                    {discount > 0 && course.price && (
                      <span className="text-xl text-gray-400 line-through">
                        ₹{course.price.toLocaleString()}
                      </span>
                    )}
                  </div>
                  {discount > 0 && (
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      {discount}% OFF
                    </span>
                  )}
                </div>
              ) : (
                <div className="mb-6">
                  <p className="text-gray-500 text-sm">Price not set yet</p>
                </div>
              )}

              {/* Add to Cart Button */}
              {course.price && course.price > 0 ? (
                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  className="w-full bg-gradient-to-r from-primary to-secondary text-white py-4 px-6 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <ShoppingCartIcon className="h-5 w-5" />
                  {addingToCart ? 'Adding...' : 'Add to Cart'}
                </button>
              ) : (
                <div className="w-full bg-gray-100 text-gray-500 py-4 px-6 rounded-lg font-semibold text-center">
                  Not Available for Purchase
                </div>
              )}

              {/* Course Features */}
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                <div className="flex items-center gap-3 text-gray-700">
                  <AcademicCapIcon className="h-5 w-5 text-primary" />
                  <span className="text-sm">Suitable for {course.level} learners</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <ClockIcon className="h-5 w-5 text-primary" />
                  <span className="text-sm">{course.duration} of content</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

