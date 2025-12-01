import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PlusIcon, PencilIcon, TrashIcon, ArrowLeftIcon, ClockIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import apiService from '../../services/api';

interface Quiz {
  _id: string;
  title: string;
  description: string;
  type: 'quiz' | 'test' | 'final-exam';
  questions: any[];
  timeLimit: number;
  passingScore: number;
  totalPoints: number;
  attemptsAllowed: number;
  isActive: boolean;
  order: number;
}

const ManageCourseQuizzes = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [courseName, setCourseName] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'quiz' as 'quiz' | 'test' | 'final-exam',
    timeLimit: 30,
    passingScore: 70,
    attemptsAllowed: 3,
    shuffleQuestions: false,
    showCorrectAnswers: true,
    isActive: true,
    order: 0,
    questions: [] as any[]
  });

  const [currentQuestion, setCurrentQuestion] = useState({
    questionText: '',
    questionType: 'multiple-choice' as 'multiple-choice' | 'true-false',
    options: [
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false }
    ],
    correctAnswer: '',
    points: 1,
    explanation: ''
  });

  useEffect(() => {
    fetchCourse();
    fetchQuizzes();
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      const response = await apiService.getCourse(courseId!);
      if (response.success) {
        setCourseName(response.data.title);
      }
    } catch (error) {
      console.error('Error fetching course:', error);
    }
  };

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAdminCourseQuizzes(courseId!);
      if (response.success) {
        setQuizzes(response.data || []);
      }
    } catch (error: any) {
      console.error('Error fetching quizzes:', error);
      toast.error('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (quiz?: Quiz) => {
    if (quiz) {
      setEditingQuiz(quiz);
      setFormData({
        title: quiz.title,
        description: quiz.description,
        type: quiz.type,
        timeLimit: quiz.timeLimit,
        passingScore: quiz.passingScore,
        attemptsAllowed: quiz.attemptsAllowed,
        shuffleQuestions: false,
        showCorrectAnswers: true,
        isActive: quiz.isActive,
        order: quiz.order,
        questions: quiz.questions || []
      });
    } else {
      setEditingQuiz(null);
      setFormData({
        title: '',
        description: '',
        type: 'quiz',
        timeLimit: 30,
        passingScore: 70,
        attemptsAllowed: 3,
        shuffleQuestions: false,
        showCorrectAnswers: true,
        isActive: true,
        order: quizzes.length,
        questions: []
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingQuiz(null);
    resetCurrentQuestion();
  };

  const resetCurrentQuestion = () => {
    setCurrentQuestion({
      questionText: '',
      questionType: 'multiple-choice',
      options: [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false }
      ],
      correctAnswer: '',
      points: 1,
      explanation: ''
    });
  };

  const handleAddQuestion = () => {
    if (!currentQuestion.questionText.trim()) {
      toast.error('Please enter a question');
      return;
    }

    if (currentQuestion.questionType === 'multiple-choice') {
      const hasCorrect = currentQuestion.options.some(opt => opt.isCorrect && opt.text.trim());
      const hasOptions = currentQuestion.options.filter(opt => opt.text.trim()).length >= 2;
      
      if (!hasOptions) {
        toast.error('Please provide at least 2 options');
        return;
      }
      
      if (!hasCorrect) {
        toast.error('Please mark at least one correct answer');
        return;
      }
    }

    if (currentQuestion.questionType === 'true-false') {
      if (!currentQuestion.correctAnswer) {
        toast.error('Please select the correct answer (True or False)');
        return;
      }
    }

    setFormData({
      ...formData,
      questions: [...formData.questions, { ...currentQuestion, order: formData.questions.length }]
    });
    
    resetCurrentQuestion();
    toast.success('Question added');
  };

  const handleRemoveQuestion = (index: number) => {
    setFormData({
      ...formData,
      questions: formData.questions.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    if (formData.questions.length === 0) {
      toast.error('Please add at least one question');
      return;
    }

    try {
      const quizData = {
        ...formData,
        course: courseId
      };

      if (editingQuiz) {
        const response = await apiService.updateQuiz(editingQuiz._id, quizData);
        if (response.success) {
          toast.success('Quiz updated successfully');
          fetchQuizzes();
          handleCloseModal();
        }
      } else {
        const response = await apiService.createQuiz(quizData);
        if (response.success) {
          toast.success('Quiz created successfully');
          fetchQuizzes();
          handleCloseModal();
        }
      }
    } catch (error: any) {
      console.error('Error saving quiz:', error);
      toast.error(error.message || 'Failed to save quiz');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this quiz?')) return;

    try {
      const response = await apiService.deleteQuiz(id);
      if (response.success) {
        toast.success('Quiz deleted successfully');
        fetchQuizzes();
      }
    } catch (error: any) {
      console.error('Error deleting quiz:', error);
      toast.error(error.message || 'Failed to delete quiz');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin/courses')}
            className="flex items-center gap-2 text-primary hover:text-primary/80 mb-4 font-medium"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Back to Courses
          </button>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-dark mb-2">Manage Quizzes & Tests</h1>
              <p className="text-medium">{courseName}</p>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-all flex items-center gap-2 shadow-md"
            >
              <PlusIcon className="w-5 h-5" />
              Add Quiz/Test
            </button>
          </div>
        </div>

        {/* Quizzes List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-medium mt-4">Loading quizzes...</p>
          </div>
        ) : quizzes.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <h3 className="text-xl font-semibold text-dark mb-2">No quizzes yet</h3>
            <p className="text-medium mb-6">Get started by adding your first quiz or test</p>
            <button
              onClick={() => handleOpenModal()}
              className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-all inline-flex items-center gap-2"
            >
              <PlusIcon className="w-5 h-5" />
              Add First Quiz
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <div
                key={quiz._id}
                className={`bg-white rounded-xl shadow-md p-6 border-2 ${
                  quiz.isActive ? 'border-green-500' : 'border-gray-200'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-dark text-lg mb-2">{quiz.title}</h3>
                    <p className="text-sm text-medium line-clamp-2">{quiz.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      quiz.type === 'quiz' ? 'bg-blue-100 text-blue-700' :
                      quiz.type === 'test' ? 'bg-purple-100 text-purple-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {quiz.type === 'quiz' ? 'Quiz' : quiz.type === 'test' ? 'Test' : 'Final Exam'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <ClockIcon className="w-4 h-4" />
                    <span>{quiz.timeLimit} minutes</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    📝 {quiz.questions?.length || 0} questions • {quiz.totalPoints} points
                  </div>
                  <div className="text-sm text-gray-600">
                    ✅ Passing: {quiz.passingScore}% • {quiz.attemptsAllowed === -1 ? 'Unlimited' : quiz.attemptsAllowed} attempts
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenModal(quiz)}
                    className="flex-1 bg-primary/10 text-primary px-4 py-2 rounded-lg hover:bg-primary/20 transition-all text-sm font-medium flex items-center justify-center gap-1"
                  >
                    <PencilIcon className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(quiz._id)}
                    className="flex-1 bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-all text-sm font-medium flex items-center justify-center gap-1"
                  >
                    <TrashIcon className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-[100] p-4 overflow-y-auto pt-20">
            <div className="bg-white rounded-xl max-w-4xl w-full my-8 max-h-[85vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 rounded-t-xl z-10 shadow-sm">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-dark">
                    {editingQuiz ? 'Edit Quiz/Test' : 'Add New Quiz/Test'}
                  </h2>
                  <button
                    onClick={handleCloseModal}
                    type="button"
                    className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                  >
                    ×
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-dark mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="e.g., AutoCAD Basics Quiz"
                      required
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-dark mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      rows={3}
                      placeholder="Brief description of the quiz..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-dark mb-2">
                      Type *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="quiz">Quiz</option>
                      <option value="test">Test</option>
                      <option value="final-exam">Final Exam</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-dark mb-2">
                      Time Limit (minutes) *
                    </label>
                    <input
                      type="number"
                      value={formData.timeLimit}
                      onChange={(e) => setFormData({ ...formData, timeLimit: Number(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      min="1"
                      max="180"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-dark mb-2">
                      Passing Score (%) *
                    </label>
                    <input
                      type="number"
                      value={formData.passingScore}
                      onChange={(e) => setFormData({ ...formData, passingScore: Number(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      min="0"
                      max="100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-dark mb-2">
                      Attempts Allowed (-1 = unlimited)
                    </label>
                    <input
                      type="number"
                      value={formData.attemptsAllowed}
                      onChange={(e) => setFormData({ ...formData, attemptsAllowed: Number(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      min="-1"
                    />
                  </div>
                </div>

                {/* Questions Section */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-bold text-dark mb-4">Questions ({formData.questions.length})</h3>
                  
                  {/* Existing Questions */}
                  {formData.questions.length > 0 && (
                    <div className="space-y-3 mb-6">
                      {formData.questions.map((q, index) => (
                        <div key={index} className="bg-gray-50 p-4 rounded-lg flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium text-dark">
                              {index + 1}. {q.questionText}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              Type: {q.questionType} • Points: {q.points}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveQuestion(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add New Question */}
                  <div className="bg-primary/5 p-4 rounded-lg space-y-4">
                    <h4 className="font-semibold text-dark">Add New Question</h4>
                    
                    <div>
                      <label className="block text-sm font-medium text-dark mb-2">Question *</label>
                      <input
                        type="text"
                        value={currentQuestion.questionText}
                        onChange={(e) => setCurrentQuestion({ ...currentQuestion, questionText: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        placeholder="Enter your question..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-dark mb-2">Type</label>
                        <select
                          value={currentQuestion.questionType}
                          onChange={(e) => setCurrentQuestion({ ...currentQuestion, questionType: e.target.value as any })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="multiple-choice">Multiple Choice</option>
                          <option value="true-false">True/False</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-dark mb-2">Points</label>
                        <input
                          type="number"
                          value={currentQuestion.points}
                          onChange={(e) => setCurrentQuestion({ ...currentQuestion, points: Number(e.target.value) })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                          min="1"
                        />
                      </div>
                    </div>

                    {currentQuestion.questionType === 'multiple-choice' && (
                      <div>
                        <label className="block text-sm font-medium text-dark mb-2">Options (check correct answer)</label>
                        {currentQuestion.options.map((opt, i) => (
                          <div key={i} className="flex items-center gap-2 mb-2">
                            <input
                              type="checkbox"
                              checked={opt.isCorrect}
                              onChange={(e) => {
                                const newOptions = [...currentQuestion.options];
                                newOptions[i].isCorrect = e.target.checked;
                                setCurrentQuestion({ ...currentQuestion, options: newOptions });
                              }}
                              className="w-5 h-5"
                            />
                            <input
                              type="text"
                              value={opt.text}
                              onChange={(e) => {
                                const newOptions = [...currentQuestion.options];
                                newOptions[i].text = e.target.value;
                                setCurrentQuestion({ ...currentQuestion, options: newOptions });
                              }}
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                              placeholder={`Option ${i + 1}`}
                            />
                          </div>
                        ))}
                        <p className="text-xs text-gray-500 mt-1">
                          ✓ Check the box(es) for correct answer(s)
                        </p>
                      </div>
                    )}

                    {currentQuestion.questionType === 'true-false' && (
                      <div>
                        <label className="block text-sm font-medium text-dark mb-2">
                          Correct Answer
                        </label>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="trueFalseAnswer"
                              checked={currentQuestion.correctAnswer === 'true'}
                              onChange={() => setCurrentQuestion({ ...currentQuestion, correctAnswer: 'true' })}
                              className="w-5 h-5 text-primary"
                            />
                            <span className="font-medium">True</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="trueFalseAnswer"
                              checked={currentQuestion.correctAnswer === 'false'}
                              onChange={() => setCurrentQuestion({ ...currentQuestion, correctAnswer: 'false' })}
                              className="w-5 h-5 text-primary"
                            />
                            <span className="font-medium">False</span>
                          </label>
                        </div>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handleAddQuestion}
                      className="w-full bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-all font-medium"
                    >
                      Add Question
                    </button>
                  </div>
                </div>

                {/* Active Status */}
                <div className="border-t pt-6">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-5 h-5 text-primary rounded"
                    />
                    <label htmlFor="isActive" className="text-sm font-semibold text-dark cursor-pointer">
                      ✅ Set as Active (visible to students)
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 ml-8">
                    Inactive quizzes will not be visible to students
                  </p>
                </div>

                {/* Modal Actions */}
                <div className="flex gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 px-6 py-3 border border-gray-300 text-dark rounded-lg hover:bg-gray-50 transition-all font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all font-medium"
                  >
                    {editingQuiz ? 'Update Quiz' : 'Create Quiz'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageCourseQuizzes;

