import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Award, RotateCcw, Home, Loader, AlertCircle } from 'lucide-react';
import api from '../services/api';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

interface Question {
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
}

interface Quiz {
  id: number;
  title: string;
  description: string;
  questions: Question[];
  passing_score: number;
}

interface QuizResult {
  score: number;
  total_questions: number;
  percentage: number;
  passed: boolean;
  passing_score: number;
}

export default function Quiz() {
  const { chapterId } = useParams<{ chapterId: string }>();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [showExplanations, setShowExplanations] = useState(false);

  useEffect(() => {
    fetchQuiz();
  }, [chapterId]);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await api.get(`/chapters/${chapterId}/quiz`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setQuiz(response.data.quiz);
      setLoading(false);
    } catch (err: any) {
      console.error('Error fetching quiz:', err);
      setError(err.response?.data?.message || 'Failed to load quiz');
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionIndex: number, optionIndex: number) => {
    if (!isSubmitted) {
      setSelectedAnswers({
        ...selectedAnswers,
        [questionIndex]: optionIndex
      });
    }
  };

  const handleSubmitQuiz = async () => {
    if (!quiz) return;

    // Check if all questions are answered
    const answeredCount = Object.keys(selectedAnswers).length;
    if (answeredCount < quiz.questions.length) {
      alert(`Please answer all questions. You've answered ${answeredCount} of ${quiz.questions.length}.`);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await api.post(`/quizzes/${quiz.id}/submit`, {
        answers: selectedAnswers
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setResult(response.data.result);
      setIsSubmitted(true);
      setShowExplanations(true);
    } catch (err: any) {
      console.error('Error submitting quiz:', err);
      alert('Failed to submit quiz. Please try again.');
    }
  };

  const handleRetry = () => {
    setSelectedAnswers({});
    setIsSubmitted(false);
    setResult(null);
    setCurrentQuestion(0);
    setShowExplanations(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Quiz Not Available</h2>
          <p className="text-gray-600 mb-6">{error || 'No quiz found for this chapter'}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Show results screen
  if (isSubmitted && result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Results Summary */}
          <div className={`bg-white rounded-lg shadow-xl p-8 mb-6 ${result.passed ? 'border-4 border-green-500' : 'border-4 border-yellow-500'}`}>
            <div className="text-center">
              {result.passed ? (
                <Award className="w-20 h-20 text-green-500 mx-auto mb-4" />
              ) : (
                <RotateCcw className="w-20 h-20 text-yellow-500 mx-auto mb-4" />
              )}

              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {result.passed ? 'Congratulations!' : 'Keep Trying!'}
              </h1>

              <p className="text-xl text-gray-600 mb-6">
                {result.passed
                  ? 'You passed the quiz!'
                  : `You need ${result.passing_score}% to pass. Keep studying!`}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Your Score</p>
                  <p className="text-3xl font-bold text-blue-600">{result.score}/{result.total_questions}</p>
                </div>
                <div className="bg-indigo-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Percentage</p>
                  <p className="text-3xl font-bold text-indigo-600">{result.percentage}%</p>
                </div>
                <div className={`${result.passed ? 'bg-green-50' : 'bg-yellow-50'} rounded-lg p-4`}>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className={`text-3xl font-bold ${result.passed ? 'text-green-600' : 'text-yellow-600'}`}>
                    {result.passed ? 'PASSED' : 'FAILED'}
                  </p>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                {!result.passed && (
                  <button
                    onClick={handleRetry}
                    className="bg-yellow-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-yellow-700 transition-colors flex items-center gap-2"
                  >
                    <RotateCcw size={20} />
                    Try Again
                  </button>
                )}
                <button
                  onClick={() => navigate('/dashboard')}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Home size={20} />
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>

          {/* Review Answers */}
          <div className="bg-white rounded-lg shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Review Your Answers</h2>

            {quiz.questions.map((question, index) => {
              const userAnswer = selectedAnswers[index];
              const isCorrect = userAnswer === question.correct_answer;

              return (
                <div key={index} className={`mb-6 p-4 rounded-lg ${isCorrect ? 'bg-green-50 border-2 border-green-500' : 'bg-red-50 border-2 border-red-500'}`}>
                  <div className="flex items-start gap-3 mb-3">
                    {isCorrect ? (
                      <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 mb-3">
                        {index + 1}. {question.question}
                      </p>

                      <div className="space-y-2">
                        {question.options.map((option, optIndex) => {
                          const isUserAnswer = userAnswer === optIndex;
                          const isCorrectAnswer = optIndex === question.correct_answer;

                          return (
                            <div
                              key={optIndex}
                              className={`p-3 rounded ${
                                isCorrectAnswer
                                  ? 'bg-green-200 border-2 border-green-600 font-semibold'
                                  : isUserAnswer
                                  ? 'bg-red-200 border-2 border-red-600'
                                  : 'bg-white border border-gray-300'
                              }`}
                            >
                              {option}
                              {isCorrectAnswer && ' ✓'}
                              {isUserAnswer && !isCorrectAnswer && ' ✗ Your answer'}
                            </div>
                          );
                        })}
                      </div>

                      {question.explanation && (
                        <div className="mt-3 p-3 bg-blue-50 rounded border-l-4 border-blue-500">
                          <p className="text-sm font-semibold text-blue-900 mb-1">Explanation:</p>
                          <p className="text-sm text-blue-800">{question.explanation}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Quiz taking screen
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;
  const question = quiz.questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{quiz.title}</h1>
          <p className="text-gray-600 mb-4">{quiz.description}</p>

          {/* Progress Bar */}
          <div className="mb-2">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Question {currentQuestion + 1} of {quiz.questions.length}</span>
              <span>{Object.keys(selectedAnswers).length} answered</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            {currentQuestion + 1}. {question.question}
          </h2>

          <div className="space-y-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(currentQuestion, index)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  selectedAnswers[currentQuestion] === index
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selectedAnswers[currentQuestion] === index
                      ? 'border-blue-600 bg-blue-600'
                      : 'border-gray-400'
                  }`}>
                    {selectedAnswers[currentQuestion] === index && (
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    )}
                  </div>
                  <span className="text-gray-800">{option}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="bg-white rounded-lg shadow-lg p-6 flex justify-between items-center">
          <button
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
            className="px-6 py-3 rounded-lg font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>

          <div className="flex gap-2">
            {quiz.questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                className={`w-10 h-10 rounded-full font-semibold transition-all ${
                  index === currentQuestion
                    ? 'bg-blue-600 text-white'
                    : selectedAnswers[index] !== undefined
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          {currentQuestion === quiz.questions.length - 1 ? (
            <button
              onClick={handleSubmitQuiz}
              className="px-6 py-3 rounded-lg font-semibold bg-green-600 text-white hover:bg-green-700 transition-colors"
            >
              Submit Quiz
            </button>
          ) : (
            <button
              onClick={() => setCurrentQuestion(Math.min(quiz.questions.length - 1, currentQuestion + 1))}
              className="px-6 py-3 rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
