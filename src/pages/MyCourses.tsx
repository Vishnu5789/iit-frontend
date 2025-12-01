import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AcademicCapIcon, ClockIcon, DocumentTextIcon, TrophyIcon, PlayIcon, CheckIcon, LockClosedIcon } from '@heroicons/react/24/outline'
import apiService from '../services/api'
import toast from 'react-hot-toast'

interface Course {
  _id: string
  title: string
  description: string
  thumbnail: {
    url: string
  }
  duration: string
  level: string
  category: string
  price: number
  discountPrice: number
  createdAt: string
  quizzes?: any[]
  certificates?: any[]
}

export default function MyCourses() {
  const navigate = useNavigate()
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null)

  useEffect(() => {
    // Check if user is authenticated
    if (!apiService.isAuthenticated()) {
      navigate('/login')
      return
    }

    fetchEnrolledCourses()
  }, [navigate])

  const fetchEnrolledCourses = async () => {
    try {
      setIsLoading(true)
      console.log('📚 Fetching enrolled courses...');
      const response = await apiService.getEnrolledCourses()
      console.log('📚 Enrolled courses response:', response);
      
      if (response.success) {
        const coursesData = response.data
        console.log('📚 Courses data:', coursesData);
        
        // Fetch quizzes and certificates for each course
        const coursesWithData = await Promise.all(
          coursesData.map(async (course: Course) => {
            console.log('🔍 Processing course:', course._id, course.title);
            try {
              const [quizzesRes, certsRes] = await Promise.all([
                apiService.getCourseQuizzes(course._id),
                apiService.getUserCertificates()
              ]);
              
              const courseCerts = certsRes.success 
                ? certsRes.data?.filter((cert: any) => cert.course?._id === course._id) || []
                : [];
              
              // Fetch attempts for each quiz
              const quizzesData = quizzesRes.success ? quizzesRes.data : [];
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
              
              return {
                ...course,
                quizzes: quizzesWithAttempts,
                certificates: courseCerts
              };
            } catch (err) {
              console.error(`Error fetching data for course ${course._id}:`, err);
              return {
                ...course,
                quizzes: [],
                certificates: []
              };
            }
          })
        );
        
        console.log('✅ Courses with data:', coursesWithData);
        setCourses(coursesWithData)
      } else {
        setError(response.message || 'Failed to fetch enrolled courses')
      }
    } catch (err: any) {
      console.error('Error fetching enrolled courses:', err)
      setError(err.message || 'Failed to fetch enrolled courses')
    } finally {
      setIsLoading(false)
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner':
        return 'bg-green-100 text-green-800'
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-800'
      case 'Advanced':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }

  if (isLoading) {
    return (
      <div className="pt-28 md:pt-32 lg:pt-36 px-4 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your courses...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="pt-28 md:pt-32 lg:pt-36 px-4 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800">{error}</p>
            <button
              onClick={fetchEnrolledCourses}
              className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-28 md:pt-32 lg:pt-36 px-4 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto pb-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-dark mb-2">My Courses</h1>
          <p className="text-gray-600">
            {courses.length === 0 
              ? 'You haven\'t enrolled in any courses yet.' 
              : `You have ${courses.length} course${courses.length > 1 ? 's' : ''} enrolled.`}
          </p>
        </div>

        {/* Empty State */}
        {courses.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <AcademicCapIcon className="w-24 h-24 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No courses yet</h3>
            <p className="text-gray-600 mb-6">
              Start learning today! Browse our courses and find one that's perfect for you.
            </p>
            <button
              onClick={() => navigate('/courses')}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition font-semibold"
            >
              Browse Courses
            </button>
          </div>
        ) : (
          /* Courses Grid */
          <div className="space-y-6">
            {courses.map((course) => (
              <div
                key={course._id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                {/* Course Header - Clickable */}
                <div 
                  className="flex flex-col md:flex-row gap-4 p-6 cursor-pointer hover:bg-gray-50 transition-all"
                  onClick={() => setExpandedCourse(expandedCourse === course._id ? null : course._id)}
                >
                  {/* Thumbnail */}
                  <div className="relative w-full md:w-48 h-32 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                    {course.thumbnail?.url ? (
                      <img
                        src={course.thumbnail.url}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <AcademicCapIcon className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Course Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                            {course.category}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getLevelColor(course.level)}`}>
                            {course.level}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-dark mb-2">
                          {course.title}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {course.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <ClockIcon className="w-4 h-4" />
                        <span>{course.duration}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DocumentTextIcon className="w-4 h-4" />
                        <span>{course.quizzes?.length || 0} Quizzes</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrophyIcon className="w-4 h-4" />
                        <span>{course.certificates?.length || 0} Certificates</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons - Right side */}
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('🔍 Navigating to course:', course._id, course);
                        if (course._id) {
                          navigate(`/courses/${course._id}`);
                        } else {
                          console.error('❌ Course ID is missing!', course);
                          toast.error('Course ID is missing');
                        }
                      }}
                      className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition font-semibold whitespace-nowrap"
                    >
                      Continue Learning
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedCourse(expandedCourse === course._id ? null : course._id);
                      }}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium text-sm whitespace-nowrap"
                    >
                      {expandedCourse === course._id ? 'Show Less ▲' : 'Show More ▼'}
                    </button>
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedCourse === course._id && (
                  <div 
                    className="border-t bg-gray-50 p-6 space-y-6"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <button
                        onClick={() => {
                          console.log('🔍 View Course Content clicked:', course._id);
                          if (course._id) {
                            navigate(`/courses/${course._id}`);
                          } else {
                            toast.error('Course ID is missing');
                          }
                        }}
                        className="flex items-center justify-center gap-2 p-4 bg-white border-2 border-primary rounded-lg hover:bg-primary/5 transition-all cursor-pointer"
                      >
                        <PlayIcon className="w-5 h-5 text-primary" />
                        <span className="font-semibold text-primary">View Course Content</span>
                      </button>
                      <button
                        onClick={() => {
                          console.log('🔍 Take Quizzes clicked:', course._id);
                          if (course._id) {
                            navigate(`/courses/${course._id}`, { state: { openTab: 'quizzes' } });
                          } else {
                            toast.error('Course ID is missing');
                          }
                        }}
                        className="flex items-center justify-center gap-2 p-4 bg-white border-2 border-blue-500 rounded-lg hover:bg-blue-50 transition-all cursor-pointer"
                      >
                        <DocumentTextIcon className="w-5 h-5 text-blue-600" />
                        <span className="font-semibold text-blue-600">Take Quizzes ({course.quizzes?.length || 0})</span>
                      </button>
                      <button
                        onClick={() => {
                          console.log('🔍 Certificates clicked:', course._id);
                          if (course._id) {
                            navigate(`/courses/${course._id}`, { state: { openTab: 'certificates' } });
                          } else {
                            toast.error('Course ID is missing');
                          }
                        }}
                        className="flex items-center justify-center gap-2 p-4 bg-white border-2 border-amber-500 rounded-lg hover:bg-amber-50 transition-all cursor-pointer"
                      >
                        <TrophyIcon className="w-5 h-5 text-amber-600" />
                        <span className="font-semibold text-amber-600">Certificates ({course.certificates?.length || 0})</span>
                      </button>
                    </div>

                    {/* Quizzes List */}
                    {course.quizzes && course.quizzes.length > 0 && (
                      <div>
                        <h4 className="font-bold text-dark mb-3">Available Quizzes & Tests</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {course.quizzes.slice(0, 4).map((quiz: any) => (
                            <div
                              key={quiz._id}
                              className="bg-white rounded-lg p-4 border border-gray-200 hover:border-primary transition-all"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <h5 className="font-semibold text-dark text-sm flex-1">{quiz.title}</h5>
                                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                  quiz.type === 'quiz' ? 'bg-blue-100 text-blue-700' :
                                  quiz.type === 'test' ? 'bg-purple-100 text-purple-700' :
                                  'bg-red-100 text-red-700'
                                }`}>
                                  {quiz.type}
                                </span>
                              </div>
                              <div className="text-xs text-gray-600 space-y-1 mb-2">
                                <div>⏱️ {quiz.timeLimit} min • {quiz.questions?.length || 0} questions</div>
                                <div>✅ Pass: {quiz.passingScore}%</div>
                                <div>🔄 {quiz.attemptsAllowed === -1 ? 'Unlimited' : `${quiz.attemptsUsed || 0}/${quiz.attemptsAllowed} used`}</div>
                              </div>
                              
                              {/* Show different UI based on user's quiz status */}
                              {quiz.hasPassed ? (
                                <div className="bg-green-50 border border-green-500 rounded p-2 mt-2">
                                  <div className="flex items-center gap-1 text-green-700 text-xs font-semibold mb-1">
                                    <CheckIcon className="w-4 h-4" />
                                    <span>Passed!</span>
                                  </div>
                                  <div className="text-xs text-green-600">
                                    Score: {quiz.bestAttempt?.percentage?.toFixed(1)}%
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
                                        courseId: course._id
                                      } 
                                    })}
                                    className="w-full mt-2 text-xs bg-green-600 text-white py-2 rounded font-semibold hover:bg-green-700 transition-all cursor-pointer"
                                  >
                                    View Results →
                                  </button>
                                </div>
                              ) : quiz.maxAttemptsReached ? (
                                <div className="bg-red-50 border border-red-500 rounded p-2 mt-2">
                                  <div className="flex items-center gap-1 text-red-700 text-xs font-semibold mb-1">
                                    <LockClosedIcon className="w-4 h-4" />
                                    <span>Max Attempts</span>
                                  </div>
                                  {quiz.bestAttempt && (
                                    <>
                                      <div className="text-xs text-red-600">
                                        Best: {quiz.bestAttempt.percentage?.toFixed(1)}%
                                      </div>
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
                                            courseId: course._id
                                          } 
                                        })}
                                        className="w-full mt-2 text-xs bg-red-600 text-white py-2 rounded font-semibold hover:bg-red-700 transition-all cursor-pointer"
                                      >
                                        View Last Attempt →
                                      </button>
                                    </>
                                  )}
                                </div>
                              ) : (
                                <button 
                                  onClick={() => navigate(`/quiz/${quiz._id}`, { state: { courseId: course._id } })}
                                  className="w-full mt-3 text-xs bg-primary/10 text-primary py-2 rounded font-semibold hover:bg-primary/20 transition-all cursor-pointer"
                                >
                                  Start Quiz →
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                        {course.quizzes.length > 4 && (
                          <button
                            onClick={() => navigate(`/courses/${course._id}`, { state: { openTab: 'quizzes' } })}
                            className="text-primary text-sm font-semibold mt-2 hover:text-primary/80 cursor-pointer"
                          >
                            View all {course.quizzes.length} quizzes →
                          </button>
                        )}
                      </div>
                    )}

                    {/* Certificates */}
                    {course.certificates && course.certificates.length > 0 && (
                      <div>
                        <h4 className="font-bold text-dark mb-3">Your Certificates</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {course.certificates.map((cert: any) => (
                            <div
                              key={cert._id}
                              className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-4 border-2 border-amber-300"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <TrophyIcon className="w-8 h-8 text-amber-600" />
                                <span className="bg-amber-600 text-white px-2 py-1 rounded text-xs font-bold">
                                  {cert.grade}
                                </span>
                              </div>
                              <h5 className="font-semibold text-dark text-sm mb-2">Certificate of Completion</h5>
                              <div className="text-xs text-gray-700 space-y-1 mb-3">
                                <div>📅 {new Date(cert.issueDate).toLocaleDateString()}</div>
                                <div>📊 Score: {cert.score}%</div>
                                <div>🔢 #{cert.certificateNumber}</div>
                              </div>
                              <button
                                onClick={() => window.open(`/certificate/${cert._id}`, '_blank')}
                                className="w-full text-xs bg-amber-600 text-white py-2 rounded font-semibold hover:bg-amber-700 transition-all cursor-pointer"
                              >
                                View Certificate
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

