import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CheckCircle, XCircle, Clock, Award, ArrowLeft,
  Home, Loader, AlertCircle, Flag
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
  is_flagged?: boolean;
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
  flagged_count?: number;
  flagged_wrong_count?: number;
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
              <p className="text-gray-600 font-medium">Loading result details...</p>
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
            <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
              <p className="text-gray-600 mb-6">{error || 'Result not found'}</p>
              <button
                onClick={() => navigate('/results')}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 shadow-md"
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
  const flaggedTotal = result.flagged_count ?? result.questions.filter(q => q.is_flagged).length;
  const flaggedWrong = result.flagged_wrong_count ?? result.questions.filter(q => q.is_flagged && !q.is_correct).length;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 lg:ml-64">
        {/* Header */}
        <div className="bg-white shadow-sm border-b sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <button
              onClick={() => navigate('/results')}
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors mb-3 font-medium text-sm"
            >
              <ArrowLeft size={18} />
              <span>Back to Results</span>
            </button>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{result.quiz_title}</h1>
            <p className="text-gray-600 text-sm mt-1">{result.chapter_name}</p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* View 2: Quiz Summary Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-8 border border-gray-100">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <h2 className="text-2xl font-bold text-gray-900">Quiz Summary</h2>
              <span className={`px-5 py-2 rounded-full text-base font-bold shadow-sm ${
                result.passed
                  ? 'bg-green-100 text-green-800 border border-green-200'
                  : 'bg-red-100 text-red-800 border border-red-200'
              }`}>
                {result.passed ? '✅ PASSED' : '❌ FAILED'}
              </span>
            </div>

            {/* Summary Stat Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <div className={`bg-gradient-to-br ${getGradeColor(result.percentage)} text-white p-5 rounded-2xl shadow-md`}>
                <Award size={28} className="mb-2 opacity-90" />
                <div className="text-3xl font-black">{Math.round(result.percentage)}%</div>
                <div className="text-xs font-semibold uppercase tracking-wider opacity-90 mt-0.5">Score</div>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-5 rounded-2xl shadow-md">
                <CheckCircle size={28} className="mb-2 opacity-90" />
                <div className="text-3xl font-black">{correctCount}</div>
                <div className="text-xs font-semibold uppercase tracking-wider opacity-90 mt-0.5">Correct</div>
              </div>

              <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-5 rounded-2xl shadow-md">
                <XCircle size={28} className="mb-2 opacity-90" />
                <div className="text-3xl font-black">{incorrectCount}</div>
                <div className="text-xs font-semibold uppercase tracking-wider opacity-90 mt-0.5">Wrong</div>
              </div>

              <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white p-5 rounded-2xl shadow-md">
                <Flag size={28} className="mb-2 opacity-90 fill-white/30" />
                <div className="text-3xl font-black">{flaggedTotal}</div>
                <div className="text-xs font-semibold uppercase tracking-wider opacity-90 mt-0.5">
                  {flaggedWrong > 0 ? `${flaggedWrong} Flagged & Wrong` : 'Flagged Questions'}
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-5 rounded-2xl shadow-md col-span-2 lg:col-span-1">
                <Clock size={28} className="mb-2 opacity-90" />
                <div className="text-3xl font-black">{formatTime(result.time_taken)}</div>
                <div className="text-xs font-semibold uppercase tracking-wider opacity-90 mt-0.5">Time Taken</div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm text-gray-500 font-medium">
              <div>Attempt #{result.attempt_number}</div>
              <div>Passing Requirement: {result.passing_score}%</div>
              <div>Submitted: {formatDate(result.created_at)}</div>
            </div>
          </div>

          {/* View 3: Questions Review */}
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-100">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900">Question Review</h2>
              <div className="flex flex-wrap gap-3 text-xs sm:text-sm font-semibold">
                <div className="flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1.5 rounded-lg border border-green-200">
                  <CheckCircle size={16} />
                  <span>{correctCount} Correct</span>
                </div>
                <div className="flex items-center gap-1.5 bg-red-50 text-red-700 px-3 py-1.5 rounded-lg border border-red-200">
                  <XCircle size={16} />
                  <span>{incorrectCount} Wrong</span>
                </div>
                {flaggedTotal > 0 && (
                  <div className="flex items-center gap-1.5 bg-amber-50 text-amber-800 px-3 py-1.5 rounded-lg border border-amber-200">
                    <Flag size={16} className="fill-amber-500 text-amber-600" />
                    <span>{flaggedTotal} Flagged ({flaggedWrong} Wrong)</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              {result.questions.map((q, index) => {
                const isFlagged = !!q.is_flagged;

                return (
                  <div
                    key={index}
                    className={`p-6 rounded-2xl border-2 transition-all ${
                      q.is_correct
                        ? 'bg-green-50/60 border-green-400'
                        : 'bg-red-50/60 border-red-400'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {q.is_correct ? (
                        <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={24} />
                      ) : (
                        <XCircle className="text-red-600 flex-shrink-0 mt-1" size={24} />
                      )}
                      <div className="flex-1 min-w-0">
                        {/* Title & Badges */}
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                          <h3 className="font-bold text-gray-900 text-base sm:text-lg">
                            Question {q.question_number}
                          </h3>
                          <div className="flex items-center gap-2">
                            {isFlagged && (
                              <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm ${
                                !q.is_correct
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                  : 'bg-blue-100 text-blue-800 border border-blue-300'
                              }`}>
                                <Flag size={12} className={!q.is_correct ? 'fill-amber-500 text-amber-600' : 'fill-blue-500 text-blue-600'} />
                                {!q.is_correct ? 'Flagged & Wrong' : 'Flagged & Correct'}
                              </span>
                            )}
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              q.is_correct
                                ? 'bg-green-100 text-green-800 border border-green-300'
                                : 'bg-red-100 text-red-800 border border-red-300'
                            }`}>
                              {q.is_correct ? '✓ Correct' : '✗ Wrong'}
                            </span>
                          </div>
                        </div>

                        {/* Flagged Note */}
                        {isFlagged && !q.is_correct && (
                          <div className="mb-3 p-3 bg-amber-100/80 border-l-4 border-amber-500 rounded-r-xl text-xs sm:text-sm font-semibold text-amber-900 flex items-center gap-2">
                            <Flag size={16} className="fill-amber-500 text-amber-600 flex-shrink-0" />
                            <span>You flagged this question during the quiz because you had doubts, and answered it incorrectly.</span>
                          </div>
                        )}

                        <p className="text-base sm:text-lg text-gray-800 mb-4 leading-relaxed font-medium">
                          {q.question}
                        </p>

                        <div className="space-y-2.5">
                          {q.options.map((option, optIndex) => {
                            const isCorrect = optIndex === q.correct_answer;
                            const isUserAnswer = optIndex === q.user_answer;

                            return (
                              <div
                                key={optIndex}
                                className={`p-4 rounded-xl border-2 transition-all ${
                                  isCorrect
                                    ? 'border-green-600 bg-green-100/90 text-green-950 font-semibold shadow-sm'
                                    : isUserAnswer
                                    ? 'border-red-600 bg-red-100/90 text-red-950 shadow-sm'
                                    : 'border-gray-200 bg-white text-gray-700'
                                }`}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-sm sm:text-base leading-relaxed">
                                    <strong className="mr-1">{String.fromCharCode(65 + optIndex)}.</strong> {option}
                                  </span>
                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    {isUserAnswer && (
                                      <span className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded-md text-xs font-bold">
                                        Your Answer
                                      </span>
                                    )}
                                    {isCorrect && (
                                      <span className="px-2.5 py-1 bg-green-200 text-green-900 rounded-md text-xs font-bold">
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
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="font-semibold text-gray-700">Your Answer: </span>
                              <span className={q.is_correct ? 'text-green-700 font-bold' : 'text-red-700 font-bold'}>
                                {q.user_answer_text}
                              </span>
                            </div>
                            {!q.is_correct && (
                              <div>
                                <span className="font-semibold text-gray-700">Correct Answer: </span>
                                <span className="text-green-700 font-bold">
                                  {q.correct_answer_text}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Explanation */}
                          {q.explanation && (
                            <div className="mt-4 p-4 bg-blue-50/90 border-l-4 border-blue-500 rounded-r-xl">
                              <p className="font-bold text-blue-900 text-xs sm:text-sm mb-1">Explanation:</p>
                              <p className="text-blue-800 text-xs sm:text-sm leading-relaxed">{q.explanation}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="mt-8 flex justify-center gap-4">
            <button
              onClick={() => navigate('/results')}
              className="px-6 py-3 bg-gray-700 text-white rounded-xl font-bold hover:bg-gray-800 flex items-center gap-2 shadow-md transition-all"
            >
              <ArrowLeft size={20} />
              <span>Back to Results</span>
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 flex items-center gap-2 shadow-md transition-all"
            >
              <Home size={20} />
              <span>Dashboard</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
