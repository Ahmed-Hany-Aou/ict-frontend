import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CheckCircle, XCircle, Award, RotateCcw, Home, Loader, AlertCircle,
  Clock, Flag, AlertTriangle, ArrowRight, HelpCircle
} from 'lucide-react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import api from '../services/api';

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
  flagged_count?: number;
  flagged_wrong_count?: number;
}

export default function Quiz() {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [startTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);

  // Mutation for quiz submission
  const submitQuizMutation = useMutation({
    mutationFn: (data: { quizId: number; answers: any; questions: any; flagged: number[]; timeTaken: number }) =>
      api.post(`/quizzes/${data.quizId}/submit`, {
        answers: data.answers,
        questions: data.questions,
        flagged: data.flagged,
        time_taken: data.timeTaken
      }),
    onSuccess: (response) => {
      setResult(response.data.result);
      setIsSubmitted(true);
      setShowSubmitModal(false);

      // Invalidate all related caches
      queryClient.invalidateQueries({ queryKey: ['quiz-results'] });
      queryClient.invalidateQueries({ queryKey: ['user-progress'] });
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
    },
    onError: (err: any) => {
      console.error('Error submitting quiz:', err);
      alert('Failed to submit quiz. Please try again.');
    }
  });

  useEffect(() => {
    fetchQuiz();
  }, [quizId]);

  // Timer to track elapsed time
  useEffect(() => {
    if (isSubmitted) return;
    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setElapsedTime(elapsed);
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime, isSubmitted]);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/quizzes/${quizId}`);
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
      setSelectedAnswers((prev) => ({
        ...prev,
        [questionIndex]: optionIndex
      }));
    }
  };

  const toggleFlag = (questionIndex: number) => {
    setFlaggedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(questionIndex)) {
        next.delete(questionIndex);
      } else {
        next.add(questionIndex);
      }
      return next;
    });
  };

  const handleOpenSubmitModal = () => {
    if (!quiz) return;
    setShowSubmitModal(true);
  };

  const handleConfirmSubmit = () => {
    if (!quiz) return;

    const timeTaken = Math.floor((Date.now() - startTime) / 1000);

    submitQuizMutation.mutate({
      quizId: quiz.id,
      answers: selectedAnswers,
      questions: quiz.questions,
      flagged: Array.from(flaggedQuestions),
      timeTaken
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRetry = () => {
    setSelectedAnswers({});
    setFlaggedQuestions(new Set());
    setIsSubmitted(false);
    setResult(null);
    setCurrentQuestion(0);
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Quiz Not Available</h2>
          <p className="text-gray-600 mb-6">{error || 'No quiz found for this chapter'}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const answeredCount = Object.keys(selectedAnswers).length;
  const totalCount = quiz.questions.length;
  const unansweredCount = totalCount - answeredCount;
  const flaggedCount = flaggedQuestions.size;

  // Unanswered & Flagged Indices
  const unansweredIndices = quiz.questions
    .map((_, idx) => idx)
    .filter((idx) => selectedAnswers[idx] === undefined);

  const flaggedIndices = Array.from(flaggedQuestions).sort((a, b) => a - b);

  // Show results screen
  if (isSubmitted && result) {
    const flaggedWrong = quiz.questions.filter((q, idx) => {
      return flaggedQuestions.has(idx) && selectedAnswers[idx] !== q.correct_answer;
    }).length;

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8">
        <div className="max-w-5xl mx-auto">
          {/* Results Summary */}
          <div className={`bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-6 ${result.passed ? 'border-4 border-green-500' : 'border-4 border-yellow-500'}`}>
            <div className="text-center">
              {result.passed ? (
                <Award className="w-16 h-16 sm:w-20 sm:h-20 text-green-500 mx-auto mb-4" />
              ) : (
                <RotateCcw className="w-16 h-16 sm:w-20 sm:h-20 text-yellow-500 mx-auto mb-4" />
              )}

              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                {result.passed ? 'Congratulations!' : 'Keep Trying!'}
              </h1>

              <p className="text-lg sm:text-xl text-gray-600 mb-6">
                {result.passed
                  ? 'You passed the quiz!'
                  : `You need ${result.passing_score}% to pass. Keep studying!`}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <p className="text-xs sm:text-sm text-gray-600 font-medium">Your Score</p>
                  <p className="text-2xl sm:text-3xl font-bold text-blue-600">{result.score}/{result.total_questions}</p>
                </div>
                <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                  <p className="text-xs sm:text-sm text-gray-600 font-medium">Percentage</p>
                  <p className="text-2xl sm:text-3xl font-bold text-indigo-600">{Math.round(result.percentage)}%</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                  <p className="text-xs sm:text-sm text-amber-800 font-medium flex items-center justify-center gap-1">
                    <Flag size={14} className="fill-amber-500 text-amber-600" /> Flagged
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-amber-700">{flaggedCount}</p>
                  {flaggedCount > 0 && (
                    <p className="text-xs text-amber-800 mt-0.5 font-semibold">
                      {flaggedWrong} Wrong
                    </p>
                  )}
                </div>
                <div className={`${result.passed ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'} rounded-xl p-4 border`}>
                  <p className="text-xs sm:text-sm text-gray-600 font-medium">Status</p>
                  <p className={`text-2xl sm:text-3xl font-bold ${result.passed ? 'text-green-600' : 'text-yellow-600'}`}>
                    {result.passed ? 'PASSED' : 'FAILED'}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                {!result.passed && (
                  <button
                    onClick={handleRetry}
                    className="bg-yellow-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-yellow-700 transition-colors flex items-center justify-center gap-2 shadow-md"
                  >
                    <RotateCcw size={20} />
                    Try Again
                  </button>
                )}
                <button
                  onClick={() => navigate('/quizzes')}
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-md"
                >
                  <Home size={20} />
                  Back to Quizzes
                </button>
              </div>
            </div>
          </div>

          {/* Review Answers */}
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">Review Your Answers</h2>

            {quiz.questions.map((q, index) => {
              const userAnswer = selectedAnswers[index];
              const isCorrect = userAnswer === q.correct_answer;
              const isFlagged = flaggedQuestions.has(index);

              return (
                <div
                  key={index}
                  className={`mb-6 p-4 sm:p-5 rounded-xl border-2 transition-all ${
                    isCorrect ? 'bg-green-50/70 border-green-500' : 'bg-red-50/70 border-red-500'
                  }`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    {isCorrect ? (
                      <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                    )}
                    <div className="flex-1 min-w-0">
                      {/* Header with Title and Badges */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        <p className="font-semibold text-base sm:text-lg text-gray-800">
                          {index + 1}. {q.question}
                        </p>
                        <div className="flex items-center gap-2">
                          {isFlagged && (
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                              !isCorrect
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : 'bg-blue-100 text-blue-800 border border-blue-300'
                            }`}>
                              <Flag size={12} className={!isCorrect ? 'fill-amber-500 text-amber-600' : 'fill-blue-500 text-blue-600'} />
                              {!isCorrect ? 'Flagged & Wrong' : 'Flagged & Correct'}
                            </span>
                          )}
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {isCorrect ? '✓ Correct' : '✗ Wrong'}
                          </span>
                        </div>
                      </div>

                      {/* Flag Explanation Badge */}
                      {isFlagged && !isCorrect && (
                        <div className="mb-3 px-3 py-2 bg-amber-50 border-l-4 border-amber-500 rounded text-xs text-amber-900 font-medium">
                          🚩 You flagged this question during the test because you had doubts, and it was answered incorrectly.
                        </div>
                      )}

                      <div className="space-y-2">
                        {q.options.map((option, optIndex) => {
                          const isUserAnswer = userAnswer === optIndex;
                          const isCorrectAnswer = optIndex === q.correct_answer;

                          return (
                            <div
                              key={optIndex}
                              className={`p-3 rounded-lg text-sm sm:text-base transition-all ${
                                isCorrectAnswer
                                  ? 'bg-green-200 border-2 border-green-600 font-semibold text-green-950'
                                  : isUserAnswer
                                  ? 'bg-red-200 border-2 border-red-600 text-red-950'
                                  : 'bg-white border border-gray-300 text-gray-700'
                              }`}
                            >
                              {option}
                              {isCorrectAnswer && ' ✓ (Correct Answer)'}
                              {isUserAnswer && !isCorrectAnswer && ' ✗ (Your Answer)'}
                            </div>
                          );
                        })}
                      </div>

                      {q.explanation && (
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                          <p className="text-xs font-bold text-blue-900 mb-1">Explanation:</p>
                          <p className="text-sm text-blue-800 leading-relaxed">{q.explanation}</p>
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
  const isCurrentFlagged = flaggedQuestions.has(currentQuestion);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header - Fixed */}
      <div className="bg-white shadow-md border-b sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{quiz.title}</h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5 truncate">{quiz.description}</p>
            </div>
            <button
              onClick={() => navigate('/quizzes')}
              className="flex items-center gap-1.5 text-gray-600 hover:text-blue-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-100 self-start sm:self-auto text-sm font-medium"
            >
              <Home size={18} />
              <span>Back</span>
            </button>
          </div>

          {/* Progress Bar & Stats */}
          <div className="mt-3">
            <div className="flex justify-between text-xs sm:text-sm text-gray-600 mb-1.5 font-medium">
              <span>Question {currentQuestion + 1} of {quiz.questions.length}</span>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1 text-blue-700">
                  <Clock size={16} />
                  {formatTime(elapsedTime)}
                </span>
                <span className="text-green-700 font-semibold">{answeredCount} answered</span>
                {flaggedCount > 0 && (
                  <span className="text-amber-700 font-semibold flex items-center gap-1">
                    <Flag size={14} className="fill-amber-500 text-amber-600" />
                    {flaggedCount} flagged
                  </span>
                )}
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content with Sidebar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar - Question Navigation */}
          <div className="lg:w-72 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-md p-5 sticky top-28 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-gray-900">Questions ({quiz.questions.length})</h3>
                {flaggedCount > 0 && (
                  <span className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <Flag size={12} className="fill-amber-500 text-amber-600" /> {flaggedCount}
                  </span>
                )}
              </div>

              {/* Grid 1..N */}
              <div className="grid grid-cols-5 gap-2 max-h-[50vh] overflow-y-auto p-1">
                {quiz.questions.map((_, index) => {
                  const isCurrent = index === currentQuestion;
                  const isAnswered = selectedAnswers[index] !== undefined;
                  const isFlagged = flaggedQuestions.has(index);

                  return (
                    <button
                      key={index}
                      onClick={() => setCurrentQuestion(index)}
                      className={`relative w-full aspect-square rounded-xl font-bold text-sm transition-all flex items-center justify-center ${
                        isCurrent
                          ? 'bg-blue-600 text-white ring-2 ring-blue-500 ring-offset-2 shadow-md'
                          : isAnswered
                          ? 'bg-green-500 text-white hover:bg-green-600 shadow-sm'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      } ${isFlagged && !isCurrent ? 'ring-2 ring-amber-400' : ''}`}
                      title={`Question ${index + 1}${isFlagged ? ' (Flagged)' : ''}${isAnswered ? ' (Answered)' : ''}`}
                    >
                      <span>{index + 1}</span>

                      {/* Small Flag Indicator on Badge */}
                      {isFlagged && (
                        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-amber-400 border border-white text-amber-900 rounded-full flex items-center justify-center shadow-sm">
                          <Flag size={10} className="fill-amber-900 text-amber-900" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="mt-5 pt-4 border-t border-gray-100 space-y-2 text-xs font-medium">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-blue-600 rounded-lg"></div>
                  <span className="text-gray-700">Current Question</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-green-500 rounded-lg"></div>
                  <span className="text-gray-700">Answered ({answeredCount})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-gray-100 border border-amber-400 rounded-lg flex items-center justify-center relative">
                    <Flag size={11} className="fill-amber-500 text-amber-600" />
                  </div>
                  <span className="text-gray-700">Flagged with Doubts ({flaggedCount})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-gray-100 rounded-lg"></div>
                  <span className="text-gray-700">Not Answered ({unansweredCount})</span>
                </div>
              </div>

              {/* Submit Button in Sidebar */}
              <button
                onClick={handleOpenSubmitModal}
                className="hidden lg:flex items-center justify-center gap-2 w-full mt-5 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 transition-all shadow-md active:scale-98"
              >
                <span>Submit Quiz</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>

          {/* Question Content */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8 border border-gray-100">
              {/* Question Header: Number, Title & Flag Toggle */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6 pb-4 border-b border-gray-100">
                <div className="flex-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
                    Question {currentQuestion + 1} of {quiz.questions.length}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mt-2 leading-snug">
                    {question.question}
                  </h2>
                </div>

                {/* Flag Question Button */}
                <button
                  onClick={() => toggleFlag(currentQuestion)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-bold transition-all ${
                    isCurrentFlagged
                      ? 'bg-amber-100 text-amber-900 border-2 border-amber-400 shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-amber-50 hover:text-amber-700 border border-gray-200'
                  }`}
                  title={isCurrentFlagged ? 'Click to unflag this question' : 'Flag this question if you have doubt'}
                >
                  <Flag
                    size={16}
                    className={isCurrentFlagged ? 'fill-amber-500 text-amber-600' : 'text-gray-500'}
                  />
                  <span>{isCurrentFlagged ? '🚩 Flagged' : 'Flag Question'}</span>
                </button>
              </div>

              {/* Options */}
              <div className="space-y-3.5">
                {question.options.map((option, index) => {
                  const isSelected = selectedAnswers[currentQuestion] === index;

                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(currentQuestion, index)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-3.5 ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/80 shadow-sm'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50/60 bg-white'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 font-bold text-xs transition-colors ${
                          isSelected
                            ? 'border-blue-600 bg-blue-600 text-white'
                            : 'border-gray-300 text-gray-500 bg-gray-50'
                        }`}
                      >
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span className={`text-sm sm:text-base leading-relaxed ${isSelected ? 'font-semibold text-blue-950' : 'text-gray-800'}`}>
                        {option}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Navigation Buttons */}
              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mt-8 pt-6 border-t border-gray-100">
                <button
                  onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                  disabled={currentQuestion === 0}
                  className="px-5 py-2.5 rounded-xl font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  ← Previous
                </button>

                <div className="flex items-center gap-3">
                  {currentQuestion < quiz.questions.length - 1 ? (
                    <button
                      onClick={() => setCurrentQuestion(currentQuestion + 1)}
                      className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-sm"
                    >
                      Next →
                    </button>
                  ) : (
                    <button
                      onClick={handleOpenSubmitModal}
                      className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl font-bold bg-green-600 text-white hover:bg-green-700 transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      <span>Review & Submit</span>
                      <ArrowRight size={18} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pre-Submission Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <HelpCircle size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Submit Your Quiz?</h3>
                  <p className="text-xs text-blue-100 mt-0.5">Please review your question status before confirming</p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                  <span className="text-xs font-bold text-green-800">Answered</span>
                  <p className="text-2xl font-black text-green-600 mt-1">{answeredCount}/{totalCount}</p>
                </div>
                <div className={`${unansweredCount > 0 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'} border rounded-xl p-3`}>
                  <span className="text-xs font-bold text-red-800">Unanswered</span>
                  <p className={`text-2xl font-black mt-1 ${unansweredCount > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                    {unansweredCount}
                  </p>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <span className="text-xs font-bold text-amber-800 flex items-center justify-center gap-1">
                    <Flag size={12} className="fill-amber-500 text-amber-600" /> Flagged
                  </span>
                  <p className="text-2xl font-black text-amber-700 mt-1">{flaggedCount}</p>
                </div>
              </div>

              {/* Warning if unanswered questions exist */}
              {unansweredCount > 0 && (
                <div className="bg-red-50 border-l-4 border-red-500 p-3.5 rounded-r-xl">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-red-900">You have {unansweredCount} unanswered question(s):</p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {unansweredIndices.map((qIdx) => (
                          <button
                            key={qIdx}
                            onClick={() => {
                              setCurrentQuestion(qIdx);
                              setShowSubmitModal(false);
                            }}
                            className="w-7 h-7 rounded-lg bg-red-200 hover:bg-red-300 text-red-900 text-xs font-bold transition-colors"
                            title={`Jump to Question ${qIdx + 1}`}
                          >
                            {qIdx + 1}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Flagged questions notice */}
              {flaggedCount > 0 && (
                <div className="bg-amber-50 border-l-4 border-amber-500 p-3.5 rounded-r-xl">
                  <div className="flex items-start gap-2.5">
                    <Flag size={18} className="fill-amber-500 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-amber-900">
                        You flagged {flaggedCount} question(s) with doubts:
                      </p>
                      <p className="text-xs text-amber-800 mt-0.5">Click any number below to review before submitting:</p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {flaggedIndices.map((qIdx) => (
                          <button
                            key={qIdx}
                            onClick={() => {
                              setCurrentQuestion(qIdx);
                              setShowSubmitModal(false);
                            }}
                            className="w-7 h-7 rounded-lg bg-amber-200 hover:bg-amber-300 text-amber-900 text-xs font-bold transition-colors flex items-center justify-center gap-0.5"
                            title={`Review Question ${qIdx + 1}`}
                          >
                            <span>{qIdx + 1}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <p className="text-xs text-gray-500 text-center">
                You can submit now, or go back to review and answer any remaining questions.
              </p>
            </div>

            {/* Modal Actions */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="px-5 py-2.5 rounded-xl font-bold text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 transition-colors text-sm"
              >
                ← Return to Quiz
              </button>
              <button
                onClick={handleConfirmSubmit}
                disabled={submitQuizMutation.isPending}
                className="px-6 py-2.5 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 transition-colors shadow-md text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitQuizMutation.isPending ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm & Submit Quiz</span>
                    <CheckCircle size={16} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
