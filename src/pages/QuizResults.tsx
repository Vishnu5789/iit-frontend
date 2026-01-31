import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { CheckCircleIcon, XCircleIcon, TrophyIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

const QuizResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { quizId } = useParams<{ quizId: string }>();
  const { results, quizTitle, courseId } = location.state || {};

  if (!results) {
    return (
      <div className="min-h-screen bg-gray-50 pt-28 pb-12 px-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">No results found</p>
          <button
            onClick={() => navigate('/my-courses')}
            className="bg-primary text-white px-6 py-3 rounded-lg"
          >
            Go to My Courses
          </button>
        </div>
      </div>
    );
  }

  const { percentage, passed, pointsEarned, totalPoints, passingScore, answers } = results;

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <button
          onClick={() => {
            if (courseId) {
              navigate(`/courses/${courseId}`);
            } else {
              navigate('/my-courses');
            }
          }}
          className="flex items-center gap-2 text-primary hover:text-primary/80 mb-6 font-medium"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Back to Course
        </button>

        {/* Results Summary Card */}
        <div className={`rounded-xl shadow-lg p-8 mb-8 ${
          passed 
            ? 'bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-500' 
            : 'bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-500'
        }`}>
          <div className="text-center">
            {passed ? (
              <TrophyIcon className="w-20 h-20 text-green-600 mx-auto mb-4" />
            ) : (
              <XCircleIcon className="w-20 h-20 text-red-600 mx-auto mb-4" />
            )}
            
            <h1 className="text-3xl font-bold text-dark mb-2">
              {passed ? '🎉 Congratulations!' : 'Keep Trying!'}
            </h1>
            
            <p className="text-lg text-medium mb-6">
              {quizTitle || 'Quiz Completed'}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-lg p-4 shadow-md">
                <p className="text-sm text-medium mb-1">Your Score</p>
                <p className="text-3xl font-bold text-primary">{percentage}%</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-md">
                <p className="text-sm text-medium mb-1">Points Earned</p>
                <p className="text-3xl font-bold text-dark">{pointsEarned}/{totalPoints}</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-md">
                <p className="text-sm text-medium mb-1">Passing Score</p>
                <p className="text-3xl font-bold text-gray-700">{passingScore}%</p>
              </div>
            </div>

            <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-lg ${
              passed 
                ? 'bg-green-600 text-white' 
                : 'bg-red-600 text-white'
            }`}>
              {passed ? (
                <>
                  <CheckCircleIcon className="w-6 h-6" />
                  PASSED
                </>
              ) : (
                <>
                  <XCircleIcon className="w-6 h-6" />
                  NOT PASSED
                </>
              )}
            </div>

            {passed && (
              <p className="text-sm text-green-700 mt-4 font-medium">
                ✅ Great job! You've successfully passed this assessment.
              </p>
            )}
            
            {!passed && (
              <p className="text-sm text-red-700 mt-4 font-medium">
                📚 Don't worry! Review the material and try again.
              </p>
            )}
          </div>
        </div>

        {/* Detailed Answers (if provided) */}
        {answers && answers.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold text-dark mb-6">Answer Review</h2>
            <div className="space-y-6">
              {answers.map((answer: any, index: number) => (
                <div
                  key={index}
                  className={`p-5 rounded-lg border-2 ${
                    answer.isCorrect
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    {answer.isCorrect ? (
                      <CheckCircleIcon className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                    ) : (
                      <XCircleIcon className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-dark mb-2">
                        Question {index + 1}
                      </p>
                      {answer.questionText && (
                        <p className="text-gray-700 mb-3 text-base">
                          {answer.questionText}
                        </p>
                      )}
                      <div className="space-y-2 text-sm">
                        <p className={`font-semibold ${
                          answer.isCorrect ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {answer.isCorrect ? '✓ Correct' : '✗ Incorrect'} • {answer.pointsEarned} / {answer.totalPoints || 1} points
                        </p>
                        
                        {answer.userAnswer && (
                          <div className="bg-white p-3 rounded border border-gray-200">
                            <p className="text-gray-600 text-xs font-semibold mb-1">Your Answer:</p>
                            <p className="text-gray-800">{answer.userAnswer}</p>
                          </div>
                        )}
                        
                        {!answer.isCorrect && answer.correctAnswer && (
                          <div className="bg-green-100 p-3 rounded border border-green-300">
                            <p className="text-green-700 text-xs font-semibold mb-1">Correct Answer:</p>
                            <p className="text-green-900 font-medium">{answer.correctAnswer}</p>
                          </div>
                        )}
                        
                        {answer.explanation && (
                          <div className="bg-blue-50 p-3 rounded border border-blue-200 mt-2">
                            <p className="text-blue-700 text-xs font-semibold mb-1 flex items-center gap-1">
                              💡 Explanation:
                            </p>
                            <p className="text-blue-900">{answer.explanation}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4">
          <button
            onClick={() => navigate('/my-courses')}
            className="flex-1 px-6 py-3 bg-gray-200 text-dark rounded-lg hover:bg-gray-300 transition-all font-semibold"
          >
            My Courses
          </button>
          {!passed ? (
            <button
              onClick={() => navigate(`/quiz/${quizId}`)}
              className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all font-semibold"
            >
              Try Again
            </button>
          ) : (
            <button
              onClick={() => {
                // Try to get courseId from results or navigate back
                if (courseId) {
                  navigate(`/courses/${courseId}`);
                } else {
                  navigate(-1);
                }
              }}
              className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all font-semibold"
            >
              Back to Course
            </button>
          )}
        </div>

        {/* Performance Message */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            {percentage >= 90 ? (
              <>🌟 <strong>Excellent!</strong> You've mastered this topic!</>
            ) : percentage >= 70 ? (
              <>✅ <strong>Good job!</strong> You have a solid understanding.</>
            ) : percentage >= 50 ? (
              <>📖 <strong>Keep learning!</strong> Review the material and try again.</>
            ) : (
              <>💪 <strong>Don't give up!</strong> Study the topics and retry when ready.</>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default QuizResults;

