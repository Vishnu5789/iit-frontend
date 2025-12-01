import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ClockIcon, ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import apiService from '../services/api';

interface Question {
  _id: string;
  questionText: string;
  questionType: 'multiple-choice' | 'true-false';
  options: Array<{ text: string; _id: string }>;
  points: number;
  explanation?: string;
}

interface Quiz {
  _id: string;
  title: string;
  description: string;
  type: string;
  timeLimit: number;
  passingScore: number;
  totalPoints: number;
  questions: Question[];
  course: string;
}

const QuizTake = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [attemptId, setAttemptId] = useState<string>('');
  const [courseId, setCourseId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<any[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    startQuiz();
  }, [quizId]);

  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeRemaining]);

  const startQuiz = async () => {
    try {
      setLoading(true);
      const response = await apiService.startQuiz(quizId!);
      
      if (response.success) {
        const quizData = response.data.quiz;
        setQuiz(quizData);
        setAttemptId(response.data.attemptId);
        // Get course ID from navigation state or from quiz data
        const cId = (location.state as any)?.courseId || quizData.course;
        setCourseId(cId); // Store course ID
        setTimeRemaining(quizData.timeLimit * 60); // Convert minutes to seconds
        
        // Initialize answers array
        const initialAnswers = quizData.questions.map((q: Question) => ({
          questionId: q._id,
          selectedOption: -1,
          answer: '',
          timeSpent: 0
        }));
        setAnswers(initialAnswers);
        
        toast.success('Quiz started! Good luck!');
      }
    } catch (error: any) {
      console.error('Error starting quiz:', error);
      toast.error(error.message || 'Failed to start quiz');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, type: string, value: any) => {
    setAnswers((prev) =>
      prev.map((ans) =>
        ans.questionId === questionId
          ? {
              ...ans,
              selectedOption: type === 'multiple-choice' ? value : ans.selectedOption,
              answer: type === 'true-false' ? value : ans.answer,
            }
          : ans
      )
    );
  };

  const handleAutoSubmit = async () => {
    if (submitting) return;
    toast.error('Time is up! Submitting your quiz...');
    await handleSubmit();
  };

  const handleSubmit = async () => {
    if (submitting) return;
    
    if (!confirm('Are you sure you want to submit your quiz? You cannot change your answers after submission.')) {
      return;
    }

    try {
      setSubmitting(true);
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      
      const response = await apiService.submitQuiz(attemptId, answers, timeSpent);
      
      if (response.success) {
        // Navigate to results page with results data
        navigate(`/quiz/${quizId}/results`, { 
          state: { 
            results: response.data,
            quizTitle: quiz?.title,
            courseId: courseId
          } 
        });
      }
    } catch (error: any) {
      console.error('Error submitting quiz:', error);
      toast.error(error.message || 'Failed to submit quiz');
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isQuestionAnswered = (questionIndex: number) => {
    const answer = answers[questionIndex];
    if (!answer) return false;
    
    const question = quiz?.questions[questionIndex];
    if (question?.questionType === 'multiple-choice') {
      return answer.selectedOption >= 0;
    }
    // For true/false
    return answer.answer !== '';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-28 pb-12 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
          <p className="text-medium text-lg">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gray-50 pt-28 pb-12 px-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg">Failed to load quiz</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 bg-primary text-white px-6 py-3 rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header with Timer */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6 sticky top-24 z-10">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-dark mb-1">{quiz.title}</h1>
              <p className="text-sm text-medium">
                Question {currentQuestionIndex + 1} of {quiz.questions.length}
              </p>
            </div>
            <div className="text-right">
              <div className={`flex items-center gap-2 text-lg font-bold ${
                timeRemaining < 60 ? 'text-red-600' : 'text-primary'
              }`}>
                <ClockIcon className="w-6 h-6" />
                {formatTime(timeRemaining)}
              </div>
              <p className="text-xs text-medium mt-1">Time Remaining</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{
                  width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-6">
          <div className="mb-6">
            <div className="flex items-start gap-3 mb-4">
              <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-semibold">
                {currentQuestion.points} {currentQuestion.points === 1 ? 'point' : 'points'}
              </span>
              <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-semibold">
                {currentQuestion.questionType === 'multiple-choice' ? 'Multiple Choice' : 'True/False'}
              </span>
            </div>
            <h2 className="text-xl font-bold text-dark">
              {currentQuestion.questionText}
            </h2>
          </div>

          {/* Answer Options */}
          <div className="space-y-3">
            {currentQuestion.questionType === 'multiple-choice' && (
              <>
                {currentQuestion.options.map((option, index) => (
                  <label
                    key={option._id}
                    className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      answers[currentQuestionIndex]?.selectedOption === index
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name={`question-${currentQuestionIndex}`}
                        checked={answers[currentQuestionIndex]?.selectedOption === index}
                        onChange={() =>
                          handleAnswerChange(currentQuestion._id, 'multiple-choice', index)
                        }
                        className="w-5 h-5 text-primary"
                      />
                      <span className="text-dark font-medium">{option.text}</span>
                    </div>
                  </label>
                ))}
              </>
            )}

            {currentQuestion.questionType === 'true-false' && (
              <>
                <label
                  className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    answers[currentQuestionIndex]?.answer === 'true'
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name={`question-${currentQuestionIndex}`}
                      checked={answers[currentQuestionIndex]?.answer === 'true'}
                      onChange={() =>
                        handleAnswerChange(currentQuestion._id, 'true-false', 'true')
                      }
                      className="w-5 h-5 text-primary"
                    />
                    <span className="text-dark font-medium">True</span>
                  </div>
                </label>
                <label
                  className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    answers[currentQuestionIndex]?.answer === 'false'
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name={`question-${currentQuestionIndex}`}
                      checked={answers[currentQuestionIndex]?.answer === 'false'}
                      onChange={() =>
                        handleAnswerChange(currentQuestion._id, 'true-false', 'false')
                      }
                      className="w-5 h-5 text-primary"
                    />
                    <span className="text-dark font-medium">False</span>
                  </div>
                </label>
              </>
            )}
          </div>
        </div>

        {/* Question Navigator */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h3 className="font-semibold text-dark mb-3">Question Navigator</h3>
          <div className="grid grid-cols-6 md:grid-cols-10 gap-2">
            {quiz.questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`w-10 h-10 rounded-lg font-semibold transition-all ${
                  index === currentQuestionIndex
                    ? 'bg-primary text-white'
                    : isQuestionAnswered(index)
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => {
              if (confirm('Are you sure you want to cancel this quiz? Your progress will be lost.')) {
                if (courseId) {
                  navigate(`/courses/${courseId}`);
                } else {
                  navigate('/my-courses');
                }
              }
            }}
            className="px-6 py-3 border-2 border-gray-300 text-dark rounded-lg hover:bg-gray-50 transition-all font-medium"
            disabled={submitting}
          >
            Cancel Quiz
          </button>
          
          <div className="flex-1 flex gap-4">
            <button
              onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
                currentQuestionIndex === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-dark hover:bg-gray-300'
              }`}
            >
              Previous
            </button>
            
            {currentQuestionIndex < quiz.questions.length - 1 ? (
              <button
                onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all font-medium"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-medium flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <CheckCircleIcon className="w-5 h-5" />
                {submitting ? 'Submitting...' : 'Submit Quiz'}
              </button>
            )}
          </div>
        </div>

        {/* Answer Summary */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <strong>Answered:</strong> {answers.filter((_, i) => isQuestionAnswered(i)).length} / {quiz.questions.length} questions
          </p>
          {answers.filter((_, i) => !isQuestionAnswered(i)).length > 0 && (
            <p className="text-xs text-blue-700 mt-1">
              ⚠️ You have unanswered questions. Make sure to answer all questions before submitting.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizTake;

