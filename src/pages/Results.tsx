import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import api from '../services/api';
import { ResultsListSkeleton } from '../components/Skeleton';
import {
  Award,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Loader,
  FileText,
  Trophy,
  Flag
} from 'lucide-react';

interface QuizResult {
  id: number;
  quiz_id: number;
  attempt_number: number;
  score: number;
  total_questions: number;
  percentage: number;
  passed: boolean;
  time_taken?: number;
  flagged_count?: number;
  flagged_wrong_count?: number;
  created_at: string;
  quiz: {
    id: number;
    title: string;
    category: string;
    passing_score: number;
    chapter?: {
      title: string;
      chapter_number: number;
    };
  };
}

export default function Results() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'passed' | 'failed'>('all');

  // Fetch results with React Query
  const { data: results = [], isLoading, error } = useQuery<QuizResult[]>({
    queryKey: ['quiz-results'],
    queryFn: async () => {
      const response = await api.get('/quiz/results');
      return response.data.results || [];
    },
    staleTime: 60 * 1000,
  });

  const filteredResults = results.filter(result => {
    if (filter === 'passed') return result.passed;
    if (filter === 'failed') return !result.passed;
    return true;
  });

  const stats = {
    total: results.length,
    passed: results.filter(r => r.passed).length,
    failed: results.filter(r => !r.passed).length,
    averageScore: results.length > 0
      ? Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / results.length)
      : 0
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

  const formatTime = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  // Show skeleton while loading
  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 lg:ml-64">
          <TopBar title="Results" subtitle="View your quiz performance" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <ResultsListSkeleton />
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 lg:ml-64">
          <div className="flex items-center justify-center h-screen">
            <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md">
              <p className="text-red-600 mb-4">Failed to load results</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 lg:ml-64">
        <TopBar title="Results" subtitle="View your quiz performance" />

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-2xl shadow-md">
              <div className="flex items-center justify-between mb-2">
                <FileText size={32} />
                <span className="text-3xl font-black">{stats.total}</span>
              </div>
              <h3 className="text-sm font-medium opacity-90">Total Attempts</h3>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-2xl shadow-md">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle size={32} />
                <span className="text-3xl font-black">{stats.passed}</span>
              </div>
              <h3 className="text-sm font-medium opacity-90">Passed</h3>
            </div>

            <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-6 rounded-2xl shadow-md">
              <div className="flex items-center justify-between mb-2">
                <XCircle size={32} />
                <span className="text-3xl font-black">{stats.failed}</span>
              </div>
              <h3 className="text-sm font-medium opacity-90">Failed</h3>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-2xl shadow-md">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp size={32} />
                <span className="text-3xl font-black">{stats.averageScore}%</span>
              </div>
              <h3 className="text-sm font-medium opacity-90">Average Score</h3>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="bg-white rounded-xl shadow-sm p-1.5 mb-6 inline-flex gap-2 border border-gray-100">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              All ({stats.total})
            </button>
            <button
              onClick={() => setFilter('passed')}
              className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${
                filter === 'passed'
                  ? 'bg-green-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Passed ({stats.passed})
            </button>
            <button
              onClick={() => setFilter('failed')}
              className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${
                filter === 'failed'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Failed ({stats.failed})
            </button>
          </div>

          {/* Results List */}
          {filteredResults.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100">
              <Trophy size={64} className="text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">No Results Found</h3>
              <p className="text-gray-500 mb-6 text-sm">
                {filter === 'all'
                  ? "You haven't taken any quizzes yet"
                  : filter === 'passed'
                  ? 'No passed quizzes yet'
                  : 'No failed quizzes'}
              </p>
              <button
                onClick={() => navigate('/quizzes')}
                className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 shadow-md transition-all text-sm"
              >
                Take a Quiz
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredResults.map((result) => {
                const hasFlagged = !!result.flagged_count && result.flagged_count > 0;

                return (
                  <div
                    key={result.id}
                    onClick={() => navigate(`/results/${result.id}`)}
                    className={`bg-white rounded-2xl shadow-sm border-2 p-6 hover:shadow-md transition-all cursor-pointer ${
                      result.passed ? 'border-green-200 hover:border-green-400' : 'border-red-200 hover:border-red-400'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2.5 mb-2">
                          {result.passed ? (
                            <CheckCircle className="text-green-600 flex-shrink-0" size={24} />
                          ) : (
                            <XCircle className="text-red-600 flex-shrink-0" size={24} />
                          )}
                          <h3 className="text-lg font-bold text-gray-900">
                            {result.quiz.title}
                          </h3>
                          <span className={`px-3 py-0.5 rounded-full text-xs font-bold ${
                            result.passed
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {result.passed ? 'PASSED' : 'FAILED'}
                          </span>

                          {/* Flagged summary badge on attempt card (View 1) */}
                          {hasFlagged && (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-300 flex items-center gap-1">
                              <Flag size={12} className="fill-amber-500 text-amber-600" />
                              <span>{result.flagged_count} Flagged</span>
                              {result.flagged_wrong_count !== undefined && result.flagged_wrong_count > 0 && (
                                <span className="text-red-600 font-extrabold">({result.flagged_wrong_count} Wrong)</span>
                              )}
                            </span>
                          )}
                        </div>

                        {result.quiz.chapter && (
                          <p className="text-sm text-gray-600 font-medium">
                            Chapter {result.quiz.chapter.chapter_number}: {result.quiz.chapter.title}
                          </p>
                        )}
                      </div>

                      <div className="text-left sm:text-right">
                        <div className={`text-3xl font-black ${
                          result.passed ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {Math.round(result.percentage)}%
                        </div>
                        <div className="text-xs text-gray-500 font-semibold mt-0.5">
                          {result.score}/{result.total_questions} correct
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs sm:text-sm text-gray-600 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Award size={16} className="text-gray-400" />
                        <span>Attempt #{result.attempt_number}</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-medium">
                        <Clock size={16} className="text-gray-400" />
                        <span>{formatTime(result.time_taken)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-medium">
                        <Calendar size={16} className="text-gray-400" />
                        <span>{formatDate(result.created_at)}</span>
                      </div>
                      {hasFlagged && (
                        <div className="flex items-center gap-1.5 font-medium text-amber-800">
                          <Flag size={14} className="fill-amber-500 text-amber-600" />
                          <span>{result.flagged_count} Flagged Doubts</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap justify-between items-center gap-2">
                      <div className="text-xs text-gray-500 font-medium">
                        Passing score: {result.quiz.passing_score}%
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/results/${result.id}`);
                          }}
                          className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors text-xs font-bold shadow-sm"
                        >
                          View Details →
                        </button>
                        {!result.passed && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/quiz/${result.quiz_id}`);
                            }}
                            className="bg-yellow-600 text-white px-4 py-2 rounded-xl hover:bg-yellow-700 transition-colors text-xs font-bold shadow-sm"
                          >
                            Retry Quiz
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
