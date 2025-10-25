import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CheckCircle, XCircle, Clock, Award, ArrowLeft,
  Home, Loader, AlertCircle
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';

interface QuestionData {
  question_number: number;
  question: string;
  options: string[];
  user_answer: number | null;
  user_answer_text: string;
  correct_answer: number;
  correct_answer_text: string;
  explanation?: string;
  is_correct: boolean;
}

interface DetailedResult {
  id: number;
  quiz_title: string;
  chapter_name: string;
  attempt_number: number;
  score: number;
  total_questions: number;
  percentage: number;
  passed: boolean;
  passing_score: number;
  time_taken: number | null;
  created_at: string;
  questions: QuestionData[];
}

export default function QuizResultDetail() {
  const { resultId } = useParams<{ resultId: string }>();
  const navigate = useNavigate();

  const [result, setResult] = useState<DetailedResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchResultDetails();
  }, [resultId]);

  const fetchResultDetails = async () => {
    try {
      const response = await api.get(`/quiz/results/${resultId}/detailed`);

      if (response.data.success) {
        setResult(response.data.result);
      } else {
        setError('Failed to load result details');
      }
    } catch (err: any) {
      console.error('Error fetching result details:', err);
      setError(err.response?.data?.message || 'Failed to load result details');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number | null) => {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 80) return 'from-green-500 to-green-600';
    if (percentage >= 60) return 'from-yellow-500 to-yellow-600';
    return 'from-red-500 to-red-600';
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 lg:ml-64">
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <Loader className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
              <p className="text-gray-600">Loading result details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 lg:ml-64">
          <div className="flex items-center justify-center h-screen">
            <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
              <p className="text-gray-600 mb-6">{error || 'Result not found'}</p>
              <button
                onClick={() => navigate('/results')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
              >
                Back to Results
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const correctCount = result.questions.filter(q => q.is_correct).length;
  const incorrectCount = result.total_questions - correctCount;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 lg:ml-64">
        {/* Header */}
        <div className="bg-white shadow-sm border-b sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <button
              onClick={() => navigate('/results')}
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors mb-4"
            >
              <ArrowLeft size={20} />
              <span className="font-medium">Back to Results</span>
            </button>
            <h1 className="text-3xl font-bold text-gray-900">{result.quiz_title}</h1>
            <p className="text-gray-600 mt-1">{result.chapter_name}</p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Summary Card */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Quiz Summary</h2>
              <span className={`px-6 py-2 rounded-full text-lg font-bold ${
                result.passed
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {result.passed ? '✅ PASSED' : '❌ FAILED'}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className={`bg-gradient-to-br ${getGradeColor(result.percentage)} text-white p-6 rounded-xl`}>
                <Award size={32} className="mb-2" />
                <div className="text-3xl font-bold">{result.percentage}%</div>
                <div className="text-sm opacity-90">Score</div>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl">
                <CheckCircle size={32} className="mb-2" />
                <div className="text-3xl font-bold">{correctCount}</div>
                <div className="text-sm opacity-90">Correct</div>
              </div>

              <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-6 rounded-xl">
                <XCircle size={32} className="mb-2" />
                <div className="text-3xl font-bold">{incorrectCount}</div>
                <div className="text-sm opacity-90">Wrong</div>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl">
                <Clock size={32} className="mb-2" />
                <div className="text-3xl font-bold">{formatTime(result.time_taken)}</div>
                <div className="text-sm opacity-90">Time Taken</div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t flex items-center justify-between text-sm text-gray-600">
              <div>Attempt #{result.attempt_number}</div>
              <div>Passing Score: {result.passing_score}%</div>
              <div>{formatDate(result.created_at)}</div>
            </div>
          </div>

          {/* Questions Review */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Question Review</h2>
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-gray-600">✓ {correctCount} Correct</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span className="text-gray-600">✗ {incorrectCount} Wrong</span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {result.questions.map((q, index) => (
                <div
                  key={index}
                  className={`p-6 rounded-xl border-l-4 ${
                    q.is_correct
                      ? 'bg-green-50 border-green-500'
                      : 'bg-red-50 border-red-500'
                  }`}
                >
                  <div className="flex items-start gap-4 mb-4">
                    {q.is_correct ? (
                      <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={24} />
                    ) : (
                      <XCircle className="text-red-600 flex-shrink-0 mt-1" size={24} />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-gray-900">
                          Question {q.question_number}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                          q.is_correct
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {q.is_correct ? '✓ Correct' : '✗ Wrong'}
                        </span>
                      </div>

                      <p className="text-lg text-gray-800 mb-4">{q.question}</p>

                      <div className="space-y-2">
                        {q.options.map((option, optIndex) => {
                          const isCorrect = optIndex === q.correct_answer;
                          const isUserAnswer = optIndex === q.user_answer;

                          return (
                            <div
                              key={optIndex}
                              className={`p-4 rounded-lg border-2 ${
                                isCorrect
                                  ? 'border-green-500 bg-green-100'
                                  : isUserAnswer
                                  ? 'border-red-500 bg-red-100'
                                  : 'border-gray-200 bg-white'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className={`${
                                  isCorrect ? 'font-semibold text-green-900' :
                                  isUserAnswer ? 'text-red-900' : 'text-gray-700'
                                }`}>
                                  {String.fromCharCode(65 + optIndex)}. {option}
                                </span>
                                <div className="flex items-center gap-2">
                                  {isUserAnswer && (
                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                                      Your Answer
                                    </span>
                                  )}
                                  {isCorrect && (
                                    <span className="px-2 py-1 bg-green-200 text-green-800 rounded text-xs font-semibold">
                                      ✓ Correct
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-semibold text-gray-700">Your Answer: </span>
                            <span className={q.is_correct ? 'text-green-600' : 'text-red-600'}>
                              {q.user_answer_text}
                            </span>
                          </div>
                          {!q.is_correct && (
                            <div>
                              <span className="font-semibold text-gray-700">Correct Answer: </span>
                              <span className="text-green-600">
                                {q.correct_answer_text}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Explanation */}
                        {q.explanation && (
                          <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                            <div className="flex items-start gap-2">
                              <svg
                                className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              <div>
                                <p className="font-semibold text-blue-900 text-sm mb-1">Explanation:</p>
                                <p className="text-blue-800 text-sm leading-relaxed">{q.explanation}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="mt-8 flex justify-center gap-4">
            <button
              onClick={() => navigate('/results')}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 flex items-center gap-2"
            >
              <ArrowLeft size={20} />
              Back to Results
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 flex items-center gap-2"
            >
              <Home size={20} />
              Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
